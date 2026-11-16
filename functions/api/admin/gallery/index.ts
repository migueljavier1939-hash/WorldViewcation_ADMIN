import { CATEGORIES, PHOTO_COLUMNS, toPhoto } from "../../../_lib/gallery";
import type { PhotoRow } from "../../../_lib/gallery";

interface Env {
  DB: D1Database;
  BUCKET?: R2Bucket;
  PUBLIC_IMAGE_BASE?: string;
}

const MAX_BYTES = 8 * 1024 * 1024;
const TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

function toDim(v: FormDataEntryValue | null): number | null {
  const n = Number(v);
  return Number.isInteger(n) && n > 0 && n < 20000 ? n : null;
}

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const { results } = await env.DB
    .prepare(`SELECT ${PHOTO_COLUMNS} FROM gallery_photos ORDER BY id DESC`)
    .all<PhotoRow>();
  return Response.json(results.map(toPhoto));
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ error: "Invalid form data." }, { status: 400 });
  }

  const caption = String(form.get("caption") ?? "").trim();
  const category = String(form.get("category") ?? "").trim();
  const photo = form.get("photo");

  if (!caption || caption.length > 160) {
    return Response.json({ error: "Please enter a caption (up to 160 characters)." }, { status: 400 });
  }
  if (!CATEGORIES.includes(category)) {
    return Response.json({ error: "Please choose a valid category." }, { status: 400 });
  }
  if (!(photo instanceof File) || photo.size === 0) {
    return Response.json({ error: "Please choose a photo to upload." }, { status: 400 });
  }

  const ext = TYPES[photo.type];
  if (!ext) return Response.json({ error: "Please choose a PNG, JPG, or WEBP image." }, { status: 400 });
  if (photo.size > MAX_BYTES) return Response.json({ error: "The photo must be 8 MB or smaller." }, { status: 400 });
  if (!env.BUCKET || !env.PUBLIC_IMAGE_BASE) {
    return Response.json({ error: "Image storage isn't set up yet." }, { status: 500 });
  }

  const width = toDim(form.get("width"));
  const height = toDim(form.get("height"));

  const key = `gallery/${crypto.randomUUID()}.${ext}`;
  await env.BUCKET.put(key, await photo.arrayBuffer(), {
    httpMetadata: { contentType: photo.type, cacheControl: "public, max-age=31536000, immutable" },
  });
  const imageUrl = `${env.PUBLIC_IMAGE_BASE.replace(/\/$/, "")}/${key}`;

  const row = await env.DB
    .prepare(
      `INSERT INTO gallery_photos (image_url, caption, category, width, height)
       VALUES (?1, ?2, ?3, ?4, ?5)
       RETURNING ${PHOTO_COLUMNS}`
    )
    .bind(imageUrl, caption, category, width, height)
    .first<PhotoRow>();

  return Response.json(toPhoto(row!), { status: 201 });
};