import {useStore} from '../../hooks/useStore'
import Form from '../upload/Form'
export default function TaskForm(){
  const{st,set,today}=useStore()
  if(!st.courses.length)return <p className="muted">Add a course first.</p>
  return <Form label="Add task" fields={[{k:'title',l:'Title'},{k:'course',l:'Course',o:st.courses.map(c=>c.code)},{k:'type',l:'Type',o:['assignment','quiz','project','cie','sie','other']},{k:'dl',l:'Deadline',t:'date',d:today},{k:'h',l:'Hours',t:'number',d:'2'}]}
    onSubmit={v=>{if(!v.title)return;set({tasks:[...st.tasks,{id:Math.random().toString(36).slice(2,9),title:v.title,courseId:st.courses.find(c=>c.code===v.course)!.id,type:v.type as 'other',deadline:v.dl,estimatedHours:+v.h,status:'pending'}]})}}/>
}
