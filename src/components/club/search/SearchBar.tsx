'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'

export default function SearchBar() {
  const router = useRouter()
  const [query, setQuery] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = query.trim()
    if (trimmed) {
      router.push(`/club/search?q=${encodeURIComponent(trimmed)}`)
      setQuery('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="검색..."
        className="w-48 lg:w-56 pl-9 pr-3 py-1.5 text-sm rounded-2xl border border-zinc-100 shadow-sm bg-zinc-50 focus:bg-white focus:border-blue-300 focus:ring-1 focus:ring-blue-300 placeholder:text-zinc-400"
      />
    </form>
  )
}
