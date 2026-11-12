import {createContext,useContext,useEffect,useMemo,useState,ReactNode} from 'react'
import {Session,Course,detectConflicts,validate,generate} from '../engine'
import {State,loadState,saveState,getMode,setMode,realToday,clearState,blankState,demoState} from '../services/storageService'
import {TODAY} from '../data/demo'
export const PALETTE=['#99e0d5','#f5a8e0','#b8c7fa','#fdb99a','#fde68a','#c4b5fd','#a7f3d0','#fca5a5']
export type Page='Landing'|'Onboarding'|'Upload'|'Analysis'|'Review'|'Setup'|'Planner'|'Dashboard'|'Courses'|'Deadlines'|'Plan'|'Progress'|'Settings'
interface Ctx{st:State;set:(p:Partial<State>)=>void;demo:boolean;toggleDemo:(d:boolean)=>void;today:string;page:Page;go:(p:Page)=>void;log:string[];setLog:(l:string[])=>void;dark:boolean;setDark:(d:boolean)=>void
  colorOf:(courseId?:string)=>string;cname:(id:string)=>string;conflicts:ReturnType<typeof detectConflicts>;issues:string[];generateNow:()=>void;mark:(id:string,s:Session['status'])=>void;reset:()=>void;courseFor:(title:string)=>Course|undefined}
const C=createContext<Ctx>(null as any)
export const useStore=()=>useContext(C)
export function StoreProvider({children}:{children:ReactNode}){
  const[demo,setDemo]=useState(getMode)
  const[st,setSt]=useState<State>(()=>loadState(getMode()))
  const[page,go]=useState<Page>(()=>{const s=loadState(getMode());return s.onboarded||s.events.length||s.courses.length?'Planner':'Landing'})
  const[log,setLog]=useState<string[]>([]);const[dark,setDark]=useState(false)
  const today=demo?TODAY:realToday()
  useEffect(()=>saveState(demo,st),[st,demo])
  useEffect(()=>{document.documentElement.dataset.theme=dark?'dark':'light'},[dark])
  const set=(p:Partial<State>)=>setSt(s=>({...s,...p}))
  const toggleDemo=(d:boolean)=>{setMode(d);setDemo(d);setSt(loadState(d));setLog([]);go(d?'Planner':'Landing')}
  const colorOf=(id?:string)=>{const i=st.courses.findIndex(c=>c.id===id);return i<0?'#e5e7eb':st.courses[i].color??PALETTE[i%PALETTE.length]}
  const cname=(id:string)=>st.courses.find(c=>c.id===id)?.name??'?'
  const courseFor=(t:string)=>{const l=t.toLowerCase();return st.courses.find(c=>l.includes(c.code.toLowerCase())||l.includes(c.name.toLowerCase().split(' ')[0]))}
  const conflicts=useMemo(()=>detectConflicts(st.events),[st.events])
  const issues=useMemo(()=>validate(st.sessions,st.events,st.tasks,st.prefs),[st])
  const generateNow=()=>{const locked=st.sessions.filter(s=>s.status==='done');const r=generate({events:st.events,courses:st.courses,tasks:st.tasks,prefs:st.prefs,today,locked,from:today});set({sessions:[...locked,...r.sessions],report:r})}
  const mark=(id:string,status:Session['status'])=>setSt(s=>({...s,sessions:s.sessions.map(x=>x.id===id?{...x,status}:x)}))
  const reset=()=>{clearState(demo);setSt(demo?demoState():blankState());go(demo?'Planner':'Landing')}
  return <C.Provider value={{st,set,demo,toggleDemo,today,page,go,log,setLog,dark,setDark,colorOf,cname,conflicts,issues,generateNow,mark,reset,courseFor}}>{children}</C.Provider>
}
