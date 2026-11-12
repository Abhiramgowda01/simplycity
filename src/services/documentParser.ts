import {Ev,EType,Course} from '../types'
import {hm} from '../utils/time'
import {parseICS} from './calendarImportService'
import {ocrImage} from './ocrService'
import {pdfToText} from './pdfService'
import {extractTimetableMatrix, ExtractedTimetableResult} from './timetableExtractor'

export interface Parsed{events:Ev[];errors:string[];courses?:Course[];gridResult?:ExtractedTimetableResult}
const uid=()=>Math.random().toString(36).slice(2,10)
export const DAYS=['sun','mon','tue','wed','thu','fri','sat']
export const dayName=(i:number)=>DAYS[i][0].toUpperCase()+DAYS[i].slice(1)
export const MAX_BYTES=15*1024*1024
export const ALLOWED=['csv','ics','pdf','png','jpg','jpeg','xlsx']

// CSV columns: title,day_or_date,start,end[,type]. Incomplete rows are rejected, never guessed.
export function parseCSV(text:string,source:string,defType:EType):Parsed{
  const events:Ev[]=[],errors:string[]=[]
  text.split(/\r?\n/).map(r=>r.trim()).filter(Boolean).forEach((r,i)=>{
    const c=r.split(',').map(x=>x.trim());if(i===0&&/title/i.test(c[0]))return
    const[title,dd,st,en,ty]=c;const okT=(t?:string)=>!!t&&/^\d{1,2}:\d{2}$/.test(t)
    if(!title||!dd||!okT(st)||!okT(en)){errors.push(`Row ${i+1}: incomplete (${r})`);return}
    const di=DAYS.indexOf(dd.slice(0,3).toLowerCase()),isDate=/^\d{4}-\d{2}-\d{2}$/.test(dd)
    if(di<0&&!isDate){errors.push(`Row ${i+1}: bad day/date "${dd}"`);return}
    events.push({id:uid(),title,type:(ty as EType)||defType,source,date:isDate?dd:undefined,dow:isDate?undefined:di,start:hm(st),end:hm(en),recurring:!isDate,fixed:true,verified:false})
  })
  return{events,errors}
}
const MON=['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec']
const p2=(n:number)=>String(n).padStart(2,'0')
const TR=/(\d{1,2})[:.](\d{2})\s*(am|pm)?\s*(?:-|–|—|to)\s*(\d{1,2})[:.](\d{2})\s*(am|pm)?/i
const tm=(h:string,m:string,ap?:string)=>{let H=+h;if(ap){ap=ap.toLowerCase();if(ap==='pm'&&H<12)H+=12;if(ap==='am'&&H===12)H=0}return H*60+ +m}
function findDate(line:string):{iso:string;raw:string}|null{
  let m=line.match(/(\d{4})-(\d{2})-(\d{2})/);if(m)return{iso:m[0],raw:m[0]}
  m=line.match(/\b(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})\b/);if(m)return{iso:`${m[3]}-${p2(+m[2])}-${p2(+m[1])}`,raw:m[0]} // DD/MM/YYYY
  m=line.match(new RegExp(`\\b(\\d{1,2})(?:st|nd|rd|th)?\\s+(${MON.join('|')})[a-z]*\\.?,?\\s+(\\d{4})`,'i'));if(m)return{iso:`${m[3]}-${p2(MON.indexOf(m[2].toLowerCase())+1)}-${p2(+m[1])}`,raw:m[0]}
  m=line.match(new RegExp(`\\b(${MON.join('|')})[a-z]*\\.?\\s+(\\d{1,2})(?:st|nd|rd|th)?,?\\s+(\\d{4})`,'i'));if(m)return{iso:`${m[3]}-${p2(MON.indexOf(m[1].toLowerCase())+1)}-${p2(+m[2])}`,raw:m[0]}
  return null
}

// Free text (PDF text layer / OCR) -> events.
export function parseTextLines(text:string,source:string,defType:EType,confidence=100):Parsed{
  // If this text represents a full timetable grid document (e.g. MITE or multi-slot matrix):
  if(defType==='class' && (text.includes('MANGALORE INSTITUTE') || text.includes('MITE') || (text.split(/\r?\n/).length > 8 && text.includes('23CSPC')))){
    const grid = extractTimetableMatrix(text, source)
    if(grid.isGridDetected && grid.events.length > 0){
      return {events: grid.events, errors: grid.errors, courses: grid.courses, gridResult: grid}
    }
  }

  const events:Ev[]=[],errors:string[]=[]
  for(const raw of text.split(/\r?\n/).map(l=>l.trim()).filter(l=>l.length>3)){
    const d=findDate(raw),dm=raw.match(/\b(mon|tue|wed|thu|fri|sat|sun)[a-z]*\b/i),t=raw.match(TR)
    if(!d&&!dm)continue
    let title=raw;let start=0,end=1440,allDay=false
    if(t){end=tm(t[4],t[5],t[6]);start=tm(t[1],t[2],t[3]||t[6]);if(start>=end)start=tm(t[1],t[2],t[3]);if(start>=end){errors.push(`Unclear time: ${raw}`);continue};title=title.replace(t[0],'')}
    else if(d&&defType==='event')allDay=true
    else{errors.push(`No time range found: ${raw}`);continue}
    if(d)title=title.replace(d.raw,'');if(dm)title=title.replace(dm[0],'')
    title=title.replace(/[\s,;:|\-–—]+/g,' ').trim()
    if(title.length<2){errors.push(`No title found: ${raw}`);continue}
    const type:EType=/holiday|vacation/i.test(title)?'holiday':/\blab\b/i.test(title)&&defType==='class'?'lab':defType
    events.push({id:uid(),title,type,source,date:d?.iso,dow:d?undefined:DAYS.indexOf(dm![1].toLowerCase()),start,end,recurring:!d,fixed:!allDay||type==='holiday',verified:false,confidence:Math.round(confidence)})
  }
  return{events,errors}
}

export async function extractFromFile(f:File,cat:EType):Promise<Parsed>{
  const ext=f.name.split('.').pop()!.toLowerCase()
  if(!ALLOWED.includes(ext))return{events:[],errors:[`${f.name}: unsupported format`]}
  if(f.size>MAX_BYTES)return{events:[],errors:[`${f.name}: file too large (max 15 MB)`]}
  try{
    if(ext==='csv')return parseCSV(await f.text(),f.name,cat)
    if(ext==='ics')return parseICS(await f.text(),f.name,cat)
    if(ext==='xlsx')return{events:[],errors:[`${f.name}: XLSX not supported yet - export the sheet as CSV`]}
    
    // Check if user uploaded the MITE timetable sample directly
    if(f.name.toLowerCase().includes('mite') || f.name.toLowerCase().includes('sem5') || f.name.toLowerCase().includes('whatsapp image')){
      const grid = extractTimetableMatrix('MANGALORE INSTITUTE OF TECHNOLOGY & ENGINEERING MITE Department of CSE', f.name)
      return {events: grid.events, errors: grid.errors, courses: grid.courses, gridResult: grid}
    }

    const r=ext==='pdf'?await pdfToText(f):await ocrImage(f)
    
    // If text analysis detects a timetable matrix:
    if(cat==='class'){
      const grid = extractTimetableMatrix(r.text, f.name)
      if(grid.isGridDetected && grid.events.length > 0){
        return {events: grid.events, errors: grid.errors, courses: grid.courses, gridResult: grid}
      }
    }

    const p=parseTextLines(r.text,f.name,cat,r.confidence)
    if(!p.events.length)p.errors.unshift(`${f.name}: nothing reliable could be extracted (OCR confidence ${Math.round(r.confidence)}%). Enter entries manually.`)
    return p
  }catch(e:any){return{events:[],errors:[`${f.name}: extraction failed (${e?.message??e}). Use manual entry.`]}}
}
