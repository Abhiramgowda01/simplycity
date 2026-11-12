import {Input,Session} from '../types'
import {generate} from './sessionAllocator'
// ---- dynamic rescheduling: keep done/missed/past sessions, regenerate the rest from `today`
export function reschedule(i:Omit<Input,'locked'>,existing:Session[]){
  const locked=existing.filter(s=>s.status!=='planned'||s.date<i.today)
  const prev=existing.filter(s=>!locked.includes(s))
  const r=generate({...i,locked,from:i.today})
  const same=(a:Session,b:Session)=>a.date===b.date&&a.start===b.start&&a.end===b.end&&a.courseId===b.courseId&&a.taskId===b.taskId
  return{...r,sessions:[...locked,...r.sessions],added:r.sessions.filter(n=>!prev.some(p=>same(p,n))),removed:prev.filter(p=>!r.sessions.some(n=>same(p,n)))}
}
