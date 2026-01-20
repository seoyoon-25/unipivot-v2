'use client'

import { useState, useRef, useEffect } from 'react'
import { Search, ChevronDown, Check } from 'lucide-react'

interface SearchableSelectProps {
  options: string[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  disabled?: boolean
  icon?: React.ReactNode
  className?: string
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = '선택하세요',
  searchPlaceholder = '검색...',
  disabled = false,
  icon,
  className = '',
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  // 검색어로 필터링된 옵션
  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(search.toLowerCase())
  )

  // 외부 클릭 시 닫기
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // 열릴 때 검색 입력란에 포커스
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // 하이라이트된 항목이 보이도록 스크롤
  useEffect(() => {
    if (isOpen && listRef.current && filteredOptions.length > 0) {
      const highlightedElement = listRef.current.children[highlightedIndex] as HTMLElement
      if (highlightedElement) {
        highlightedElement.scrollIntoView({ block: 'nearest' })
      }
    }
  }, [highlightedIndex, isOpen, filteredOptions.length])

  // 키보드 네비게이션
  function handleKeyDown(e: React.KeyboardEvent) {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault()
        setIsOpen(true)
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex(prev =>
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : 0)
        break
      case 'Enter':
        e.preventDefault()
        if (filteredOptions[highlightedIndex]) {
          handleSelect(filteredOptions[highlightedIndex])
        }
        break
      case 'Escape':
        e.preventDefault()
        setIsOpen(false)
        setSearch('')
        break
    }
  }

  function handleSelect(option: string) {
    onChange(option)
    setIsOpen(false)
    setSearch('')
    setHighlightedIndex(0)
  }

  function handleToggle() {
    if (!disabled) {
      setIsOpen(!isOpen)
      if (!isOpen) {
        setSearch('')
        setHighlightedIndex(0)
      }
    }
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* 선택 버튼 */}
      <button
        type="button"
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={`
          w-full flex items-center justify-between
          px-4 py-3 border border-gray-200 rounded-xl
          bg-white text-left
          focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
          transition-colors
          ${disabled ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : 'hover:border-gray-300'}
          ${icon ? 'pl-12' : ''}
        `}
      >
        {icon && (
          <span className="absolute left-4 text-gray-400">
            {icon}
          </span>
        )}
        <span className={value ? 'text-gray-900' : 'text-gray-400'}>
          {value || placeholder}
        </span>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* 드롭다운 */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          {/* 검색 입력란 */}
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setHighlightedIndex(0)
                }}
                onKeyDown={handleKeyDown}
                placeholder={searchPlaceholder}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>

          {/* 옵션 목록 */}
          <ul
            ref={listRef}
            className="max-h-60 overflow-y-auto py-1"
          >
            {filteredOptions.length === 0 ? (
              <li className="px-4 py-3 text-sm text-gray-400 text-center">
                검색 결과가 없습니다
              </li>
            ) : (
              filteredOptions.map((option, index) => (
                <li
                  key={option}
                  onClick={() => handleSelect(option)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={`
                    px-4 py-2.5 text-sm cursor-pointer flex items-center justify-between
                    ${index === highlightedIndex ? 'bg-primary/5 text-primary' : 'text-gray-700 hover:bg-gray-50'}
                    ${option === value ? 'font-medium' : ''}
                  `}
                >
                  <span>{option}</span>
                  {option === value && (
                    <Check className="w-4 h-4 text-primary" />
                  )}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
