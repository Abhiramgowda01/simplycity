import {Ev,Task,Prefs,Session} from '../types'
import {dowOf,isExam,overlap} from '../utils/time'
import {busyFor} from './recurringEvents'
// ---- validation: returns [] when clash-free
export function validate(sessions:Session[],events:Ev[],tasks:Task[],prefs:Prefs):string[]{
  const errs:string[]=[];const act=sessions.filter(s=>s.status!=='missed')
  const byDay:Record<string,Session[]>={}
  for(const s of act){
    (byDay[s.date]??=[]).push(s)
    if(s.date<prefs.startDate||s.date>prefs.endDate)errs.push(`${s.id}: outside planning range`)
    if(s.end<=s.start)errs.push(`${s.id}: invalid time range`)
    if(s.start<prefs.start||s.end>prefs.end)errs.push(`${s.id}: outside preferred study window`)
    for(const b of busyFor(events,s.date))if(overlap({s:s.start,e:s.end},b))errs.push(`${s.id}: overlaps "${b.title}"`)
    for(const u of prefs.unavailable)if((!u.days||u.days.includes(dowOf(s.date)))&&overlap({s:s.start,e:s.end},{s:u.start,e:u.end}))errs.push(`${s.id}: overlaps unavailable period`)
    const t=tasks.find(t=>t.id===s.taskId);if(t&&s.date>t.deadline)errs.push(`${s.id}: after deadline of "${t.title}"`)
    for(const t of tasks)if(isExam(t.type)&&t.courseId===s.courseId&&s.date>=t.deadline&&t.status!=='done'&&s.kind==='revision')errs.push(`${s.id}: revision on/after exam`)
  }
  for(const[d,l]of Object.entries(byDay)){
    l.sort((a,b)=>a.start-b.start)
    for(let k=1;k<l.length;k++)if(l[k].start<l[k-1].end)errs.push(`${l[k].id}: overlaps another study session`)
    if(l.reduce((a,s)=>a+s.end-s.start,0)>prefs.dailyTarget*60)errs.push(`${d}: exceeds daily target`)
  }
  return errs
}
