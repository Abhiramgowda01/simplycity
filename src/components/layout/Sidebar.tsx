import {useStore,Page} from '../../hooks/useStore'
const NAV:[Page,string][]=[['Planner','📅 Planner'],['Dashboard','🏠 Dashboard'],['Upload','⬆ Upload documents'],['Analysis','🔎 Analysis'],['Review','✔ Timetable review'],['Setup','⚙ Study setup'],['Courses','📚 Courses'],['Deadlines','📝 Deadlines'],['Plan','🧠 Study plan'],['Progress','📈 Progress'],['Settings','⚙ Settings']]
export default function Sidebar(){
  const{page,go,demo,toggleDemo,dark,setDark}=useStore()
  return <aside><h1 onClick={()=>go('Landing')} style={{cursor:'pointer'}}>🎓 SmartStudy</h1>{NAV.map(([p,l])=><button key={p} className={p===page?'nav on':'nav'} onClick={()=>go(p)}>{l}</button>)}
    <hr/><button className="nav" onClick={()=>toggleDemo(!demo)}>{demo?'Exit demo mode':'Load demo data'}</button><button className="nav" onClick={()=>setDark(!dark)}>{dark?'☀ Light':'🌙 Dark'} mode</button></aside>
}
