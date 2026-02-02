import { Lightbulb } from 'lucide-react'

interface Props {
  analysis: string
}

export default function TasteAnalysis({ analysis }: Props) {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-5">
      <div className="flex items-center gap-2 mb-2">
        <Lightbulb className="w-5 h-5 text-blue-600" />
        <h3 className="font-semibold text-gray-900">독서 취향 분석</h3>
      </div>
      <p className="text-sm text-gray-700 leading-relaxed">{analysis}</p>
    </div>
  )
}
