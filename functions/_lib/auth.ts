export interface Env {
  DB: D1Database;
  SESSION_SECRET: string;
}

const encoder = new TextEncoder();
export const COOKIE_NAME = "wv_admin";
const SESSION_SECONDS = 60 * 60 * 12; // stay signed in for 12 hours

function toBase64(bytes: Uint8Array): string {
  let s = "";
  bytes.forEach((b) => (s += String.fromCharCode(b)));
  return btoa(s);
}
function fromBase64(b64: string): Uint8Array {
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
}
function toBase64Url(bytes: Uint8Array): string {
  return toBase64(bytes).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function fromBase64Url(s: string): Uint8Array {
  const pad = "=".repeat((4 - (s.length % 4)) % 4);
  return fromBase64(s.replace(/-/g, "+").replace(/_/g, "/") + pad);
}
function safeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [saltB64, hashB64] = (stored ?? "").split(":");
  if (!saltB64 || !hashB64) return false;
  const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = new Uint8Array(
    await crypto.subtle.deriveBits(
      { name: "PBKDF2", hash: "SHA-256", salt: fromBase64(saltB64), iterations: 100000 },
      key,
      256
    )
  );
  return safeEqual(bits, fromBase64(hashB64));
}

async function hmacKey(secret: string) {
  return crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

export async function createSessionCookie(env: Env, adminId: number): Promise<string> {
  const expires = Math.floor(Date.now() / 1000) + SESSION_SECONDS;
  const payload = `${adminId}.${expires}`;
  const sig = new Uint8Array(
    await crypto.subtle.sign("HMAC", await hmacKey(env.SESSION_SECRET), encoder.encode(payload))
  );
  return `${COOKIE_NAME}=${payload}.${toBase64Url(sig)}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${SESSION_SECONDS}`;
}

export function clearSessionCookie(): string {
  return `${COOKIE_NAME}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`;
}

// Returns the signed-in admin's id, or null if there is no valid session.
export async function getAdminId(request: Request, env: Env): Promise<number | null> {
  const cookie = (request.headers.get("Cookie") ?? "")
    .split(";")
    .map((s) => s.trim())
    .find((s) => s.startsWith(COOKIE_NAME + "="));
  if (!cookie) return null;

  const parts = cookie.slice(COOKIE_NAME.length + 1).split(".");
  if (parts.length !== 3) return null;
  const [idStr, expStr, sig] = parts;
  const id = Number(idStr);
  const expires = Number(expStr);
  if (!id || !expires || expires < Date.now() / 1000) return null;

  try {
    const ok = await crypto.subtle.verify(
      "HMAC",
      await hmacKey(env.SESSION_SECRET),
      fromBase64Url(sig),
      encoder.encode(`${idStr}.${expStr}`)
    );
    return ok ? id : null;
  } catch {
    return null;
  }
}