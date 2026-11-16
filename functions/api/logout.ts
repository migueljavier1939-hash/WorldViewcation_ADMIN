import { clearSessionCookie } from "../_lib/auth";

export const onRequestPost: PagesFunction = async () => {
  return Response.json({ ok: true }, { headers: { "Set-Cookie": clearSessionCookie() } });
};