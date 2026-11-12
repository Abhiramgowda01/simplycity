import {useStore,PALETTE} from '../hooks/useStore'
import {priority,isExam,Task} from '../engine'
import Form from '../components/upload/Form'
export default function Courses(){
  const{st,set,today,colorOf,courseFor,go}=useStore()
  const upC=(id:string,p:object)=>set({courses:st.courses.map(x=>x.id===id?{...x,...p}:x)})
  return <section><h3>Courses</h3><div style={{overflowX:'auto'}}><table><thead><tr><th>Color</th><th>Name</th><th>Code</th><th>Difficulty</th><th>Understanding</th><th>Importance</th><th>Prep hours</th><th>Priority</th><th></th></tr></thead><tbody>
    {st.courses.map(c=><tr key={c.id}><td><input type="color" value={colorOf(c.id).length===7?colorOf(c.id):PALETTE[0]} onChange={e=>upC(c.id,{color:e.target.value})} style={{width:40,padding:0}}/></td><td>{c.name}</td><td>{c.code}</td>
      <td><select value={c.difficulty} onChange={e=>upC(c.id,{difficulty:+e.target.value})}><option value={1}>Easy</option><option value={2}>Medium</option><option value={3}>Hard</option></select></td>
      <td><select value={c.understanding} onChange={e=>upC(c.id,{understanding:+e.target.value})}><option value={1}>Low</option><option value={2}>Medium</option><option value={3}>High</option></select></td>
      <td><input type="number" min={1} max={5} value={c.importance} onChange={e=>upC(c.id,{importance:Math.min(5,Math.max(1,+e.target.value))})}/></td><td><input type="number" min={0} value={c.estimatedHours} onChange={e=>upC(c.id,{estimatedHours:+e.target.value})}/></td><td>{priority(c,st.tasks,today).score.toFixed(0)}</td>
      <td><button className="ghost" onClick={()=>set({courses:st.courses.filter(x=>x.id!==c.id),tasks:st.tasks.filter(t=>t.courseId!==c.id)})}>Delete</button></td></tr>)}</tbody></table></div>
    <Form label="Add course" fields={[{k:'name',l:'Name'},{k:'code',l:'Code'},{k:'diff',l:'Difficulty',o:['Easy','Medium','Hard'],d:'Medium'},{k:'und',l:'Understanding',o:['Low','Medium','High'],d:'Medium'},{k:'imp',l:'Importance 1-5',t:'number',d:'3'},{k:'h',l:'Prep hours',t:'number',d:'6'}]}
      onSubmit={v=>{if(!v.name||!v.code)return;set({courses:[...st.courses,{id:Math.random().toString(36).slice(2,9),name:v.name,code:v.code,difficulty:(['Easy','Medium','Hard'].indexOf(v.diff)+1) as 1,understanding:(['Low','Medium','High'].indexOf(v.und)+1) as 1,importance:Math.min(5,Math.max(1,+v.imp)) as 1,estimatedHours:+v.h}]})}}/>
    <button className="ghost" onClick={()=>{const add:Task[]=[];st.events.filter(e=>isExam(e.type)).forEach(e=>{const c=courseFor(e.title);if(c&&!st.tasks.some(t=>t.deadline===e.date&&t.courseId===c.id&&t.type===e.type))add.push({id:Math.random().toString(36).slice(2,9),title:e.title,courseId:c.id,type:e.type as 'cie',deadline:e.date!,estimatedHours:0,status:'pending'})});set({tasks:[...st.tasks,...add]});alert(`${add.length} exam task(s) created from imported CIE/SIE entries`)}}>Create exam tasks from imported CIE/SIE entries</button>
    <button onClick={()=>go('Deadlines')}>Next: deadlines →</button></section>
}
