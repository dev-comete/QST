// npm install exceljs
import { useCallback, useState } from "react";
import ExcelJS from "exceljs";

/** A wrong answer: no explanation, no color. */
export interface WrongAnswer {
  text: string;
  isCorrect?: false;
}

/** The correct answer: highlighted in green, and an explanation is required. */
export interface CorrectAnswer {
  text: string;
  isCorrect: true;
  explanation: string;
}

export type TemplateAnswer = WrongAnswer | CorrectAnswer;

export interface TemplateQuestion {
  question: string;
  answers: TemplateAnswer[];
}

export interface UseDownloadQuizTemplateOptions {
  fileName?: string;
  sheetName?: string;
  /** Example rows to include so users see the expected format. */
  examples?: TemplateQuestion[];
}

const HEADERS = ["Question", "Réponse", "Explication"] as const;

// Colors taken from the reference template (Distractor.xlsx)
const COLORS = {
  header: "FF9BC2E6", // light blue header
  correct: "FF70AD47", // green: correct answer AND its explanation
} as const;

const solid = (argb: string): ExcelJS.Fill => ({
  type: "pattern",
  pattern: "solid",
  fgColor: { argb },
});

const DEFAULT_EXAMPLES: TemplateQuestion[] = [
  {
    question:
      "1- Comment est souvent gérée la remise de chèques physiques dans une banque traditionnelle ?",
    answers: [
      {
        text: "Le client doit obligatoirement les envoyer par la poste au siège social de la banque.",
      },
      {
        text: "Le client remplit un bordereau et dépose le tout dans une urne sécurisée ou au guichet de son agence.",
        isCorrect: true,
        explanation:
          "La proximité de l'agence simplifie grandement l'encaissement des chèques sans nécessiter d'envoi postal payant.",
      },
      {
        text: "Le chèque papier est détruit par le client une fois qu'il l'a pris en photo.",
      },
    ],
  },
];

/**
 * Builds the workbook layout:
 *  - Column A: question (merged across the question's answer rows)
 *  - Column B: one answer per row (correct answer filled in green)
 *  - Column C: explanation (same green, on the correct answer's row)
 */
async function buildWorkbook(
  sheetName: string,
  examples: TemplateQuestion[]
): Promise<ExcelJS.Workbook> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(sheetName);

  sheet.columns = [
    { header: HEADERS[0], key: "question", width: 50 },
    { header: HEADERS[1], key: "answer", width: 65 },
    { header: HEADERS[2], key: "explanation", width: 60 },
  ];

  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.alignment = { vertical: "middle", horizontal: "center" };
  headerRow.eachCell((cell) => {
    cell.fill = solid(COLORS.header);
  });
  sheet.views = [{ state: "frozen", ySplit: 1 }];

  for (const q of examples) {
    const startRow = sheet.rowCount + 1;

    q.answers.forEach((a, i) => {
      if (a.isCorrect && !a.explanation.trim()) {
        throw new Error(
          `The correct answer of "${q.question}" needs an explanation.`
        );
      }

      const row = sheet.addRow({
        question: i === 0 ? q.question : "",
        answer: a.text,
        explanation: a.isCorrect ? a.explanation : "",
      });

      if (a.isCorrect) {
        row.getCell("answer").fill = solid(COLORS.correct);
        row.getCell("explanation").fill = solid(COLORS.correct);
      }
    });

    const endRow = startRow + q.answers.length - 1;
    if (endRow > startRow) {
      sheet.mergeCells(startRow, 1, endRow, 1);
    }
  }

  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    row.eachCell({ includeEmpty: true }, (cell) => {
      cell.alignment = { wrapText: true, vertical: "top" };
    });
  });

  return workbook;
}

function triggerBrowserDownload(buffer: ArrayBuffer, fileName: string) {
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function useDownloadQuizTemplate({
  fileName = "Modele_question_qst.xlsx",
  sheetName = "Feuille1",
  examples = DEFAULT_EXAMPLES,
}: UseDownloadQuizTemplateOptions = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const download = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const workbook = await buildWorkbook(sheetName, examples);
      const buffer = await workbook.xlsx.writeBuffer();
      triggerBrowserDownload(buffer as ArrayBuffer, fileName);
    } catch (e) {
      setError(e instanceof Error ? e : new Error("Export failed"));
    } finally {
      setIsLoading(false);
    }
  }, [fileName, sheetName, examples]);

  return { download, isLoading, error };
}