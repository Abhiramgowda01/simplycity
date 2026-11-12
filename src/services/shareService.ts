import {Ev} from '../types'
// Class-representative feature: export confirmed fixed events as JSON so classmates can import the same schedule.
export const exportSchedule=(events:Ev[])=>JSON.stringify({smartstudy:1,events:events.filter(e=>e.fixed)},null,1)
export function importSchedule(text:string):Ev[]{const j=JSON.parse(text);if(j?.smartstudy!==1||!Array.isArray(j.events))throw new Error('Not a SmartStudy schedule file');return j.events.map((e:Ev)=>({...e,id:Math.random().toString(36).slice(2,10),source:'shared:'+e.source,verified:false}))}
