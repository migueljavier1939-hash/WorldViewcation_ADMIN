interface Env {
  DB: D1Database;
  BUCKET?: R2Bucket;
  PUBLIC_IMAGE_BASE?: string;
}

export const onRequestDelete: PagesFunction<Env> = async ({ env, params }) => {
  const id = Number(String(params.id));
  if (!Number.isInteger(id)) return Response.json({ error: "Bad id." }, { status: 400 });

  const row = await env.DB
    .prepare("SELECT image_url FROM gallery_photos WHERE id = ?1")
    .bind(id)
    .first<{ image_url: string }>();
  if (!row) return Response.json({ error: "Photo not found." }, { status: 404 });

  await env.DB.prepare("DELETE FROM gallery_photos WHERE id = ?1").bind(id).run();

  // Also remove the uploaded file from R2 (only files under gallery/)
  const base = env.PUBLIC_IMAGE_BASE?.replace(/\/$/, "");
  if (env.BUCKET && base && row.image_url.startsWith(`${base}/gallery/`)) {
    await env.BUCKET.delete(row.image_url.slice(base.length + 1));
  }

  return Response.json({ ok: true });
};