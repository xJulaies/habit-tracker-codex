# AGENTS.md

## Grundregeln

- Verwende immer UTF-8.
- Schreibe modernen TypeScript-Code mit ES6-Syntax, `import` und `export`.
- Der Code soll klar, einfach, verständlich und einfach zu bearbeiten sein.
- Benutze Methoden wie KISS, YAGNI und SOLID.
- Verrenne dich nicht in komplexen oder abstrakten Codestrukturen. Halte den Code sauber.
- Halte Backend und Frontend getrennt. Änderungen sollen im passenden Ordner stattfinden.

## Produkt- und Arbeitsprozess

- Vor jedem neuen Feature wird zuerst gemeinsam geklärt, welches Feature gebaut werden soll.
- Für jedes Feature wird eine kurze Todo-Liste angelegt und während der Umsetzung aktualisiert.
- Jede Feature-Todo liegt im jeweiligen Feature-Ordner als `feature.todo.md`.
- Die Feature-Todo enthält MVP-Ziel, offene Aufgaben, erledigte Aufgaben und bewusste Nicht-Ziele.
- Die Feature-Todo wird bei jedem abgeschlossenen Schritt aktualisiert.
- Vor der Implementierung wird ein sokratischer Dialog geführt: Stelle gezielte Fragen, damit Produktziel, Nutzerwert und Grenzen klar werden.
- Formuliere Produktfragen so, dass der Nutzer entweder mit Ja/Nein antworten kann oder 2-3 konkrete Auswahlmöglichkeiten bekommt.
- Stelle pro Antwort-Runde möglichst nur eine Frage.
- Wenn eine freie Antwort nötig ist, halte die Frage kurz und erkläre, warum sie nötig ist.
- Der Fokus liegt auf MVP als Most Valuable Product: Baue zuerst den kleinsten wertvollen Produktumfang, nicht nur den kleinsten technischen Umfang.
- Kläre bei jedem Feature:
  - Wer nutzt das Feature?
  - Welches Problem löst es?
  - Was ist der kleinste wertvolle Ablauf?
  - Was gehört bewusst nicht in die erste Version?
  - Welche Daten müssen gespeichert werden?
  - Welche Fehlerfälle sind wichtig?
- Erst wenn der MVP-Umfang klar ist, werden Tests und produktiver Code geschrieben.
- Bei unklaren Produktentscheidungen nicht raten, sondern kurz und gezielt nachfragen.

## Projektstruktur

- `backend` enthält die Express API.
- `frontend` enthält die Vite React App.
- `backend/dist` und `frontend/dist` sind nur Build-Output und nicht Teil der aktiven Entwicklung.
- `node_modules` und Build-Output werden bei Reviews und Suchen ignoriert.

## Backend-Architektur

- Baue das Backend featurebased.
- Jedes neue Backend-Feature muss in `backend/src/features`.
- Wiederverwendbare Backend-Logik gehört nach `backend/src/lib`.
- Helferfunktionen, die nur zu einem Feature gehören, bleiben im jeweiligen Feature-Ordner.
- Angewandte Middleware gehört nach `backend/src/middlewares`.
- Konfiguration gehört nach `backend/src/config`.
- Jedes Feature soll unabhängig von anderen Features existieren und keine unnötige oder überschneidende Logik haben.
- Die Projektstruktur hier ist immer zu priorisieren. Verändere sie nicht, selbst wenn ein Skill andere Methoden benutzt.

## Backend-Feature-Struktur

Features sollen klar strukturiert sein.

- `feature.route.ts` für Express-Routen.
- `feature.controller.ts` für Request- und Response-Logik.
- `feature.model.ts` für Types, Datenstrukturen und Mongoose-Modelle.
- `feature.zodSchema.ts` für Zod-Validierung.
- `feature.docs.md` für Routendokumentation.
- `feature.todo.md` für Feature-Aufgaben und MVP-Stand.

## Backend-Auth

- Clerk ist die Auth-Lösung.
- Im Backend wird `@clerk/express` verwendet.
- Die globale Clerk-Middleware liegt in `backend/src/middlewares/clerkAuth.middleware.ts`.
- `clerkMiddleware()` liest Auth-Informationen, schützt aber nicht automatisch jede Route.
- Geschützte Routen müssen explizit mit Clerk-Auth geprüft werden, z. B. über `getAuth(req)` oder eine eigene Auth-Middleware.
- Auth-Fehler sollen über das zentrale ErrorHandling laufen.
- Clerk-Secret-Werte gehören nur in Backend-Env-Dateien und niemals ins Frontend.

## Express-Regeln

- Routen binden Controller an, rufen Validierungen auf und beschränken sich aufs Routing.
- Controller bearbeiten HTTP-Logik für Request und Response und dürfen andere Funktionen benutzen.
- Benutze `createAnswer`, um eine Antwort zurückzugeben.
- Benutze `createError` mit `next` für Fehler als zentrales ErrorHandling. Kein doppeltes ErrorHandling.
- Wenn du eine neue Route anlegst, erstelle eine Dokumentation als Markdown-Datei und aktualisiere sie bei jeder Veränderung der Route.
- CORS verwendet die Frontend-Origins aus `FRONTEND_URL`; mehrere lokale Origins werden kommasepariert eingetragen.
- Helmet bleibt aktiv und ergänzt Clerk, ersetzt Clerk aber nicht.
- Rate-Limiting darf im lokalen MVP in-memory sein; für Production oder mehrere Backend-Instanzen muss ein externer Store geplant werden.

## Frontend-Architektur

- Das Frontend ist eine Vite React TypeScript App in `frontend`.
- Clerk wird im Frontend über `@clerk/clerk-react` verwendet.
- Der Einstieg liegt in `frontend/src/main.tsx`.
- Die Haupt-App liegt in `frontend/src/App.tsx`.
- Der Clerk Publishable Key wird über `VITE_CLERK_PUBLISHABLE_KEY` geladen.
- API-Requests verwenden `VITE_API_URL`.
- Frontend-Env-Werte mit `VITE_` sind öffentlich. Keine Secrets im Frontend speichern.
- UI-Code soll einfach, wartbar und komponentenorientiert bleiben.
- Frontend-Layouts werden mobile-first geplant und danach für Tablet/Desktop erweitert.
- Usertexte werden als normaler React-Text gerendert. Kein `dangerouslySetInnerHTML` für gespeicherte Userdaten.
- Auth- und Dashboard-Fehler im Frontend sollen sichtbar abgefangen werden, damit keine weiße Seite ohne Hinweis entsteht.
- Temporäre Status- oder Debug-Texte dürfen nicht dauerhaft in der UI stehen; sichtbare Statusmeldungen sollen Nutzerwert haben.

## Dateien und Exporte

- Jede Datei soll eine nachvollziehbare Aufgabe erfüllen und Namen sollen zur Aufgabe passen.
- Konstanten und Funktionen sollen sinnvoll nach ihrer Aufgabe benannt werden.
- Exportierte Funktionen, Helper, Klassen, Types oder Schemas sollen eine eigene Datei haben, es sei denn, man kann sinnvoll gruppieren.

Beispiele für Dateinamen:

- `auth.controller.ts`
- `auth.model.ts`
- `auth.route.ts`
- `validateAuth.middleware.ts`
- `clerkAuth.middleware.ts`

Beispiele für Gruppierung:

- `errorTypes.ts`
  - `TCreateError`
  - `TStatusCode`

## Benennung

- Verwende camelCase für Funktionen und Variablen.
- Verwende PascalCase für Typen, Interfaces, React-Komponenten und Klassen.
- Verwende UPPER_SNAKE_CASE für echte Konstanten.
- Env-Variablen werden in UPPER_SNAKE_CASE geschrieben.

## Async-Regeln

- Asynchrone Logik benutzt `async` und `await` und keine `.then`-Ketten.
- Fehler müssen an das zentrale ErrorHandling weitergegeben werden.

## TypeScript-Regeln

- Halte dich an `strict`.
- Verwende kein Type `any`, es sei denn, es gibt keine sinnvolle Alternative.
- Erstelle Types, wenn notwendig basierend auf Notwendigkeit, besonders bei Ex- und Imports.
- Halte Env-Zugriffe zentral und typisiert, sobald sie in mehreren Stellen gebraucht werden.

## Wiederverwendbarkeit

- Jede wiederkehrende Logik soll ausgelagert werden, wenn sie sich wiederholt oder die Lesbarkeit verbessert werden kann.
- Halte Helperfunktionen klein und übersichtlich.
- Keine Abstraktionen auf Vorrat.

## Sauberkeit und Wartbarkeit

- Benutze keinen veralteten Code.
- Kommentare nur wenn nötig oder wenn nicht klar erkennbar ist, was die Logik tut.
- Halte den Code sauber, keine unbenutzten Imports oder Variablen.
- Bei Überarbeitung halte dich an die Grundregeln. Keine unnötigen komplexen Veränderungen.

## Tests und Prüfung

- Arbeite nach Test Driven Development.
- Erstelle immer einen fehlschlagenden Test bevor du produktive Codeänderungen machst.
- Schreibe nur so viel Code, wie nötig ist, um den Test zu bestehen. Anschließend refactoren.
- Schreibe Tests bei Bugfixes, um den Fehler zu reproduzieren.
- Schreibe Fehlerfälle und Erfolgsfälle bei API-Routen.
- Keine Tests müssen geschrieben werden beim Refactoren von Namen oder Dingen ohne Laufzeitlogik.
- Bei einem Review muss die passende Test-Suite einmal ausgeführt werden und grün sein.
- Bei einem Review muss außerdem der passende Linter ausgeführt werden und grün sein.
- Backend-Prüfung: `npm.cmd test -- --run`, `npm.cmd run build`, `npm.cmd run lint` im `backend`-Ordner.
- Frontend-Prüfung: `npm.cmd run lint`, `npx.cmd tsc -b` und nach Möglichkeit `npm.cmd run build` im `frontend`-Ordner.
- Ein Code Review wird immer aus Sicht eines Seniorentwicklers durchgeführt.
- Bei einem Code Review wird der Code gezielt auf Fehler, mögliche Bugs, Sicherheitsrisiken und sonstige Probleme geprüft.
- Review-Ergebnisse werden nach Schwere sortiert ausgegeben, beginnend mit den schwerwiegendsten Punkten.
