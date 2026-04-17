import { Link } from "react-router-dom";
import { GraduationCap, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b sticky top-0 bg-background/95 backdrop-blur z-50">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center gap-3">
          <Link to="/"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
          <GraduationCap className="h-5 w-5 text-primary" /><span className="font-semibold">NexHire</span>
        </div>
      </nav>
      <div className="max-w-3xl mx-auto px-6 py-12 prose dark:prose-invert">
        <h1>Privacy Policy</h1>
        <p><em>Last updated: {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</em></p>
        <h2>1. Information We Collect</h2>
        <p><strong>Account Data:</strong> Name, email, password (hashed), college code, role.</p>
        <p><strong>Student Data:</strong> Branch, year, CGPA, backlogs, skills, resume, placement status.</p>
        <p><strong>Usage Data:</strong> Login timestamps, actions performed, IP addresses (for audit logs).</p>
        <h2>2. How We Use Your Data</h2>
        <ul><li>Provide and improve the placement management service</li><li>Match students to eligible drives</li><li>Generate analytics and reports for colleges</li><li>Send transactional emails (welcome, password reset, drive notifications)</li></ul>
        <h2>3. Data Isolation</h2>
        <p>NexHire is multi-tenant. Each college's data is logically isolated. No college can access another college's students, drives, or analytics.</p>
        <h2>4. Data Storage</h2>
        <p>Data is stored in PostgreSQL databases. Files (resumes) are stored securely. All data is encrypted in transit (HTTPS).</p>
        <h2>5. Data Sharing</h2>
        <p>We do not sell or share your personal data with third parties. Data is only shared with: (a) your college's placement cell; (b) companies you apply to through drives.</p>
        <h2>6. Your Rights</h2>
        <ul><li><strong>Access:</strong> View your profile and application data anytime</li><li><strong>Export:</strong> Download your data in CSV format</li><li><strong>Deletion:</strong> Request account deletion via settings</li><li><strong>Correction:</strong> Update your profile data anytime</li></ul>
        <h2>7. Cookies</h2>
        <p>We use essential cookies for authentication (JWT token storage). We do not use third-party tracking cookies.</p>
        <h2>8. Security</h2>
        <p>Passwords are hashed with bcrypt. JWT tokens expire. Account lockout after failed attempts. All API endpoints require authentication.</p>
        <h2>9. Changes</h2>
        <p>We may update this policy. Changes will be posted on this page with an updated date.</p>
        <h2>10. Contact</h2>
        <p>Privacy questions? Email <a href="mailto:privacy@nexhire.com">privacy@nexhire.com</a>.</p>
      </div>
    </div>
  );
}
