# SPEC.md

## Produktbeschreibung

Das Projekt ist eine Fullstack-Anwendung mit Express-Backend, MongoDB-Anbindung und Vite React Frontend.

Der aktuelle Schwerpunkt ist der Habit-Tracker-MVP. Eingeloggte User können eigene Habits erstellen, anzeigen, bearbeiten, löschen, für heute/gestern einchecken und einfache Stats sehen. Clerk schützt Frontend und Habit-API.

## Projektstruktur

- `backend` enthält die API.
- `frontend` enthält die Web-App.
- `backend/dist` und `frontend/dist` sind Build-Output.
- `node_modules` ist kein Teil des Quellcodes.

## Backend-Technologiestack

- Node.js
- Express
- TypeScript
- Mongoose
- dotenv
- cors
- helmet
- nodemon
- ts-node
- Vitest
- Supertest
- ESLint
- Clerk Express SDK: `@clerk/express`
- Zod

## Frontend-Technologiestack

- Vite
- React
- TypeScript
- Clerk React SDK: `@clerk/clerk-react`
- Lucide Icons: `lucide-react`
- ESLint

## Backend-Einstiegspunkt

- `backend/index.ts` ist der Einstiegspunkt der Backend-Anwendung.
- `backend/src/app.ts` enthält die Express-App und kann unabhängig vom Serverstart getestet werden.
- Das Backend verwendet TypeScript mit CommonJS-Modulformat.
- Der TypeScript-Code wird im Entwicklungsstart über `ts-node` ausgeführt.
- `backend/dist` ist nur für kompilierten Output vorgesehen und nicht Teil des Entwicklungsstarts.

## Frontend-Einstiegspunkt

- `frontend/index.html` ist der HTML-Einstiegspunkt.
- `frontend/src/main.tsx` initialisiert React und den `ClerkProvider`.
- `frontend/src/App.tsx` enthält die App-Shell mit Clerk-Login.
- Das Habit-Dashboard liegt komponentenbasiert unter `frontend/src/features/habit-dashboard`.
- Das Dashboard lädt eigene Habits, erstellt Habits, zeigt Details/Stats und setzt Check-ins für heute/gestern.
- Das aktuelle Design ist mobile-first, Premium Dark und nutzt sparsam `lucide-react` Icons.
- Der Clerk Sign-in ist als eingebettete responsive Ansicht umgesetzt und nutzt Virtual-Routing mit Redirect zurück zur App.
- Das Frontend zeigt Standard-Statusmeldungen wie `Habits geladen` nicht mehr dauerhaft an; echte Fehler bleiben sichtbar.
- Das Frontend wird mit Vite gestartet.

## Auth-Stand

- Clerk ist im Frontend erfolgreich vorbereitet.
- Das Frontend nutzt `@clerk/clerk-react`.
- Der Clerk Publishable Key wird über `VITE_CLERK_PUBLISHABLE_KEY` geladen.
- Benutzer-Login über Clerk funktioniert im aktuellen Frontend.
- Während Clerk lädt, zeigt das Frontend einen eigenen Loading-State.
- Dashboard-Renderfehler werden im Frontend sichtbar abgefangen, statt in einer weißen Seite zu enden.
- Email und Google werden über das Clerk Dashboard konfiguriert.
- Das Backend nutzt `@clerk/express`.
- Die globale Clerk-Middleware liegt in `backend/src/middlewares/clerkAuth.middleware.ts`.
- Das Backend liest Clerk-Auth-Informationen global mit `clerkMiddleware()`.
- Alle Habit-Routen sind mit `requireAuth` geschützt.

## Habit Tracker MVP

Der erste echte Produktbereich wird ein Habit Tracker.

MVP-Ziel:

- Eingeloggte User können eigene Habits erstellen, verfolgen, bearbeiten und löschen.
- User sehen nur ihre eigenen Habits.
- Der MVP zeigt, ob ein User heute oder diese Woche dranbleibt.
- Zusätzlich liefert der MVP einfache Fortschrittswerte und Gesamtstatistiken.

Habit-Daten:

- `userId`: Clerk User ID.
- MVP-Limit: maximal 5 Habits pro User.
- `title`: Pflichtfeld, maximal 80 Zeichen.
- `description`: optional, maximal 300 Zeichen.
- `category`: Pflichtfeld, frei benennbar, maximal 40 Zeichen.
- `plan`: `daily` oder `weekly`.
- `weeklyTarget`: Pflicht bei `weekly`, nicht erlaubt bei `daily`, Wert 1 bis 14.
- `color`: optional im Request, wird immer gespeichert.
- Wenn `color` fehlt, setzt das Backend Grau als Default-Farbe.
- Es gibt 16 vordefinierte erlaubte Farben.
- Textfelder werden getrimmt und als Rohtext gespeichert.
- Das React-Frontend rendert Textfelder ohne `dangerouslySetInnerHTML`, sodass HTML beim Rendern escaped wird.
- `checkins`: strukturierte Check-in-Objekte.

Check-in-Daten:

- Check-in-Datum wird intern als `YYYY-MM-DD` gespeichert.
- Im Frontend wird Datum als `DD.MM.YYYY` angezeigt.
- Check-ins werden als `{ date: string; count: number; createdAt: Date; updatedAt: Date }` gespeichert.
- Daily-Habits erlauben maximal `count = 1` pro Datum.
- Weekly-Habits erlauben mehrere Check-ins pro Datum.
- Check-ins sind im MVP nur für heute und gestern erlaubt.
- Datumslogik verwendet im MVP UTC-Tage.
- User-Zeitzonen werden in Version 1 noch nicht gespeichert oder berechnet.
- Weekly wird nach Kalenderwoche Montag bis Sonntag berechnet.

Fortschritt:

- Daily-Habits haben eine Streak.
- Weekly-Habits haben im MVP keine Streak.
- Daily zeigt heutigen Status.
- Weekly zeigt Wochenfortschritt `x von y`.
- Gesamtstatistik zeigt erledigte Check-ins und einfache Erfolgsquote.
- Die Stats API liefert `current` und `totals` getrennt.
- Daily `current` enthält Datum, Count, Completed und Streak.
- Weekly `current` enthält Wochenstart, Wochenende, Count, Ziel, Rest und Completed.

Bearbeiten und Löschen:

- Bearbeitet werden können Titel, Beschreibung und Kategorie.
- Der Plan kann nach Erstellung im MVP nicht geändert werden.
- Habits werden im MVP direkt gelöscht.
- Archivieren ist kein Teil von Version 1.

Bewusste Nicht-Ziele für Version 1:

- Keine beliebigen Kalender-Check-ins.
- Keine frei wählbaren Wochentage.
- Keine Planänderung nach Erstellung.
- Keine Weekly-Streak.
- Keine komplexen Diagramme.
- Keine Habit-Icons.
- Keine User-Zeitzonen.

## Habit API MVP

Alle Habit-Routen sind auth-geschützt. User können nur eigene Habits lesen und verändern.

Basis:

- `GET /api/habits`
- `GET /api/habits/:habitId`
- `POST /api/habits`
- `PATCH /api/habits/:habitId`
- `DELETE /api/habits/:habitId`

Check-ins:

- `PUT /api/habits/:habitId/checkins/:date`
- `DELETE /api/habits/:habitId/checkins/:date`

Stats:

- `GET /api/habits/:habitId/stats`

API-Regeln:

- `GET /api/habits` sortiert nach `createdAt desc`.
- Nicht vorhandene Habits geben `404` zurück.
- Fremde Habits geben ebenfalls `404` zurück.
- Check-in-Datum in der URL verwendet `YYYY-MM-DD`.
- `PUT /api/habits/:habitId/checkins/:date` setzt den `count`.
- Daily-Habits erlauben maximal `count = 1`.
- Weekly-Habits erlauben mehrere Check-ins pro Datum.
- `DELETE /api/habits/:habitId/checkins/:date` entfernt den Check-in für das Datum.
- Check-in-Routen erlauben im MVP nur heute und gestern.
- Check-in Upsert und Delete werden atomisch für Habit und Datum geschrieben.
- Habit Create wird durch eine atomische Quota gegen paralleles Überschreiten des 5-Habit-Limits geschützt.
- Habit API Requests werden per In-Memory Rate-Limit begrenzt.
- `GET /api/habits/:habitId/stats` liefert Fortschritt und Gesamtstatistik separat zur Habit-Liste.
- Daily Stats berechnen die Erfolgsquote über getrackte Tage seit Erstellung.
- Weekly Stats berechnen die Erfolgsquote über Wochenziele seit Erstellung.

## Backend-Env

Das Backend erwartet aktuell:

- `PORT`
- `MONGODB`
- `BASE_URL`
- `FRONTEND_URL`
- `CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`

`FRONTEND_URL` wird für CORS verwendet und kann mehrere kommaseparierte Origins enthalten. `CLERK_SECRET_KEY` darf nur im Backend liegen.

## Frontend-Env

Das Frontend erwartet aktuell:

- `VITE_CLERK_PUBLISHABLE_KEY`
- `VITE_API_URL`

Alle `VITE_`-Werte sind im Browser sichtbar und dürfen keine Secrets enthalten.

## Aktueller Funktionsstand

- Backend-Grundstruktur steht.
- Express-App ist testbar getrennt vom Serverstart.
- MongoDB-Verbindung ist vorbereitet.
- Zentrales ErrorHandling mit `createError` und `createAnswer` ist vorbereitet.
- Helmet und CORS sind aktiv.
- Clerk-Middleware ist im Backend registriert.
- Wiederverwendbare `requireAuth`-Middleware ist vorhanden.
- Habit Foundation mit Model, Zod-Schemas und Datums-Helpern ist implementiert.
- `POST /api/habits` ist implementiert.
- `GET /api/habits` ist implementiert.
- `GET /api/habits/:habitId` ist implementiert.
- `PATCH /api/habits/:habitId` ist implementiert.
- `DELETE /api/habits/:habitId` ist implementiert.
- `PUT /api/habits/:habitId/checkins/:date` ist implementiert.
- `DELETE /api/habits/:habitId/checkins/:date` ist implementiert.
- `GET /api/habits/:habitId/stats` ist implementiert.
- MVP-Limit von 5 Habits pro User ist implementiert.
- Das MVP-Limit wird per atomischer Quota durchgesetzt.
- Habit API Rate-Limiting ist implementiert.
- Das Rate-Limit ist für den lokalen MVP als In-Memory-Limit umgesetzt.
- Für Production oder mehrere Backend-Instanzen soll das Rate-Limit auf einen externen Store umgestellt werden.
- Textfelder werden als Rohtext gespeichert und im React-Frontend sicher gerendert.
- Unerwartete Serverfehler senden generische `500`-Antworten.
- Backend-Pflichtwerte werden beim Serverstart validiert.
- CORS erlaubt lokale Frontend-Origins über `FRONTEND_URL`.
- Frontend-Grundstruktur steht.
- Clerk-Login im Frontend funktioniert.
- Das Frontend sendet Clerk Bearer Tokens an die Habit API.
- Das Habit-Dashboard ist an Liste, Create, Detail, Delete, Check-ins und Stats angebunden.
- Das Frontend ist in eine mobile-first Premium-Dark-Komponentenstruktur überführt.
- Mobile nutzt iconbasierte Bottom Tabs für `Übersicht`, `Erstellen` und `Profil`; Desktop nutzt ein eigenes Dashboard-Layout.
- Mobile Tab 1 zeigt Begrüßung und Habit-Library. Habit-Auswahl öffnet eine Detailansicht mit Stats und Check-ins.
- Der Profil-Tab nutzt aktuell Clerk-Daten und benötigt keine eigene Backend-Route.
- Signed-out nutzt eine eigene Hero-Ansicht und eine responsive eingebettete Clerk-Login-Karte.
- Frontend-Standardstatusmeldungen werden ausgeblendet; Fehlermeldungen bleiben als Statuszeile sichtbar.
- Habit Tracker MVP ist fachlich geplant und als erster Fullstack-Slice umgesetzt.

## Noch offen

- Frontend-Env-Validierung und Deployment-Konfiguration weiter härten.
- Rate-Limit für Production auf externen Store umstellen.
- User-Zeitzonen für spätere Version planen.
- Routendokumentation bei jeder Habit-Routenänderung aktualisieren.
