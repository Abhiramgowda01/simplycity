import {describe,it,expect} from 'vitest'
import {parseTextLines,parseCSV} from '../../src/services/documentParser'
import {parseICS} from '../../src/services/calendarImportService'
import {exportSchedule,importSchedule} from '../../src/services/shareService'
import {dedupe} from '../../src/engine'
describe('OCR/PDF text -> events',()=>{
  it('parses a weekly timetable line',()=>{const r=parseTextLines('Monday 9:00 - 10:00 DSA Lecture','t.pdf','class');expect(r.events[0]).toMatchObject({dow:1,start:540,end:600,title:'DSA Lecture',recurring:true,verified:false})})
  it('parses dated exam lines in several date formats',()=>{
    const r=parseTextLines('23/11/2026  DSA CIE-2  09:00-12:00\nDecember 10, 2026 Mathematics SIE 2:00 pm - 5:00 pm','e.pdf','cie',80)
    expect(r.events.map(e=>e.date)).toEqual(['2026-11-23','2026-12-10']);expect(r.events[1].start).toBe(840);expect(r.events[0].confidence).toBe(80)})
  it('never invents missing times',()=>{const r=parseTextLines('Tuesday Physics Lecture','t.pdf','class');expect(r.events.length).toBe(0);expect(r.errors.length).toBe(1)})
  it('treats a dated line without time as all-day in an event calendar',()=>{const r=parseTextLines('2026-11-27 Diwali Holiday','c.pdf','event');expect(r.events[0]).toMatchObject({type:'holiday',start:0,end:1440})})
  it('ignores header/noise lines',()=>{expect(parseTextLines('Department of CSE\nTime Table','t','class').events.length).toBe(0)})
})
describe('multi-source import',()=>{
  it('merges CSV + ICS + text and drops duplicates',()=>{
    const a=parseCSV('title,d,s,e\nDSA CIE,2026-11-23,09:00,12:00','a.csv','cie').events
    const b=parseICS('BEGIN:VEVENT\nSUMMARY:DSA CIE\nDTSTART:20261123T090000\nDTEND:20261123T120000\nEND:VEVENT','b.ics','cie').events
    const c=parseTextLines('23/11/2026 DSA CIE 09:00-12:00','c.pdf','cie').events
    expect(dedupe([...a,...b,...c]).kept.length).toBe(1)})
  it('ICS all-day event becomes a holiday',()=>{expect(parseICS('BEGIN:VEVENT\nSUMMARY:Break\nDTSTART;VALUE=DATE:20261127\nEND:VEVENT','x.ics','event').events[0].type).toBe('holiday')})
  it('shared schedule round-trips and rejects bad files',()=>{const ev=parseCSV('title,d,s,e\nX,Mon,09:00,10:00','a','class').events;expect(importSchedule(exportSchedule(ev)).length).toBe(1);expect(()=>importSchedule('{}')).toThrow()})
})
