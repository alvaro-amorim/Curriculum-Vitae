import { randomUUID, timingSafeEqual } from "node:crypto";

import { v2 as cloudinary } from "cloudinary";

import {
  projectMediaFolder,
  validateProjectMediaUploadInput,
  type ProjectMediaRegistrationImage,
  type ProjectMediaResourceType,
  type ProjectMediaSignaturePayload,
} from "./media-rules.ts";

export type CloudinaryServerConfig = {
  apiKey: string;
  apiSecret: string;
  cloudName: string;
};

export type SignedProjectMediaUpload = {
  apiKey: string;
  cloudName: string;
  params: {
    overwrite: "false";
    public_id: string;
    signature: string;
    timestamp: number;
  };
  resourceType: "image";
  uploadUrl: string;
};

function readRequiredCloudinaryEnv(name: keyof NodeJS.ProcessEnv, environment: NodeJS.ProcessEnv) {
  const value = environment[name]?.trim();

  if (!value) {
    throw new Error(`Missing required server environment variable: ${name}`);
  }

  return value;
}

export function readCloudinaryServerConfig(environment: NodeJS.ProcessEnv = process.env): CloudinaryServerConfig {
  return {
    apiKey: readRequiredCloudinaryEnv("CLOUDINARY_API_KEY", environment),
    apiSecret: readRequiredCloudinaryEnv("CLOUDINARY_API_SECRET", environment),
    cloudName: readRequiredCloudinaryEnv("CLOUDINARY_CLOUD_NAME", environment),
  };
}

export function sanitizeCloudinaryError(error: unknown) {
  if (!(error instanceof Error)) {
    return "Cloudinary operation failed";
  }

  return error.message
    .replace(/api[_-]?secret[=:][^\s&]+/gi, "api_secret=[redacted]")
    .replace(/api[_-]?key[=:][^\s&]+/gi, "api_key=[redacted]")
    .slice(0, 240) || "Cloudinary operation failed";
}

function configureCloudinary(config = readCloudinaryServerConfig()) {
  cloudinary.config({
    api_key: config.apiKey,
    api_secret: config.apiSecret,
    cloud_name: config.cloudName,
    secure: true,
  });

  return config;
}

export function createSignedProjectMediaUpload(
  input: ProjectMediaSignaturePayload,
  now = new Date(),
): SignedProjectMediaUpload {
  validateProjectMediaUploadInput(input);

  const config = configureCloudinary();
  const timestamp = Math.floor(now.getTime() / 1_000);
  const publicId = `${projectMediaFolder(input.projectSlug)}/${randomUUID()}`;
  const signedParams = {
    overwrite: "false" as const,
    public_id: publicId,
    timestamp,
  };
  const signature = cloudinary.utils.api_sign_request(signedParams, config.apiSecret);

  return {
    apiKey: config.apiKey,
    cloudName: config.cloudName,
    params: {
      ...signedParams,
      signature,
    },
    resourceType: "image",
    uploadUrl: `https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`,
  };
}

export function verifyCloudinaryUploadResponseSignature(uploadResult: ProjectMediaRegistrationImage) {
  const config = configureCloudinary();
  const expectedSignature = cloudinary.utils.api_sign_request(
    {
      public_id: uploadResult.publicId,
      version: uploadResult.version,
    },
    config.apiSecret,
  );
  const expected = Buffer.from(expectedSignature);
  const received = Buffer.from(uploadResult.signature);

  return expected.length === received.length && timingSafeEqual(expected, received);
}

export async function deleteCloudinaryProjectMedia(publicId: string, resourceType: ProjectMediaResourceType = "image") {
  configureCloudinary();

  const result = await cloudinary.uploader.destroy(publicId, {
    invalidate: true,
    resource_type: resourceType,
  });

  if (!result || result.result !== "ok") {
    throw new Error("Cloudinary did not confirm asset deletion.");
  }
}
