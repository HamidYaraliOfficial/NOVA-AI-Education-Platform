export type Role = "STUDENT" | "TEACHER" | "COURSE_CREATOR" | "MODERATOR" | "ADMIN";

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  avatarUrl?: string;
  level: number;
  xp: number;
  streakDays: number;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  coverUrl?: string;
  category: string;
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";
  language: "en" | "fa" | "zh";
  progressPercent: number;
  totalLessons: number;
  completedLessons: number;
  rating: number;
  instructor: string;
}

export interface Section {
  id: string;
  title: string;
  chapters: Chapter[];
}

export interface Chapter {
  id: string;
  title: string;
  lessons: Lesson[];
}

export type LessonType = "VIDEO" | "TEXT" | "AUDIO" | "PDF" | "CODE_EXERCISE" | "QUIZ" | "ASSIGNMENT" | "PROJECT" | "FINAL_EXAM";

export interface Lesson {
  id: string;
  title: string;
  type: LessonType;
  durationMinutes: number;
  completed: boolean;
  resumePositionSeconds?: number;
}

export type QuestionType =
  | "MULTIPLE_CHOICE"
  | "MULTIPLE_ANSWER"
  | "TRUE_FALSE"
  | "MATCHING"
  | "ORDERING"
  | "FILL_BLANK"
  | "SHORT_ANSWER"
  | "CODE";

export interface QuizQuestion {
  id: string;
  type: QuestionType;
  prompt: string;
  options?: string[];
  correctOptionIndexes?: number[];
  explanation?: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  timeLimitSeconds?: number;
  points: number;
  tags: string[];
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  easeFactor: number;
  intervalDays: number;
  dueAt: string;
  correctStreak: number;
  aiGenerated: boolean;
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  type: "REMINDER" | "EXAM" | "ASSIGNMENT" | "STREAK" | "COURSE_UPDATE" | "ANNOUNCEMENT" | "AI_RECOMMENDATION";
  read: boolean;
  createdAt: string;
}

export interface AvailabilityWindow {
  id: string;
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday
  startTime: string; // "HH:mm"
  endTime: string;   // "HH:mm"
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export interface LeaderboardEntry {
  rank: number;
  userName: string;
  xp: number;
  avatarUrl?: string;
}
