"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Timer, XCircle } from "lucide-react";
import { Badge, Button, Card, CardContent, Progress } from "@/components/ui";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { QuizQuestion } from "@/lib/types";

interface Props {
  questions: QuizQuestion[];
  onFinish: (result: { scored: number; total: number; answers: Record<string, number[]> }) => void;
}

export function QuizEngine({ questions, onFinish }: Props) {
  const { t } = useI18n();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number[]>>({});
  const [selected, setSelected] = useState<number[]>([]);
  const [revealed, setRevealed] = useState(false);

  const question = questions[index];
  const timeLimit = question?.timeLimitSeconds ?? 60;
  const [secondsLeft, setSecondsLeft] = useState(timeLimit);

  useEffect(() => {
    setSecondsLeft(timeLimit);
    setSelected([]);
    setRevealed(false);
  }, [index, timeLimit]);

  useEffect(() => {
    if (revealed) return;
    if (secondsLeft <= 0) {
      handleNext();
      return;
    }
    const id = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft, revealed]);

  const isMulti = question?.type === "MULTIPLE_ANSWER";

  function toggleOption(i: number) {
    if (revealed) return;
    setSelected((prev) => {
      if (isMulti) return prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i];
      return [i];
    });
  }

  function handleCheck() {
    setRevealed(true);
  }

  function handleNext() {
    const updated = { ...answers, [question.id]: selected };
    setAnswers(updated);
    if (index + 1 < questions.length) {
      setIndex((i) => i + 1);
    } else {
      const scored = questions.reduce((acc, q) => {
        const given = (updated[q.id] ?? []).slice().sort();
        const correct = (q.correctOptionIndexes ?? []).slice().sort();
        const isCorrect = given.length === correct.length && given.every((v, i2) => v === correct[i2]);
        return acc + (isCorrect ? q.points : 0);
      }, 0);
      const total = questions.reduce((acc, q) => acc + q.points, 0);
      onFinish({ scored, total, answers: updated });
    }
  }

  const progressPercent = useMemo(() => ((index + 1) / questions.length) * 100, [index, questions.length]);

  if (!question) return null;

  return (
    <Card>
      <CardContent className="space-y-5">
        <div className="flex items-center justify-between">
          <Badge variant="muted">
            {index + 1} / {questions.length}
          </Badge>
          <div className="flex items-center gap-2">
            <Badge variant={question.difficulty === "HARD" ? "destructive" : question.difficulty === "MEDIUM" ? "warning" : "success"}>
              {question.difficulty}
            </Badge>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Timer className="h-3.5 w-3.5" />
              <span className="font-mono tabular-nums">{secondsLeft}s</span>
            </div>
          </div>
        </div>

        <Progress value={progressPercent} />

        <h3 className="text-lg font-semibold leading-snug">{question.prompt}</h3>

        <div className="space-y-2">
          {(question.options ?? []).map((opt, i) => {
            const isSelected = selected.includes(i);
            const isCorrect = (question.correctOptionIndexes ?? []).includes(i);
            return (
              <button
                key={i}
                onClick={() => toggleOption(i)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-md border p-3 text-start text-sm transition-colors",
                  !revealed && isSelected && "border-primary bg-primary/5",
                  !revealed && !isSelected && "border-border hover:bg-muted",
                  revealed && isCorrect && "border-success bg-success/10",
                  revealed && !isCorrect && isSelected && "border-destructive bg-destructive/10"
                )}
              >
                <span
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px]",
                    isSelected ? "border-primary bg-primary text-primary-foreground" : "border-border"
                  )}
                >
                  {isMulti ? (isSelected ? "✓" : "") : String.fromCharCode(65 + i)}
                </span>
                <span className="flex-1">{opt}</span>
                {revealed && isCorrect && <CheckCircle2 className="h-4 w-4 text-success" />}
                {revealed && !isCorrect && isSelected && <XCircle className="h-4 w-4 text-destructive" />}
              </button>
            );
          })}
        </div>

        {revealed && question.explanation && (
          <p className="rounded-md bg-muted p-3 text-sm text-muted-foreground">{question.explanation}</p>
        )}

        <div className="flex justify-end gap-2">
          {!revealed ? (
            <Button onClick={handleCheck} disabled={selected.length === 0}>
              {t("action.submit")}
            </Button>
          ) : (
            <Button onClick={handleNext}>{index + 1 < questions.length ? t("quiz.next") : t("quiz.finish")}</Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
