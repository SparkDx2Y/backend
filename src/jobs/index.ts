import type { Container } from 'inversify';
import { DI_TYPES } from '../di/types';
import type { SubscriptionCleanupJob } from './SubscriptionCleanupJob';

export const initJobs = (container: Container) => {
    const subscriptionJob = container.get<SubscriptionCleanupJob>(DI_TYPES.JOBS.SUBSCRIPTION_CLEANUP_JOB);
    subscriptionJob.init();
};
