import { Resend } from "resend";
import { env } from "./env.js";
import { logger } from "./logger.js";

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;
const FROM_EMAIL = "NexHire <onboarding@resend.dev>";
const appUrl = () => env.FRONTEND_URL || "http://localhost:5173";

export async function sendEmail(to: string, subject: string, html: string) {
  if (!resend) {
    logger.warn(`📧 Email skipped (no RESEND_API_KEY): ${subject} → ${to}`);
    return null;
  }
  try {
    const result = await resend.emails.send({ from: FROM_EMAIL, to, subject, html });
    logger.info(`📧 Email sent: ${subject} → ${to}`);
    return result;
  } catch (err) {
    logger.error(err, `📧 Email failed: ${subject} → ${to}`);
    return null;
  }
}

export const emailTemplates = {
  welcome(name: string, code: string) {
    return {
      subject: "Welcome to NexHire! 🎓",
      html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
        <h2 style="color:#6366f1">Welcome to NexHire, ${name}!</h2>
        <p>Your account has been created successfully.</p>
        <p><strong>College Code:</strong> ${code}</p>
        <p>Log in at <a href="${appUrl()}" style="color:#6366f1">NexHire</a> to get started.</p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0"/>
        <p style="color:#9ca3af;font-size:12px">NexHire — Campus Placement Platform</p>
      </div>`,
    };
  },

  passwordReset(name: string, resetToken: string) {
    return {
      subject: "Reset Your Password — NexHire",
      html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
        <h2 style="color:#6366f1">Password Reset</h2>
        <p>Hi ${name}, we received a request to reset your password.</p>
        <p>Use this code to reset your password:</p>
        <div style="background:#f3f4f6;padding:16px;border-radius:8px;text-align:center;font-size:24px;font-weight:bold;letter-spacing:4px;margin:16px 0">${resetToken}</div>
        <p>This code expires in 15 minutes.</p>
        <p style="color:#9ca3af;font-size:13px">If you didn't request this, ignore this email.</p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0"/>
        <p style="color:#9ca3af;font-size:12px">NexHire — Campus Placement Platform</p>
      </div>`,
    };
  },

  driveNotification(studentName: string, driveTitle: string, companyName: string, packageLpa: number) {
    return {
      subject: `New Drive: ${driveTitle} by ${companyName} 🚀`,
      html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
        <h2 style="color:#6366f1">New Placement Drive!</h2>
        <p>Hi ${studentName},</p>
        <p>A new placement drive has been posted that matches your profile:</p>
        <div style="background:#f3f4f6;padding:16px;border-radius:8px;margin:16px 0">
          <h3 style="margin:0 0 8px">${driveTitle}</h3>
          <p style="margin:0;color:#6b7280"><strong>${companyName}</strong> — ₹${packageLpa} LPA</p>
        </div>
        <a href="${appUrl()}/student/drives" style="display:inline-block;background:#6366f1;color:white;padding:10px 24px;border-radius:8px;text-decoration:none;margin-top:8px">View Drive</a>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0"/>
        <p style="color:#9ca3af;font-size:12px">NexHire — Campus Placement Platform</p>
      </div>`,
    };
  },

  applicationUpdate(studentName: string, driveTitle: string, status: string) {
    const statusColors: Record<string, string> = { selected: "#22c55e", rejected: "#ef4444", shortlisted: "#f59e0b", applied: "#6366f1" };
    return {
      subject: `Application Update: ${driveTitle}`,
      html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
        <h2 style="color:#6366f1">Application Update</h2>
        <p>Hi ${studentName},</p>
        <p>Your application for <strong>${driveTitle}</strong> has been updated:</p>
        <div style="background:#f3f4f6;padding:16px;border-radius:8px;margin:16px 0;text-align:center">
          <span style="background:${statusColors[status] || "#6b7280"};color:white;padding:6px 16px;border-radius:9999px;font-weight:600;text-transform:uppercase">${status}</span>
        </div>
        <a href="${appUrl()}/student/applications" style="display:inline-block;background:#6366f1;color:white;padding:10px 24px;border-radius:8px;text-decoration:none;margin-top:8px">View Applications</a>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0"/>
        <p style="color:#9ca3af;font-size:12px">NexHire — Campus Placement Platform</p>
      </div>`,
    };
  },
};
