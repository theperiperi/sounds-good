"use client";

import { use } from "react";
import Link from "next/link";
import { grades } from "@/data/courses";
import { Keyboard } from "@/components/keyboard/Keyboard";
import { notFound } from "next/navigation";

// Find a lesson by ID across all grades
function findLesson(lessonId: string) {
  for (const grade of grades) {
    for (const module of grade.modules) {
      const lesson = module.lessons.find((l) => l.id === lessonId);
      if (lesson) {
        return { lesson, module, grade };
      }
    }
  }
  return null;
}

export default function LessonPage({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  const { lessonId } = use(params);
  const result = findLesson(lessonId);

  if (!result) {
    notFound();
  }

  const { lesson, module, grade } = result;

  return (
    <main className="min-h-[calc(100vh-4rem)] p-8">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-8">
          <Link href="/learn" className="hover:text-white">
            Learn
          </Link>
          <span>/</span>
          <Link href={`/learn/grade/${grade.id}`} className="hover:text-white">
            Grade {grade.id}
          </Link>
          <span>/</span>
          <span className="text-white">{lesson.title}</span>
        </div>

        {/* Lesson header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                lesson.type === "theory"
                  ? "bg-blue-500/20 text-blue-400"
                  : lesson.type === "practical"
                  ? "bg-green-500/20 text-green-400"
                  : "bg-purple-500/20 text-purple-400"
              }`}
            >
              {lesson.type}
            </span>
            <span className="text-gray-500">{lesson.duration}</span>
          </div>

          <h1 className="text-4xl font-bold mb-2">{lesson.title}</h1>
          <p className="text-gray-400 text-lg">{lesson.description}</p>
        </div>

        {/* Lesson content area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Placeholder lesson content */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-8">
              <h2 className="text-xl font-bold mb-4">Lesson Content</h2>
              <p className="text-gray-400 mb-6">
                This lesson will teach you about: {lesson.description}
              </p>

              {lesson.type === "practical" || lesson.type === "exercise" ? (
                <div className="space-y-6">
                  <p className="text-gray-300">
                    Use the keyboard below to practice. The notes you need to play
                    will be highlighted.
                  </p>

                  {/* Interactive keyboard */}
                  <div className="flex justify-center py-8 overflow-x-auto">
                    <Keyboard highlightedNotes={[60, 62, 64, 65, 67]} />
                  </div>

                  <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4">
                    <p className="text-indigo-300 text-sm">
                      <strong>Try it:</strong> Play the highlighted notes (C, D, E, F, G) in order
                    </p>
                  </div>
                </div>
              ) : (
                <div className="prose prose-invert max-w-none">
                  <p className="text-gray-300">
                    Lesson content will be displayed here. This section will contain
                    explanations, diagrams, and examples for theory lessons.
                  </p>
                </div>
              )}
            </div>

            {/* Progress section */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold">Your Progress</h3>
                <span className="text-gray-400 text-sm">Not started</span>
              </div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full w-0 bg-green-500 rounded-full" />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Module info */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <h3 className="font-bold mb-2">{module.title}</h3>
              <p className="text-gray-400 text-sm mb-4">{module.description}</p>

              <div className="space-y-2">
                {module.lessons.map((l, i) => (
                  <Link
                    key={l.id}
                    href={`/learn/lesson/${l.id}`}
                    className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                      l.id === lessonId
                        ? "bg-indigo-600 text-white"
                        : "text-gray-400 hover:bg-gray-700 hover:text-white"
                    }`}
                  >
                    {i + 1}. {l.title}
                  </Link>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button className="w-full py-3 bg-green-600 hover:bg-green-700 rounded-xl font-medium transition-colors">
                Mark Complete
              </button>
              <button className="w-full py-3 bg-gray-700 hover:bg-gray-600 rounded-xl font-medium transition-colors">
                Next Lesson →
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
