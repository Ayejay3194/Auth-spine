import { api } from "@/src/core/api";
import spec from "@/openapi/openapi.json";

export async function GET() {
  return api(async () => spec);
}
