import {useState} from 'react'
import {useStore} from '../../hooks/useStore'
import {dayDiff} from '../../engine'
import TaskForm from '../deadlines/TaskForm'
export default function TaskPanel({addOpen}:{addOpen:boolean}){
  const{st,today,cname,colorOf}=useStore()
  const[f,setF]=useState('todo');const[q,setQ]=useState('');const[open,setOpen]=useState(false)
  const list=st.tasks.filter(t=>t.title.toLowerCase().includes(q.toLowerCase())).filter(t=>{const d=dayDiff(today,t.deadline);return f==='all'||(f==='done'?t.status==='done':t.status!=='done'&&(f==='todo'||(f==='overdue'?d<0:f==='today'?d===0:d>=0&&d<=7)))}).sort((a,b)=>a.deadline.localeCompare(b.deadline))
  const group=(d:number)=>d<0?'Overdue':d===0?'Due today':d===1?'Due tomorrow':`Due in ${d} days`
  let last=''
  return <div className="tp"><div className="row"><select value={f} onChange={e=>setF(e.target.value)}><option value="todo">All To Do</option><option value="overdue">Overdue</option><option value="today">Due today</option><option value="week">This week</option><option value="done">Done</option><option value="all">All</option></select></div>
    <input placeholder="Search for task" value={q} onChange={e=>setQ(e.target.value)} style={{width:'100%',maxWidth:'none'}}/>
    <button className="ghost addtask" onClick={()=>setOpen(!open)}>⊕ Add a task</button>{(open||addOpen)&&<div className="note"><TaskForm/></div>}
    {list.map(t=>{const d=dayDiff(today,t.deadline);const g=group(d);const h=g!==last;last=g
      return <div key={t.id}>{h&&<div className="grp">{g}</div>}<div className="tcard" style={{borderLeftColor:colorOf(t.courseId)}}><div className="muted">{cname(t.courseId)} <span className={'tag '+t.type}>{t.type}</span></div><b>{t.title}</b><div className="muted">Due: {t.deadline} <span className="status">{t.status==='done'?'Done':d<0?'Overdue':'Planned'}</span></div></div></div>})}
    {!list.length&&<p className="muted">No tasks.</p>}</div>
}
