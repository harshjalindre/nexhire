export type ApplicationStatus = "applied" | "shortlisted" | "interview" | "offered" | "rejected" | "withdrawn";
export interface RoundStatus { roundId: string; roundName: string; status: "pending" | "passed" | "failed" | "upcoming"; date?: string; remarks?: string; }
export interface Application { id: string; driveId: string; driveTitle: string; companyName: string; companyLogo?: string; status: ApplicationStatus; appliedAt: string; roundStatuses: RoundStatus[]; packageLpa: number; }
