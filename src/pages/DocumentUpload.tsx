import {useState} from 'react'
import {useStore} from '../hooks/useStore'
import {EType,dedupe} from '../engine'
import {extractFromFile} from '../services/documentParser'
import Form from '../components/upload/Form'
import {parseCSV} from '../services/documentParser'
const CATS:[string,EType][]=[['Regular college timetable','class'],['Academic / event calendar','event'],['CIE examination timetable','cie'],['SIE examination timetable','sie'],['Additional academic schedule','personal'],['Assignment & project schedule','event']]
export default function DocumentUpload(){
  const{st,set,go,setLog}=useStore()
  const[sel,setSel]=useState<Record<number,boolean>>({0:true});const[busy,setBusy]=useState('')
  const run=async(i:number,fs:FileList|null)=>{
    if(!fs||!fs.length)return;const out:string[]=[];let all=st.events
    for(const f of Array.from(fs)){setBusy(`Analyzing ${f.name}…`);const r=await extractFromFile(f,CATS[i][1]);all=[...all,...r.events];out.push(`${f.name} [${CATS[i][0]}]: ${r.events.length} entries extracted`,...r.errors.map(e=>'⚠ '+e))}
    const d=dedupe(all);set({events:d.kept});setBusy('');setLog([...out,...(d.dropped.length?[`${d.dropped.length} duplicate entr${d.dropped.length>1?'ies':'y'} ignored`]:[])]);go('Analysis')
  }
  return <><section><h3>What academic schedules do you want SmartStudy to analyze?</h3><p className="muted">Select any (or all). None is mandatory. Formats: PDF, JPG/PNG (OCR), CSV, ICS. CSV columns: <code>title,day_or_date,start,end[,type]</code></p>
    {CATS.map(([l],i)=><div key={i} className="upl"><label className="chk"><input type="checkbox" checked={!!sel[i]} onChange={e=>setSel({...sel,[i]:e.target.checked})}/>{l}</label>
      {sel[i]&&<input type="file" multiple accept=".csv,.ics,.pdf,.png,.jpg,.jpeg" disabled={!!busy} onChange={e=>run(i,e.target.files)}/>}</div>)}
    {busy&&<div className="note">{busy} (OCR can take a while)</div>}
    <p className="muted">Don't have a file? Add entries manually below, or <a onClick={()=>go('Setup')}>skip to study setup</a>.</p></section>
    <section><h3>Add entry manually</h3><Form label="Add" fields={[{k:'title',l:'Title'},{k:'type',l:'Type',o:['class','lab','event','holiday','cie','sie','personal']},{k:'when',l:'Day (Mon..) or date YYYY-MM-DD',d:'Mon'},{k:'s',l:'Start',t:'time',d:'09:00'},{k:'e',l:'End',t:'time',d:'10:00'}]}
      onSubmit={v=>{const r=parseCSV(`${v.title},${v.when},${v.s},${v.e},${v.type}`,'manual',v.type as EType);if(r.errors.length)return setLog(r.errors);set({events:dedupe([...st.events,...r.events.map(e=>({...e,verified:true}))]).kept});setLog(['Entry added'])}}/></section></>
}
