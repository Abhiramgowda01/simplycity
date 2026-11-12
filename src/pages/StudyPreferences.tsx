import {useStore} from '../hooks/useStore'
import {hm,fmt} from '../engine'
import {dayName,DAYS} from '../services/documentParser'
import Form from '../components/upload/Form'
export default function StudyPreferences(){
  const{st,set,go}=useStore();const p=st.prefs;const sp=(x:Partial<typeof p>)=>set({prefs:{...p,...x}})
  return <section><h3>When do you want to start your study preparation?</h3><div className="row"><label>Start date<input type="date" value={p.startDate} onChange={e=>sp({startDate:e.target.value})}/></label>
    <label>Until when should I plan?<input type="date" value={p.endDate} onChange={e=>sp({endDate:e.target.value})}/></label></div>
    <h3>Daily study window</h3><div className="row"><label>Start studying at<input type="time" value={fmt(p.start)} onChange={e=>sp({start:hm(e.target.value)})}/></label><label>Stop studying at<input type="time" value={fmt(p.end)} onChange={e=>sp({end:hm(e.target.value)})}/></label></div>
    <h3>Targets</h3><div className="row"><label>Hours per day<select value={[1,2,3,4].includes(p.dailyTarget)?p.dailyTarget:'c'} onChange={e=>e.target.value!=='c'&&sp({dailyTarget:+e.target.value})}>{[1,2,3,4].map(h=><option key={h} value={h}>{h} hour{h>1?'s':''}</option>)}<option value="c">Custom…</option></select></label>
      <label>Custom hours<input type="number" min={0.5} step={0.5} value={p.dailyTarget} onChange={e=>sp({dailyTarget:+e.target.value})}/></label>
      <label>Session (min)<select value={[30,45,60,90].includes(p.session)?p.session:'c'} onChange={e=>e.target.value!=='c'&&sp({session:+e.target.value})}>{[30,45,60,90].map(m=><option key={m} value={m}>{m}</option>)}<option value="c">Custom</option></select></label><label>Custom<input type="number" min={30} step={5} value={p.session} onChange={e=>sp({session:+e.target.value})}/></label>
      <label>Break (min)<input type="number" min={0} step={5} value={p.breakMin} onChange={e=>sp({breakMin:+e.target.value})}/></label></div>
    <h3>Study days (untick days you don't want to study)</h3><div className="row">{[1,2,3,4,5,6,0].map(d=><label key={d} className="chk"><input type="checkbox" checked={p.studyDays.includes(d)} onChange={e=>sp({studyDays:e.target.checked?[...p.studyDays,d]:p.studyDays.filter(x=>x!==d)})}/>{dayName(d)}</label>)}</div>
    <h3>Unavailable periods (meals, travel, sports, coaching…)</h3>{p.unavailable.map((u,i)=><div key={i}>{u.label||'Busy'} {fmt(u.start)}–{fmt(u.end)} · {u.days?u.days.map(dayName).join(', '):'every day'}<button className="ghost" onClick={()=>sp({unavailable:p.unavailable.filter((_,j)=>j!==i)})}>Remove</button></div>)}
    <Form label="Add" fields={[{k:'l',l:'Name',d:'Meal'},{k:'s',l:'From',t:'time',d:'13:00'},{k:'e',l:'To',t:'time',d:'14:00'},{k:'d',l:'Day (blank = every day)',d:''}]} onSubmit={v=>{const di=v.d?[DAYS.indexOf(v.d.slice(0,3).toLowerCase())].filter(x=>x>=0):undefined;sp({unavailable:[...p.unavailable,{label:v.l,start:hm(v.s),end:hm(v.e),days:di}]})}}/>
    <button onClick={()=>go('Courses')}>Save & add courses →</button></section>
}
