import {useStore} from '../hooks/useStore'
export default function Progress(){
  const{st,cname}=useStore();const done=st.sessions.filter(s=>s.status==='done'),missed=st.sessions.filter(s=>s.status==='missed')
  const m=(l:typeof done)=>l.reduce((a,s)=>a+s.end-s.start,0)/60
  return <section><p>Completed <b>{done.length}</b> sessions ({m(done).toFixed(1)}h actual) · Missed <b>{missed.length}</b> ({m(missed).toFixed(1)}h). Only sessions marked Done count as progress.</p>
    <table><thead><tr><th>Course</th><th>Done h</th><th>Prep target h</th><th>Progress</th></tr></thead><tbody>{st.courses.map(c=>{const h=m(done.filter(s=>s.courseId===c.id));return <tr key={c.id}><td>{cname(c.id)}</td><td>{h.toFixed(1)}</td><td>{c.estimatedHours}</td><td><div className="bar"><i style={{width:Math.min(100,100*h/Math.max(1,c.estimatedHours))+'%'}}/></div></td></tr>})}</tbody></table>
    <h3>Daily</h3>{[...new Set(done.map(s=>s.date))].sort().map(d=><div key={d}>{d}: {m(done.filter(s=>s.date===d)).toFixed(1)}h</div>)}{!done.length&&<p className="muted">No completed sessions yet.</p>}</section>
}
