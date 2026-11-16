import { verifyPassword, createSessionCookie } from "../_lib/auth";
import type { Env } from "../_lib/auth";

const MAX_ATTEMPTS = 5;
const WINDOW_SECONDS = 15 * 60;
// Used when the email doesn't exist, so the response time doesn't reveal which emails are real.
const DUMMY_HASH = "AAAAAAAAAAAAAAAAAAAAAA==:" + "A".repeat(43) + "=";

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const ip = request.headers.get("CF-Connecting-IP") ?? "unknown";
  const now = Math.floor(Date.now() / 1000);
  const since = now - WINDOW_SECONDS;

  await env.DB.prepare("DELETE FROM login_attempts WHERE attempted_at < ?1").bind(since).run();
  const row = await env.DB
    .prepare("SELECT COUNT(*) AS n FROM login_attempts WHERE ip = ?1 AND attempted_at >= ?2")
    .bind(ip, since)
    .first<{ n: number }>();

  if ((row?.n ?? 0) >= MAX_ATTEMPTS) {
    return Response.json({ error: "Too many attempts. Please try again in 15 minutes." }, { status: 429 });
  }

  let body: { email?: string; password?: string } = {};
  try {
    body = await request.json();
  } catch {}

  const email = (body.email ?? "").trim().toLowerCase();
  const password = body.password ?? "";

  const admin = await env.DB
    .prepare("SELECT id, email, full_name, role, password_hash FROM admins WHERE email = ?1")
    .bind(email)
    .first<{ id: number; email: string; full_name: string | null; role: string; password_hash: string }>();

  const ok = await verifyPassword(password, admin?.password_hash ?? DUMMY_HASH);

  if (!admin || !ok) {
    await env.DB.prepare("INSERT INTO login_attempts (ip, attempted_at) VALUES (?1, ?2)").bind(ip, now).run();
    return Response.json({ error: "Invalid email or password." }, { status: 401 });
  }

  await env.DB.prepare("DELETE FROM login_attempts WHERE ip = ?1").bind(ip).run();
  return Response.json(
    { name: admin.full_name ?? "Admin", email: admin.email, role: admin.role },
    { headers: { "Set-Cookie": await createSessionCookie(env, admin.id) } }
  );
};