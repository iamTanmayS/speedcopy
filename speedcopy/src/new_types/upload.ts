import { UUID, ISODateString } from "./shared";

export type UploadStatus = "pending" | "uploading" | "approved" | "rejected";

export interface UploadedFile {
    id: UUID;
    customerId: UUID;
    originalFileName: string;
    storedFileUrl: string;       // S3 URL
    status: UploadStatus;
    uploadedAt: ISODateString;
}
