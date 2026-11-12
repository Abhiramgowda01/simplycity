import {useStore} from '../hooks/useStore'
import {fmt} from '../engine'
import {dayName} from '../services/documentParser'
export default function TimetableReview(){
  const{st,set,conflicts,go}=useStore()
  const up=(id:string,p:object)=>set({events:st.events.map(y=>y.id===id?{...y,...p}:y)})
  const inConf=new Set(conflicts.flat().map(e=>e.id))
  return <section><h3>Combined timetable ({st.events.length})</h3>
    {conflicts.length>0&&<div className="warn"><b>{conflicts.length} conflict(s)</b> between fixed commitments — edit, delete, or untick "Blocks study" for informational items:{conflicts.map(([a,b],i)=><div key={i}>• {a.title} <i>({a.source})</i> ⟷ {b.title} <i>({b.source})</i> — {a.recurring?dayName(a.dow!):a.date}</div>)}</div>}
    <div style={{overflowX:'auto'}}><table><thead><tr><th>Title</th><th>Type</th><th>When</th><th>Start</th><th>End</th><th>Source</th><th>Blocks study</th><th>Verified</th><th></th></tr></thead><tbody>
    {[...st.events].sort((a,b)=>(a.date??'0').localeCompare(b.date??'0')).map(e=><tr key={e.id} className={inConf.has(e.id)?'warnrow':''}><td><input value={e.title} onChange={x=>up(e.id,{title:x.target.value})}/></td><td>{e.type}</td><td>{e.recurring?'Every '+dayName(e.dow!):e.date}</td>
      <td><input type="time" value={fmt(e.start)} onChange={x=>up(e.id,{start:+x.target.value.slice(0,2)*60+ +x.target.value.slice(3)})}/></td><td><input type="time" value={fmt(Math.min(e.end,1439))} onChange={x=>up(e.id,{end:+x.target.value.slice(0,2)*60+ +x.target.value.slice(3)})}/></td><td>{e.source}{e.confidence!==undefined&&e.confidence<70?' ⚠':''}</td>
      <td><input type="checkbox" checked={e.fixed} onChange={x=>up(e.id,{fixed:x.target.checked})}/></td><td><input type="checkbox" checked={e.verified} onChange={x=>up(e.id,{verified:x.target.checked})}/></td><td><button className="ghost" onClick={()=>set({events:st.events.filter(y=>y.id!==e.id)})}>Delete</button></td></tr>)}</tbody></table></div>
    <div className="row"><button onClick={()=>{set({events:st.events.map(e=>({...e,verified:true}))});go('Setup')}}>Confirm all & continue →</button></div></section>
}
