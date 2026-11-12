import {Ev,EType} from '../types'
const uid=()=>Math.random().toString(36).slice(2,10)
const icsDate=(v:string)=>{const m=v.match(/(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2}))?/);return m?{date:`${m[1]}-${m[2]}-${m[3]}`,t:m[4]?+m[4]*60+ +m[5]:null}:null}
export function parseICS(text:string,source:string,type:EType){
  const events:Ev[]=[],errors:string[]=[]
  text.replace(/\r?\n[ \t]/g,'').split('BEGIN:VEVENT').slice(1).forEach((b,i)=>{
    const g=(k:string)=>b.match(new RegExp('^'+k+'[^:\\n]*:(.*)$','m'))?.[1]?.trim()
    const title=g('SUMMARY'),ds=g('DTSTART'),de=g('DTEND');const s=ds?icsDate(ds):null,e=de?icsDate(de):null
    if(!title||!s){errors.push(`Event ${i+1}: missing summary/start`);return}
    const allDay=s.t===null
    events.push({id:uid(),title,type:allDay&&type==='event'?'holiday':type,source,date:s.date,start:allDay?0:s.t!,end:allDay?1440:(e&&e.t!==null?e.t:s.t!+60),recurring:false,fixed:true,verified:false})
  })
  return{events,errors}
}
