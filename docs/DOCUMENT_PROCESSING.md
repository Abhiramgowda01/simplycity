# Document processing
Formats: CSV, ICS, PDF, JPG, PNG (max 15 MB; others rejected; XLSX gives a message to export CSV).
- CSV `title,day_or_date,start,end[,type]`; ICS VEVENT (all-day -> holiday in event calendars).
- PDF: PDF.js text layer, lines rebuilt by y/x position. No text layer -> pages rendered to canvas -> Tesseract.js.
- Images: Tesseract.js (needs internet on first use to fetch language data).
- Text parsing (`parseTextLines`): a line needs a weekday or a date (ISO, DD/MM/YYYY, "10 Dec 2026", "December 10, 2026") plus a time range (24h or am/pm). Missing time/title lines are reported as errors for manual entry - nothing is guessed. Results are unverified and carry OCR confidence; confidence <70% is highlighted.
Real OCR accuracy depends on the scan; always verify on the Review screen.
