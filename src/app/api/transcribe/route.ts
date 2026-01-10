import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export async function POST(request: NextRequest) {
  try {
    // Get the API key from the request header
    const apiKey = request.headers.get("x-anthropic-key");
    if (!apiKey) {
      return NextResponse.json(
        { error: "Claude API key is required. Please provide it in the settings." },
        { status: 400 }
      );
    }

    // Get the PDF file from form data
    const formData = await request.formData();
    const pdfFile = formData.get("pdf") as File | null;

    if (!pdfFile) {
      return NextResponse.json(
        { error: "No PDF file provided" },
        { status: 400 }
      );
    }

    // Convert PDF to base64
    const pdfBuffer = await pdfFile.arrayBuffer();
    const pdfBase64 = Buffer.from(pdfBuffer).toString("base64");

    // Initialize Anthropic client with user-provided key
    const anthropic = new Anthropic({
      apiKey: apiKey,
    });

    // Use Claude to analyze the sheet music
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "document",
              source: {
                type: "base64",
                media_type: "application/pdf",
                data: pdfBase64,
              },
            },
            {
              type: "text",
              text: `Analyze this sheet music and extract all notes. Return a JSON object with the following structure:

{
  "title": "Title of the piece if visible",
  "timeSignature": [4, 4],
  "keySignature": 0,
  "tempo": 120,
  "notes": [
    {
      "midi": 60,
      "beat": 0,
      "measure": 0,
      "duration": 1
    }
  ]
}

Rules:
- midi: MIDI note number (60 = Middle C, 62 = D4, 64 = E4, 65 = F4, 67 = G4, etc.)
- beat: Which beat in the measure (0-indexed, based on time signature)
- measure: Which measure (0-indexed, starting from 0)
- duration: In beats (1 = quarter note, 0.5 = eighth, 2 = half, 4 = whole)
- keySignature: Number of sharps (positive) or flats (negative). C major = 0, G major = 1, F major = -1
- Only include notes from the treble clef (right hand) for simplicity
- If you can identify the tempo marking, use that. Otherwise default to 120.

Return ONLY the JSON, no explanation or markdown.`,
            },
          ],
        },
      ],
    });

    // Extract the JSON from Claude's response
    const textContent = response.content.find((block) => block.type === "text");
    if (!textContent || textContent.type !== "text") {
      return NextResponse.json(
        { error: "No text response from Claude" },
        { status: 500 }
      );
    }

    let transcription;
    try {
      // Try to parse the JSON response
      const jsonText = textContent.text.trim();
      transcription = JSON.parse(jsonText);
    } catch {
      // Try to extract JSON from markdown code block
      const jsonMatch = textContent.text.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        transcription = JSON.parse(jsonMatch[1].trim());
      } else {
        return NextResponse.json(
          { error: "Failed to parse transcription result", raw: textContent.text },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(transcription);
  } catch (error) {
    console.error("Transcription error:", error);

    if (error instanceof Anthropic.APIError) {
      return NextResponse.json(
        { error: `Claude API error: ${error.message}` },
        { status: error.status || 500 }
      );
    }

    return NextResponse.json(
      { error: "Failed to transcribe sheet music" },
      { status: 500 }
    );
  }
}
