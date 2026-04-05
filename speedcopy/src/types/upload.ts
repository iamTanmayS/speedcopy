import {
    UUID,
    ISODateString,
    MediaType,
    DPI
} from "./shared";

export type UploadStatus =
    | "pending"
    | "uploading"
    | "processing"
    | "qc_warning"
    | "approved"
    | "rejected"
    | "expired";

export interface FileUploadInitRequest {
    fileName: string;
    fileSize: number; // bytes
    mediaType: MediaType;
    orderId?: UUID;   // if linked to order
    productId: UUID;
    skuId: UUID;
}

export interface FileUploadInitResponse {
    uploadId: UUID;
    uploadUrl: string;      // pre-signed S3 URL
    chunkSize: number;      // bytes per chunk
    totalChunks: number;
    expiresAt: ISODateString;
}

export interface FileChunkUploadRequest {
    uploadId: UUID;
    chunkIndex: number;
    totalChunks: number;
    data: Blob | ArrayBuffer;
}

export interface FileChunkUploadResponse {
    uploadId: UUID;
    chunkIndex: number;
    received: boolean;
    nextChunk?: number;
}

export interface FileUploadCompleteRequest {
    uploadId: UUID;
}

export interface UploadedFile {
    id: UUID;
    uploadId: UUID;
    customerId: UUID;
    productId: UUID;
    skuId: UUID;
    originalFileName: string;
    storedFileUrl: string;
    previewUrl: string;
    mediaType: MediaType;
    fileSizeBytes: number;
    dpi: DPI;
    dpiStatus: "ok" | "low" | "undetectable";
    width: number;
    height: number;
    uploadedAt: ISODateString;
    approvedAt?: ISODateString;
    approvalAcknowledged: boolean;  // mandatory checkbox
    qualityWarningShown: boolean;
    status: UploadStatus;
}

export interface CropRect {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface BackgroundOption {
    type: "color" | "transparent" | "image";
    value: string; // hex color or URL
}

export interface EditorState {
    fileId: UUID;
    cropMode: "fixed" | "free";
    cropRect?: CropRect;
    rotation: 0 | 90 | 180 | 270;
    zoom: number;          // 1.0 = 100%
    backgroundOption: BackgroundOption;
    printAreaOverlayVisible: boolean;
    templateId?: UUID;
}

export interface QCApprovalRequest {
    fileId: UUID;
    customerAcknowledgedLowDPI: boolean; // mandatory if DPI warning shown
    editorState: EditorState;
}

export interface QCApprovalResponse {
    fileId: UUID;
    approvedAt: ISODateString;
    approvalToken: string; // used at checkout to validate
}

export interface SavedDesign {
    id: UUID;
    customerId: UUID;
    productId: UUID;
    product?: {
        id: UUID;
        name: string;
        thumbnailUrl: string;
    };
    skuId: UUID;
    name: string;
    thumbnailUrl: string;
    fileId: UUID;
    editorState: EditorState;
    createdAt: ISODateString;
    updatedAt: ISODateString;
    lastOrderedAt?: ISODateString;
    orderCount: number;
}

export interface SaveDesignRequest {
    productId: UUID;
    skuId: UUID;
    name: string;
    fileId: UUID;
    editorState: EditorState;
}
