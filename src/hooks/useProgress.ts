"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { LessonProgress, Database } from "@/lib/supabase/types";

type LessonProgressInsert = Database["public"]["Tables"]["lesson_progress"]["Insert"];

export function useProgress() {
  const { user, isConfigured } = useAuth();
  const [progress, setProgress] = useState<LessonProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(
    () => (isSupabaseConfigured() ? createClient() : null),
    []
  );

  // Fetch all progress for the user
  const fetchProgress = useCallback(async () => {
    if (!user || !supabase) {
      setProgress([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("lesson_progress")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;
      setProgress((data as LessonProgress[]) || []);
    } catch (error) {
      console.error("Error fetching progress:", error);
    } finally {
      setLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  // Check if a lesson is completed
  const isLessonCompleted = useCallback(
    (lessonId: string) => {
      return progress.some((p) => p.lesson_id === lessonId && p.completed);
    },
    [progress]
  );

  // Get completed lesson IDs
  const getCompletedLessons = useCallback(() => {
    return progress.filter((p) => p.completed).map((p) => p.lesson_id);
  }, [progress]);

  // Mark a lesson as complete
  const markLessonComplete = useCallback(
    async (lessonId: string) => {
      if (!user || !supabase) return false;

      try {
        const insertData: LessonProgressInsert = {
          user_id: user.id,
          lesson_id: lessonId,
          completed: true,
          completed_at: new Date().toISOString(),
        };

        const { error } = await supabase
          .from("lesson_progress")
          .upsert(insertData as never, {
            onConflict: "user_id,lesson_id",
          });

        if (error) throw error;

        // Update local state
        setProgress((prev) => {
          const existing = prev.find((p) => p.lesson_id === lessonId);
          if (existing) {
            return prev.map((p) =>
              p.lesson_id === lessonId
                ? { ...p, completed: true, completed_at: new Date().toISOString() }
                : p
            );
          }
          return [
            ...prev,
            {
              id: crypto.randomUUID(),
              user_id: user.id,
              lesson_id: lessonId,
              completed: true,
              completed_at: new Date().toISOString(),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ];
        });

        return true;
      } catch (error) {
        console.error("Error marking lesson complete:", error);
        return false;
      }
    },
    [user, supabase]
  );

  // Mark a lesson as incomplete
  const markLessonIncomplete = useCallback(
    async (lessonId: string) => {
      if (!user || !supabase) return false;

      try {
        const insertData: LessonProgressInsert = {
          user_id: user.id,
          lesson_id: lessonId,
          completed: false,
          completed_at: null,
        };

        const { error } = await supabase
          .from("lesson_progress")
          .upsert(insertData as never, {
            onConflict: "user_id,lesson_id",
          });

        if (error) throw error;

        // Update local state
        setProgress((prev) =>
          prev.map((p) =>
            p.lesson_id === lessonId
              ? { ...p, completed: false, completed_at: null }
              : p
          )
        );

        return true;
      } catch (error) {
        console.error("Error marking lesson incomplete:", error);
        return false;
      }
    },
    [user, supabase]
  );

  // Toggle lesson completion
  const toggleLessonComplete = useCallback(
    async (lessonId: string) => {
      const isCompleted = isLessonCompleted(lessonId);
      if (isCompleted) {
        return markLessonIncomplete(lessonId);
      }
      return markLessonComplete(lessonId);
    },
    [isLessonCompleted, markLessonComplete, markLessonIncomplete]
  );

  return {
    progress,
    loading,
    isLessonCompleted,
    getCompletedLessons,
    markLessonComplete,
    markLessonIncomplete,
    toggleLessonComplete,
    refetch: fetchProgress,
  };
}

// Calculate progress for a module
export function calculateModuleProgress(
  moduleLessons: { id: string }[],
  completedLessons: string[]
): number {
  if (moduleLessons.length === 0) return 0;
  const completed = moduleLessons.filter((l) =>
    completedLessons.includes(l.id)
  ).length;
  return Math.round((completed / moduleLessons.length) * 100);
}

// Calculate progress for a grade (all modules)
export function calculateGradeProgress(
  modules: { lessons: { id: string }[] }[],
  completedLessons: string[]
): number {
  const allLessons = modules.flatMap((m) => m.lessons);
  return calculateModuleProgress(allLessons, completedLessons);
}
