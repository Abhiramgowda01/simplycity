import {Ev,EType,hm} from './engine'
const DAYS=['sun','mon','tue','wed','thu','fri','sat']
const uid=()=>Math.random().toString(36).slice(2,10)
export interface Imported{events:Ev[];errors:string[]}
// CSV columns: title,day_or_date,start,end[,type]  (day = Mon..Sun => weekly recurring; date = YYYY-MM-DD => one-off)
// Rows with missing/invalid fields are rejected with an error - nothing is guessed.
export function parseCSV(text:string,source:string,defType:EType):Imported{
  const events:Ev[]=[],errors:string[]=[]
  const rows=text.split(/\r?\n/).map(r=>r.trim()).filter(Boolean)
  rows.forEach((r,i)=>{
    const c=r.split(',').map(x=>x.trim());if(i===0&&/title/i.test(c[0]))return
    const[title,dd,st,en,ty]=c
    const okT=(t?:string)=>!!t&&/^\d{1,2}:\d{2}$/.test(t)
    if(!title||!dd||!okT(st)||!okT(en)){errors.push(`Row ${i+1}: incomplete (${r})`);return}
    const di=DAYS.indexOf(dd.slice(0,3).toLowerCase()),isDate=/^\d{4}-\d{2}-\d{2}$/.test(dd)
    if(di<0&&!isDate){errors.push(`Row ${i+1}: bad day/date "${dd}"`);return}
    events.push({id:uid(),title,type:(ty as EType)||defType,source,date:isDate?dd:undefined,dow:isDate?undefined:di,start:hm(st),end:hm(en),recurring:!isDate,fixed:true,verified:false})
  })
  return{events,errors}
}
const icsDate=(v:string)=>{const m=v.match(/(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2}))?/);return m?{date:`${m[1]}-${m[2]}-${m[3]}`,t:m[4]?+m[4]*60+ +m[5]:null}:null}
export function parseICS(text:string,source:string,type:EType):Imported{
  const events:Ev[]=[],errors:string[]=[]
  const blocks=text.replace(/\r?\n[ \t]/g,'').split('BEGIN:VEVENT').slice(1)
  blocks.forEach((b,i)=>{
    const g=(k:string)=>b.match(new RegExp('^'+k+'[^:\\n]*:(.*)$','m'))?.[1]?.trim()
    const title=g('SUMMARY'),ds=g('DTSTART'),de=g('DTEND')
    const s=ds?icsDate(ds):null,e=de?icsDate(de):null
    if(!title||!s){errors.push(`Event ${i+1}: missing summary/start`);return}
    const allDay=s.t===null
    events.push({id:uid(),title,type:allDay&&type==='event'?'holiday':type,source,date:s.date,start:allDay?0:s.t!,end:allDay?1440:(e&&e.t!==null?e.t:s.t!+60),recurring:false,fixed:true,verified:false})
  })
  return{events,errors}
}
// OCR (Tesseract.js) / PDF.js hook point: NOT implemented in this prototype - use CSV/ICS or manual entry.
export const dayName=(i:number)=>DAYS[i][0].toUpperCase()+DAYS[i].slice(1)
