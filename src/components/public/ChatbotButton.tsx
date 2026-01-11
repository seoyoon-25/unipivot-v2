'use client'

import { useState } from 'react'
import { MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ChatbotModal } from './ChatbotModal'

export function ChatbotButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          'fixed bottom-6 right-6 w-14 h-14 bg-primary hover:bg-primary-dark text-white rounded-full shadow-lg hover:shadow-primary/30 z-40 group transition-all duration-200',
          isOpen && 'opacity-0 pointer-events-none'
        )}
      >
        <MessageCircle className="w-6 h-6 mx-auto" />
        <span className="absolute right-full mr-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity">
          피봇이에게 물어보세요
        </span>
      </button>

      {/* Chat Modal */}
      <ChatbotModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}
