"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Badge, Button, Card, CardContent } from "@/components/ui";
import { useI18n } from "@/lib/i18n";
import type { Flashcard } from "@/lib/types";

export type Grade = "AGAIN" | "GOOD" | "EASY";

/**
 * Simplified SM-2 spaced-repetition update. Mirrors the algorithm used
 * server-side (see backend flashcard module) so the UI can preview the
 * next interval before syncing with the API.
 */
export function applySm2(card: Flashcard, grade: Grade): Flashcard {
  let { easeFactor, intervalDays, correctStreak } = card;

  if (grade === "AGAIN") {
    correctStreak = 0;
    intervalDays = 1;
    easeFactor = Math.max(1.3, easeFactor - 0.2);
  } else {
    correctStreak += 1;
    if (grade === "GOOD") {
      intervalDays = correctStreak === 1 ? 1 : correctStreak === 2 ? 3 : Math.round(intervalDays * easeFactor);
    } else {
      intervalDays = correctStreak === 1 ? 2 : Math.round(intervalDays * easeFactor * 1.3);
      easeFactor += 0.15;
    }
  }

  const dueAt = new Date(Date.now() + intervalDays * 86400000).toISOString();
  return { ...card, easeFactor, intervalDays, correctStreak, dueAt };
}

export function FlashcardDeck({
  cards,
  onGrade
}: {
  cards: Flashcard[];
  onGrade: (cardId: string, grade: Grade, updated: Flashcard) => void;
}) {
  const { t } = useI18n();
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const card = cards[index];
  if (!card) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          {t("flashcards.due")}: 0
        </CardContent>
      </Card>
    );
  }

  function grade(g: Grade) {
    const updated = applySm2(card, g);
    onGrade(card.id, g, updated);
    setFlipped(false);
    setIndex((i) => i + 1);
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Badge variant="muted">
              {index + 1} / {cards.length}
            </Badge>
            {card.aiGenerated && (
              <Badge>
                <Sparkles className="me-1 h-3 w-3" /> AI
              </Badge>
            )}
          </div>
          <button
            onClick={() => setFlipped((f) => !f)}
            className="fluent-card flex min-h-[220px] w-full items-center justify-center p-8 text-center text-lg font-medium transition-transform hover:-translate-y-0.5"
          >
            {flipped ? card.back : card.front}
          </button>
          <p className="text-center text-xs text-muted-foreground">Click card to flip</p>
        </CardContent>
      </Card>

      {flipped && (
        <div className="grid grid-cols-3 gap-2">
          <Button variant="destructive" onClick={() => grade("AGAIN")}>
            {t("flashcards.again")}
          </Button>
          <Button variant="secondary" onClick={() => grade("GOOD")}>
            {t("flashcards.good")}
          </Button>
          <Button onClick={() => grade("EASY")}>{t("flashcards.easy")}</Button>
        </div>
      )}
    </div>
  );
}
