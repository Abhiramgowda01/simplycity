import {Course,Task} from '../types'
import {dayDiff,isExam} from '../utils/time'
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
