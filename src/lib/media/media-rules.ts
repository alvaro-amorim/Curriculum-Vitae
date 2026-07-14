import { z } from "zod";

export const PROJECT_MEDIA_PROVIDER = "cloudinary";
export const PROJECT_MEDIA_MAX_ASSETS = 20;
export const PROJECT_MEDIA_MAX_IMAGE_BYTES = 10 * 1024 * 1024;

export const PROJECT_MEDIA_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
] as const;

export const PROJECT_MEDIA_IMAGE_FORMATS = ["jpg", "jpeg", "png", "webp", "avif"] as const;

export const PROJECT_MEDIA_ROLES = [
  "unassigned",
  "logo",
  "thumbnail",
  "hero",
  "gallery",
] as const;

export type ProjectMediaProvider = typeof PROJECT_MEDIA_PROVIDER;
export type ProjectMediaResourceType = "image";
export type ProjectMediaRole = typeof PROJECT_MEDIA_ROLES[number];

const ProjectSlugSchema = z.string().trim().min(2).max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const CloudinaryPublicIdSegmentSchema = z.string().trim().min(1).max(180).regex(/^[a-zA-Z0-9/_-]+$/);
const HttpsUrlSchema = z.string().trim().url().max(2_048).refine((value) => {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "res.cloudinary.com";
  } catch {
    return false;
  }
}, "A URL da imagem precisa usar HTTPS no domínio Cloudinary.");

export const ProjectMediaSignaturePayloadSchema = z.object({
  bytes: z.number().int().positive().max(PROJECT_MEDIA_MAX_IMAGE_BYTES),
  fileName: z.string().trim().min(1).max(180),
  mimeType: z.string().trim().min(1).max(120),
  projectSlug: ProjectSlugSchema,
  resourceType: z.literal("image"),
}).strict();

const CloudinaryImageUploadResponseForMappingSchema = z.object({
  bytes: z.number().int().positive().max(PROJECT_MEDIA_MAX_IMAGE_BYTES),
  format: z.string().trim().min(1).max(24),
  height: z.number().int().positive().max(20_000),
  original_filename: z.string().trim().max(180).optional(),
  public_id: CloudinaryPublicIdSegmentSchema,
  resource_type: z.literal("image"),
  secure_url: HttpsUrlSchema,
  signature: z.string().trim().min(20).max(120),
  version: z.number().int().positive(),
  width: z.number().int().positive().max(20_000),
}).passthrough();

export const ProjectMediaRegistrationImageSchema = z.object({
  bytes: z.number().int().positive().max(PROJECT_MEDIA_MAX_IMAGE_BYTES),
  folder: z.string().trim().min(1).max(120),
  format: z.string().trim().min(1).max(24),
  height: z.number().int().positive().max(20_000),
  originalFilename: z.string().trim().max(180).optional(),
  projectSlug: ProjectSlugSchema,
  publicId: CloudinaryPublicIdSegmentSchema,
  resourceType: z.literal("image"),
  secureUrl: HttpsUrlSchema,
  signature: z.string().trim().min(20).max(120),
  version: z.number().int().positive(),
  width: z.number().int().positive().max(20_000),
}).strict();

export const ProjectMediaRegisterPayloadSchema = ProjectMediaRegistrationImageSchema;
export const ProjectMediaRollbackPayloadSchema = ProjectMediaRegistrationImageSchema;

export const ProjectMediaSelectionSchema = z.object({
  alt: z.object({
    en: z.string().trim().max(180),
    pt: z.string().trim().max(180),
  }).strict(),
  id: z.string().trim().regex(/^[a-f0-9]{24}$/i),
  position: z.coerce.number().int().min(0).max(PROJECT_MEDIA_MAX_ASSETS - 1),
  role: z.enum(PROJECT_MEDIA_ROLES),
}).strict();

export const ProjectMediaSelectionsSchema = z.array(ProjectMediaSelectionSchema).max(PROJECT_MEDIA_MAX_ASSETS);

export type ProjectMediaSignaturePayload = z.infer<typeof ProjectMediaSignaturePayloadSchema>;
export type CloudinaryImageUploadResponseForMapping = z.infer<typeof CloudinaryImageUploadResponseForMappingSchema>;
export type ProjectMediaRegistrationImage = z.infer<typeof ProjectMediaRegistrationImageSchema>;
export type ProjectMediaRegisterPayload = z.infer<typeof ProjectMediaRegisterPayloadSchema>;
export type ProjectMediaRollbackPayload = z.infer<typeof ProjectMediaRollbackPayloadSchema>;
export type ProjectMediaSelection = z.infer<typeof ProjectMediaSelectionSchema>;

export function projectMediaFolder(projectSlug: string) {
  const slug = ProjectSlugSchema.parse(projectSlug);
  return `portfolio-os/projects/${slug}`;
}

export function mapCloudinaryUploadResultToRegistrationPayload(
  projectSlug: string,
  uploadResult: unknown,
): ProjectMediaRegisterPayload {
  const parsed = CloudinaryImageUploadResponseForMappingSchema.parse(uploadResult);

  return {
    bytes: parsed.bytes,
    folder: projectMediaFolder(projectSlug),
    format: parsed.format,
    height: parsed.height,
    originalFilename: parsed.original_filename,
    projectSlug,
    publicId: parsed.public_id,
    resourceType: "image",
    secureUrl: parsed.secure_url,
    signature: parsed.signature,
    version: parsed.version,
    width: parsed.width,
  };
}

export function isAllowedProjectMediaMime(mimeType: string) {
  return PROJECT_MEDIA_IMAGE_MIME_TYPES.includes(mimeType as typeof PROJECT_MEDIA_IMAGE_MIME_TYPES[number]);
}

export function isAllowedProjectMediaFormat(format: string) {
  const normalizedFormat = format.trim().toLowerCase();
  return PROJECT_MEDIA_IMAGE_FORMATS.includes(normalizedFormat as typeof PROJECT_MEDIA_IMAGE_FORMATS[number]);
}

export function validateProjectMediaUploadInput(input: ProjectMediaSignaturePayload) {
  if (input.resourceType !== "image" || !isAllowedProjectMediaMime(input.mimeType)) {
    throw new Error("Tipo de imagem não permitido.");
  }

  if (input.bytes > PROJECT_MEDIA_MAX_IMAGE_BYTES) {
    throw new Error("Imagem acima de 10 MB.");
  }
}

export function validateProjectMediaPublicId(projectSlug: string, publicId: string) {
  const expectedFolder = `${projectMediaFolder(projectSlug)}/`;

  if (!publicId.startsWith(expectedFolder) || publicId.includes("..")) {
    throw new Error("Public ID fora da pasta permitida.");
  }
}

export function validateProjectMediaRegistrationPayload(payload: ProjectMediaRegistrationImage) {
  if (payload.resourceType !== "image") {
    throw new Error("Somente imagens são permitidas.");
  }

  if (payload.folder !== projectMediaFolder(payload.projectSlug)) {
    throw new Error("Pasta Cloudinary inválida.");
  }

  validateProjectMediaPublicId(payload.projectSlug, payload.publicId);

  if (!isAllowedProjectMediaFormat(payload.format)) {
    throw new Error("Formato de imagem não permitido.");
  }

  if (payload.bytes > PROJECT_MEDIA_MAX_IMAGE_BYTES) {
    throw new Error("Imagem acima de 10 MB.");
  }
}

export function cloudinaryOptimizedImageUrl(source: string, width?: number) {
  if (!source.includes("res.cloudinary.com") || !source.includes("/upload/")) {
    return source;
  }

  const transforms = ["f_auto", "q_auto"];

  if (width) {
    transforms.push(`w_${width}`);
  }

  return source.replace("/upload/", `/upload/${transforms.join(",")}/`);
}
