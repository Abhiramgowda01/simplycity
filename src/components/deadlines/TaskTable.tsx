import {useStore} from '../../hooks/useStore'
import {dayDiff,isExam} from '../../engine'
export default function TaskTable(){
  const{st,set,today,cname,colorOf}=useStore()
  return <table><thead><tr><th>Title</th><th>Course</th><th>Type</th><th>Deadline</th><th>Hours</th><th>Flag</th><th>Done</th><th></th></tr></thead><tbody>
    {[...st.tasks].sort((a,b)=>a.deadline.localeCompare(b.deadline)).map(t=>{const d=dayDiff(today,t.deadline);const flag=t.status==='done'?'':d<0?'overdue':d<=1?'<24h':d<=3?'≤3 days':d<=7?'≤7 days':''
      return <tr key={t.id}><td>{t.title}</td><td><span className="dot" style={{background:colorOf(t.courseId)}}/>{cname(t.courseId)}</td><td><span className={'tag '+t.type}>{t.type}</span></td><td>{t.deadline}</td><td>{isExam(t.type)?'—':t.estimatedHours}</td><td>{flag}</td>
      <td><input type="checkbox" checked={t.status==='done'} onChange={e=>set({tasks:st.tasks.map(x=>x.id===t.id?{...x,status:e.target.checked?'done':'pending'}:x)})}/></td><td><button className="ghost" onClick={()=>set({tasks:st.tasks.filter(x=>x.id!==t.id)})}>Delete</button></td></tr>})}</tbody></table>
}
