import { redirect } from "next/navigation";
import { czyAdmin } from "@/lib/sesja";

export default async function Centrala() {
  redirect((await czyAdmin()) ? "/centrala/zgloszenia" : "/centrala/logowanie");
}
