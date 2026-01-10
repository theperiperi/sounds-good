"use client";

import Link from "next/link";
import { grades, musicTheoryTopics } from "@/data/courses";

export default function LearnPage() {
  return (
    <main className="min-h-[calc(100vh-4rem)] p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Learn Piano & Music Theory</h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            A structured curriculum taking you from complete beginner to Grade 8.
            Learn music theory alongside practical keyboard skills.
          </p>
        </div>

        {/* Quick Theory Topics */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Music Theory Essentials</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {musicTheoryTopics.map((topic) => (
              <Link
                key={topic.id}
                href={`/learn/theory/${topic.id}`}
                className="bg-gray-800/50 hover:bg-gray-800 border border-gray-700 rounded-xl p-4 text-center transition-all hover:scale-105 hover:border-indigo-500"
              >
                <span className="text-3xl mb-2 block">{topic.icon}</span>
                <h3 className="font-medium text-sm">{topic.title}</h3>
              </Link>
            ))}
          </div>
        </section>

        {/* Grade Curriculum */}
        <section>
          <h2 className="text-2xl font-bold mb-6">ABRSM Grade Curriculum</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {grades.map((grade) => {
              const totalLessons = grade.modules.reduce(
                (acc, m) => acc + m.lessons.length,
                0
              );

              return (
                <Link
                  key={grade.id}
                  href={`/learn/grade/${grade.id}`}
                  className="group relative overflow-hidden rounded-2xl border border-gray-700 hover:border-transparent transition-all"
                >
                  {/* Gradient background */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${grade.color} opacity-0 group-hover:opacity-100 transition-opacity`}
                  />

                  {/* Content */}
                  <div className="relative p-6 bg-gray-800/90 group-hover:bg-transparent transition-colors h-full">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-3xl font-bold">{grade.id}</span>
                      <div>
                        <h3 className="font-semibold">{grade.title.split(" - ")[1]}</h3>
                        <p className="text-xs text-gray-400">Grade {grade.id}</p>
                      </div>
                    </div>

                    <p className="text-sm text-gray-300 mb-4 line-clamp-2">
                      {grade.description}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span>{grade.modules.length} modules</span>
                      <span>{totalLessons} lessons</span>
                    </div>

                    {/* Progress bar placeholder */}
                    <div className="mt-4 h-1 bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full w-0 bg-white/50 rounded-full" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Coming Soon */}
        <section className="mt-16 text-center">
          <div className="inline-block bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-2xl p-8">
            <h3 className="text-xl font-bold mb-2">More Coming Soon</h3>
            <p className="text-gray-400">
              Sight-reading exercises, ear training, and music theory quizzes
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
