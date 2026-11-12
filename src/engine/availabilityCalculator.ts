import {Prefs,Iv} from '../types'
import {dowOf} from '../utils/time'
export function freeSlots(d:string,busy:Iv[],p:Prefs,minLen=30):[number,number][]{
  const dw=dowOf(d)
  const all=[...busy,...p.unavailable.filter(u=>!u.days||u.days.includes(dw)).map(u=>({s:u.start,e:u.end,title:'unavailable',id:'u'}))].sort((a,b)=>a.s-b.s)
  const out:[number,number][]=[];let cur=p.start
  for(const b of all){if(b.e<=cur)continue;if(b.s>=p.end)break;if(b.s-cur>=minLen)out.push([cur,b.s]);cur=Math.max(cur,b.e)}
  if(p.end-cur>=minLen)out.push([cur,p.end]);return out
}
