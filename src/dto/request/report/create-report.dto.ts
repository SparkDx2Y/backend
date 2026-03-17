import { z } from 'zod';
import { REPORT_REASONS } from '../../../constants/report/report.constants';

export const CreateReportSchema = z.object({
    reportedUser: z.string().min(1, 'Reported user ID is required'),
    reason: z.enum(REPORT_REASONS),
    description: z.string().max(500).optional(),
    image: z.string().optional(),
});

export type CreateReportRequest = z.infer<typeof CreateReportSchema>;
