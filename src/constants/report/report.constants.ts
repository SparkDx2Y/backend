export const REPORT_REASONS = [
    'Harassment',
    'Spam',
    'Inappropriate Content',
    'Other',
] as const;

export type ReportReason = typeof REPORT_REASONS[number];

export const REPORT_STATUS = [
    'pending',
    'resolved',
    'dismissed',
] as const;

export type ReportStatus = typeof REPORT_STATUS[number];
