export type MessageType = 'text' | 'image' | 'audio' | 'video_call' | 'date_proposal';

export interface IMessageMetadata {
    placeId?: string;
    name?: string;
    address?: string;
    rating?: number;
    photo?: string;
}
