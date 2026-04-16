import { FileText, Download, Eye, Trash2, Upload } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { FadeIn } from "@/components/animations/FadeIn";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileUploader } from "@/components/shared/FileUploader";
import { useUploadResume } from "@/features/profile/hooks/useProfile";

export default function ResumePage() {
  const uploadMutation = useUploadResume();
  return (
    <div className="space-y-6">
      <FadeIn><PageHeader title="Resume" description="Upload and manage your resume for applications" /></FadeIn>
      <div className="grid gap-6 lg:grid-cols-2">
        <FadeIn delay={0.1}><Card><CardHeader><CardTitle className="text-lg flex items-center gap-2"><Upload className="h-5 w-5" /> Upload Resume</CardTitle></CardHeader><CardContent>
          <FileUploader accept=".pdf,.docx" maxSize={5 * 1024 * 1024} onUpload={async (file) => uploadMutation.mutateAsync(file)} />
          <div className="mt-4 space-y-2"><h4 className="text-sm font-medium">Guidelines:</h4><ul className="text-xs text-muted-foreground space-y-1"><li>• PDF or DOCX format (max 5MB)</li><li>• Keep it to 1-2 pages</li><li>• Include your latest projects and skills</li><li>• Ensure contact information is up to date</li></ul></div>
        </CardContent></Card></FadeIn>
        <FadeIn delay={0.2}><Card><CardHeader><CardTitle className="text-lg flex items-center gap-2"><FileText className="h-5 w-5" /> Current Resume</CardTitle></CardHeader><CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center"><div className="rounded-full bg-primary/10 p-6 mb-4"><FileText className="h-12 w-12 text-primary" /></div><h3 className="font-semibold mb-1">Resume_Priya_Sharma.pdf</h3><p className="text-sm text-muted-foreground mb-4">Uploaded on Apr 10, 2026 • 245 KB</p><div className="flex items-center gap-3"><Button variant="outline" size="sm"><Eye className="h-4 w-4 mr-1" /> Preview</Button><Button variant="outline" size="sm"><Download className="h-4 w-4 mr-1" /> Download</Button><Button variant="outline" size="sm" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4 mr-1" /> Delete</Button></div></div>
        </CardContent></Card></FadeIn>
      </div>
    </div>
  );
}
