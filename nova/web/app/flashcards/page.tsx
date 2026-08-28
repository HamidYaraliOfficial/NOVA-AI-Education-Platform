"use client";

import { useState } from "react";
import { AppShell } from "@/components/shell";
import { FlashcardDeck } from "@/components/flashcard-deck";
import type { Flashcard } from "@/lib/types";

const INITIAL: Flashcard[] = [
  {
    id: "f1",
    front: "What does the Python `len()` function return for a dictionary?",
    back: "The number of key-value pairs it contains.",
    easeFactor: 2.5,
    intervalDays: 1,
    dueAt: new Date().toISOString(),
    correctStreak: 0,
    aiGenerated: true
  },
  {
    id: "f2",
    front: "What is Big-O notation used to describe?",
    back: "The upper bound of an algorithm's time or space complexity as input size grows.",
    easeFactor: 2.5,
    intervalDays: 1,
    dueAt: new Date().toISOString(),
    correctStreak: 0,
    aiGenerated: false
  },
  {
    id: "f3",
    front: "In REST, which HTTP method is idempotent and used to fully replace a resource?",
    back: "PUT.",
    easeFactor: 2.5,
    intervalDays: 1,
    dueAt: new Date().toISOString(),
    correctStreak: 0,
    aiGenerated: true
  }
];

export default function FlashcardsPage() {
  const [cards, setCards] = useState<Flashcard[]>(INITIAL);

  return (
    <AppShell>
      <div className="mx-auto max-w-xl space-y-4">
        <div>
          <h1 className="text-2xl font-semibold">Flashcards</h1>
          <p className="text-muted-foreground">Spaced repetition keeps weak cards coming back more often.</p>
        </div>
        <FlashcardDeck
          cards={cards}
          onGrade={(id, _grade, updated) => {
            setCards((prev) => prev.map((c) => (c.id === id ? updated : c)));
          }}
        />
      </div>
    </AppShell>
  );
}
