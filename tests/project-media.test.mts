import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { ObjectId } from "mongodb";

import { projects } from "../src/content/projects.ts";
import {
  createSignedProjectMediaUpload,
  readCloudinaryServerConfig,
} from "../src/lib/media/cloudinary.ts";
import {
  mapCloudinaryUploadResultToRegistrationPayload,
  PROJECT_MEDIA_MAX_IMAGE_BYTES,
  ProjectMediaRegisterPayloadSchema,
  projectMediaFolder,
  validateProjectMediaPublicId,
  validateProjectMediaRegistrationPayload,
  validateProjectMediaUploadInput,
} from "../src/lib/media/media-rules.ts";
import {
  assertPublishedProjectMediaAlt,
  buildProjectVisualsFromMediaAssets,
} from "../src/lib/media/project-media-visuals.ts";
import {
  ProjectMediaValidationError,
  registerProjectMediaAsset,
  rollbackUnregisteredProjectMedia,
} from "../src/lib/media/repository.ts";
import { ProjectContentSchema } from "../src/lib/projects/project-schema.ts";
import type {
  PortfolioProjectDocument,
  ProjectMediaAssetDocument,
} from "../src/lib/mongodb/collections.ts";

function withCloudinaryEnv(callback: () => void) {
  const previous = {
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  };

  process.env.CLOUDINARY_CLOUD_NAME = "portfolio-test-cloud";
  process.env.CLOUDINARY_API_KEY = "portfolio-test-key";
  process.env.CLOUDINARY_API_SECRET = "portfolio-test-secret";

  try {
    callback();
  } finally {
    if (previous.cloudName === undefined) delete process.env.CLOUDINARY_CLOUD_NAME;
    else process.env.CLOUDINARY_CLOUD_NAME = previous.cloudName;

    if (previous.apiKey === undefined) delete process.env.CLOUDINARY_API_KEY;
    else process.env.CLOUDINARY_API_KEY = previous.apiKey;

    if (previous.apiSecret === undefined) delete process.env.CLOUDINARY_API_SECRET;
    else process.env.CLOUDINARY_API_SECRET = previous.apiSecret;
  }
}

const fullCloudinaryResponse = {
  api_key: "must-not-be-forwarded",
  asset_folder: "portfolio-os/projects/margem-app",
  asset_id: "provider-asset-id",
  bytes: 1_024,
  created_at: "2026-07-14T12:00:00Z",
  display_name: "screen",
  etag: "provider-etag",
  existing: false,
  format: "webp",
  height: 720,
  original_filename: "screen",
  placeholder: false,
  public_id: `${projectMediaFolder("margem-app")}/asset-1`,
  resource_type: "image",
  secure_url: "https://res.cloudinary.com/demo/image/upload/v1/portfolio-os/projects/margem-app/asset-1.webp",
  signature: "a".repeat(40),
  tags: [],
  type: "upload",
  url: "http://res.cloudinary.com/demo/image/upload/v1/unsafe.webp",
  version: 1,
  version_id: "provider-version-id",
  width: 1280,
} as const;

const registrationPayload = mapCloudinaryUploadResultToRegistrationPayload("margem-app", fullCloudinaryResponse);

function createFakeMediaCollections(projectSlug = "margem-app") {
  const projectDocument: PortfolioProjectDocument = {
    content: projects[0],
    createdAt: new Date("2026-07-14T12:00:00.000Z"),
    publicationStatus: "draft",
    publishedAt: null,
    slug: projectSlug,
    sortOrder: 10,
    updatedAt: new Date("2026-07-14T12:00:00.000Z"),
    updatedBy: "admin@example.com",
  };
  const assets: (ProjectMediaAssetDocument & { _id: ObjectId })[] = [];

  return {
    assets,
    collections: {
      portfolioProjects: {
        async findOne(filter: { slug?: string }) {
          return filter.slug === projectSlug ? { ...projectDocument, _id: new ObjectId() } : null;
        },
      },
      projectMediaAssets: {
        async countDocuments() {
          return assets.filter((asset) => !asset.deletedAt).length;
        },
        async findOne(filter: { publicId?: string }) {
          return assets.find((asset) => asset.publicId === filter.publicId) ?? null;
        },
        async insertOne(document: ProjectMediaAssetDocument) {
          const inserted = { ...document, _id: new ObjectId() };
          assets.push(inserted);
          return { insertedId: inserted._id };
        },
      },
    },
  };
}

test("requires server-only Cloudinary configuration", () => {
  assert.throws(() => readCloudinaryServerConfig({}), /CLOUDINARY_API_KEY|CLOUDINARY_API_SECRET|CLOUDINARY_CLOUD_NAME/);
});

test("creates signed direct image uploads without exposing the API secret", () => {
  withCloudinaryEnv(() => {
    const signed = createSignedProjectMediaUpload({
      bytes: 1_024,
      fileName: "screen.webp",
      mimeType: "image/webp",
      projectSlug: "margem-app",
      resourceType: "image",
    }, new Date("2026-07-14T12:00:00.000Z"));
    const serialized = JSON.stringify(signed);

    assert.equal(signed.cloudName, "portfolio-test-cloud");
    assert.equal(signed.params.public_id.startsWith(`${projectMediaFolder("margem-app")}/`), true);
    assert.equal(signed.params.overwrite, "false");
    assert.equal(serialized.includes("portfolio-test-secret"), false);
    assert.equal(signed.resourceType, "image");
    assert.equal(signed.uploadUrl, "https://api.cloudinary.com/v1_1/portfolio-test-cloud/image/upload");
  });
});

test("maps a full Cloudinary response to the strict registration payload", () => {
  assert.equal(registrationPayload.projectSlug, "margem-app");
  assert.equal(registrationPayload.publicId, fullCloudinaryResponse.public_id);
  assert.equal(registrationPayload.secureUrl, fullCloudinaryResponse.secure_url);
  assert.equal(registrationPayload.resourceType, "image");
  assert.equal(ProjectMediaRegisterPayloadSchema.safeParse(registrationPayload).success, true);

  const serialized = JSON.stringify(registrationPayload);
  for (const forbidden of ["asset_id", "version_id", "created_at", "tags", "etag", "placeholder", "url", "asset_folder", "display_name", "existing", "api_key"]) {
    assert.equal(serialized.includes(forbidden), false, forbidden);
  }
});

test("keeps the registration schema strict", () => {
  const parsed = ProjectMediaRegisterPayloadSchema.safeParse({
    ...registrationPayload,
    asset_id: "must-fail",
  });

  assert.equal(parsed.success, false);
});

test("rejects videos, unsupported MIME types and images above 10 MB", () => {
  assert.throws(() => validateProjectMediaUploadInput({
    bytes: 1_024,
    fileName: "demo.webm",
    mimeType: "video/webm",
    projectSlug: "margem-app",
    resourceType: "image",
  }), /imagem|Tipo/i);

  assert.throws(() => validateProjectMediaUploadInput({
    bytes: 1_024,
    fileName: "payload.svg",
    mimeType: "image/svg+xml",
    projectSlug: "margem-app",
    resourceType: "image",
  }), /imagem|Tipo/i);

  assert.throws(() => validateProjectMediaUploadInput({
    bytes: PROJECT_MEDIA_MAX_IMAGE_BYTES + 1,
    fileName: "large.webp",
    mimeType: "image/webp",
    projectSlug: "margem-app",
    resourceType: "image",
  }), /10 MB/);

  assert.equal(ProjectMediaRegisterPayloadSchema.safeParse({
    ...registrationPayload,
    resourceType: "video",
  }).success, false);
});

test("validates Cloudinary registration ownership, HTTPS and format", () => {
  assert.doesNotThrow(() => validateProjectMediaRegistrationPayload(registrationPayload));
  assert.throws(() => validateProjectMediaPublicId("margem-app", "portfolio-os/projects/other/asset"), /pasta/);
  assert.throws(() => validateProjectMediaRegistrationPayload({
    ...registrationPayload,
    format: "gif",
  }), /Formato/);

  const insecureUrl = ProjectMediaRegisterPayloadSchema.safeParse({
    ...registrationPayload,
    secureUrl: "http://res.cloudinary.com/demo/image/upload/v1/asset.webp",
  });
  assert.equal(insecureUrl.success, false);
});

test("registers a valid image in MongoDB metadata without storing binary data", async () => {
  const { assets, collections } = createFakeMediaCollections();
  const registered = await registerProjectMediaAsset({
    createdBy: "admin@example.com",
    image: registrationPayload,
    projectSlug: "margem-app",
  }, {
    collections: collections as never,
  });

  assert.equal(registered.publicId, registrationPayload.publicId);
  assert.equal(registered.resourceType, "image");
  assert.equal(registered.role, "unassigned");
  assert.equal(assets[0].secureUrl, registrationPayload.secureUrl);
  assert.equal("file" in assets[0], false);
});

test("builds project visuals with logo, thumbnail, hero and ordered gallery as separate roles", () => {
  const visuals = buildProjectVisualsFromMediaAssets(projects[0], [
    {
      alt: { en: "Logo EN", pt: "Logo PT" },
      position: 0,
      resourceType: "image",
      role: "logo",
      secureUrl: "https://res.cloudinary.com/demo/image/upload/v1/logo.webp",
    },
    {
      alt: { en: "Hero EN", pt: "Hero PT" },
      position: 0,
      resourceType: "image",
      role: "hero",
      secureUrl: "https://res.cloudinary.com/demo/image/upload/v1/hero.webp",
    },
    {
      alt: { en: "Gallery second EN", pt: "Gallery second PT" },
      position: 1,
      resourceType: "image",
      role: "gallery",
      secureUrl: "https://res.cloudinary.com/demo/image/upload/v1/gallery-2.webp",
    },
    {
      alt: { en: "Gallery first EN", pt: "Gallery first PT" },
      position: 0,
      resourceType: "image",
      role: "gallery",
      secureUrl: "https://res.cloudinary.com/demo/image/upload/v1/gallery-1.webp",
    },
    {
      alt: { en: "Thumb EN", pt: "Thumb PT" },
      position: 0,
      resourceType: "image",
      role: "thumbnail",
      secureUrl: "https://res.cloudinary.com/demo/image/upload/v1/thumb.webp",
    },
  ]);

  assert.equal(visuals.logo, "https://res.cloudinary.com/demo/image/upload/v1/logo.webp");
  assert.equal(visuals.logoAlt?.pt, "Logo PT");
  assert.equal(visuals.thumbnail, "https://res.cloudinary.com/demo/image/upload/v1/thumb.webp");
  assert.equal(visuals.heroImage, "https://res.cloudinary.com/demo/image/upload/v1/hero.webp");
  assert.deepEqual(visuals.gallery, [
    "https://res.cloudinary.com/demo/image/upload/v1/gallery-1.webp",
    "https://res.cloudinary.com/demo/image/upload/v1/gallery-2.webp",
  ]);
  assert.equal(visuals.alt.pt, "Thumb PT");
  assert.equal(visuals.status, "available");
});

test("requires alt text for published images including logo", () => {
  const selectedLogo = [{
    alt: { en: "", pt: "" },
    position: 0,
    resourceType: "image" as const,
    role: "logo" as const,
    secureUrl: "https://res.cloudinary.com/demo/image/upload/v1/logo.webp",
  }];

  assert.doesNotThrow(() => assertPublishedProjectMediaAlt("draft", selectedLogo));
  assert.throws(() => assertPublishedProjectMediaAlt("published", selectedLogo), /Alt PT\/EN/);
});

test("keeps old projects compatible when visuals are absent and strips legacy video on parse", () => {
  const projectWithoutVisuals = { ...projects[0] };
  delete projectWithoutVisuals.visuals;

  const fallbackVisuals = buildProjectVisualsFromMediaAssets(projectWithoutVisuals, []);
  assert.equal(fallbackVisuals.status, "pending");
  assert.equal(fallbackVisuals.logo, null);
  assert.equal(fallbackVisuals.thumbnail, null);
  assert.equal(fallbackVisuals.alt.pt, projectWithoutVisuals.title.pt);
  assert.equal(ProjectContentSchema.safeParse(projectWithoutVisuals).success, true);

  const parsedLegacy = ProjectContentSchema.safeParse({
    ...projects[0],
    visuals: {
      ...projects[0].visuals,
      ["demo" + "Video"]: "https://res.cloudinary.com/demo/video/upload/v1/demo.webm",
    },
  });
  assert.equal(parsedLegacy.success, true);
  assert.equal(JSON.stringify(parsedLegacy.success ? parsedLegacy.data : {}).includes("demoVideo"), false);
});

test("rolls back only unregistered assets inside the project folder", async () => {
  const deleted: string[] = [];
  const { collections } = createFakeMediaCollections();

  await rollbackUnregisteredProjectMedia(registrationPayload, {
    collections: {
      projectMediaAssets: collections.projectMediaAssets,
    } as never,
    deleteImage: async (publicId) => {
      deleted.push(publicId);
    },
  });

  assert.deepEqual(deleted, [registrationPayload.publicId]);

  assert.rejects(() => rollbackUnregisteredProjectMedia({
    ...registrationPayload,
    publicId: "portfolio-os/projects/other/asset-1",
  }, {
    collections: {
      projectMediaAssets: collections.projectMediaAssets,
    } as never,
    deleteImage: async () => undefined,
  }), /pasta/);
});

test("rollback refuses assets that are already registered", async () => {
  const deleted: string[] = [];
  const { collections } = createFakeMediaCollections();
  await registerProjectMediaAsset({
    createdBy: "admin@example.com",
    image: registrationPayload,
    projectSlug: "margem-app",
  }, {
    collections: collections as never,
  });

  await assert.rejects(() => rollbackUnregisteredProjectMedia(registrationPayload, {
    collections: {
      projectMediaAssets: collections.projectMediaAssets,
    } as never,
    deleteImage: async (publicId) => {
      deleted.push(publicId);
    },
  }), ProjectMediaValidationError);

  assert.deepEqual(deleted, []);
});

test("public logo rendering keeps the generic fallback and uses contain for real logos", () => {
  const homeComponent = readFileSync("src/components/visual-final-candidate/visual-final-candidate.tsx", "utf8");
  const homeStyles = readFileSync("src/components/visual-final-candidate/visual-final-candidate.module.css", "utf8");
  const projectCard = readFileSync("src/components/projects/project-card.tsx", "utf8");
  const projectStyles = readFileSync("src/components/projects/project-experience.module.css", "utf8");

  assert.match(homeComponent, /project\.logo/);
  assert.match(homeComponent, /ProjectIcon iconKey/);
  assert.match(homeComponent, /<Image/);
  assert.match(projectCard, /visuals\.logo/);
  assert.match(homeStyles, /\.projectLogoIcon img[\s\S]*object-fit: contain/);
  assert.match(projectStyles, /\.sceneLogoTile img[\s\S]*object-fit: contain/);
  assert.match(projectStyles, /\.caseLogoTile img[\s\S]*object-fit: contain/);
});
