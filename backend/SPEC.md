# SPEC.md

## Produktbeschreibung

Das Projekt ist eine Fullstack-Anwendung mit Express-Backend, MongoDB-Anbindung und Vite React Frontend.

Der aktuelle Schwerpunkt ist der saubere Projektaufbau mit Clerk-Authentifizierung. Das Frontend kann Benutzer über Clerk anmelden. Das Backend ist vorbereitet, Auth-Informationen aus Clerk-Sessions zu lesen und später geschützte API-Routen bereitzustellen.

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
- `frontend/src/App.tsx` enthält aktuell die einfache Clerk-Login-Oberfläche und einen Backend-Statuscheck.
- Das Frontend wird mit Vite gestartet.

## Auth-Stand

- Clerk ist im Frontend erfolgreich vorbereitet.
- Das Frontend nutzt `@clerk/clerk-react`.
- Der Clerk Publishable Key wird über `VITE_CLERK_PUBLISHABLE_KEY` geladen.
- Benutzer-Login über Clerk funktioniert im aktuellen Frontend.
- Email und Google werden über das Clerk Dashboard konfiguriert.
- Das Backend nutzt `@clerk/express`.
- Die globale Clerk-Middleware liegt in `backend/src/middlewares/clerkAuth.middleware.ts`.
- Aktuell liest das Backend Clerk-Auth-Informationen global mit `clerkMiddleware()`.
- Geschützte API-Routen müssen noch gezielt implementiert werden.

## Backend-Env

Das Backend erwartet aktuell:

- `PORT`
- `MONGODB`
- `BASE_URL`
- `FRONTEND_URL`
- `CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`

`FRONTEND_URL` wird für CORS verwendet. `CLERK_SECRET_KEY` darf nur im Backend liegen.

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
- Frontend-Grundstruktur steht.
- Clerk-Login im Frontend funktioniert.
- Ein einfacher Frontend-Button kann das Backend mit optionalem Bearer Token anfragen.

## Noch offen

- Erste echte Fachfeatures in `backend/src/features`.
- Geschützte Backend-Routen mit Clerk-Auth-Prüfung.
- Saubere Env-Validierung für Backend und Frontend.
- Persistente Datenmodelle und CRUD-Routen.
- Routendokumentation pro neuem API-Feature.
