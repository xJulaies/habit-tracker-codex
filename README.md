# Habit Tracker MVP

Eine Fullstack-Habit-Tracker-App mit Express, MongoDB, Vite React und Clerk.

Das Projekt ist als lernbarer, sauber strukturierter MVP aufgebaut: eingeloggte
User koennen eigene Habits erstellen, anzeigen, bearbeiten, loeschen und fuer
heute oder gestern einchecken. Das Backend schuetzt alle Habit-Routen mit Clerk
und speichert die Daten userbezogen in MongoDB.

## Produktumfang

Aktuell umgesetzt:

- Login und Session-Handling mit Clerk.
- Habit-Dashboard im Frontend.
- Mobile-first Premium-Dark-Dashboard mit iconbasierter Navigation.
- Responsive eingebettete Clerk-Login-Ansicht.
- Eigene Habits laden und anzeigen.
- Habits erstellen, bearbeiten und loeschen.
- Maximal 5 Habits pro User im MVP.
- Daily- und Weekly-Habits.
- Check-ins fuer heute und gestern.
- Daily-Streak und einfache Weekly-Stats.
- User sehen und veraendern nur eigene Habits.
- API-Validierung mit Zod.
- Zentrales Error-Handling im Backend.
- CORS, Helmet und Rate-Limiting.

Bewusst nicht Teil von Version 1:

- Frei waehlbare Kalender-Check-ins.
- Frei waehlbare Wochentage.
- Planwechsel nach Erstellung.
- Weekly-Streak.
- Komplexe Diagramme.
- Habit-Icons.
- User-Zeitzonen.

## Tech Stack

Backend:

- Node.js
- Express
- TypeScript
- MongoDB mit Mongoose
- Clerk Express SDK
- Zod
- Helmet
- CORS
- Vitest
- Supertest
- ESLint

Frontend:

- Vite
- React
- TypeScript
- Clerk React SDK
- Lucide Icons
- ESLint

## Projektstruktur

```text
backend-api-codex/
  backend/
    src/
      config/
      features/
        habit/
      lib/
      middlewares/
    tests/
    Agents.md
    SPEC.md
  frontend/
    src/
```

Das Backend ist featurebasiert aufgebaut. Der aktuelle Fachbereich liegt unter
`backend/src/features/habit`.

Das Frontend ist ebenfalls featureorientiert gegliedert. Das Habit-Dashboard
liegt unter `frontend/src/features/habit-dashboard`; Design-Entscheidungen und
Review-Fixes stehen in `frontend/src/features/dashboard-design/dashboard-design.todo.md`.

## Voraussetzungen

- Node.js
- npm
- MongoDB lokal oder per Connection String
- Clerk-Projekt mit Publishable Key und Secret Key

## Installation

Backend-Abhaengigkeiten installieren:

```bash
cd backend
npm install
```

Frontend-Abhaengigkeiten installieren:

```bash
cd frontend
npm install
```

## Environment

Lege im Backend eine `.env` auf Basis von `backend/.env.template` an:

```env
PORT=3000
MONGODB=mongodb://localhost:27017/backend
BASE_URL=/api
FRONTEND_URL=http://localhost:5173,http://127.0.0.1:5173
CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key
CLERK_SECRET_KEY=sk_test_your_secret_key
```

Lege im Frontend eine `.env` auf Basis von `frontend/.env.template` an:

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key
VITE_API_URL=http://localhost:3000
```

Wichtig: `.env`-Dateien werden nicht committed. Nur `.env.template` gehoert ins
Repository.

## Entwicklung starten

Backend starten:

```bash
cd backend
npm run dev
```

Frontend starten:

```bash
cd frontend
npm run dev
```

Standard-URLs:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`

## API-Uebersicht

Alle Habit-Routen liegen unter `/api/habits` und benoetigen einen Clerk Bearer
Token.

- `GET /api/habits`
- `GET /api/habits/:habitId`
- `POST /api/habits`
- `PATCH /api/habits/:habitId`
- `DELETE /api/habits/:habitId`
- `PUT /api/habits/:habitId/checkins/:date`
- `DELETE /api/habits/:habitId/checkins/:date`
- `GET /api/habits/:habitId/stats`

Das Check-in-Datum verwendet intern `YYYY-MM-DD`. Im Frontend wird es als
`DD.MM.YYYY` angezeigt.

## Checks

Backend:

```bash
cd backend
npm test -- --run
npm run build
npm run lint
npm audit --audit-level=moderate
```

Frontend:

```bash
cd frontend
npm run lint
npx tsc -b
npm run build
npm audit --audit-level=moderate
```

## Sicherheit und aktuelle Grenzen

- Clerk schuetzt die Authentifizierung.
- Der Clerk Sign-in laeuft im Frontend eingebettet mit Hash-Routing und Redirect
  zurueck zur App.
- Alle Habit-Routen pruefen explizit `requireAuth`.
- Userdaten werden immer nach Clerk User ID gefiltert.
- Fremde oder nicht vorhandene Habits geben `404` zurueck.
- Usertexte werden als Rohtext gespeichert und in React normal gerendert.
- Dashboard-Renderfehler werden im Frontend sichtbar abgefangen, statt als
  weisse Seite zu enden.
- Keine Secrets im Frontend speichern.
- Das aktuelle Rate-Limit ist in-memory und fuer den lokalen MVP geeignet.
  Fuer Production oder mehrere Backend-Instanzen sollte ein externer Store
  verwendet werden.
- Die Datumslogik nutzt im MVP UTC-Tage. User-Zeitzonen sind ein spaeteres
  Feature.

## Dokumentation

- `backend/SPEC.md` beschreibt den aktuellen Produkt- und Technikstand.
- `backend/Agents.md` beschreibt die Arbeitsregeln fuer Entwicklung und Reviews.
- `backend/src/features/habit/habit.docs.md` dokumentiert die Habit API.
- `backend/src/features/habit/habit.todo.md` dokumentiert den Feature-Fortschritt.
