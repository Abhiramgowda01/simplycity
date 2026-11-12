import {useState} from 'react'
import {useStore} from '../hooks/useStore'
import {reschedule,isExam,fmt,dowOf} from '../engine'
import {dayName} from '../services/documentParser'
export default function StudyPlan(){
  const{st,set,today,cname,generateNow,mark,issues,go}=useStore()
  const[pv,setPv]=useState<ReturnType<typeof reschedule>|null>(null)
  const r=st.report,dates=[...new Set(st.sessions.map(s=>s.date))].sort()
  const excl=st.tasks.filter(t=>isExam(t.type)&&(t.deadline<st.prefs.startDate||t.deadline>st.prefs.endDate))
  const un=r?r.unscheduled.reduce((a,u)=>a+u.minutes,0):0
  return <><section><div className="row"><button onClick={generateNow} disabled={!st.courses.length}>Generate study plan</button><button onClick={()=>setPv(reschedule({events:st.events,courses:st.courses,tasks:st.tasks,prefs:st.prefs,today},st.sessions))} disabled={!st.sessions.length}>Regenerate remaining schedule…</button><button className="ghost" onClick={()=>go('Planner')}>Open in calendar</button></div>
    {!st.courses.length&&<p className="muted">Add courses first.</p>}{excl.length>0&&<div className="note">Excluded from this plan (outside the selected dates): {excl.map(t=>t.title).join(', ')}</div>}
    {pv&&<div className="note"><b>Preview of changes:</b> {pv.removed.length} planned sessions removed, {pv.added.length} added. Done, missed and past sessions are preserved.<div className="row"><button onClick={()=>{set({sessions:pv.sessions,report:pv});setPv(null)}}>Apply</button><button className="ghost" onClick={()=>setPv(null)}>Cancel</button></div></div>}</section>
    {r&&<section><h3>Coverage</h3><p>Required <b>{(r.requiredMin/60).toFixed(1)}h</b> · Scheduled <b>{(r.scheduledMin/60).toFixed(1)}h</b> · Unscheduled <b>{(un/60).toFixed(1)}h</b></p>
      {r.unscheduled.length?<div className="warn"><b>Insufficient availability.</b> Not fully covered: {r.unscheduled.map(u=>`${st.tasks.find(t=>t.id===u.key)?.title??cname(u.courseId)+' prep'} (${(u.minutes/60).toFixed(1)}h)`).join('; ')}. Try more hours per day, a wider study window, more study days, or lower prep estimates.</div>:<div className="ok">All preparation requirements are scheduled.</div>}</section>}
    <section><h3>Validation</h3>{!st.sessions.length?<p className="muted">No plan yet.</p>:issues.length===0?<div className="ok">✔ Clash-free: no overlaps; planning range, study window, deadlines and daily limits respected.</div>:<div className="warn">{issues.slice(0,10).map((x,i)=><div key={i}>{x}</div>)}</div>}</section>
    <section><h3>Sessions</h3>{dates.map(d=><div key={d}><b>{d} ({dayName(dowOf(d))})</b>{st.sessions.filter(s=>s.date===d).sort((a,b)=>a.start-b.start).map(s=><div key={s.id} className={'sess '+s.status}>{fmt(s.start)}–{fmt(s.end)} {cname(s.courseId)}{s.taskId?` · ${st.tasks.find(t=>t.id===s.taskId)?.title}`:''} {s.kind==='revision'&&<span className="tag cie">revision</span>} <i>{s.status}</i>
      <button className="ghost" onClick={()=>mark(s.id,'done')}>Done</button><button className="ghost" onClick={()=>mark(s.id,'missed')}>Missed</button><button className="ghost" onClick={()=>mark(s.id,'planned')}>Reset</button></div>)}</div>)}</section></>
}
