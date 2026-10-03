"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function Logowanie() {
  const router = useRouter();
  const [haslo, setHaslo] = React.useState("");
  const [blad, setBlad] = React.useState("");
  return (
    <form
      className="max-w-md space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        const r = await fetch("/api/centrala/logowanie", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ haslo }) });
        if (r.ok) router.push("/centrala/zgloszenia");
        else setBlad(r.status === 429 ? "Za dużo prób. Poczekaj chwilę." : "Nieprawidłowe hasło.");
      }}
    >
      <label htmlFor="haslo" className="block text-xl font-bold">
        Hasło
      </label>
      <input
        id="haslo"
        type="password"
        autoComplete="current-password"
        value={haslo}
        onChange={(e) => setHaslo(e.target.value)}
        className="block min-h-12 w-full rounded-xl border-2 border-fg bg-card px-4 text-lg"
      />
      {blad && (
        <p role="alert" className="font-semibold text-primary">
          {blad}
        </p>
      )}
      <Button type="submit">Zaloguj</Button>
    </form>
  );
}
