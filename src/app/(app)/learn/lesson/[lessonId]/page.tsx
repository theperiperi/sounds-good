"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { grades } from "@/data/courses";
import { getLessonContent, getLessonNotes } from "@/data/lessonContent";
import { Keyboard } from "@/components/keyboard/Keyboard";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, BookOpen, Play, FlaskConical, Clock, Lightbulb, CheckCircle, ArrowRight, Music, Check, Loader2, LogIn } from "lucide-react";
import { useProgress, calculateModuleProgress } from "@/hooks/useProgress";
import { useAuth } from "@/components/auth/AuthProvider";
import { toast } from "sonner";

const typeIcons = {
  theory: BookOpen,
  practical: Play,
  exercise: FlaskConical,
};

// Unified gold theme - all types use gold with subtle variation
const typeColors = {
  theory: "bg-gold/10 text-gold border-gold/30",
  practical: "bg-gold/20 text-gold border-gold/40",
  exercise: "bg-gold/15 text-gold border-gold/35",
};

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
  const router = useRouter();
  const { user } = useAuth();
  const { isLessonCompleted, toggleLessonComplete, getCompletedLessons, loading: progressLoading } = useProgress();
  const [isToggling, setIsToggling] = useState(false);

  if (!result) {
    notFound();
  }

  const { lesson, module, grade } = result;
  const TypeIcon = typeIcons[lesson.type];

  // Get lesson content and notes
  const lessonContent = getLessonContent(lessonId);
  const highlightedNotes = getLessonNotes(lessonId);

  // Find next lesson
  const currentIndex = module.lessons.findIndex(l => l.id === lessonId);
  const nextLesson = module.lessons[currentIndex + 1];

  // Progress tracking
  const isCompleted = isLessonCompleted(lessonId);
  const completedLessons = getCompletedLessons();
  const moduleProgress = calculateModuleProgress(module.lessons, completedLessons);

  const handleMarkComplete = async () => {
    if (!user) {
      router.push("/auth");
      return;
    }

    setIsToggling(true);
    const success = await toggleLessonComplete(lessonId);
    setIsToggling(false);

    if (success) {
      if (!isCompleted) {
        toast.success("Lesson completed!", {
          description: nextLesson ? "Ready for the next one?" : "Great job finishing this module!",
        });
      }
    } else {
      toast.error("Failed to update progress");
    }
  };

  const handleNextLesson = () => {
    if (nextLesson) {
      router.push(`/learn/lesson/${nextLesson.id}`);
    }
  };

  return (
    <main className="min-h-[calc(100vh-4rem)] p-8">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link href="/learn" className="hover:text-foreground transition-colors">
            Learn
          </Link>
          <span className="text-muted-foreground/50">/</span>
          <Link href={`/learn/grade/${grade.id}`} className="hover:text-foreground transition-colors">
            Grade {grade.id}
          </Link>
          <span className="text-muted-foreground/50">/</span>
          <span className="text-foreground">{lesson.title}</span>
        </div>

        {/* Lesson header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Badge variant="outline" className={typeColors[lesson.type]}>
              <TypeIcon className="w-3 h-3 mr-1" />
              {lesson.type}
            </Badge>
            <span className="text-muted-foreground flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {lesson.duration}
            </span>
          </div>

          <h1 className="font-serif text-4xl font-bold mb-3 text-shadow-gold">{lesson.title}</h1>
          <p className="text-muted-foreground text-lg">{lesson.description}</p>
        </div>

        {/* Lesson content area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Lesson Content */}
            <Card className="bg-card/50 border-border">
              <CardHeader>
                <CardTitle className="font-serif">Lesson Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {lessonContent ? (
                  <>
                    {/* Introduction */}
                    <p className="text-foreground leading-relaxed">
                      {lessonContent.content.introduction}
                    </p>

                    {/* Key Points */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-gold">Key Points</h3>
                      <ul className="space-y-2">
                        {lessonContent.content.keyPoints.map((point, i) => (
                          <li key={i} className="flex items-start gap-3 text-muted-foreground">
                            <span className="w-5 h-5 rounded-full bg-gold/20 text-gold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                              {i + 1}
                            </span>
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Scale/Chord Info if present */}
                    {lessonContent.scale && (
                      <Card className="bg-gold/5 border-gold/20">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Music className="w-4 h-4 text-gold" />
                            <span className="font-semibold text-gold">{lessonContent.scale.name}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Notes: {lessonContent.scale.notes.join(" - ")}
                          </p>
                        </CardContent>
                      </Card>
                    )}

                    {lessonContent.chord && (
                      <Card className="bg-gold/5 border-gold/20">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Music className="w-4 h-4 text-gold" />
                            <span className="font-semibold text-gold">{lessonContent.chord.name}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Notes: {lessonContent.chord.notes.join(" - ")}
                          </p>
                        </CardContent>
                      </Card>
                    )}

                    {/* Interactive Keyboard for practical/exercise lessons */}
                    {(lesson.type === "practical" || lesson.type === "exercise") && highlightedNotes.length > 0 && (
                      <div className="space-y-6">
                        <div className="flex justify-center py-6 overflow-x-auto">
                          <Keyboard highlightedNotes={highlightedNotes} />
                        </div>
                      </div>
                    )}

                    {/* Practice instruction */}
                    {lessonContent.content.practice && (
                      <Card className="bg-gold/10 border-gold/20">
                        <CardContent className="p-4 flex items-start gap-3">
                          <Play className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
                          <div>
                            <strong className="text-gold">Practice:</strong>{" "}
                            <span className="text-foreground">{lessonContent.content.practice}</span>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Tip */}
                    {lessonContent.content.tip && (
                      <Card className="bg-card border-border">
                        <CardContent className="p-4 flex items-start gap-3">
                          <Lightbulb className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
                          <div>
                            <strong className="text-gold">Tip:</strong>{" "}
                            <span className="text-muted-foreground">{lessonContent.content.tip}</span>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </>
                ) : (
                  <>
                    {/* Fallback content for lessons without rich content yet */}
                    <p className="text-muted-foreground">
                      This lesson covers: {lesson.description}
                    </p>

                    {(lesson.type === "practical" || lesson.type === "exercise") && (
                      <div className="space-y-6">
                        <p className="text-foreground">
                          Use the keyboard below to practice. The notes you need to play
                          will be highlighted.
                        </p>

                        <div className="flex justify-center py-6 overflow-x-auto">
                          <Keyboard highlightedNotes={[60, 62, 64, 65, 67]} />
                        </div>

                        <Card className="bg-gold/10 border-gold/20">
                          <CardContent className="p-4 flex items-start gap-3">
                            <Lightbulb className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
                            <p className="text-sm">
                              <strong className="text-gold">Try it:</strong>{" "}
                              <span className="text-foreground">Explore the keyboard and practice the highlighted notes.</span>
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Progress section */}
            <Card className="bg-card/50 border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold">Module Progress</h3>
                  <span className="text-muted-foreground text-sm">
                    {user ? `${moduleProgress}% complete` : "Sign in to track"}
                  </span>
                </div>
                <Progress value={user ? moduleProgress : 0} className="h-2" />
                {user && isCompleted && (
                  <p className="text-sm text-gold mt-3 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    You've completed this lesson
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Module info */}
            <Card className="bg-card/50 border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{module.title}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-muted-foreground text-sm mb-4">{module.description}</p>
                <Separator className="mb-4" />
                <div className="space-y-1">
                  {module.lessons.map((l, i) => {
                    const lessonCompleted = isLessonCompleted(l.id);
                    return (
                      <Link
                        key={l.id}
                        href={`/learn/lesson/${l.id}`}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                          l.id === lessonId
                            ? "gradient-gold text-black font-medium"
                            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                        }`}
                      >
                        {lessonCompleted ? (
                          <Check className={`w-4 h-4 flex-shrink-0 ${l.id === lessonId ? "text-black" : "text-gold"}`} />
                        ) : (
                          <span className="w-4 text-center flex-shrink-0">{i + 1}.</span>
                        )}
                        <span className="truncate">{l.title}</span>
                      </Link>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="space-y-3">
              {user ? (
                <Button
                  className={`w-full ${isCompleted ? "bg-gold/20 text-gold border border-gold/30 hover:bg-gold/30" : "gradient-gold text-black hover:opacity-90"}`}
                  onClick={handleMarkComplete}
                  disabled={isToggling || progressLoading}
                >
                  {isToggling ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : isCompleted ? (
                    <Check className="w-4 h-4 mr-2" />
                  ) : (
                    <CheckCircle className="w-4 h-4 mr-2" />
                  )}
                  {isCompleted ? "Completed" : "Mark Complete"}
                </Button>
              ) : (
                <Link href="/auth" className="block">
                  <Button className="w-full gradient-gold text-black hover:opacity-90">
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign in to Track Progress
                  </Button>
                </Link>
              )}
              {nextLesson && (
                <Button variant="secondary" className="w-full" onClick={handleNextLesson}>
                  Next Lesson
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
