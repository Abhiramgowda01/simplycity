import {useState} from 'react'
import {useStore} from '../../hooks/useStore'
import {Ev,Session,addDays,datesBetween,dowOf,fmt,occursOn,freeSlots,busyFor,validate,normEnd} from '../../engine'
import {dayName} from '../../services/documentParser'
const H0=6,H1=24,PX=44
const layerOf=(t:string)=>t==='class'||t==='lab'?'class':t==='event'||t==='holiday'?'event':t
const top=(m:number)=>(Math.max(m,H0*60)-H0*60)/60*PX
type Sel={k:'s'|'e';id:string}|null
export default function CalendarGrid({onAddTask}:{onAddTask:()=>void}){
  const{st,set,today,cname,colorOf,courseFor,mark}=useStore()
  const[view,setView]=useState<'day'|'week'|'month'>(innerWidth<800?'day':'week');const[anchor,setAnchor]=useState(today);const[sel,setSel]=useState<Sel>(null);const[note,setNote]=useState('')
  const step=view==='month'?30:view==='week'?7:1
  const ws=addDays(anchor,-((dowOf(anchor)+6)%7))
  const days=view==='day'?[anchor]:view==='week'?datesBetween(ws,addDays(ws,6)):(()=>{const f=anchor.slice(0,8)+'01';const s=addDays(f,-((dowOf(f)+6)%7));return datesBetween(s,addDays(s,41))})()
  const on=(k:string)=>st.layers[k]!==false
  const evColor=(e:Ev)=>{const c=courseFor(e.title);return e.type==='cie'||e.type==='sie'?'#fecaca':e.type==='holiday'?'#e5e7eb':e.type==='event'?'#fde68a':e.type==='personal'?'#e5e7eb':c?colorOf(c.id):'#dbeafe'}
  const evs=(d:string)=>st.events.filter(e=>e.fixed&&occursOn(e,d)&&on(layerOf(e.type)))
  const sess=(d:string)=>on('study')?st.sessions.filter(s=>s.date===d&&s.status!=='missed'&&st.layers['course:'+s.courseId]!==false):[]
  const rel=st.sessions.length
  const onDrop=(d:string,e:React.DragEvent)=>{
    e.preventDefault();const data=e.dataTransfer.getData('text');const r=e.currentTarget.getBoundingClientRect()
    const m=Math.min(H1*60-60,H0*60+Math.round((e.clientY-r.top)/PX*4)*15)
    if(data==='custom'){const ne:Ev={id:Math.random().toString(36).slice(2,9),title:'Personal event',type:'personal',source:'manual',date:d,start:m,end:m+60,recurring:false,fixed:true,verified:true}
      const gone=st.sessions.filter(s=>s.status==='planned'&&s.date===d&&s.start<ne.end&&ne.start<s.end).map(s=>s.id)
      set({events:[...st.events,ne],sessions:st.sessions.filter(s=>!gone.includes(s.id))});setNote(gone.length?`${gone.length} study session(s) displaced — use Study plan → Regenerate to re-place them.`:'Personal event added.');return}
    if(data.startsWith('s:')){const id=data.slice(2);const s=st.sessions.find(x=>x.id===id)!;const moved:Session={...s,date:d,start:m,end:m+(s.end-s.start)}
      const others=st.sessions.map(x=>x.id===id?moved:x);const before=validate(st.sessions,st.events,st.tasks,st.prefs).length;const errs=validate(others,st.events,st.tasks,st.prefs)
      if(errs.length>before){setNote('Move rejected: '+(errs.find(x=>x.startsWith(id))??errs[0]));return}
      set({sessions:others});setNote('Session moved and re-validated: no clashes.')}
  }
  const selS=sel?.k==='s'?st.sessions.find(s=>s.id===sel.id):null,selE=sel?.k==='e'?st.events.find(e=>e.id===sel.id):null
  return <div className="cal"><div className="toolbar">
    <div className="seg">{(['day','week','month'] as const).map(v=><button key={v} className={view===v?'on':''} onClick={()=>setView(v)}>{v[0].toUpperCase()+v.slice(1)}</button>)}</div>
    <button className="ghost" onClick={()=>setAnchor(addDays(anchor,-step))}>◀</button><input type="date" value={anchor} onChange={e=>e.target.value&&setAnchor(e.target.value)}/><button className="ghost" onClick={()=>setAnchor(addDays(anchor,step))}>▶</button><button className="ghost" onClick={()=>setAnchor(today)}>Today</button>
    <span style={{flex:1}}/><button onClick={onAddTask}>+ Task</button></div>
    {note&&<div className="note" onClick={()=>setNote('')}>{note}</div>}
    {(selS||selE)&&<div className="note"><b>{selS?cname(selS.courseId):selE!.title}</b> — {selS?`${selS.date} ${fmt(selS.start)}–${fmt(selS.end)} (${selS.kind}, ${selS.status})`:`${selE!.type} · ${selE!.recurring?'every '+dayName(selE!.dow!):selE!.date} ${fmt(selE!.start)}–${fmt(normEnd(selE!))} · from ${selE!.source}`}
      {selS&&<> <button className="ghost" onClick={()=>mark(selS.id,'done')}>Done</button><button className="ghost" onClick={()=>mark(selS.id,'missed')}>Missed</button><button className="ghost" onClick={()=>mark(selS.id,'planned')}>Reset</button> <span className="muted">(drag the block to reschedule)</span></>}
      {selE&&<> <button className="ghost" onClick={()=>{set({events:st.events.filter(x=>x.id!==selE.id)});setSel(null)}}>Delete</button></>}<button className="ghost" onClick={()=>setSel(null)}>Close</button></div>}
    {view==='month'?<div className="month">{['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d=><b key={d}>{d}</b>)}{days.map(d=><div key={d} className={'mcell'+(d===today?' today':'')+(d.slice(0,7)!==anchor.slice(0,7)?' dim':'')} onClick={()=>{setAnchor(d);setView('day')}}><span>{+d.slice(8)}</span>
      {evs(d).slice(0,2).map(e=><i key={e.id} style={{background:evColor(e)}}>{e.title}</i>)}{sess(d).length>0&&<i style={{background:'#c7d2fe'}}>{sess(d).length} study</i>}{st.tasks.filter(t=>t.deadline===d&&t.status!=='done').map(t=><i key={t.id} className="due">{t.title}</i>)}</div>)}</div>
    :<div className="gridwrap"><div className="gridhead"><div className="gut"/>{days.map(d=><div key={d} className={'dh'+(d===today?' today':'')}><b>{dayName(dowOf(d))} {+d.slice(8)}</b><small>{st.tasks.filter(t=>t.deadline===d&&t.status!=='done').length} tasks due</small></div>)}</div>
      <div className="gridbody"><div className="gut">{Array.from({length:H1-H0},(_,i)=><div key={i} style={{height:PX}}>{(H0+i)%12||12}{H0+i<12?'a':'p'}</div>)}</div>
      {days.map(d=>{const busy=busyFor(st.events,d).concat(sess(d).map(s=>({s:s.start,e:s.end,title:'s',id:s.id})));const free=on('free')&&st.prefs.studyDays.includes(dowOf(d))?freeSlots(d,busy,st.prefs,45):[]
        return <div key={d} className={'col'+(d===today?' today':'')} style={{height:(H1-H0)*PX}} onDragOver={e=>e.preventDefault()} onDrop={e=>onDrop(d,e)}>
          {Array.from({length:H1-H0},(_,i)=><div key={i} className="hl" style={{top:i*PX}}/>)}
          {st.prefs.unavailable.filter(u=>!u.days||u.days.includes(dowOf(d))).map((u,i)=><div key={'u'+i} className="blk grey" style={{top:top(u.start),height:Math.max(14,(u.end-u.start)/60*PX)}}>{u.label||'Busy'}</div>)}
          {free.map(([a,b],i)=><div key={'f'+i} className="free" style={{top:top(a),height:(b-a)/60*PX}}>{Math.round((b-a)/6)/10}h free</div>)}
          {evs(d).map(e=><div key={e.id} className={'blk '+(e.type==='cie'||e.type==='sie'?'exam':'')} style={{top:top(e.start),height:Math.max(16,(normEnd(e)-e.start)/60*PX),background:evColor(e)}} onClick={()=>setSel({k:'e',id:e.id})}>{fmt(e.start)} {e.title}</div>)}
          {sess(d).map(s=><div key={s.id} draggable className={'blk study '+s.status} style={{top:top(s.start),height:Math.max(16,(s.end-s.start)/60*PX),background:colorOf(s.courseId)}} onDragStart={ev=>ev.dataTransfer.setData('text','s:'+s.id)} onClick={()=>setSel({k:'s',id:s.id})}><b>{cname(s.courseId)}</b><br/>{s.kind==='revision'?'Revision':'Study'}{s.status==='done'?' ✓':''}</div>)}
          {d===new Date().toISOString().slice(0,10)&&<div className="now" style={{top:top(new Date().getHours()*60+new Date().getMinutes())}}/>}</div>})}</div></div>}
    {!rel&&<p className="muted">No study sessions yet — open <b>Study plan</b> and click Generate.</p>}</div>
}
