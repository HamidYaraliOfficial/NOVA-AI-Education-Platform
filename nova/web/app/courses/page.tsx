"use client";

import { AppShell } from "@/components/shell";
import { CourseCard } from "@/components/widgets";
import type { Course } from "@/lib/types";

const COURSES: Course[] = [
  {
    id: "python-101",
    title: "Python for Data Analysis",
    description: "From variables to pandas dataframes, with hands-on exercises after every lesson.",
    category: "Programming",
    difficulty: "BEGINNER",
    language: "en",
    progressPercent: 62,
    totalLessons: 48,
    completedLessons: 30,
    rating: 4.8,
    instructor: "Dr. Amelia Chen"
  },
  {
    id: "algo-201",
    title: "Algorithms & Data Structures",
    description: "Master the fundamentals with 120+ coding challenges and adaptive quizzes.",
    category: "Computer Science",
    difficulty: "INTERMEDIATE",
    language: "en",
    progressPercent: 24,
    totalLessons: 60,
    completedLessons: 14,
    rating: 4.9,
    instructor: "Farid Hosseini"
  },
  {
    id: "ml-301",
    title: "Applied Machine Learning",
    description: "Build and evaluate real models, guided by your AI tutor at every step.",
    category: "AI & ML",
    difficulty: "ADVANCED",
    language: "en",
    progressPercent: 5,
    totalLessons: 55,
    completedLessons: 3,
    rating: 4.7,
    instructor: "Li Wei"
  },
  {
    id: "web-101",
    title: "Modern Web Development",
    description: "TypeScript, React and API design, taught through a real project.",
    category: "Programming",
    difficulty: "BEGINNER",
    language: "en",
    progressPercent: 0,
    totalLessons: 40,
    completedLessons: 0,
    rating: 4.6,
    instructor: "Amelia Chen"
  }
];

export default function CoursesPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">My Learning</h1>
          <p className="text-muted-foreground">All courses in your personalized path.</p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {COURSES.map((c) => (
            <CourseCard key={c.id} course={c} />
          ))}
        </div>
      </div>
    </AppShell>
  );
}
