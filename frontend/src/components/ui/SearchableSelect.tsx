import { useEffect, useMemo, useRef, useState } from 'react'

export interface SearchableSelectOption {
  value: string
  label: string
}

interface Props {
  options: SearchableSelectOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  emptyLabel?: string
}

export default function SearchableSelect({ options, value, onChange, placeholder, emptyLabel = '- Nessun risultato -' }: Props) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const selected = useMemo(() => options.find(o => o.value === value), [options, value])

  useEffect(() => {
    setQuery(selected ? selected.label : '')
  }, [selected])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        setQuery(selected ? selected.label : '')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [selected])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q || q === selected?.label.toLowerCase()) return options
    return options.filter(o => o.label.toLowerCase().includes(q))
  }, [options, query, selected])

  function selectOption(option: SearchableSelectOption) {
    onChange(option.value)
    setQuery(option.label)
    setOpen(false)
  }

  return (
    <div className="searchable-select" ref={containerRef}>
      <input
        type="text"
        className="form-control"
        placeholder={placeholder}
        value={query}
        onFocus={() => setOpen(true)}
        onChange={e => {
          setQuery(e.target.value)
          setOpen(true)
        }}
      />
      {open && (
        <div className="searchable-select-list">
          {value && (
            <div
              className="searchable-select-option searchable-select-option-clear"
              onMouseDown={e => {
                e.preventDefault()
                onChange('')
                setQuery('')
                setOpen(false)
              }}
            >
              - Nessuna selezione -
            </div>
          )}
          {filtered.length === 0 ? (
            <div className="searchable-select-empty">{emptyLabel}</div>
          ) : (
            filtered.map(o => (
              <div
                key={o.value}
                className={`searchable-select-option${o.value === value ? ' selected' : ''}`}
                onMouseDown={e => {
                  e.preventDefault()
                  selectOption(o)
                }}
              >
                {o.label}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
