# Scheduling algorithm
1. **Fixed commitments** (`busyFor`): fixed events recurring by weekday or on their date; holidays block the whole day.
2. **Free slots** (`freeSlots`): study window minus fixed events, unavailable periods (per weekday) and existing sessions; slots shorter than 30 min dropped.
3. **Priority** (`priority`): deadline 30%, exam 25%, difficulty 20%, understanding gap 15%, manual importance 10%; each normalised 0-100 (urgency = 100 x (1 - min(days,30)/30)).
4. **Demands:** per course a prep demand (estimatedHours, ends the day before the nearest exam, else plan end) and per non-exam task a demand ending on its deadline. Done sessions are subtracted.
5. **Allocation** (`generate`): for each study day inside the plan range, up to the daily target, fill slots with sessions <= session length (+ break). Choose the demand with best score = course priority + need-vs-days-left pressure - 30 x sessions already given to that course today. Last 2 days before an exam are tagged "revision".
6. **Shortage:** leftover demand is returned as `unscheduled`; the UI never claims full coverage when it exists.
7. **Validation** (`validate`): overlaps (fixed events, unavailable, other sessions), range, window, invalid times, daily target, deadlines.
8. **Rescheduling** (`reschedule`): keeps done/missed and past sessions, regenerates from today, returns added/removed lists for preview.
