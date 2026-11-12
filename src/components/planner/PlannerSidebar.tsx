import {useStore} from '../../hooks/useStore'
import Form from '../upload/Form'
import {hm,fmt} from '../../engine'
const LAYERS:[string,string][]=[['class','Classes & labs'],['event','Events & holidays'],['cie','CIE exams'],['sie','SIE exams'],['personal','Personal'],['study','Study sessions'],['free','Free time hints']]
export default function PlannerSidebar(){
  const{st,set,colorOf,go}=useStore()
  const hidden=(id:string)=>st.layers['course:'+id]===false
  return <div className="psb">
    <div className="customEvt" draggable onDragStart={e=>e.dataTransfer.setData('text','custom')}>Drag a custom event</div>
    <h4>Courses <a onClick={()=>go('Courses')}>+ Add new</a></h4>
    {st.courses.map(c=><div key={c.id} className="pill" style={{background:colorOf(c.id),opacity:hidden(c.id)?.45:1}} onClick={()=>set({layers:{...st.layers,['course:'+c.id]:hidden(c.id)}})} title="Click to show/hide on calendar">{c.name}</div>)}
    <h4>Activities</h4>
    {st.prefs.unavailable.map((u,i)=><div key={i} className="pill grey">{u.label||'Busy'} {fmt(u.start)}–{fmt(u.end)}<b onClick={()=>set({prefs:{...st.prefs,unavailable:st.prefs.unavailable.filter((_,j)=>j!==i)}})}>×</b></div>)}
    <details><summary>+ Add new</summary><Form label="Add" fields={[{k:'l',l:'Name',d:'Meal'},{k:'s',l:'From',t:'time',d:'13:00'},{k:'e',l:'To',t:'time',d:'14:00'}]} onSubmit={v=>set({prefs:{...st.prefs,unavailable:[...st.prefs.unavailable,{label:v.l,start:hm(v.s),end:hm(v.e)}]}})}/></details>
    <h4>Selected calendars</h4>
    {LAYERS.map(([k,l])=><label key={k} className="chk"><input type="checkbox" checked={st.layers[k]!==false} onChange={e=>set({layers:{...st.layers,[k]:e.target.checked}})}/>{l}</label>)}
  </div>
}
