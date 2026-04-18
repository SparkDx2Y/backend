export type MessageType = 'text' | 'image' | 'audio' | 'video_call' | 'date_proposal';

export interface IMessageMetadata {
    placeId?: string;
    name?: string;
    address?: string;
    rating?: number;
    photo?: string;
    proposalStatus?: 'pending' | 'accepted' | 'declined' | 'suggested';
    lastSuggestedBy?: string;
    scheduledAt?: Date | string;
}
