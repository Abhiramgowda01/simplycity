# Data model (`src/types`)
- **Ev** (AcademicEvent): id, title, type (class|lab|event|holiday|cie|sie|personal), source (file name = provenance), date or dow, start/end (minutes), recurring, fixed (blocks study), verified, confidence (OCR).
- **Course**: id, name, code, difficulty 1-3, understanding 1-3, importance 1-5, estimatedHours, color.
- **Task**: id, title, courseId, type, deadline, estimatedHours, status. Exam tasks (cie/sie) have no separate hours; the course's prep hours cover them.
- **Prefs**: startDate, endDate, start, end, dailyTarget (h), session, breakMin, studyDays, unavailable[{start,end,days?,label?}].
- **Session**: id, courseId, taskId?, date, start, end, status (planned|done|missed), kind (study|revision).
- **Profile**, **AcademicSource** (type only; sources are currently tracked via Ev.source).
Validation: CSV/text rows need title + day/date + valid time range; sessions validated by `scheduleValidator`.
