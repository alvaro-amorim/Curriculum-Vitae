export type MongoEnvironment = Record<string, string | undefined>;

export type MongoConfig = {
  databaseName: string;
  uri: string;
};

const DATABASE_NAME_PATTERN = /^[A-Za-z0-9_-]{1,63}$/;

export function isMongoConfigured(environment: MongoEnvironment = process.env) {
  return Boolean(environment.MONGODB_URI?.trim() && environment.MONGODB_DB?.trim());
}

export function readMongoConfig(environment: MongoEnvironment = process.env): MongoConfig {
  const uri = environment.MONGODB_URI?.trim();
  const databaseName = environment.MONGODB_DB?.trim();

  if (!uri) {
    throw new Error("Missing required server environment variable: MONGODB_URI");
  }

  if (!uri.startsWith("mongodb://") && !uri.startsWith("mongodb+srv://")) {
    throw new Error("MONGODB_URI must use mongodb:// or mongodb+srv://");
  }

  if (/\s/.test(uri)) {
    throw new Error("MONGODB_URI cannot contain whitespace");
  }

  if (!databaseName) {
    throw new Error("Missing required server environment variable: MONGODB_DB");
  }

  if (!DATABASE_NAME_PATTERN.test(databaseName)) {
    throw new Error("MONGODB_DB contains unsupported characters");
  }

  return {
    databaseName,
    uri,
  };
}

export function sanitizeMongoError(error: unknown) {
  if (!(error instanceof Error)) {
    return "MongoDB connection failed";
  }

  const message = error.message
    .replace(/mongodb(?:\+srv)?:\/\/[^\s]+/gi, "[redacted-mongodb-uri]")
    .replace(/(?:password|passwd|pwd)=([^&\s]+)/gi, "$1=[redacted]");

  return message.slice(0, 240) || "MongoDB connection failed";
}
