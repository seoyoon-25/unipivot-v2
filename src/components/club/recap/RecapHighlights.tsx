import { BookOpen, Quote, Lightbulb } from 'lucide-react';

interface Props {
  highlights: {
    topBooks: { title: string; author: string | null; attendees: number }[];
  };
  aiHighlights?: {
    keyInsights?: string[];
    memorableQuotes?: string[];
    summary?: string;
  } | null;
}

export default function RecapHighlights({ highlights, aiHighlights }: Props) {
  return (
    <div className="space-y-6">
      {/* 인기 책 */}
      {highlights.topBooks.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            가장 인기 있었던 책
          </h2>
          <div className="space-y-3">
            {highlights.topBooks.map((book, i) => (
              <div key={i} className="flex items-center gap-4">
                <span className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-sm">
                  {i + 1}
                </span>
                <div>
                  <p className="font-medium text-gray-900">{book.title}</p>
                  {book.author && (
                    <p className="text-sm text-gray-500">{book.author}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI 하이라이트 */}
      {aiHighlights && (
        <>
          {/* AI 요약 */}
          {aiHighlights.summary && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
              <p className="text-gray-700 text-lg leading-relaxed">
                {aiHighlights.summary}
              </p>
            </div>
          )}

          {/* 주요 인사이트 */}
          {aiHighlights.keyInsights && aiHighlights.keyInsights.length > 0 && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-purple-600" />
                주요 인사이트
              </h2>
              <ul className="space-y-2">
                {aiHighlights.keyInsights.map((insight, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-purple-600 mt-0.5">&#x2022;</span>
                    <span className="text-gray-700">{insight}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 기억에 남는 명문장 */}
          {aiHighlights.memorableQuotes &&
            aiHighlights.memorableQuotes.length > 0 && (
              <div className="bg-amber-50 rounded-xl border border-amber-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Quote className="w-5 h-5 text-amber-600" />
                  기억에 남는 명문장
                </h2>
                <div className="space-y-4">
                  {aiHighlights.memorableQuotes.map((quote, i) => (
                    <blockquote
                      key={i}
                      className="text-gray-700 italic border-l-4 border-amber-400 pl-4"
                    >
                      &ldquo;{quote}&rdquo;
                    </blockquote>
                  ))}
                </div>
              </div>
            )}
        </>
      )}
    </div>
  );
}
