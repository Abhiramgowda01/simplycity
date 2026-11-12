import {useStore} from '../hooks/useStore'
import {fmt} from '../engine'
import {dayName} from '../services/documentParser'
export default function DocumentAnalysis(){
  const{st,log,go,conflicts}=useStore()
  const groups:Record<string,typeof st.events>={};st.events.forEach(e=>(groups[e.source]??=[]).push(e))
  return <><section><h3>Extraction results</h3>{log.map((l,i)=><div key={i} className={'note'+(l.startsWith('⚠')?' warnline':'')}>{l}</div>)}{!log.length&&<p className="muted">Nothing analyzed in this session.</p>}</section>
    <section><h3>Merged commitments by source ({st.events.length})</h3>{Object.entries(groups).map(([src,l])=><details key={src}><summary><b>{src}</b> — {l.length} entries, {l.filter(e=>!e.verified).length} unverified{l.some(e=>e.confidence!==undefined&&e.confidence<70)?' · ⚠ low OCR confidence':''}</summary>
      <table><tbody>{l.map(e=><tr key={e.id} className={e.confidence!==undefined&&e.confidence<70?'warnrow':''}><td>{e.title}</td><td>{e.type}</td><td>{e.recurring?'Every '+dayName(e.dow!):e.date}</td><td>{fmt(e.start)}–{fmt(e.end>=1440?1439:e.end)}</td><td>{e.confidence!==undefined?e.confidence+'%':''}</td></tr>)}</tbody></table></details>)}
      {conflicts.length>0&&<div className="warn">{conflicts.length} conflicting pair(s) detected — resolve them on the review screen.</div>}
      <button onClick={()=>go('Review')}>Review & correct →</button></section></>
}
