import Link from "next/link";

import { runQuickBook } from "@22b/quickbook";

import { QuickBookForm } from "./form";

import type { QuickBookProgress, QuickBookRequest, QuickBookResult } from "@22b/quickbook";

export const dynamic = "force-dynamic";

export interface QuickBookActionState {
  submitted: boolean;
  progress: QuickBookProgress[];
  result: QuickBookResult | null;
  error: string | null;
}

const initialState: QuickBookActionState = {
  submitted: false,
  progress: [],
  result: null,
  error: null,
};

function parseReferences(value: string): QuickBookRequest["references"] {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      if (line.startsWith("http://") || line.startsWith("https://")) {
        return { type: "url", value: line } as const;
      }

      if (
        line.includes("\\") ||
        line.includes("/") ||
        /\.(pdf|txt|md)$/i.test(line)
      ) {
        return { type: "file", value: line } as const;
      }

      return { type: "text", value: line } as const;
    });
}

export async function submitQuickBook(
  _previousState: QuickBookActionState,
  formData: FormData,
): Promise<QuickBookActionState> {
  "use server";

  const topic = String(formData.get("topic") ?? "").trim();

  if (!topic) {
    return {
      submitted: true,
      progress: [],
      result: null,
      error: "주제를 입력해 주세요.",
    };
  }

  const formats = formData
    .getAll("format")
    .map((value) => String(value))
    .filter((value): value is "epub" | "pdf" => value === "epub" || value === "pdf");
  const progress: QuickBookProgress[] = [];

  try {
    const result = await runQuickBook(
      {
        topic,
        genre: String(formData.get("genre") ?? "").trim() || undefined,
        chapters: Number(formData.get("chapters") ?? 100),
        style: String(formData.get("style") ?? "웹소설체"),
        language: formData.get("language") === "en" ? "en" : "ko",
        format: formats.length > 0 ? formats : ["epub"],
        references: parseReferences(String(formData.get("references") ?? "")),
      },
      (event) => {
        progress.push(event);
      },
    );

    return {
      submitted: true,
      progress,
      result,
      error: null,
    };
  } catch (error) {
    return {
      submitted: true,
      progress,
      result: null,
      error: error instanceof Error ? error.message : "생성 중 알 수 없는 오류가 발생했습니다.",
    };
  }
}

export default function QuickBookPage() {
  return (
    <main className="shell quickbook-shell">
      <Link href="/" className="back-link">
        ← Dashboard
      </Link>

      <section className="hero quickbook-hero">
        <span className="eyebrow">22B QuickBook</span>
        <h1>주제만 넣으면 장편 전자책까지 바로 뽑습니다</h1>
        <p>
          Author DNA, 플롯 아키텍처, 메모리 DB, export는 뒤에서 자동으로 돌아갑니다.
          보스는 주제와 분량, 레퍼런스만 정하면 됩니다.
        </p>
      </section>

      <QuickBookForm initialState={initialState} action={submitQuickBook} />
    </main>
  );
}
