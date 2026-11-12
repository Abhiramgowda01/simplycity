import {describe,it,expect} from 'vitest'
import {extractTimetableMatrix} from '../../src/services/timetableExtractor'
import {MITE_TIMETABLE_EVENTS, MITE_COURSES, MITE_CIE_EVENTS} from '../../src/data/miteTimetable'

describe('MITE Timetable Extraction & Matrix Analysis',()=>{
  it('correctly identifies MITE Department of CSE Odd Sem 2026-27 document',()=>{
    const result = extractTimetableMatrix('MANGALORE INSTITUTE OF TECHNOLOGY & ENGINEERING Department of CSE 23CSPC302', 'test_mite.jpeg')
    expect(result.isGridDetected).toBe(true)
    expect(result.instituteName).toContain('Mangalore Institute of Technology')
    expect(result.events.length).toBeGreaterThan(15)
    expect(result.courses.length).toBeGreaterThan(5)
  })

  it('correctly extracts merged laboratory sessions spanning multiple periods',()=>{
    const monLab = MITE_TIMETABLE_EVENTS.find(e => e.dow === 1 && e.type === 'lab')
    expect(monLab).toBeDefined()
    // 09:00 (540m) to 12:05 (725m) = 185 minutes spanning 3 periods
    expect(monLab?.start).toBe(540)
    expect(monLab?.end).toBe(725)

    const thuLab = MITE_TIMETABLE_EVENTS.find(e => e.dow === 4 && e.type === 'lab')
    expect(thuLab).toBeDefined()
    // 13:45 (825m) to 16:30 (990m) = 165 minutes spanning 3 afternoon periods
    expect(thuLab?.start).toBe(825)
    expect(thuLab?.end).toBe(990)
  })

  it('correctly extracts tea break and lunch break periods',()=>{
    const result = extractTimetableMatrix('MITE CSE Timetable', 'mite.png')
    expect(result.breaks.length).toBe(2)
    expect(result.breaks[0].label).toBe('Tea Break')
    expect(result.breaks[1].label).toBe('Lunch Break')
  })

  it('cross-references course codes to full titles and faculty',()=>{
    const dbms = MITE_COURSES.find(c => c.code === '23CSPC303')
    expect(dbms).toBeDefined()
    expect(dbms?.name).toBe('Database Management Systems')

    const flat = MITE_COURSES.find(c => c.code === '23CSPC302')
    expect(flat).toBeDefined()
    expect(flat?.name).toBe('Formal Language & Automata Theory')

    const fsd = MITE_COURSES.find(c => c.code === '23CSPE311')
    expect(fsd).toBeDefined()
    expect(fsd?.name).toBe('Full-Stack Development')
  })

  it('provides structured CIE exam timetable with exact dates and timings',()=>{
    expect(MITE_CIE_EVENTS.length).toBe(5)
    expect(MITE_CIE_EVENTS[0].date).toBe('2026-11-23')
    expect(MITE_CIE_EVENTS[0].type).toBe('cie')
    expect(MITE_CIE_EVENTS[0].start).toBe(570) // 09:30
    expect(MITE_CIE_EVENTS[0].end).toBe(660)   // 11:00
  })
})
