# GrowthOS (MVP in progress)

Konzept: `../docs/GrowthOS.md`. Stack: Next.js, TypeScript, Tailwind, Zod, Vitest.

## Lokal starten
```
cd growthos
npm install
cp .env.example .env.local   # Werte eintragen, siehe unten
npm run dev                  # http://localhost:3000
npm test && npm run typecheck && npm run build
```

## Umgebungsvariablen (`.env.local`, nie committen)
- `ANTHROPIC_API_KEY` (optional): KI-Analyse. Ohne Key läuft eine einfache Regel-Analyse. Modell per `GROWTHOS_MODEL`.
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI` (`http://localhost:3000/api/google/callback`): Search Console, nur lesend. Ohne Zugangsdaten zeigt das Dashboard klar gekennzeichnete Demo-Daten.
- Daten liegen lokal in `.data/` (gitignored): Workspace und Google-Refresh-Token (unverschlüsselt, nur Einzelnutzer-MVP).

## Stand
Fertig:
1. Website-Analyse (Crawler mit SSRF-Schutz) und Unternehmensverständnis (Claude oder Heuristik)
2. Bestätigen/Korrigieren, Geschäftsziel, Persistenz (JSON-Datei)
3. Dashboard mit AI Growth Manager (regelbasiert) und Tagesrate bis zum Ziel
4. Search Console: OAuth, SEO-Chancen (Seite 2, schwache CTR), Demo-Fallback. Live-Verbindung noch nicht getestet (Zugangsdaten fehlen).

Nächste Schritte (MVP-Reihenfolge):
1. Google-Verbindung live testen (Cloud-Projekt, Search Console API, OAuth-Client, Testnutzer)
2. Google Analytics anbinden: "Aktuell", Besucher, Registrierungen real (Analytics Data API, Scope `analytics.readonly`)
3. Content Opportunities, dann Content-Erstellung
4. Social Publishing, Unified Inbox/Reply-Unterstützung, Relationship CRM

Grundsätze: nur offizielle Plattform-APIs (sonst "Recommended Action" für manuelle Ausführung), keine erfundenen Kennzahlen, Demo-Daten immer kennzeichnen, sensible Fälle an Menschen eskalieren.
