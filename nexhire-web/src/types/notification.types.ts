export type NotificationType = "drive_created" | "application_update" | "shortlisted" | "offer" | "system" | "reminder";
export interface Notification { id: string; type: NotificationType; title: string; message: string; read: boolean; link?: string; createdAt: string; }
