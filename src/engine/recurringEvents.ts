import {Ev,Iv} from '../types'
import {dowOf,normEnd} from '../utils/time'
export const occursOn=(e:Ev,d:string)=>e.recurring?e.dow===dowOf(d):e.date===d
export function busyFor(events:Ev[],d:string):Iv[]{
  return events.filter(e=>e.fixed&&occursOn(e,d)).map(e=>e.type==='holiday'?{s:0,e:1440,title:e.title,id:e.id}:{s:e.start,e:normEnd(e),title:e.title,id:e.id})
}
