# Habit Feature Todo

## MVP-Ziel

Eingeloggte User können frei planbare Habits erstellen und verfolgen. Der kleinste wertvolle Umfang zeigt, ob ein User heute oder diese Woche dranbleibt, und gibt einfache Fortschrittswerte zurück.

## MVP-Entscheidungen

- Auth: Jeder User sieht und verändert nur eigene Habits.
- MVP-Limit: maximal 5 Habits pro User.
- Planung: `daily` oder `weekly`.
- Daily: Ein Check-in pro Tag.
- Weekly: Ziel X-mal pro Kalenderwoche, Montag bis Sonntag.
- Kategorien: frei benennbar.
- Beim Erstellen ist `category` Pflicht.
- `color` ist optional im Request, wird aber immer gespeichert.
- Wenn `color` fehlt, setzt das Backend Grau als Default-Farbe.
- Erlaubt sind 16 vordefinierte Farben.
- `description` ist optional.
- `weeklyTarget` ist nur bei `weekly` Pflicht.
- Textfelder: `title`, `description` und `category` werden getrimmt und als Rohtext gespeichert.
- React rendert Textfelder ohne `dangerouslySetInnerHTML`; HTML wird beim Rendern escaped.
- Leere `description` und `category` dürfen als `""` gespeichert werden.
- Textlimits: `title` maximal 80 Zeichen, `description` maximal 300 Zeichen, `category` maximal 40 Zeichen.
- Bearbeiten: Titel, Beschreibung und Kategorie.
- Löschen: Habits werden im MVP direkt gelöscht.
- Check-ins: heute und gestern erlaubt.
- Datumslogik: MVP verwendet UTC-Tage, noch keine User-Zeitzonen.
- Check-in-Datum intern: `YYYY-MM-DD`.
- Check-in-Datum im Frontend: Anzeige als `DD.MM.YYYY`.
- Check-in-Speicherung: `checkins: { date: string; count: number; createdAt: Date; updatedAt: Date }[]`.
- Daily-Check-ins: maximal `count = 1` pro Datum.
- Weekly-Check-ins: mehrere Check-ins pro Datum erlaubt.
- Weekly-Ziel: `weeklyTarget` von 1 bis 14.
- `daily` mit `weeklyTarget` wird als Validation Error abgelehnt.
- `weekly` ohne `weeklyTarget` wird als Validation Error abgelehnt.
- Weekly-Check-in-API: `PUT` setzt `count`; Plus/Minus wird vom Frontend in einen neuen `count` umgerechnet.
- Daily-Streak: ja.
- Weekly-Streak: nein im MVP.
- Fortschritt: aktueller Status plus Gesamtstatistik.

## Todo

- [x] Foundation: MVP-Entscheidungen festhalten.
- [x] API-Routen grob festlegen.
- [x] Foundation: Datenmodell, Zod-Schemas und Datums-Helper planen.
- [x] Foundation-Tests schreiben.
- [x] Habit-Model implementieren.
- [x] Habit-Zod-Schemas implementieren.
- [x] Datums-Helper für heute, gestern und Kalenderwoche implementieren.
- [x] Create + List API planen und testen.
  - [x] `requireAuth.middleware.ts` anlegen.
  - [x] `POST /api/habits` unauthenticated testen.
  - [x] `GET /api/habits` unauthenticated testen.
  - [x] `GET /api/habits/:habitId` unauthenticated testen.
  - [x] `GET /api/habits/:habitId` ungueltige ID als `404` testen.
  - [x] `GET /api/habits/:habitId` fremd/nicht gefunden als `404` testen.
  - [x] `GET /api/habits/:habitId` Erfolg testen.
  - [x] `POST /api/habits` Validation Error testen.
  - [x] `POST /api/habits` Erfolg testen.
  - [x] `GET /api/habits` nur eigene Habits und `createdAt desc` testen.
  - [x] `habit.controller.ts` implementieren.
  - [x] `habit.route.ts` implementieren.
  - [x] Route in `app.ts` registrieren.
  - [x] `habit.docs.md` anlegen.
- [x] Update + Delete API planen und testen.
  - [x] `PATCH /api/habits/:habitId` unauthenticated testen.
  - [x] `PATCH /api/habits/:habitId` leeren Body als `400` testen.
  - [x] `PATCH /api/habits/:habitId` unerlaubte Felder als `400` testen.
  - [x] `PATCH /api/habits/:habitId` fremd/nicht gefunden als `404` testen.
  - [x] `PATCH /api/habits/:habitId` Erfolg testen.
  - [x] `DELETE /api/habits/:habitId` unauthenticated testen.
  - [x] `DELETE /api/habits/:habitId` fremd/nicht gefunden als `404` testen.
  - [x] `DELETE /api/habits/:habitId` Erfolg testen.
- [x] Check-in API planen und testen.
  - [x] `PUT /api/habits/:habitId/checkins/:date` unauthenticated testen.
  - [x] `PUT /api/habits/:habitId/checkins/:date` ungueltiges Datum als `400` testen.
  - [x] `PUT /api/habits/:habitId/checkins/:date` Datum ausserhalb heute/gestern als `400` testen.
  - [x] `PUT /api/habits/:habitId/checkins/:date` fremd/nicht gefunden als `404` testen.
  - [x] `PUT /api/habits/:habitId/checkins/:date` Daily `count > 1` als `400` testen.
  - [x] `PUT /api/habits/:habitId/checkins/:date` Erstellen und Aktualisieren testen.
  - [x] `DELETE /api/habits/:habitId/checkins/:date` unauthenticated testen.
  - [x] `DELETE /api/habits/:habitId/checkins/:date` Erfolg testen.
  - [x] `habit.docs.md` aktualisieren.
- [x] Security-Hardening für aktuellen Habit-Slice.
  - [x] Maximal 5 Habits pro User testen und implementieren.
  - [x] Habit-Limit per atomischer Quota testen und implementieren.
  - [x] Habit-API Rate-Limit testen und implementieren.
  - [x] Check-in Upsert/Delete atomisch testen und implementieren.
  - [x] Generische `500`-Antworten testen und implementieren.
  - [x] Textfelder als Rohtext speichern und React-Rendering nutzen.
- [x] Stats API planen und testen.
  - [x] `GET /api/habits/:habitId/stats` unauthenticated testen.
  - [x] `GET /api/habits/:habitId/stats` ungueltige ID als `404` testen.
  - [x] `GET /api/habits/:habitId/stats` fremd/nicht gefunden als `404` testen.
  - [x] Daily Stats mit heutigem Status, Streak und Gesamtwerten testen.
  - [x] Weekly Stats mit Wochenfortschritt und Gesamtwerten testen.
  - [x] `habit.docs.md` aktualisieren.
- [x] Frontend-Dashboard planen und anbinden.
  - [x] Eingeloggte User laden eigene Habit-Liste.
  - [x] Habit-Create-Form an `POST /api/habits` anbinden.
  - [x] Habit-Auswahl und Detailansicht bauen.
  - [x] Stats an `GET /api/habits/:habitId/stats` anbinden.
  - [x] Heute/Gestern Check-ins an `PUT`/`DELETE` anbinden.
  - [x] Habit-Delete an `DELETE /api/habits/:habitId` anbinden.
  - [x] Nach Delete automatisch nächsten Habit auswählen.
  - [x] Frontend-Lint, Typecheck und Build ausführen.

## Bewusste Nicht-Ziele Für Version 1

- Keine beliebigen Kalender-Check-ins.
- Keine frei wählbaren Wochentage.
- Keine Änderung des Plans nach Erstellung.
- Keine Weekly-Streak.
- Kein Archivieren von Habits.
- Keine komplexen Diagramme.
- Keine Habit-Icons.
- Keine User-Zeitzonen.

## API-Entscheidungen

- Basisroute: `/api/habits`.
- Check-ins liegen unter `/api/habits/:habitId/checkins`.
- Stats liegen unter `/api/habits/:habitId/stats`.
- Habit-Liste wird nach `createdAt desc` sortiert.
- Nicht vorhandene und fremde Habits geben immer `404` zurück.

### MVP-Routen

- `GET /api/habits`
- `GET /api/habits/:habitId`
- `POST /api/habits`
- `PATCH /api/habits/:habitId`
- `DELETE /api/habits/:habitId`
- `PUT /api/habits/:habitId/checkins/:date`
- `DELETE /api/habits/:habitId/checkins/:date`
- `GET /api/habits/:habitId/stats`

### Check-in-Route

- `PUT /api/habits/:habitId/checkins/:date` setzt den `count` für ein Datum.
- Daily-Habits erlauben maximal `count = 1`.
- Weekly-Habits erlauben mehrere Check-ins pro Datum.
- `DELETE /api/habits/:habitId/checkins/:date` entfernt den Check-in für ein Datum.
