import { PROMO_COLUMNS, toPromo } from "../../../_lib/promos";
import type { PromoRow } from "../../../_lib/promos";

interface Env {
  DB: D1Database;
  BUCKET?: R2Bucket;
  PUBLIC_IMAGE_BASE?: string;
}

export const onRequestPatch: PagesFunction<Env> = async ({ request, env, params }) => {
  const id = Number(String(params.id));
  if (!Number.isInteger(id)) return Response.json({ error: "Bad id." }, { status: 400 });

  let body: { active?: boolean } = {};
  try {
    body = await request.json();
  } catch {}
  if (typeof body.active !== "boolean") {
    return Response.json({ error: "Missing 'active' value." }, { status: 400 });
  }

  const row = await env.DB
    .prepare(`UPDATE promos SET is_active = ?1 WHERE id = ?2 RETURNING ${PROMO_COLUMNS}`)
    .bind(body.active ? 1 : 0, id)
    .first<PromoRow>();
  if (!row) return Response.json({ error: "Promo not found." }, { status: 404 });

  return Response.json(toPromo(row));
};

export const onRequestDelete: PagesFunction<Env> = async ({ env, params }) => {
  const id = Number(String(params.id));
  if (!Number.isInteger(id)) return Response.json({ error: "Bad id." }, { status: 400 });

  const row = await env.DB
    .prepare("SELECT image_url FROM promos WHERE id = ?1")
    .bind(id)
    .first<{ image_url: string | null }>();
  if (!row) return Response.json({ error: "Promo not found." }, { status: 404 });

  await env.DB.prepare("DELETE FROM promos WHERE id = ?1").bind(id).run();

  // Also remove the uploaded poster from R2 (only files this panel uploaded, under promos/)
  const base = env.PUBLIC_IMAGE_BASE?.replace(/\/$/, "");
  if (env.BUCKET && base && row.image_url?.startsWith(`${base}/promos/`)) {
    await env.BUCKET.delete(row.image_url.slice(base.length + 1));
  }

  return Response.json({ ok: true });
};