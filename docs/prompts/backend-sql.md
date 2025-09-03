# architektura backend i sql dla postgis

**Zasada architektoniczna:**

"Cały backend musi być zaimplementowany w Node.js z TypeScript. Użyj frameworka Express.js do obsługi routingu. Wszystkie operacje na bazie danych muszą być obsługiwane przez ORM, taki jak Prisma lub TypeORM, aby zapewnić bezpieczeństwo typów i łatwość zarządzania schematem."

**Prompt:**

```text
Używając Node.js z biblioteką pg i PostGIS, wygeneruj instrukcje SQL CREATE TABLE dla następujących schematów: Fanciers, Lofts, Pigeons, Races, ReleasePoints i Results. Tabele Lofts i ReleasePoints muszą używać typu PostGIS geography(Point, 4326) dla współrzędnych. Upewnij się, że ograniczenia klucza obcego są poprawnie zdefiniowane. Tabela Pigeons potrzebuje samoodwołującego się klucza obcego dla sire_id i dam_id. Wszystkie tabele powinny zawierać znaczniki czasu created_at i updated_at.
```

