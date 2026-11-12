import {useStore} from '../hooks/useStore'
export default function LandingPage(){
  const{go,toggleDemo}=useStore()
  return <div className="hero"><h1>🎓 SmartStudy</h1><p>Upload your timetable, event calendar, CIE and SIE schedules. SmartStudy merges them, finds your real free time and builds a clash-free study plan that adapts when life changes.</p>
    <div className="row" style={{justifyContent:'center'}}><button onClick={()=>go('Onboarding')}>Get started</button><button className="ghost" onClick={()=>toggleDemo(true)}>Load demo data</button></div>
    <div className="cards" style={{marginTop:30}}>{['Multi-document import (PDF, image, CSV, ICS)','Conflict & duplicate detection','Priority-weighted scheduling','Dynamic rescheduling with preview'].map(t=><div key={t} className="card">{t}</div>)}</div></div>
}
