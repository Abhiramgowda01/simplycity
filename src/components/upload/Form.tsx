import {useState} from 'react'
export interface Field{k:string;l:string;t?:string;o?:string[];d?:string}
export default function Form({fields,onSubmit,label}:{fields:Field[];onSubmit:(v:Record<string,string>)=>void;label:string}){
  const init=()=>Object.fromEntries(fields.map(f=>[f.k,f.d??(f.o?f.o[0]:'')]))
  const[v,setV]=useState(init)
  return <div className="row">{fields.map(f=><label key={f.k}>{f.l}{f.o?<select value={v[f.k]} onChange={e=>setV({...v,[f.k]:e.target.value})}>{f.o.map(o=><option key={o}>{o}</option>)}</select>:<input type={f.t??'text'} value={v[f.k]} onChange={e=>setV({...v,[f.k]:e.target.value})}/>}</label>)}<button onClick={()=>{onSubmit(v);setV(init())}}>{label}</button></div>
}
