import type { Document} from 'mongoose';
import mongoose, { Schema } from 'mongoose';

import type { ReportReason, ReportStatus } from '../constants/report/report.constants';
import { REPORT_REASONS, REPORT_STATUS } from '../constants/report/report.constants';

export interface IReport extends Document {
    reportedBy: mongoose.Types.ObjectId;
    reportedUser: mongoose.Types.ObjectId;
    reason: ReportReason;
    description?: string;
    status: ReportStatus;
    image?: string;
    createdAt: Date;
    updatedAt: Date;
}

const reportSchema = new Schema<IReport>(
    {
        reportedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        reportedUser: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        reason: {
            type: String,
            required: true,
            enum: REPORT_REASONS,
        },
        description: {
            type: String,
            maxlength: 500,
        },
        status: {
            type: String,
            enum: REPORT_STATUS,
            default: 'pending',
        },
        image: {
            type: String,
            required: false
        }
    },
    { timestamps: true }
);

export const Report = mongoose.model<IReport>('Report', reportSchema);
