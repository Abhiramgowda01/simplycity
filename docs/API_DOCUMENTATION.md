# API
There is no backend. Local service functions:
`extractFromFile(file, category)`, `parseCSV`, `parseTextLines`, `parseICS`, `pdfToText`, `ocrImage`, `loadState/saveState/clearState`, `exportSchedule/importSchedule`.
Engine: `generate(input)`, `reschedule(input, sessions)`, `validate(sessions, events, tasks, prefs)`, `freeSlots`, `busyFor`, `priority`, `detectConflicts`, `dedupe`.
