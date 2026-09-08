import { useCallback, useRef, useState } from 'react'
import { AlertTriangle, BarChart3, FileSpreadsheet, Loader2, ShieldCheck, UploadCloud } from 'lucide-react'
import { useInventoryStore } from '@/store/useInventoryStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { REQUIRED_COLUMNS } from '@/types/inventory'

const ACCEPTED_EXTENSIONS = ['.xlsx', '.xls']

export function UploadPage() {
  const loadWorkbook = useInventoryStore((s) => s.loadWorkbook)
  const status = useInventoryStore((s) => s.status)
  const error = useInventoryStore((s) => s.error)
  const meta = useInventoryStore((s) => s.meta)
  const [isDragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(
    (file: File | undefined | null) => {
      if (!file) return
      const isValidExtension = ACCEPTED_EXTENSIONS.some((ext) => file.name.toLowerCase().endsWith(ext))
      if (!isValidExtension) return
      void loadWorkbook(file)
    },
    [loadWorkbook],
  )

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-2xl">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <BarChart3 className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground">Singer Inventory Intelligence Platform</h1>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Upload a Singer Inventory Report to instantly analyze stock across channels, areas, districts,
            locations and SKUs — entirely inside your browser.
          </p>
        </div>

        <Card
          className={`border-2 border-dashed transition-colors ${isDragging ? 'border-primary bg-accent/40' : 'border-border'}`}
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragging(false)
            handleFile(e.dataTransfer.files?.[0])
          }}
        >
          <CardContent className="flex flex-col items-center gap-4 px-8 py-12 text-center">
            {status === 'loading' ? (
              <>
                <Loader2 className="h-9 w-9 animate-spin text-primary" />
                <p className="text-sm font-medium text-foreground">Parsing workbook locally…</p>
                <p className="text-xs text-muted-foreground">Large files may take a few seconds.</p>
              </>
            ) : (
              <>
                <UploadCloud className="h-9 w-9 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">Upload Singer Inventory Report</p>
                  <p className="mt-1 text-xs text-muted-foreground">Drag and drop, or click to browse</p>
                </div>
                <Button onClick={() => inputRef.current?.click()} className="gap-2">
                  <FileSpreadsheet className="h-4 w-4" />
                  Browse files
                </Button>
                <input
                  ref={inputRef}
                  type="file"
                  accept={ACCEPTED_EXTENSIONS.join(',')}
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files?.[0])}
                />
                <p className="text-[11px] text-muted-foreground">Supported: .xlsx, .xls</p>
              </>
            )}
          </CardContent>
        </Card>

        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-xs text-destructive">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {meta && meta.warnings.length > 0 && (
          <div className="mt-4 rounded-lg border border-warning/40 bg-warning/10 px-4 py-3 text-xs text-warning-foreground">
            <p className="mb-1 flex items-center gap-1.5 font-medium">
              <AlertTriangle className="h-3.5 w-3.5" />
              Loaded with {meta.warnings.length} warning{meta.warnings.length === 1 ? '' : 's'}
            </p>
            <ul className="list-inside list-disc space-y-0.5 opacity-90">
              {meta.warnings.map((w) => (
                <li key={w.column}>{w.message}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-6 flex items-start gap-2 rounded-lg bg-secondary px-4 py-3 text-xs text-secondary-foreground">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" />
          <p>
            Your file is parsed entirely in this browser tab and is never uploaded to any server. Expected
            columns: {REQUIRED_COLUMNS.join(', ')}.
          </p>
        </div>
      </div>
    </div>
  )
}
