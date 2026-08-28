"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { CheckCircle2, Play, XCircle } from "lucide-react";
import { Badge, Button, Card, CardContent } from "@/components/ui";
import { useI18n } from "@/lib/i18n";
import { codeExecApi } from "@/lib/api-client";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

const LANGUAGES = ["python", "javascript", "typescript", "java", "kotlin", "cpp", "csharp", "go", "rust"] as const;
type Language = (typeof LANGUAGES)[number];

const STARTER: Record<Language, string> = {
  python: 'def solve(nums):\n    return sum(nums)\n\nprint(solve([1, 2, 3]))\n',
  javascript: 'function solve(nums) {\n  return nums.reduce((a, b) => a + b, 0);\n}\nconsole.log(solve([1, 2, 3]));\n',
  typescript: 'function solve(nums: number[]): number {\n  return nums.reduce((a, b) => a + b, 0);\n}\nconsole.log(solve([1, 2, 3]));\n',
  java: 'public class Main {\n  public static void main(String[] args) {\n    System.out.println(6);\n  }\n}\n',
  kotlin: 'fun main() {\n    println(listOf(1, 2, 3).sum())\n}\n',
  cpp: '#include <iostream>\nint main() {\n  std::cout << 6 << std::endl;\n}\n',
  csharp: 'System.Console.WriteLine(6);\n',
  go: 'package main\nimport "fmt"\nfunc main() { fmt.Println(6) }\n',
  rust: 'fn main() {\n    println!("{}", 6);\n}\n'
};

interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
}

const SAMPLE_TESTS: TestCase[] = [
  { id: "t1", input: "[1,2,3]", expectedOutput: "6" },
  { id: "t2", input: "[10,-5,2]", expectedOutput: "7" }
];

export function CodePlayground() {
  const { t } = useI18n();
  const [language, setLanguage] = useState<Language>("python");
  const [code, setCode] = useState(STARTER.python);
  const [output, setOutput] = useState<{ stdout: string; stderr: string; exitCode: number } | null>(null);
  const [running, setRunning] = useState(false);
  const [testResults, setTestResults] = useState<Record<string, boolean> | null>(null);

  function changeLanguage(lang: Language) {
    setLanguage(lang);
    setCode(STARTER[lang]);
    setOutput(null);
    setTestResults(null);
  }

  async function run() {
    setRunning(true);
    setOutput(null);
    try {
      const result = await codeExecApi.run(language, code);
      setOutput(result);
    } catch {
      setOutput({
        stdout: "",
        stderr: "Sandbox executor unreachable. Start the backend's code-execution worker to run this for real.",
        exitCode: 1
      });
    } finally {
      setRunning(false);
    }
  }

  async function runTests() {
    setRunning(true);
    const results: Record<string, boolean> = {};
    for (const tc of SAMPLE_TESTS) {
      try {
        const res = await codeExecApi.run(language, code, tc.input);
        results[tc.id] = res.stdout.trim() === tc.expectedOutput.trim();
      } catch {
        results[tc.id] = false;
      }
    }
    setTestResults(results);
    setRunning(false);
  }

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border p-3">
        <div className="flex items-center gap-2">
          <select
            value={language}
            onChange={(e) => changeLanguage(e.target.value as Language)}
            className="h-9 rounded-md border border-input bg-surface px-2 text-sm"
          >
            {LANGUAGES.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
          <Badge variant="muted">Sandboxed · CPU & memory limited</Badge>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={runTests} disabled={running}>
            Run tests
          </Button>
          <Button size="sm" onClick={run} disabled={running}>
            <Play className="h-3.5 w-3.5" />
            {t("action.run")}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2">
        <div className="h-[420px] border-b border-border lg:border-b-0 lg:border-e">
          <MonacoEditor
            height="420px"
            language={language === "cpp" ? "cpp" : language}
            theme="vs-dark"
            value={code}
            onChange={(v) => setCode(v ?? "")}
            options={{ fontSize: 13, minimap: { enabled: false }, automaticLayout: true }}
          />
        </div>

        <div className="flex h-[420px] flex-col divide-y divide-border overflow-y-auto">
          <div className="p-3">
            <div className="mb-1 text-xs font-semibold text-muted-foreground">STDOUT</div>
            <pre className="whitespace-pre-wrap rounded-md bg-muted p-2.5 text-xs">{output?.stdout || "—"}</pre>
          </div>
          <div className="p-3">
            <div className="mb-1 text-xs font-semibold text-muted-foreground">STDERR</div>
            <pre className="whitespace-pre-wrap rounded-md bg-destructive/5 p-2.5 text-xs text-destructive">
              {output?.stderr || "—"}
            </pre>
          </div>
          <div className="p-3">
            <div className="mb-1 text-xs font-semibold text-muted-foreground">TEST CASES</div>
            <ul className="space-y-1.5">
              {SAMPLE_TESTS.map((tc) => (
                <li key={tc.id} className="flex items-center gap-2 rounded-md bg-muted p-2 text-xs">
                  {testResults?.[tc.id] === true && <CheckCircle2 className="h-3.5 w-3.5 text-success" />}
                  {testResults?.[tc.id] === false && <XCircle className="h-3.5 w-3.5 text-destructive" />}
                  <span className="font-mono">
                    input: {tc.input} → expected: {tc.expectedOutput}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Card>
  );
}
