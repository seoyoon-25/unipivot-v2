'use client'

interface CategoryFilterProps {
  categories: string[]
  selected: string
  onSelect: (category: string) => void
}

export default function CategoryFilter({
  categories,
  selected,
  onSelect,
}: CategoryFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
      {categories.map((category) => {
        const isSelected = category === selected

        return (
          <button
            key={category}
            type="button"
            onClick={() => onSelect(category)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm transition-colors ${
              isSelected
                ? 'bg-primary text-white'
                : 'bg-white text-neutral-500 border border-neutral-500/30 hover:border-primary hover:text-primary'
            }`}
          >
            {category}
          </button>
        )
      })}
    </div>
  )
}
