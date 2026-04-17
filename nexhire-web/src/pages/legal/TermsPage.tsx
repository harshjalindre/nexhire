import { Link } from "react-router-dom";
import { GraduationCap, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b sticky top-0 bg-background/95 backdrop-blur z-50">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center gap-3">
          <Link to="/"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
          <GraduationCap className="h-5 w-5 text-primary" /><span className="font-semibold">NexHire</span>
        </div>
      </nav>
      <div className="max-w-3xl mx-auto px-6 py-12 prose dark:prose-invert">
        <h1>Terms of Service</h1>
        <p><em>Last updated: {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</em></p>
        <h2>1. Acceptance</h2>
        <p>By accessing or using NexHire ("Service"), you agree to be bound by these Terms. If you do not agree, do not use the Service.</p>
        <h2>2. Service Description</h2>
        <p>NexHire is a multi-tenant SaaS platform for campus placement management. We provide tools for colleges, students, and recruiters to manage the placement process.</p>
        <h2>3. Accounts</h2>
        <p>You must provide accurate information when creating an account. You are responsible for safeguarding your password and for all activities under your account. Each college/institution is a separate tenant.</p>
        <h2>4. Subscriptions & Billing</h2>
        <p>Paid plans are billed monthly. You may upgrade or downgrade at any time. Refunds are provided on a pro-rata basis for unused months. The Free tier has limited features and student capacity.</p>
        <h2>5. Data Ownership</h2>
        <p>Each tenant retains full ownership of their data. We do not share tenant data across institutions. You may export your data at any time.</p>
        <h2>6. Acceptable Use</h2>
        <p>You may not: (a) use the Service for unlawful purposes; (b) attempt to access other tenants' data; (c) reverse engineer the Service; (d) upload malicious files.</p>
        <h2>7. Privacy</h2>
        <p>Our handling of personal data is described in our <Link to="/privacy">Privacy Policy</Link>.</p>
        <h2>8. Limitation of Liability</h2>
        <p>The Service is provided "as is". We are not liable for indirect, incidental, or consequential damages arising from your use of the Service.</p>
        <h2>9. Termination</h2>
        <p>We may suspend or terminate your account for violations. You may delete your account at any time. Upon termination, your data will be retained for 30 days before deletion.</p>
        <h2>10. Changes</h2>
        <p>We may update these Terms. Continued use constitutes acceptance of the updated Terms.</p>
        <h2>11. Contact</h2>
        <p>Questions? Email us at <a href="mailto:support@nexhire.com">support@nexhire.com</a>.</p>
      </div>
    </div>
  );
}
