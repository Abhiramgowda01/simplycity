import {useStore} from '../hooks/useStore'
import {dedupe} from '../engine'
import {exportSchedule,importSchedule} from '../services/shareService'
import Onboarding from './Onboarding'
export default function Settings(){
  const{st,set,reset,dark,setDark}=useStore()
  const dl=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([exportSchedule(st.events)],{type:'application/json'}));a.download='smartstudy-schedule.json';a.click()}
  const imp=async(f?:File)=>{if(!f)return;try{const ev=importSchedule(await f.text());set({events:dedupe([...st.events,...ev]).kept});alert(`${ev.length} shared entries imported (unverified — review them).`)}catch(e:any){alert(e.message)}}
  return <><Onboarding/><section><h3>Preferences</h3><label className="chk"><input type="checkbox" checked={dark} onChange={e=>setDark(e.target.checked)}/>Dark mode</label></section>
    <section><h3>Share schedule (class representatives)</h3><div className="row"><button onClick={dl}>Export fixed commitments</button><label>Import a shared file<input type="file" accept=".json" onChange={e=>imp(e.target.files?.[0])}/></label></div></section>
    <section><h3>Data</h3><button className="ghost" onClick={()=>confirm('Erase all data in this mode?')&&reset()}>Reset data</button></section></>
}
