
export const ALLOWED_IMAGE_MIME_TYPES = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "image/webp",
    "image/avif",
    "image/apng",
    "image/gif"
]

export const ALLOWED_AUDIO_MIME_TYPES = [
    "audio/mpeg",
    "audio/wav",
    "audio/webm",
    "audio/ogg",
    "audio/x-m4a",
    "audio/mp4"
]

export const ALLOWED_VIDEO_MIME_TYPES = [
    "video/mp4",
    "video/webm",
    "video/ogg",
    "video/quicktime", // mov
    "video/x-msvideo", // avi
];

export const MAX_IMAGE_FILE_SIZE = 6 * 1024 * 1024;
export const MAX_AUDIO_FILE_SIZE = 10 * 1024 * 1024; // 10MB for audio recordings
export const MAX_VIDEO_FILE_SIZE = 50 * 1024 * 1024; // 50MB for vibe clips

export const MAX_FILES_PER_REQUEST = 6;

