# System architecture
```
UI (pages/, components/)  ->  hooks/useStore (state + actions)  ->  services/ (parsing, OCR, storage, share)
                                                  \-> engine/ (pure TypeScript scheduling)
```
- `src/engine/*` pure functions; imports only `types/` and `utils/time`. Modules: recurringEvents, availabilityCalculator, priorityCalculator, sessionAllocator, conflictDetector, scheduleValidator, rescheduler.
- `src/services`: documentParser (CSV + free-text parser + dispatcher), pdfService (PDF.js), ocrService (Tesseract.js), calendarImportService (ICS), storageService (localStorage, separate keys for demo/user), shareService.
- `src/hooks/useStore.tsx`: React context with state, navigation, generate/mark actions, derived conflicts and validation issues.
- Data flow: file -> extractFromFile -> events (unverified) -> dedupe -> review -> confirmed events -> engine.generate -> sessions -> validate -> calendar.
