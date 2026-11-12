# SmartStudy – Intelligent Academic Scheduling (prototype)
Merges timetable, event calendar, CIE and SIE schedules with courses/deadlines and generates a clash-free, priority-weighted study plan inside a chosen date range. React + TypeScript + Vite, localStorage persistence, deterministic engine (no AI API).

## Run
```
npm install
npm run dev        # open the URL, click "Load demo data"
npm test           # engine + parser tests
npm run build
```
## Structure
`src/engine` (scheduling, pure TS) · `src/services` (CSV/ICS/PDF/OCR, storage, share) · `src/pages` (13 pages) · `src/components` · `src/hooks/useStore.tsx` · `src/types` · `tests/` · `docs/` (10 documents).

## Features
Multi-document import incl. PDF.js + Tesseract.js OCR · review/edit/confirm · duplicate + conflict detection · study setup (dates, window, targets, unavailable time) · courses + tasks · priority scoring (30/25/20/15/10) · shortage report · validator · rescheduling with preview · screenshot-style planner (sidebar, day/week/month grid, task panel, drag to move, custom events) · dashboard · progress · demo mode · dark mode · schedule sharing.

## Limitations
OCR accuracy depends on scan quality and needs internet on first use (language data). Free-text parsing expects a weekday/date and a time range on each line. No XLSX, backend, accounts, notifications; overnight events are clipped at midnight; no mock-test sessions (last-2-day revision only); UI is not covered by automated tests. See docs/TESTING.md.
