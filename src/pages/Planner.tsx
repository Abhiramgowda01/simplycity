import {useState} from 'react'
import PlannerSidebar from '../components/planner/PlannerSidebar'
import CalendarGrid from '../components/planner/CalendarGrid'
import TaskPanel from '../components/planner/TaskPanel'
import TaskTable from '../components/deadlines/TaskTable'
import {useStore} from '../hooks/useStore'
export default function Planner(){
  const[tab,setTab]=useState<'Calendar'|'Task List'>('Calendar');const[add,setAdd]=useState(false);const{generateNow,st}=useStore()
  return <div className="planner"><PlannerSidebar/><div className="pc"><div className="tabs">{(['Calendar','Task List'] as const).map(t=><button key={t} className={t===tab?'on':''} onClick={()=>setTab(t)}>{t}</button>)}<span style={{flex:1}}/><button className="ghost" onClick={generateNow} disabled={!st.courses.length}>⚡ Auto-plan</button></div>
    {tab==='Calendar'?<CalendarGrid onAddTask={()=>setAdd(!add)}/>:<TaskTable/>}</div><TaskPanel addOpen={add}/></div>
}
