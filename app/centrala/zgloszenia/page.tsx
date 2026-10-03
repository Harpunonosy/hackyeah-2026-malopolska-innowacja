import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Skrzynka } from "@/components/centrala/skrzynka";
import { czyAdmin } from "@/lib/sesja";

export const metadata: Metadata = { title: "Centrala: skrzynka" };

export default async function Page() {
  if (!(await czyAdmin())) redirect("/centrala/logowanie");
  return <Skrzynka />;
}
