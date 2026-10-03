import { opisApi } from "@/lib/openapi";

export function GET(req: Request) {
  return Response.json(opisApi(new URL(req.url).origin), { headers: { "Cache-Control": "public, max-age=300", "Access-Control-Allow-Origin": "*" } });
}
