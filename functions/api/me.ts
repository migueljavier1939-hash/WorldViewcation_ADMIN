import { getAdminId } from "../_lib/auth";
import type { Env } from "../_lib/auth";

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const id = await getAdminId(request, env);
  if (id === null) return Response.json({ error: "Not signed in" }, { status: 401 });

  const admin = await env.DB
    .prepare("SELECT email, full_name, role FROM admins WHERE id = ?1")
    .bind(id)
    .first<{ email: string; full_name: string | null; role: string }>();
  if (!admin) return Response.json({ error: "Not signed in" }, { status: 401 });

  return Response.json({ name: admin.full_name ?? "Admin", email: admin.email, role: admin.role });
};