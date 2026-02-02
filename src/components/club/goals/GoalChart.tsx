'use client'

interface GoalData {
  label: string
  target: number
  achieved: number
}

interface Props {
  data: GoalData[]
}

export default function GoalChart({ data }: Props) {
  if (data.length === 0) return null

  const maxValue = Math.max(...data.map((d) => Math.max(d.target, d.achieved)))

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="font-semibold text-gray-900 mb-4">월별 달성률</h3>
      <div className="flex items-end gap-2 h-40">
        {data.map((item) => {
          const targetHeight = maxValue > 0 ? (item.target / maxValue) * 100 : 0
          const achievedHeight = maxValue > 0 ? (item.achieved / maxValue) * 100 : 0

          return (
            <div key={item.label} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex items-end gap-0.5" style={{ height: '128px' }}>
                <div
                  className="flex-1 bg-gray-200 rounded-t"
                  style={{ height: `${targetHeight}%` }}
                  title={`목표: ${item.target}권`}
                />
                <div
                  className={`flex-1 rounded-t ${
                    item.achieved >= item.target ? 'bg-green-500' : 'bg-blue-500'
                  }`}
                  style={{ height: `${achievedHeight}%` }}
                  title={`달성: ${item.achieved}권`}
                />
              </div>
              <span className="text-xs text-gray-500">{item.label}</span>
            </div>
          )
        })}
      </div>
      <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-gray-200 rounded" />
          목표
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-blue-500 rounded" />
          달성
        </div>
      </div>
    </div>
  )
}
