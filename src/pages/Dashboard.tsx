import {useStore} from '../hooks/useStore'
import {busyFor,freeSlots,dayDiff,isExam,fmt} from '../engine'
import Card from '../components/dashboard/Card'
export default function Dashboard(){
  const{st,today,cname,go}=useStore()
  const busy=busyFor(st.events,today),free=freeSlots(today,busy,st.prefs).reduce((a,[s,e])=>a+e-s,0)
  const todays=st.sessions.filter(s=>s.date===today&&s.status!=='missed').sort((a,b)=>a.start-b.start),planned=todays.reduce((a,s)=>a+s.end-s.start,0)
  const wk=st.sessions.filter(s=>s.date>=today&&dayDiff(today,s.date)<7)
  const up=st.tasks.filter(t=>t.status!=='done'&&t.deadline>=today).sort((a,b)=>a.deadline.localeCompare(b.deadline))
  const nxt=st.sessions.filter(s=>s.status==='planned'&&s.date>=today).sort((a,b)=>(a.date+fmt(a.start)).localeCompare(b.date+fmt(b.start)))[0]
  const mins:Record<string,number>={};st.sessions.filter(s=>s.status!=='missed').forEach(s=>mins[s.courseId]=(mins[s.courseId]||0)+s.end-s.start);const max=Math.max(1,...Object.values(mins))
  const un=st.report?st.report.unscheduled.reduce((a,u)=>a+u.minutes,0):0
  return <><div className="cards"><Card l="Today's classes" v={busy.filter(b=>b.e<1440||b.s>0).length}/><Card l="Free hours today" v={(free/60).toFixed(1)}/><Card l="Scheduled today" v={(planned/60).toFixed(1)+'h'}/><Card l="Pending tasks" v={up.filter(t=>!isExam(t.type)).length}/><Card l="Upcoming CIE" v={up.filter(t=>t.type==='cie').length}/><Card l="Upcoming SIE" v={up.filter(t=>t.type==='sie').length}/><Card l="Sessions done" v={st.sessions.filter(s=>s.status==='done').length}/><Card l="7-day completion" v={wk.length?Math.round(100*wk.filter(s=>s.status==='done').length/wk.length)+'%':'0%'}/></div>
    {un>0&&<div className="warn">Workload warning: {(un/60).toFixed(1)}h of preparation is not scheduled — see Study plan.</div>}
    <div className="grid2"><section><h3>Next recommended</h3>{nxt?<p><b>{cname(nxt.courseId)}</b> — {nxt.date} {fmt(nxt.start)}–{fmt(nxt.end)} ({nxt.kind})</p>:<p>No planned sessions. <a onClick={()=>go('Plan')}>Generate a plan</a>.</p>}
      <h3>Today's study</h3>{todays.map(s=><div key={s.id}>{fmt(s.start)}–{fmt(s.end)} {cname(s.courseId)} <i>{s.status}</i></div>)}{!todays.length&&<p className="muted">Nothing scheduled.</p>}
      <h3>Today's college commitments</h3>{busy.map(b=><div key={b.id}>{fmt(b.s)}–{fmt(Math.min(b.e,1439))} {b.title}</div>)}{!busy.length&&<p className="muted">None.</p>}</section>
    <section><h3>Countdowns & deadlines</h3>{up.slice(0,8).map(t=>{const d=dayDiff(today,t.deadline);return <div key={t.id}><span className={'tag '+t.type}>{t.type}</span> {t.title} — {d===0?'today':d+' days'}{d<=1?' ⚠':''}</div>})}
      <h3>Study distribution</h3>{st.courses.map(c=><div key={c.id} className="bar"><span>{c.code}</span><i style={{width:(100*(mins[c.id]||0)/max)+'%'}}/><span>{((mins[c.id]||0)/60).toFixed(1)}h</span></div>)}</section></div></>
}
