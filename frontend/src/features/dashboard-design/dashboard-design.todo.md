# Dashboard Design Todo

## MVP-Ziel

Das bestehende Habit-Dashboard soll modern, visuell ansprechend und weiterhin
einfach bedienbar werden. Der Design-Slice verbessert zuerst die vorhandenen
Workflows, ohne neue Produktlogik oder neue Backend-Routen einzuführen.

## Design-Prinzipien

- Die App bleibt ein produktives Dashboard, keine Marketing-Landingpage.
- Der erste Screen zeigt direkt die Habit-Nutzung.
- Informationen sollen schnell scanbar sein: Habits, Status, Fortschritt und Check-ins.
- UI-Elemente dürfen modern wirken, sollen aber ruhig und klar bleiben.
- Das Design wird mobile-first geplant.
- Keine Secrets, keine neue Auth-Logik, keine Backend-Änderungen für diesen Slice.

## Bisherige Design-Entscheidungen

- Visuelle Richtung: Premium Dark.
- Fokus: analytisch, Stats und Fortschritt sind prominent.
- Akzente: Habit-Farbe prägt Detailansicht und wichtige UI-Akzente.
- Check-ins: mittel prominent, schnell erreichbar, aber Stats bleiben visuell wichtiger.
- Layout: Mobile orientiert sich an einem klaren App-Flow mit kompaktem Detailbereich; Desktop kombiniert ein modernes Dashboard-Board mit Sidebar/Detail-Logik.
- Umsetzung: mobile-first, danach Ausbau für größere Viewports.
- Habit-Erstellung: kompakt einklappbar über einen klaren "Neues Habit"-Einstieg.
- Bewegung: sanft moderne Transitions, aktive States und Fortschrittsgefühl ohne starke Animationen.
- Icons: sparsam für Aktionen, Status und Navigation.
- Icon-Library: `lucide-react`.
- Mobile Navigation: Bottom Tabs mit `Heute`, `Habits`, `Erstellen`.
- Desktop Navigation: eigenes Dashboard-Layout ohne Bottom Tabs.
- Startpriorität: Heute zuerst.
- Empty State: motivierend mit klarer nächster Aktion.
- Refactor-Ziel: saubere Komponentenstruktur mit eigenen Frontend-Komponenten-Dateien.

## Offene Produktfragen

- Keine offenen Produktfragen für den aktuellen Mobile-Refactor.

## Mobile Refactor Entscheidungen

- Tab 1 ist das Mobile-Home: Begrüßung plus scrollbare Habit-Library.
- Tab 1 zeigt bei leerer Library einen motivierenden Empty State mit CTA zum Erstellen.
- Der CTA im Empty State wechselt auf Tab 2 und nutzt dieselbe Funktion wie der Erstellen-Tab.
- Habits in Tab 1 sind anklickbar.
- Ein Habit-Tap öffnet eine Mobile-Detailansicht für dieses Habit.
- In der Mobile-Detailansicht liegen Stats, Check-ins und später Bearbeiten/Löschen.
- Wenn der Nutzer erneut Tab 1 wählt, geht es zurück zum Mobile-Home mit Begrüßung und Library.
- Tab 2 ist ein eigener Create-Screen.
- Tab 3 ist ein Profil-Screen.
- Profil nutzt für den aktuellen Stand Clerk-Daten und Clerk-Profilaktionen.
- Eigene App-Profilrouten werden erst benötigt, wenn App-spezifische Profileinstellungen gespeichert werden.
- Mobile Bottom Tabs nutzen nur Icons mit `aria-label`, keine sichtbaren Textlabels.
- Vorgeschlagene Icons: `LayoutDashboard` oder `ListChecks`, `PlusCircle`, `UserCircle`.

## Todo

- [x] Design-Slice als Frontend-Todo anlegen.
- [x] Sokratischen Design-Dialog abschließen.
- [x] Gewählte Designrichtung dokumentieren.
- [x] Layout-Plan für Dashboard, Sidebar, Detailbereich und Check-ins festhalten.
- [x] `lucide-react` als Frontend-Dependency installieren.
- [x] Frontend-Umsetzung planen.
- [x] Bestehende UI in `App.tsx`, `App.css` und `index.css` überarbeiten.
- [x] Neue Komponentenstruktur unter `frontend/src/features/habit-dashboard` anlegen.
- [x] Frontend-Lint ausführen.
- [x] Frontend-Typecheck ausführen.
- [x] Frontend-Build ausführen.
- [x] Kurzer UI-Review auf Lesbarkeit, Responsiveness und Bedienbarkeit.
- [x] Mobile Navigation refactoren: Tabs werden `Übersicht/Habits`, `Erstellen`, `Profil`.
- [x] Mobile Tab 1 klären: Habit-Liste, Detailansicht und Check-ins sinnvoll sortieren.
- [x] Mobile Bottom Tabs ohne sichtbare Textlabels umsetzen; größere Icons mit `aria-label` nutzen.
- [x] Tab 1 als Mobile-Home mit Begrüßung und scrollbarer Habit-Library umsetzen.
- [x] Habit-Tap in Tab 1 öffnet Mobile-Detailansicht.
- [x] Erneutes Drücken auf Tab 1 führt zurück ins Mobile-Home.
- [x] Empty State in Tab 1 mit CTA zu Tab 2 umsetzen.
- [x] Begrüßung des Users nur in Mobile Tab 1 anzeigen.
- [x] Mobile Tab 2 als eigener Create-Bereich gestalten.
- [x] Create-Form auf Displayhöhe optimieren, damit Eingabefelder und Keyboard sauber funktionieren.
- [x] Mobile Farbauswahl platzsparend als Dropdown oder anderes kompaktes Control umsetzen.
- [x] Mobile Tab 3 als Profilbereich prüfen.
- [x] Klären, ob der Profilbereich nur Clerk nutzt oder eigene API-Routen braucht.

## Bewusste Nicht-Ziele Für Diesen Slice

- Keine neuen Backend-Routen.
- Keine Änderung am Habit-Datenmodell.
- Keine neue Statistiklogik.
- Keine komplexen Diagramme.
- Keine Animationen, wenn sie Bedienbarkeit oder Lesbarkeit verschlechtern.
- Keine komplette Component-Library einführen.

## Review-Fixes

- [x] Deutsche UI-Texte mit Umlauten schreiben, z. B. `Löschen`.
- [x] Mobile Breakpoint überarbeitet: Desktop-Dashboard startet erst ab 1120px.
- [x] Mobile Stats bleiben einspaltig und werden nicht zusammengequetscht.
- [x] Create-Panel-State für Mobile und Desktop getrennt.
- [x] Native Selects durch kompakte App-Menüs ersetzt.
- [x] Farbauswahl zeigt auswählbare Farbpunkte statt Farbnamen.
- [x] Detail-, Create- und Profil-Tab nutzen die verfügbare Mobile-Höhe besser aus.
- [x] Profil-Tab hat klare Aktionen für Konto verwalten und Abmelden.
- [x] Signed-out Mobile-Ansicht nutzt den gesamten Bildschirm besser aus.
- [x] Signed-out Hero überarbeitet: große zentrierte Headline, Kontexttext, Login-Button.
- [x] Signed-out Statistik-Karten entfernt.
- [x] Diagonales App-Preview-Mockup als visueller Teaser ergänzt.
- [x] Signed-out Hero vertikal angeordnet: CTA oben, Preview in der unteren Bildschirmhälfte.
- [x] Clerk Sign-in nicht mehr als kleines Modal, sondern als eingebettete Fullscreen-Ansicht anzeigen.
- [x] Clerk Sign-in für iPad/Tablet vergrößert: Formular, Main-Bereich und Footer nutzen die verfügbare Breite und Höhe besser.
- [x] Clerk Sign-in auf Mobile als gleichmäßiges responsives Login-Fenster zentrieren.
- [x] Clerk Login-Flow mit Loading-State, Redirects und Dashboard-Fehleransicht absichern.
- [x] Dauerhafte Standard-Statuszeile wie `Habits geladen` aus Mobile und Desktop entfernen.
- [x] Fehlerhaften ClerkJS-Version-Pin wieder entfernen; Clerk lädt die passende Browser-Script-Version selbst.
- [x] Clerk Sign-in von Hash-Routing auf Virtual-Routing umstellen und Logout mit Redirect zur App-Startseite absichern.
