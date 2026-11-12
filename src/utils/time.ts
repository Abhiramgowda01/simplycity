import {Ev} from '../types'
// Times = minutes since midnight; dates = 'YYYY-MM-DD'. All date math is UTC so DST cannot shift results.
export const hm=(s:string)=>{const[a,b]=s.split(':').map(Number);return a*60+(b||0)}
export const fmt=(m:number)=>`${String(Math.floor(m/60)).padStart(2,'0')}:${String(m%60).padStart(2,'0')}`
export const dowOf=(d:string)=>new Date(d+'T00:00:00Z').getUTCDay()
export const dayDiff=(a:string,b:string)=>Math.round((Date.parse(b)-Date.parse(a))/864e5)
export const addDays=(d:string,n:number)=>new Date(Date.parse(d)+n*864e5).toISOString().slice(0,10)
export function datesBetween(a:string,b:string){const o:string[]=[];for(let t=Date.parse(a);t<=Date.parse(b);t+=864e5)o.push(new Date(t).toISOString().slice(0,10));return o}
export const isExam=(t:string)=>t==='cie'||t==='sie'
export const overlap=(a:{s:number;e:number},b:{s:number;e:number})=>a.s<b.e&&b.s<a.e
export const normEnd=(e:Ev)=>e.end<=e.start?1440:e.end // overnight events are clipped at midnight (documented limitation)
