export interface StorageTransformation {
    start_offset?: string | number;
    duration?: string | number;
    crop?: string;
    width?: string | number;
    height?: string | number;
    gravity?: string;
    quality?: string | number;
}

export interface StorageUploadOptions {
    transformation?: StorageTransformation[];
    resource_type?: "image" | "video" | "auto" | "raw";
    folder?: string;
}
