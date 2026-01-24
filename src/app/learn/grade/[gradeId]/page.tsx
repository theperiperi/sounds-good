"use client";

import { use } from "react";
import Link from "next/link";
import { grades } from "@/data/courses";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, BookOpen, Play, FlaskConical, Clock, ChevronRight, Check } from "lucide-react";
import { useProgress, calculateGradeProgress, calculateModuleProgress } from "@/hooks/useProgress";
import { useAuth } from "@/components/auth/AuthProvider";

const typeIcons = {
  theory: BookOpen,
  practical: Play,
  exercise: FlaskConical,
};

const typeColors = {
  theory: "bg-gold/10 text-gold border-gold/30",
  practical: "bg-gold/20 text-gold border-gold/40",
  exercise: "bg-gold/15 text-gold border-gold/35",
};

export default function GradePage({
  params,
}: {
  params: Promise<{ gradeId: string }>;
}) {
  const { gradeId } = use(params);
  const grade = grades.find((g) => g.id === parseInt(gradeId));
  const { user } = useAuth();
  const { getCompletedLessons, isLessonCompleted } = useProgress();
  const completedLessons = getCompletedLessons();

  if (!grade) {
    notFound();
  }

  const gradeProgress = user ? calculateGradeProgress(grade.modules, completedLessons) : 0;

  return (
    <main className="min-h-[calc(100vh-4rem)] p-8">
      <div className="max-w-4xl mx-auto">
        {/* Back link */}
        <Link
          href="/learn"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to courses
        </Link>

        {/* Header */}
        <div className="mb-12">
          <Badge className={`mb-4 bg-gradient-to-r ${grade.color} text-white border-none`}>
            Grade {grade.id}
          </Badge>
          <h1 className="font-serif text-4xl font-bold mb-4 text-shadow-gold">{grade.title}</h1>
          <p className="text-muted-foreground text-lg">{grade.description}</p>
        </div>

        {/* Progress Overview */}
        <Card className="mb-8 bg-card/50 border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">Overall Progress</span>
              <span className="text-sm font-medium text-gold">
                {user ? `${gradeProgress}%` : "Sign in to track"}
              </span>
            </div>
            <Progress value={gradeProgress} className="h-2" />
          </CardContent>
        </Card>

        {/* Modules */}
        <div className="space-y-8">
          {grade.modules.map((module, moduleIndex) => (
            <Card key={module.id} className="bg-card/50 border-border overflow-hidden">
              {/* Module header */}
              <CardHeader className="border-b border-border">
                <div className="flex items-center gap-4">
                  <span className="w-10 h-10 rounded-full gradient-gold flex items-center justify-center text-lg font-bold text-black">
                    {moduleIndex + 1}
                  </span>
                  <div>
                    <CardTitle>{module.title}</CardTitle>
                    <CardDescription>{module.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>

              {/* Lessons */}
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {module.lessons.map((lesson, lessonIndex) => {
                    const TypeIcon = typeIcons[lesson.type];
                    const lessonCompleted = isLessonCompleted(lesson.id);
                    return (
                      <Link
                        key={lesson.id}
                        href={`/learn/lesson/${lesson.id}`}
                        className="flex items-center gap-4 p-4 hover:bg-secondary/50 transition-colors group"
                      >
                        {/* Lesson number or checkmark */}
                        {lessonCompleted ? (
                          <span className="w-8 h-8 rounded-lg bg-gold/20 flex items-center justify-center">
                            <Check className="w-4 h-4 text-gold" />
                          </span>
                        ) : (
                          <span className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-sm text-muted-foreground">
                            {lessonIndex + 1}
                          </span>
                        )}

                        {/* Lesson info */}
                        <div className="flex-1 min-w-0">
                          <h3 className={`font-medium truncate group-hover:text-gold transition-colors ${lessonCompleted ? "text-gold" : ""}`}>
                            {lesson.title}
                          </h3>
                          <p className="text-muted-foreground text-sm truncate">
                            {lesson.description}
                          </p>
                        </div>

                        {/* Type badge */}
                        <Badge variant="outline" className={typeColors[lesson.type]}>
                          <TypeIcon className="w-3 h-3 mr-1" />
                          {lesson.type}
                        </Badge>

                        {/* Duration */}
                        <span className="text-muted-foreground text-sm flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {lesson.duration}
                        </span>

                        {/* Arrow */}
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-gold transition-colors" />
                      </Link>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}
