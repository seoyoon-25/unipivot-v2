'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface FaqQuestion {
  q: string
  a: string
}

interface Props {
  questions: FaqQuestion[]
}

export default function FaqAccordion({ questions }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className="space-y-2">
      {questions.map((item, index) => {
        const isOpen = openIndex === index
        return (
          <div
            key={index}
            className="bg-white rounded-xl border border-gray-200 overflow-hidden"
          >
            <button
              onClick={() => toggle(index)}
              className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
              aria-expanded={isOpen}
            >
              <span className="font-medium text-gray-900 pr-4">{item.q}</span>
              <ChevronDown
                className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${
                  isOpen ? 'rotate-180' : ''
                }`}
              />
            </button>
            <div
              className={`overflow-hidden transition-all duration-200 ${
                isOpen ? 'max-h-96' : 'max-h-0'
              }`}
            >
              <p className="px-4 pb-4 text-gray-600 text-sm leading-relaxed">{item.a}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
