import {describe,it,expect} from 'vitest'
import {freeSlots,generate,validate,reschedule,dedupe,detectConflicts,priority,busyFor,hm,datesBetween,Ev,Prefs,Course,Task,Session} from '../src/engine'
import {parseCSV} from '../src/importers'
import {demoEvents,demoCourses,demoTasks,defaultPrefs,TODAY} from '../src/demo'
const P:Prefs={...defaultPrefs,unavailable:[]}
const ev=(o:Partial<Ev>):Ev=>({id:Math.random()+'',title:'x',type:'class',source:'s',start:hm('09:00'),end:hm('10:00'),recurring:false,fixed:true,verified:true,...o})
const inp={events:demoEvents,courses:demoCourses,tasks:demoTasks,prefs:defaultPrefs,today:TODAY}
describe('availability',()=>{
  it('computes free slots around commitments (spec example)',()=>{
    const p={...P,start:hm('17:00'),end:hm('22:00'),unavailable:[{start:hm('20:00'),end:hm('20:30')}]}
    expect(freeSlots('2026-11-16',[{s:hm('18:00'),e:hm('19:00'),title:'c',id:'1'}],p)).toEqual([[1020,1080],[1140,1200],[1230,1320]])})
  it('expands recurring events only on matching weekdays',()=>{expect(busyFor(demoEvents,'2026-11-16').length).toBeGreaterThan(0);expect(busyFor(demoEvents,'2026-11-15').length).toBe(0)})
  it('handles all-day holidays',()=>{expect(freeSlots('2026-11-27',busyFor(demoEvents,'2026-11-27'),P)).toEqual([])})
})
describe('import & conflicts',()=>{
  it('rejects incomplete rows without inventing data',()=>{const r=parseCSV('title,day,start,end\nDSA,Mon,09:00,10:00\nBad,Tue,,',"f.csv",'class');expect(r.events.length).toBe(1);expect(r.errors.length).toBe(1)})
  it('detects duplicates',()=>{const a=ev({title:'DSA',date:'2026-11-23'});expect(dedupe([a,{...a,id:'z',source:'other'}]).dropped.length).toBe(1)})
  it('flags conflicting fixed events',()=>{expect(detectConflicts([ev({date:'2026-11-20',start:600,end:780}),ev({date:'2026-11-20',start:660,end:720,title:'y'})]).length).toBe(1)})
  it('flags dated event overlapping recurring class (demo workshop on Friday)',()=>{expect(detectConflicts(demoEvents).length).toBeGreaterThan(0)})
})
describe('priority',()=>{
  const c=(o:Partial<Course>):Course=>({id:'a',name:'a',code:'a',difficulty:2,understanding:2,importance:3,estimatedHours:5,...o})
  it('harder/weaker subject scores higher',()=>{expect(priority(c({difficulty:3,understanding:1}),[],TODAY).score).toBeGreaterThan(priority(c({difficulty:1,understanding:3}),[],TODAY).score)})
  it('nearer deadline scores higher',()=>{const t=(d:string):Task=>({id:'t',title:'t',courseId:'a',type:'assignment',deadline:d,estimatedHours:1,status:'pending'});expect(priority(c({}),[t('2026-11-15')],TODAY).score).toBeGreaterThan(priority(c({}),[t('2026-12-10')],TODAY).score)})
})
describe('scheduler',()=>{
  const r=generate({...inp,locked:[]})
  it('generates sessions and validates clash-free',()=>{expect(r.sessions.length).toBeGreaterThan(10);expect(validate(r.sessions,demoEvents,demoTasks,defaultPrefs)).toEqual([])})
  it('stays within planning range and daily limit',()=>{const ds=datesBetween(defaultPrefs.startDate,defaultPrefs.endDate);for(const s of r.sessions)expect(ds).toContain(s.date);const by:Record<string,number>={};r.sessions.forEach(s=>by[s.date]=(by[s.date]||0)+s.end-s.start);Object.values(by).forEach(v=>expect(v).toBeLessThanOrEqual(180))})
  it('never schedules prep on/after the exam date',()=>{for(const s of r.sessions.filter(s=>s.courseId==='dsa'&&!s.taskId))expect(s.date<'2026-11-23').toBe(true)})
  it('never overlaps exam hours or classes',()=>{for(const s of r.sessions)for(const b of busyFor(demoEvents,s.date))expect(s.start<b.e&&b.s<s.end).toBe(false)})
  it('assignments are done before deadline',()=>{for(const s of r.sessions.filter(s=>s.taskId==='t8'))expect(s.date<='2026-11-18').toBe(true)})
  it('spreads time across subjects',()=>{expect(new Set(r.sessions.map(s=>s.courseId)).size).toBe(5)})
  it('detects insufficient availability honestly',()=>{const x=generate({...inp,prefs:{...defaultPrefs,dailyTarget:0.5},locked:[]});expect(x.unscheduled.length).toBeGreaterThan(0);expect(x.requiredMin).toBeGreaterThan(x.scheduledMin)})
  it('respects non-study days & window',()=>{const x=generate({...inp,prefs:{...defaultPrefs,studyDays:[6]},locked:[]});x.sessions.forEach(s=>expect(new Date(s.date+'T00:00:00Z').getUTCDay()).toBe(6))})
})
describe('validation & rescheduling',()=>{
  const r=generate({...inp,locked:[]})
  it('catches injected clash',()=>{const bad:Session={...r.sessions[0],id:'bad',start:r.sessions[0].start+10};expect(validate([...r.sessions,bad],demoEvents,demoTasks,defaultPrefs).length).toBeGreaterThan(0)})
  it('preserves completed sessions and re-plans missed ones',()=>{
    const first=r.sessions[0],second=r.sessions[1]
    const ex:Session[]=r.sessions.map(s=>s.id===first.id?{...s,status:'done'}:s.id===second.id?{...s,status:'missed'}:s)
    const re=reschedule({...inp,today:first.date<=TODAY?TODAY:first.date,prefs:defaultPrefs},ex)
    expect(re.sessions.find(s=>s.id===first.id)?.status).toBe('done')
    expect(validate(re.sessions,demoEvents,demoTasks,defaultPrefs)).toEqual([])
  })
  it('reacts to a newly added exam',()=>{
    const newTask:Task={id:'n',title:'New',courseId:'net',type:'cie',deadline:'2026-11-17',estimatedHours:0,status:'pending'}
    const re=reschedule({...inp,tasks:[...demoTasks,newTask]},r.sessions);expect(re.added.length+re.removed.length).toBeGreaterThan(0)
    for(const s of re.sessions.filter(s=>s.courseId==='net'&&s.status==='planned'&&!s.taskId))expect(s.date<'2026-11-17').toBe(true)})
})
