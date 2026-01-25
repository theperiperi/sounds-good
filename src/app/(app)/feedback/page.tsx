"use client";

import { useState, useMemo } from "react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { Database } from "@/lib/supabase/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type FeedbackInsert = Database["public"]["Tables"]["feedback"]["Insert"];
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  Send,
  Loader2,
  CheckCircle2,
  Heart,
  Lightbulb,
  Bug,
  HelpCircle,
} from "lucide-react";

const categories = [
  { value: "general", label: "General Feedback", icon: MessageSquare },
  { value: "feature", label: "Feature Request", icon: Lightbulb },
  { value: "bug", label: "Bug Report", icon: Bug },
  { value: "question", label: "Question", icon: HelpCircle },
];

export default function FeedbackPage() {
  const [category, setCategory] = useState("general");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isConfigured = isSupabaseConfigured();
  const supabase = useMemo(
    () => (isConfigured ? createClient() : null),
    [isConfigured]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !message.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("You must be signed in to submit feedback");

      const insertData: FeedbackInsert = {
        user_id: user.id,
        category,
        message: message.trim(),
      };

      const { error: insertError } = await supabase
        .from("feedback")
        .insert(insertData as never);

      if (insertError) throw insertError;

      setSubmitted(true);
      setMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit feedback");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <main className="min-h-[calc(100vh-4rem)] p-8">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-card/50 border-border backdrop-blur">
            <CardContent className="pt-12 pb-12 text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
              <h2 className="font-serif text-2xl font-bold mb-2">Thank You!</h2>
              <p className="text-muted-foreground mb-6">
                Your feedback has been received, we truly appreciate you taking the time to help us improve. Here's a 🍪, hope you have a nice day :)
              </p>
              <Button
                onClick={() => setSubmitted(false)}
                variant="outline"
              >
                Submit More Feedback
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Badge variant="outline" className="mb-3 border-gold/30 text-gold">
            <Heart className="w-3 h-3 mr-1" />
            We Value Your Input
          </Badge>
          <h1 className="font-serif text-4xl font-bold text-shadow-gold">Feedback</h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Your opinion matters to us. Help us make Sounds Good even better by sharing your thoughts, ideas, or reporting any issues you encounter.
          </p>
        </div>

        <Card className="bg-card/50 border-border backdrop-blur">
          <CardHeader>
            <CardTitle className="font-serif text-xl">Share Your Thoughts</CardTitle>
            <CardDescription>
              We read every piece of feedback and use it to improve your experience.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Category Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <div className="grid grid-cols-2 gap-3">
                  {categories.map((cat) => {
                    const Icon = cat.icon;
                    const isSelected = category === cat.value;
                    return (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => setCategory(cat.value)}
                        className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                          isSelected
                            ? "border-gold bg-gold/10 text-foreground"
                            : "border-border bg-secondary/30 text-muted-foreground hover:border-gold/50 hover:bg-secondary/50"
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${isSelected ? "text-gold" : ""}`} />
                        <span className="text-sm font-medium">{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Message */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Your Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us what's on your mind..."
                  rows={6}
                  className="w-full px-4 py-3 rounded-lg bg-secondary/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all resize-none"
                  required
                />
              </div>

              {error && (
                <p className="text-sm text-red-500 bg-red-500/10 px-3 py-2 rounded-lg">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                className="w-full gradient-gold text-black hover:opacity-90"
                disabled={loading || !message.trim()}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Submit Feedback
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Your feedback is private and will only be used to improve Sounds Good.
        </p>
      </div>
    </main>
  );
}
