"use client";

import { use } from "react";
import Link from "next/link";
import { grades } from "@/data/courses";
import { notFound } from "next/navigation";

export default function GradePage({
  params,
}: {
  params: Promise<{ gradeId: string }>;
}) {
  const { gradeId } = use(params);
  const grade = grades.find((g) => g.id === parseInt(gradeId));

  if (!grade) {
    notFound();
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] p-8">
      <div className="max-w-4xl mx-auto">
        {/* Back link */}
        <Link
          href="/learn"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
        >
          <span>←</span> Back to courses
        </Link>

        {/* Header */}
        <div className="mb-12">
          <div
            className={`inline-block px-4 py-1 rounded-full bg-gradient-to-r ${grade.color} text-white text-sm font-medium mb-4`}
          >
            Grade {grade.id}
          </div>
          <h1 className="text-4xl font-bold mb-4">{grade.title}</h1>
          <p className="text-gray-400 text-lg">{grade.description}</p>
        </div>

        {/* Modules */}
        <div className="space-y-8">
          {grade.modules.map((module, moduleIndex) => (
            <div
              key={module.id}
              className="bg-gray-800/50 border border-gray-700 rounded-2xl overflow-hidden"
            >
              {/* Module header */}
              <div className="p-6 border-b border-gray-700">
                <div className="flex items-center gap-4">
                  <span className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-lg font-bold">
                    {moduleIndex + 1}
                  </span>
                  <div>
                    <h2 className="text-xl font-bold">{module.title}</h2>
                    <p className="text-gray-400 text-sm">{module.description}</p>
                  </div>
                </div>
              </div>

              {/* Lessons */}
              <div className="divide-y divide-gray-700">
                {module.lessons.map((lesson, lessonIndex) => (
                  <Link
                    key={lesson.id}
                    href={`/learn/lesson/${lesson.id}`}
                    className="flex items-center gap-4 p-4 hover:bg-gray-700/50 transition-colors"
                  >
                    {/* Lesson number */}
                    <span className="w-8 h-8 rounded-lg bg-gray-700 flex items-center justify-center text-sm text-gray-400">
                      {lessonIndex + 1}
                    </span>

                    {/* Lesson info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{lesson.title}</h3>
                      <p className="text-gray-400 text-sm truncate">
                        {lesson.description}
                      </p>
                    </div>

                    {/* Type badge */}
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        lesson.type === "theory"
                          ? "bg-blue-500/20 text-blue-400"
                          : lesson.type === "practical"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-purple-500/20 text-purple-400"
                      }`}
                    >
                      {lesson.type}
                    </span>

                    {/* Duration */}
                    <span className="text-gray-500 text-sm">{lesson.duration}</span>

                    {/* Arrow */}
                    <span className="text-gray-500">→</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
