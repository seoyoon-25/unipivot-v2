import { GoogleGenerativeAI } from '@google/generative-ai';
import prisma from '@/lib/db';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export interface AIHighlights {
  keyInsights?: string[];
  memorableQuotes?: string[];
  summary?: string;
}

/**
 * AI 기반 시즌 하이라이트 생성 (Gemini)
 */
export async function generateAIHighlights(
  programId: string,
): Promise<AIHighlights | null> {
  const program = await prisma.program.findUnique({
    where: { id: programId },
    include: { sessions: true },
  });

  if (!program) return null;

  const bookTitles = program.sessions
    .map((s) => s.bookTitle)
    .filter((t): t is string => !!t);

  if (bookTitles.length === 0) return null;

  // 독후감 수집
  const reports = await prisma.bookReport.findMany({
    where: {
      OR: [
        { programId },
        { bookTitle: { in: bookTitles } },
      ],
    },
    select: { content: true, bookTitle: true },
    take: 20,
  });

  // 명문장 수집
  const quotes = await prisma.quote.findMany({
    where: { bookTitle: { in: bookTitles } },
    select: { content: true, bookTitle: true },
    take: 10,
  });

  if (reports.length === 0 && quotes.length === 0) return null;

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
다음은 "${program.title}" 독서모임의 독후감과 명문장입니다.
시즌 회고용 하이라이트를 생성해주세요.

독후감:
${reports.map((r) => `[${r.bookTitle}] ${r.content.slice(0, 200)}`).join('\n')}

명문장:
${quotes.map((q) => `[${q.bookTitle}] "${q.content}"`).join('\n')}

JSON 형식으로 응답해주세요:
{
  "keyInsights": ["인사이트1", "인사이트2", "인사이트3"],
  "memorableQuotes": ["명문장1", "명문장2"],
  "summary": "한 문장 요약"
}
`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();
    const jsonMatch = response.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as AIHighlights;
    }
  } catch (error) {
    console.error('AI highlight generation error:', error);
  }

  return null;
}
