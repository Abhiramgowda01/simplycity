import {Ev} from '../types'
import {dowOf,overlap,normEnd} from '../utils/time'
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
