import 'server-only';

/**
 * Server-only helpers for the IELTS listening-audio pipeline on Tencent
 * CloudBase COS. The storage convention matches the original `upload-audio.cjs`
 * batch script so the existing signed-URL route (`/api/ielts/audio`) keeps
 * working: files live at `ielts-audio/{book}/test{test}-{part}.{ext}` and are
 * referenced in the DB by a CloudBase `cloud://{env}.{bucket}/{key}` fileID.
 *
 * Credentials come only from the environment (never hardcoded). Bucket/region
 * fall back to the known IELTS bucket so it works today, but stay overridable.
 */

const ENV_ID = process.env.NEXT_PUBLIC_CLOUDBASE_ENV_ID || 'ngs-d7gnop4sfa66322e9';
const SECRET_ID = process.env.CLOUDBASE_SECRET_ID || process.env.TENCENTCLOUD_SECRETID || '';
const SECRET_KEY = process.env.CLOUDBASE_SECRET_KEY || process.env.TENCENTCLOUD_SECRETKEY || '';

export const COS_BUCKET = process.env.IELTS_COS_BUCKET || '6e67-ngs-d7gnop4sfa66322e9-1356366479';
export const COS_REGION = process.env.IELTS_COS_REGION || process.env.NEXT_PUBLIC_CLOUDBASE_REGION || 'ap-shanghai';

export function cosConfigured(): boolean {
  return Boolean(SECRET_ID && SECRET_KEY);
}

/** A minimal typed view of the cos-nodejs-sdk-v5 methods we use. */
type CosLike = {
  uploadFile(opts: Record<string, unknown>, cb: (err: unknown, data: unknown) => void): void;
  deleteObject(opts: Record<string, unknown>, cb: (err: unknown, data: unknown) => void): void;
};

export async function cosClient(): Promise<CosLike> {
  const mod = (await import('cos-nodejs-sdk-v5')) as unknown as { default?: new (o: unknown) => CosLike } & (new (o: unknown) => CosLike);
  const COS = (mod.default ?? mod) as new (o: unknown) => CosLike;
  return new COS({ SecretId: SECRET_ID, SecretKey: SECRET_KEY });
}

const AUDIO_EXTS = ['mp3', 'm4a', 'wav', 'aac', 'ogg', 'mp4', 'm4b'] as const;
export function normalizeExt(raw: string | null | undefined): string {
  const e = (raw || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  return (AUDIO_EXTS as readonly string[]).includes(e) ? e : 'mp3';
}

/** COS object key for a whole-test listening file. */
export function wholeTestKey(book: string, test: string, ext: string): string {
  return `ielts-audio/${book}/test${test}-whole.${ext}`;
}

/** Build the CloudBase fileID for a COS key (same format getTempFileURL expects). */
export function fileIdForKey(key: string): string {
  return `cloud://${ENV_ID}.${COS_BUCKET}/${key}`;
}

/** Extract the COS object key from a `cloud://env.bucket/key` fileID. */
export function keyFromFileId(fileID: string): string {
  const rest = fileID.replace(/^cloud:\/\//, '');
  const slash = rest.indexOf('/');
  return slash >= 0 ? rest.slice(slash + 1) : rest;
}

/** Promise wrapper around cos.uploadFile (multipart, robust on slow links). */
export function cosUploadFile(cos: CosLike, key: string, filePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    cos.uploadFile(
      {
        Bucket: COS_BUCKET,
        Region: COS_REGION,
        Key: key,
        FilePath: filePath,
        SliceSize: 512 * 1024, // 512 KB parts — resilient to the slow ap-shanghai link
        SlowRequestSpeed: 1,
        SlowRequestTime: 3600,
      },
      (err) => (err ? reject(err) : resolve()),
    );
  });
}

/** Promise wrapper around cos.deleteObject. */
export function cosDeleteObject(cos: CosLike, key: string): Promise<void> {
  return new Promise((resolve, reject) => {
    cos.deleteObject({ Bucket: COS_BUCKET, Region: COS_REGION, Key: key }, (err) => (err ? reject(err) : resolve()));
  });
}
