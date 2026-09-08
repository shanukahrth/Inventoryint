import { useMemo, useState } from 'react'
import { ChevronDown, X } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface MultiSelectFilterProps {
  label: string
  options: string[]
  selected: string[]
  onChange: (values: string[]) => void
  className?: string
}

export function MultiSelectFilter({ label, options, selected, onChange, className }: MultiSelectFilterProps) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)

  const filteredOptions = useMemo(() => {
    if (!query.trim()) return options
    const q = query.toLowerCase()
    return options.filter((o) => o.toLowerCase().includes(q))
  }, [options, query])

  const toggle = (value: string) => {
    onChange(selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value])
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            'justify-between gap-1.5 border-dashed font-normal',
            selected.length > 0 && 'border-solid border-primary/40 bg-accent',
            className,
          )}
        >
          <span className="truncate">
            {label}
            {selected.length > 0 && (
              <span className="ml-1.5 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
                {selected.length}
              </span>
            )}
          </span>
          <ChevronDown className="h-3.5 w-3.5 opacity-60" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2">
        <div className="flex items-center gap-1.5 pb-2">
          <Input
            placeholder={`Search ${label.toLowerCase()}...`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-8 text-xs"
          />
          {selected.length > 0 && (
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => onChange([])}>
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
        <div className="max-h-64 space-y-0.5 overflow-y-auto">
          {filteredOptions.length === 0 && (
            <p className="px-2 py-3 text-center text-xs text-muted-foreground">No matches.</p>
          )}
          {filteredOptions.map((option) => (
            <label
              key={option}
              className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-xs hover:bg-accent"
            >
              <Checkbox checked={selected.includes(option)} onCheckedChange={() => toggle(option)} />
              <span className="truncate">{option}</span>
            </label>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
