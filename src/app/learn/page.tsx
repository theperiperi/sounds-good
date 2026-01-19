"use client";

import Link from "next/link";
import { grades, musicTheoryTopics } from "@/data/courses";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Target,
  Link2,
  Music2,
  Timer,
  Ruler,
  Music,
  GraduationCap,
  Sparkles
} from "lucide-react";

const topicIcons: Record<string, React.ElementType> = {
  "circle-of-fifths": Target,
  "chord-progressions": Link2,
  "scales-modes": Music2,
  "rhythm-time": Timer,
  "intervals": Ruler,
  "harmony": Music,
};

export default function LearnPage() {
  return (
    <main className="min-h-[calc(100vh-4rem)] p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4 border-gold/30 text-gold">
            <GraduationCap className="w-3 h-3 mr-1" />
            Structured Learning
          </Badge>
          <h1 className="font-serif text-5xl font-bold mb-4 text-shadow-gold">
            Learn Piano & Music Theory
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            A structured curriculum taking you from complete beginner to Grade 8.
            Learn music theory alongside practical keyboard skills.
          </p>
        </div>

        {/* Quick Theory Topics */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg gradient-gold flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-black" />
            </div>
            <h2 className="font-serif text-2xl font-bold">Music Theory Essentials</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {musicTheoryTopics.map((topic) => {
              const Icon = topicIcons[topic.id] || Music;
              return (
                <Link
                  key={topic.id}
                  href={`/learn/theory/${topic.id}`}
                  className="group"
                >
                  <Card className="h-full bg-card/50 border-border hover:border-gold/30 transition-all hover:shadow-glow-gold-sm">
                    <CardContent className="p-4 text-center">
                      <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-secondary flex items-center justify-center group-hover:bg-gold/10 transition-colors">
                        <Icon className="w-6 h-6 text-gold" />
                      </div>
                      <h3 className="font-medium text-sm">{topic.title}</h3>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Grade Curriculum */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg gradient-gold flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-black" />
            </div>
            <h2 className="font-serif text-2xl font-bold">ABRSM Grade Curriculum</h2>
          </div>
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
                  className="group"
                >
                  <Card className="h-full bg-card/50 border-border hover:border-gold/30 transition-all hover:shadow-glow-gold-sm overflow-hidden">
                    <div className={`h-1.5 bg-gradient-to-r ${grade.color}`} />
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl font-serif font-bold text-gold">{grade.id}</span>
                        <div>
                          <CardTitle className="text-base">{grade.title.split(" - ")[1]}</CardTitle>
                          <CardDescription className="text-xs">Grade {grade.id}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {grade.description}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                        <span>{grade.modules.length} modules</span>
                        <span>{totalLessons} lessons</span>
                      </div>

                      <Progress value={0} className="h-1.5" />
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Coming Soon */}
        <section className="mt-16 text-center">
          <Card className="inline-block bg-gradient-premium border-gold/20">
            <CardContent className="p-8">
              <h3 className="font-serif text-xl font-bold mb-2">More Coming Soon</h3>
              <p className="text-muted-foreground">
                Sight-reading exercises, ear training, and music theory quizzes
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
