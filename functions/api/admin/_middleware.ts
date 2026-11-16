import { getAdminId } from "../../_lib/auth";
import type { Env } from "../../_lib/auth";

// Runs before every route under /api/admin/. Anything without a valid session is rejected.
export const onRequest: PagesFunction<Env> = async (context) => {
  if ((await getAdminId(context.request, context.env)) === null) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  return context.next();
};