import {useStore} from '../hooks/useStore'
export default function Onboarding(){
  const{st,set,go}=useStore()
  const L:Record<string,string>={name:'Student name',college:'College',dept:'Department',year:'Academic year',sem:'Semester'}
  return <section><h3>Create your profile</h3><div className="row">{(Object.keys(L) as (keyof typeof st.profile)[]).map(k=><label key={k}>{L[k]}<input value={st.profile[k]} onChange={e=>set({profile:{...st.profile,[k]:e.target.value}})}/></label>)}</div>
    <button onClick={()=>{set({onboarded:true});go('Upload')}}>Continue to document upload</button></section>
}
