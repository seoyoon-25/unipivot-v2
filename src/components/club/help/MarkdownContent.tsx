interface Props {
  content: string
}

export default function MarkdownContent({ content }: Props) {
  const lines = content.trim().split('\n')
  const elements: React.ReactNode[] = []
  let inTable = false
  let tableHeaders: string[] = []
  let tableRows: string[][] = []

  const renderInline = (text: string): React.ReactNode => {
    const parts: React.ReactNode[] = []
    let remaining = text

    while (remaining.length > 0) {
      // Bold
      const boldMatch = remaining.match(/\*\*(.+?)\*\*/)
      if (boldMatch && boldMatch.index !== undefined) {
        if (boldMatch.index > 0) {
          parts.push(remaining.slice(0, boldMatch.index))
        }
        parts.push(
          <strong key={parts.length} className="font-semibold">
            {boldMatch[1]}
          </strong>
        )
        remaining = remaining.slice(boldMatch.index + boldMatch[0].length)
        continue
      }

      // Inline code
      const codeMatch = remaining.match(/`(.+?)`/)
      if (codeMatch && codeMatch.index !== undefined) {
        if (codeMatch.index > 0) {
          parts.push(remaining.slice(0, codeMatch.index))
        }
        parts.push(
          <code
            key={parts.length}
            className="px-1.5 py-0.5 bg-gray-100 rounded text-sm font-mono"
          >
            {codeMatch[1]}
          </code>
        )
        remaining = remaining.slice(codeMatch.index + codeMatch[0].length)
        continue
      }

      parts.push(remaining)
      break
    }

    return parts.length === 1 ? parts[0] : <>{parts}</>
  }

  const flushTable = () => {
    if (tableHeaders.length > 0) {
      elements.push(
        <div key={elements.length} className="overflow-x-auto my-4">
          <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gray-50">
                {tableHeaders.map((header, i) => (
                  <th
                    key={i}
                    className="px-4 py-2 text-left text-sm font-semibold text-gray-700 border-b"
                  >
                    {renderInline(header)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row, ri) => (
                <tr key={ri} className="border-b last:border-b-0">
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-4 py-2 text-sm text-gray-600">
                      {renderInline(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    }
    tableHeaders = []
    tableRows = []
    inTable = false
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()

    // Table detection
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      const cells = trimmed
        .slice(1, -1)
        .split('|')
        .map((c) => c.trim())

      if (!inTable) {
        tableHeaders = cells
        inTable = true
        continue
      }

      // Separator row
      if (cells.every((c) => /^[-:]+$/.test(c))) {
        continue
      }

      tableRows.push(cells)
      continue
    }

    if (inTable) {
      flushTable()
    }

    // Empty line
    if (trimmed === '') {
      continue
    }

    // Headings
    if (trimmed.startsWith('# ')) {
      elements.push(
        <h1 key={elements.length} className="text-2xl font-bold text-gray-900 mb-4 mt-6">
          {renderInline(trimmed.slice(2))}
        </h1>
      )
    } else if (trimmed.startsWith('## ')) {
      elements.push(
        <h2 key={elements.length} className="text-xl font-semibold text-gray-900 mb-3 mt-8">
          {renderInline(trimmed.slice(3))}
        </h2>
      )
    } else if (trimmed.startsWith('### ')) {
      elements.push(
        <h3 key={elements.length} className="text-lg font-medium text-gray-900 mb-2 mt-6">
          {renderInline(trimmed.slice(4))}
        </h3>
      )
    }
    // Blockquote
    else if (trimmed.startsWith('> ')) {
      elements.push(
        <blockquote
          key={elements.length}
          className="border-l-4 border-blue-400 pl-4 py-2 my-3 bg-blue-50 rounded-r-lg text-gray-700 text-sm"
        >
          {renderInline(trimmed.slice(2))}
        </blockquote>
      )
    }
    // Ordered list item
    else if (/^\d+\.\s/.test(trimmed)) {
      const text = trimmed.replace(/^\d+\.\s/, '')
      const indent = line.length - line.trimStart().length
      elements.push(
        <div
          key={elements.length}
          className="flex gap-2 text-gray-600 my-1"
          style={{ paddingLeft: indent > 0 ? '1.5rem' : '0' }}
        >
          <span className="text-gray-400 shrink-0">
            {trimmed.match(/^(\d+)\./)?.[1]}.
          </span>
          <span>{renderInline(text)}</span>
        </div>
      )
    }
    // Unordered list item
    else if (trimmed.startsWith('- ')) {
      elements.push(
        <div key={elements.length} className="flex gap-2 text-gray-600 my-1">
          <span className="text-gray-400 shrink-0">&bull;</span>
          <span>{renderInline(trimmed.slice(2))}</span>
        </div>
      )
    }
    // Regular paragraph
    else {
      elements.push(
        <p key={elements.length} className="text-gray-600 leading-relaxed my-2">
          {renderInline(trimmed)}
        </p>
      )
    }
  }

  if (inTable) {
    flushTable()
  }

  return <div className="prose-custom">{elements}</div>
}
