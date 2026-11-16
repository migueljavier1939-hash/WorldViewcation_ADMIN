import { PROMO_COLUMNS, toPromo } from "../../../_lib/promos";
import type { PromoRow } from "../../../_lib/promos";

interface Env {
  DB: D1Database;
  BUCKET?: R2Bucket;
  PUBLIC_IMAGE_BASE?: string;
}

const MAX_BYTES = 5 * 1024 * 1024;
const TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const { results } = await env.DB
    .prepare(`SELECT ${PROMO_COLUMNS} FROM promos ORDER BY id DESC`)
    .all<PromoRow>();
  return Response.json(results.map(toPromo));
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ error: "Invalid form data." }, { status: 400 });
  }

  const title = String(form.get("title") ?? "").trim();
  const destination = String(form.get("destination") ?? "").trim();
  const discount = String(form.get("discount") ?? "").trim();
  const validUntil = String(form.get("validUntil") ?? "").trim();

  if (!title || !destination || !discount || !/^\d{4}-\d{2}-\d{2}$/.test(validUntil)) {
    return Response.json({ error: "Please fill in all fields." }, { status: 400 });
  }
  if (title.length > 120 || destination.length > 120 || discount.length > 60) {
    return Response.json({ error: "One of the fields is too long." }, { status: 400 });
  }

  let imageUrl: string | null = null;
  const photo = form.get("photo");
  if (photo instanceof File && photo.size > 0) {
    const ext = TYPES[photo.type];
    if (!ext) return Response.json({ error: "Please choose a PNG, JPG, or WEBP image." }, { status: 400 });
    if (photo.size > MAX_BYTES) return Response.json({ error: "The photo must be 5 MB or smaller." }, { status: 400 });
    if (!env.BUCKET || !env.PUBLIC_IMAGE_BASE) {
      return Response.json({ error: "Image storage isn't set up yet." }, { status: 500 });
    }

    const key = `promos/${crypto.randomUUID()}.${ext}`;
    await env.BUCKET.put(key, await photo.arrayBuffer(), {
      httpMetadata: { contentType: photo.type, cacheControl: "public, max-age=31536000, immutable" },
    });
    imageUrl = `${env.PUBLIC_IMAGE_BASE.replace(/\/$/, "")}/${key}`;
  }

  const row = await env.DB
    .prepare(
      `INSERT INTO promos (title, destination, discount, image_url, end_date, is_active)
       VALUES (?1, ?2, ?3, ?4, ?5, 1)
       RETURNING ${PROMO_COLUMNS}`
    )
    .bind(title, destination, discount, imageUrl, validUntil)
    .first<PromoRow>();

  return Response.json(toPromo(row!), { status: 201 });
};