import {Input,Result,Session} from '../types'
import {dayDiff,dowOf,datesBetween,isExam} from '../utils/time'
import {busyFor} from './recurringEvents'
import {freeSlots} from './availabilityCalculator'
import {priority} from './priorityCalculator'
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
