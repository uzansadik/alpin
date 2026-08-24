export type UploadPurpose = "user-avatar" | "organization-logo";

export type CreateUploadInput = {
  purpose: UploadPurpose;
  ownerId: string;

  fileName: string;
  contentType: string;
  size: number;
};

export type PresignedUpload = {
  key: string;
  uploadUrl: string;
  expiresAt: Date;

  headers: {
    "content-type": string;
  };
};
