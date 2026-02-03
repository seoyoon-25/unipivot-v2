'use client'

import { useEffect, useState } from 'react'

interface Props {
  message: string
  type?: 'polite' | 'assertive'
}

export default function LiveRegion({ message, type = 'polite' }: Props) {
  const [announcement, setAnnouncement] = useState('')

  useEffect(() => {
    if (message) {
      setAnnouncement('')
      setTimeout(() => setAnnouncement(message), 100)
    }
  }, [message])

  return (
    <div
      role="status"
      aria-live={type}
      aria-atomic="true"
      className="sr-only"
    >
      {announcement}
    </div>
  )
}
