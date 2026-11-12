# Testing
`npm test` (Vitest). `tests/scheduling/engine.test.ts`: free slots (spec example), recurring expansion, holidays, priorities, clash-free generation, range/daily limits, exam cut-off, deadlines, fairness, shortage detection, study days, injected-clash validation, completed-session preservation, new-exam rescheduling. `tests/documents/parser.test.ts`: text/OCR line parsing, date formats, no invention of missing data, all-day events, multi-source merge + duplicates, share round-trip.
Not covered by automated tests: React UI, real Tesseract/PDF.js runs (browser-only), drag-and-drop.
