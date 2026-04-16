import { useCallback, useState } from "react";
import { Upload, X, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface FileUploaderProps { accept?: string; maxSize?: number; onUpload: (file: File) => Promise<void>; className?: string; }

export function FileUploader({ accept = ".pdf,.docx", maxSize = 5 * 1024 * 1024, onUpload, className }: FileUploaderProps) {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(async (file: File) => {
    setError(null);
    if (file.size > maxSize) { setError(`File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`); return; }
    setSelectedFile(file); setUploading(true); setProgress(0);
    const interval = setInterval(() => setProgress((p) => Math.min(p + 10, 90)), 200);
    try { await onUpload(file); setProgress(100); } catch { setError("Upload failed. Please try again."); } finally { clearInterval(interval); setUploading(false); }
  }, [maxSize, onUpload]);

  const onDrop = useCallback((e: React.DragEvent) => { e.preventDefault(); setDragOver(false); const file = e.dataTransfer.files[0]; if (file) handleFile(file); }, [handleFile]);

  return (
    <div className={cn("space-y-3", className)}>
      <div className={cn("relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors cursor-pointer", dragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50")}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={onDrop} onClick={() => document.getElementById("file-upload")?.click()}>
        <Upload className={cn("h-10 w-10 mb-3", dragOver ? "text-primary" : "text-muted-foreground")} />
        <p className="text-sm font-medium">Drag & drop your file here</p>
        <p className="text-xs text-muted-foreground mt-1">or click to browse ({accept})</p>
        <input id="file-upload" type="file" accept={accept} className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
      </div>
      {selectedFile && (
        <div className="flex items-center gap-3 rounded-lg border p-3">
          <FileText className="h-8 w-8 text-primary shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{selectedFile.name}</p>
            <p className="text-xs text-muted-foreground">{(selectedFile.size / 1024).toFixed(1)} KB</p>
            {uploading && <Progress value={progress} className="mt-2 h-1.5" />}
          </div>
          <Button variant="ghost" size="icon" onClick={() => setSelectedFile(null)} className="shrink-0"><X className="h-4 w-4" /></Button>
        </div>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
