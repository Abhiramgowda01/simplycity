// Deterministic scheduling engine. Times = minutes since midnight; dates = 'YYYY-MM-DD' (UTC math, so DST-safe).
export type EType='class'|'lab'|'event'|'holiday'|'cie'|'sie'|'personal'
export interface Ev{id:string;title:string;code?:string;type:EType;source:string;date?:string;dow?:number;start:number;end:number;recurring:boolean;fixed:boolean;verified:boolean}
export interface Course{id:string;name:string;code:string;difficulty:1|2|3;understanding:1|2|3;importance:1|2|3|4|5;estimatedHours:number}
export type TType='assignment'|'quiz'|'project'|'cie'|'sie'|'other'
export interface Task{id:string;title:string;courseId:string;type:TType;deadline:string;estimatedHours:number;status:'pending'|'done'}
export interface Prefs{startDate:string;endDate:string;start:number;end:number;dailyTarget:number;session:number;breakMin:number;studyDays:number[];unavailable:{start:number;end:number;days?:number[]}[]}
export interface Session{id:string;courseId:string;taskId?:string;date:string;start:number;end:number;status:'planned'|'done'|'missed';kind:'study'|'revision'}
export interface Iv{s:number;e:number;title:string;id:string}
export interface Input{events:Ev[];courses:Course[];tasks:Task[];prefs:Prefs;locked:Session[];today:string;from?:string}
export interface Result{sessions:Session[];unscheduled:{key:string;courseId:string;minutes:number}[];requiredMin:number;scheduledMin:number}

export const hm=(s:string)=>{const[a,b]=s.split(':').map(Number);return a*60+(b||0)}
export const fmt=(m:number)=>`${String(Math.floor(m/60)).padStart(2,'0')}:${String(m%60).padStart(2,'0')}`
export const dowOf=(d:string)=>new Date(d+'T00:00:00Z').getUTCDay()
export const dayDiff=(a:string,b:string)=>Math.round((Date.parse(b)-Date.parse(a))/864e5)
export function datesBetween(a:string,b:string){const o:string[]=[];for(let t=Date.parse(a);t<=Date.parse(b);t+=864e5)o.push(new Date(t).toISOString().slice(0,10));return o}
export const isExam=(t:string)=>t==='cie'||t==='sie'
const overlap=(a:{s:number;e:number},b:{s:number;e:number})=>a.s<b.e&&b.s<a.e
const normEnd=(e:Ev)=>e.end<=e.start?1440:e.end // overnight events are clipped at midnight (documented limitation)

export const occursOn=(e:Ev,d:string)=>e.recurring?e.dow===dowOf(d):e.date===d
export function busyFor(events:Ev[],d:string):Iv[]{
  return events.filter(e=>e.fixed&&occursOn(e,d)).map(e=>e.type==='holiday'?{s:0,e:1440,title:e.title,id:e.id}:{s:e.start,e:normEnd(e),title:e.title,id:e.id})
}
export function freeSlots(d:string,busy:Iv[],p:Prefs,minLen=30):[number,number][]{
  const dw=dowOf(d)
  const all=[...busy,...p.unavailable.filter(u=>!u.days||u.days.includes(dw)).map(u=>({s:u.start,e:u.end,title:'unavailable',id:'u'}))].sort((a,b)=>a.s-b.s)
  const out:[number,number][]=[];let cur=p.start
  for(const b of all){if(b.e<=cur)continue;if(b.s>=p.end)break;if(b.s-cur>=minLen)out.push([cur,b.s]);cur=Math.max(cur,b.e)}
  if(p.end-cur>=minLen)out.push([cur,p.end]);return out
}
// ---- duplicates & conflicts
const sig=(e:Ev)=>[e.title.trim().toLowerCase(),e.type,e.recurring?'d'+e.dow:e.date,e.start,e.end].join('|')
export function dedupe(events:Ev[]){const seen=new Set<string>();const kept:Ev[]=[],dropped:Ev[]=[];for(const e of events){const k=sig(e);if(seen.has(k))dropped.push(e);else{seen.add(k);kept.push(e)}}return{kept,dropped}}
export function detectConflicts(events:Ev[]):[Ev,Ev][]{
  const f=events.filter(e=>e.fixed),out:[Ev,Ev][]=[]
  for(let i=0;i<f.length;i++)for(let j=i+1;j<f.length;j++){
    const a=f[i],b=f[j];let same=false
    if(a.recurring&&b.recurring)same=a.dow===b.dow
    else if(a.recurring)same=dowOf(b.date!)===a.dow
    else if(b.recurring)same=dowOf(a.date!)===b.dow
    else same=a.date===b.date
    const ia=a.type==='holiday'?{s:0,e:1440}:{s:a.start,e:normEnd(a)},ib=b.type==='holiday'?{s:0,e:1440}:{s:b.start,e:normEnd(b)}
    if(same&&overlap(ia,ib)&&sig(a)!==sig(b))out.push([a,b])
  }
  return out
}
// ---- priority (weights per spec, each factor normalised 0-100)
export const WEIGHTS={deadline:.30,exam:.25,difficulty:.20,gap:.15,manual:.10}
export function priority(c:Course,tasks:Task[],today:string,w=WEIGHTS){
  const urg=(ds:number[])=>ds.length?100*(1-Math.min(Math.min(...ds),30)/30):0
  const mine=tasks.filter(t=>t.courseId===c.id&&t.status!=='done'&&dayDiff(today,t.deadline)>=0)
  const deadline=urg(mine.filter(t=>!isExam(t.type)).map(t=>dayDiff(today,t.deadline)))
  const exam=urg(mine.filter(t=>isExam(t.type)).map(t=>dayDiff(today,t.deadline)))
  const difficulty=(c.difficulty-1)*50,gap=(3-c.understanding)*50,manual=(c.importance-1)*25
  const score=deadline*w.deadline+exam*w.exam+difficulty*w.difficulty+gap*w.gap+manual*w.manual
  return{score,deadline,exam,difficulty,gap,manual}
}
// ---- allocation
interface Demand{key:string;courseId:string;taskId?:string;rem:number;deadline:string;exclusive:boolean}
export function buildDemands(i:Input):Demand[]{
  const{courses,tasks,prefs,today,locked}=i;const ds:Demand[]=[]
  const doneMin=(key:string)=>locked.filter(s=>s.status==='done'&&(s.taskId??'c:'+s.courseId)===key).reduce((a,s)=>a+s.end-s.start,0)
  for(const c of courses){
    const exams=tasks.filter(t=>t.courseId===c.id&&isExam(t.type)&&t.status!=='done'&&t.deadline>=today).map(t=>t.deadline).sort()
    const key='c:'+c.id
    ds.push({key,courseId:c.id,rem:Math.max(0,c.estimatedHours*60-doneMin(key)),deadline:exams[0]??prefs.endDate,exclusive:!!exams[0]})
  }
  for(const t of tasks)if(!isExam(t.type)&&t.status!=='done')ds.push({key:t.id,courseId:t.courseId,taskId:t.id,rem:Math.max(0,t.estimatedHours*60-doneMin(t.id)),deadline:t.deadline,exclusive:false})
  return ds
}
export function generate(i:Input):Result{
  const{events,courses,tasks,prefs,locked,today}=i
  const from=i.from&&i.from>prefs.startDate?i.from:prefs.startDate
  const demands=buildDemands(i);const requiredMin=demands.reduce((a,d)=>a+d.rem,0)
  const pr=new Map(courses.map(c=>[c.id,priority(c,tasks,today).score]))
  const sessions:Session[]=[];const tgt=prefs.dailyTarget*60
  for(const d of datesBetween(from,prefs.endDate)){
    if(!prefs.studyDays.includes(dowOf(d)))continue
    const occ=locked.filter(s=>s.date===d&&s.status!=='missed')
    const busy=[...busyFor(events,d),...occ.map(s=>({s:s.start,e:s.end,title:'session',id:s.id}))]
    let cap=tgt-locked.filter(s=>s.date===d&&s.status==='done').reduce((a,s)=>a+s.end-s.start,0)
    const cnt:Record<string,number>={}
    for(const[s0,e]of freeSlots(d,busy,prefs)){
      let cur=s0
      while(cap>=30&&e-cur>=30){
        const cands=demands.filter(x=>x.rem>0&&(x.exclusive?d<x.deadline:d<=x.deadline))
        if(!cands.length)break
        const score=(x:Demand)=>{const left=Math.max(1,dayDiff(d,x.deadline)+(x.exclusive?0:1));return(pr.get(x.courseId)??0)+40*Math.min(1,x.rem/(left*tgt*.5))-30*(cnt[x.courseId]||0)}
        const best=cands.reduce((a,b)=>score(b)>score(a)?b:a)
        let len=Math.min(prefs.session,e-cur,cap)
        if(best.rem<len)len=Math.min(e-cur,cap,Math.max(30,Math.ceil(best.rem/15)*15))
        if(len<30)break
        sessions.push({id:`${d}-${cur}-${best.key}`,courseId:best.courseId,taskId:best.taskId,date:d,start:cur,end:cur+len,status:'planned',kind:best.exclusive&&dayDiff(d,best.deadline)<=2?'revision':'study'})
        best.rem-=len;cap-=len;cnt[best.courseId]=(cnt[best.courseId]||0)+1;cur+=len+prefs.breakMin
      }
    }
  }
  const unscheduled=demands.filter(x=>x.rem>0).map(x=>({key:x.key,courseId:x.courseId,minutes:x.rem}))
  return{sessions,unscheduled,requiredMin,scheduledMin:sessions.reduce((a,s)=>a+s.end-s.start,0)}
}
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
// ---- dynamic rescheduling: keep done/missed/past sessions, regenerate the rest from `today`
export function reschedule(i:Omit<Input,'locked'>,existing:Session[]){
  const locked=existing.filter(s=>s.status!=='planned'||s.date<i.today)
  const prev=existing.filter(s=>!locked.includes(s))
  const r=generate({...i,locked,from:i.today})
  const same=(a:Session,b:Session)=>a.date===b.date&&a.start===b.start&&a.end===b.end&&a.courseId===b.courseId&&a.taskId===b.taskId
  return{...r,sessions:[...locked,...r.sessions],added:r.sessions.filter(n=>!prev.some(p=>same(p,n))),removed:prev.filter(p=>!r.sessions.some(n=>same(p,n)))}
}
