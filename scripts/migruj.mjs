import pg from 'pg';
import { BladMigracji, odczytajMigracje, ustawieniaPolaczenia, zastosujMigracje } from './migracje-vercel.mjs';

async function main() {
  const konfiguracja = ustawieniaPolaczenia(process.env);
  const migracje = await odczytajMigracje();
  const klient = new pg.Client(konfiguracja);
  try {
    await klient.connect();
    await zastosujMigracje(klient, migracje, console.log);
  } finally {
    await klient.end();
  }
}

main().catch(blad => {
  // Nie wypisuj URL, haseł ani szczegółów połączenia z błędów sterownika.
  const kod = typeof blad?.code === 'string' && /^[A-Z0-9]{5}$/.test(blad.code) ? ` (SQLSTATE ${blad.code})` : '';
  console.error(blad instanceof BladMigracji
    ? blad.message
    : `Migracje przerwane${kod}. Sprawdź dostęp do istniejącej bazy i uprawnienia właściciela przez DATABASE_URL.`);
  process.exitCode = 1;
});
