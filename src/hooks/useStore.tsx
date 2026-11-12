import {createContext,useContext,useEffect,useMemo,useState,ReactNode} from 'react'
import {Session,Course,Task,Ev,detectConflicts,validate,generate,dedupe} from '../engine'
import {State,loadState,saveState,getMode,setMode,realToday,clearState,blankState,demoState} from '../services/storageService'
import {TODAY} from '../data/demo'
import {MITE_TIMETABLE_EVENTS, MITE_COURSES, MITE_CIE_EVENTS, MITE_ACADEMIC_EVENTS, MITE_TASKS} from '../data/miteTimetable'

export const PALETTE=['#b8c7fa','#c4b5fd','#99e0d5','#fdb99a','#fde68a','#a7f3d0','#f5a8e0','#fca5a5']

export type Page=
  | 'MyWeek'
  | 'Calendar'
  | 'StudyPlan'
  | 'Courses'
  | 'Tasks'
  | 'Timetable'
  | 'CIE'
  | 'SIE'
  | 'Events'
  | 'Documents'
  | 'Progress'
  | 'Settings'
  | 'Setup'
  | 'Landing'
  | 'Onboarding'
  // Legacy aliases
  | 'Planner'
  | 'Dashboard'
  | 'Deadlines'
  | 'Plan'
  | 'Upload'
  | 'Analysis'
  | 'Review'

export interface EventStyle {
  bg: string
  border: string
  text: string
  label: string
}

export const EVENT_STYLES: Record<string, EventStyle> = {
  class: { bg: '#E0EDFD', border: '#BFDBFE', text: '#1E40AF', label: 'Lecture' },
  lab: { bg: '#EDE9FE', border: '#DDD6FE', text: '#5B21B6', label: 'Laboratory' },
  study: { bg: '#DCFCE7', border: '#BBF7D0', text: '#166534', label: 'Study Session' },
  cie: { bg: '#FFEDD5', border: '#FED7AA', text: '#9A3412', label: 'CIE Examination' },
  sie: { bg: '#FEE2E2', border: '#FECACA', text: '#991B1B', label: 'SIE Examination' },
  assignment: { bg: '#FEF9C3', border: '#FEF08A', text: '#854D0E', label: 'Assignment' },
  event: { bg: '#CCFBF1', border: '#99F6E4', text: '#115E59', label: 'College Event' },
  holiday: { bg: '#F3F4F6', border: '#E5E7EB', text: '#4B5563', label: 'Holiday' },
  personal: { bg: '#F3F4F6', border: '#E5E7EB', text: '#374151', label: 'Personal' }
}

interface Ctx{
  st:State;
  set:(p:Partial<State>)=>void;
  demo:boolean;
  toggleDemo:(d:boolean)=>void;
  today:string;
  page:Page;
  go:(p:Page)=>void;
  log:string[];
  setLog:(l:string[])=>void;
  dark:boolean;
  setDark:(d:boolean)=>void;
  sidebarCollapsed:boolean;
  setSidebarCollapsed:(c:boolean)=>void;
  colorOf:(courseId?:string)=>string;
  cname:(id:string)=>string;
  conflicts:ReturnType<typeof detectConflicts>;
  issues:string[];
  generateNow:()=>void;
  mark:(id:string,s:Session['status'])=>void;
  reset:()=>void;
  courseFor:(title:string)=>Course|undefined;
  loadMiteData:()=>void;
}

const C=createContext<Ctx>(null as any)
export const useStore=()=>useContext(C)

export function StoreProvider({children}:{children:ReactNode}){
  const[demo,setDemo]=useState(getMode)
  const[st,setSt]=useState<State>(()=>loadState(getMode()))
  // Default to MyWeek after onboarding or when data exists
  const[page,go]=useState<Page>(()=>{
    const s=loadState(getMode())
    return s.onboarded||s.events.length||s.courses.length?'MyWeek':'Landing'
  })
  const[log,setLog]=useState<string[]>([])
  const[dark,setDark]=useState(false)
  const[sidebarCollapsed,setSidebarCollapsed]=useState(false)

  const today=demo?TODAY:realToday()

  useEffect(()=>saveState(demo,st),[st,demo])
  useEffect(()=>{document.documentElement.dataset.theme=dark?'dark':'light'},[dark])

  const set=(p:Partial<State>)=>setSt(s=>({...s,...p}))

  const toggleDemo=(d:boolean)=>{
    setMode(d)
    setDemo(d)
    setSt(loadState(d))
    setLog([])
    go(d?'MyWeek':'Landing')
  }

  const colorOf=(id?:string)=>{
    const i=st.courses.findIndex(c=>c.id===id)
    return i<0?'#E0EDFD':st.courses[i].color??PALETTE[i%PALETTE.length]
  }

  const cname=(id:string)=>st.courses.find(c=>c.id===id)?.name??'?'

  const courseFor=(t:string)=>{
    const l=t.toLowerCase()
    return st.courses.find(c=>l.includes(c.code.toLowerCase())||l.includes(c.name.toLowerCase().split(' ')[0]))
  }

  const conflicts=useMemo(()=>detectConflicts(st.events),[st.events])
  const issues=useMemo(()=>validate(st.sessions,st.events,st.tasks,st.prefs),[st])

  const generateNow=()=>{
    const locked=st.sessions.filter(s=>s.status==='done')
    const r=generate({events:st.events,courses:st.courses,tasks:st.tasks,prefs:st.prefs,today,locked,from:today})
    set({sessions:[...locked,...r.sessions],report:r})
  }

  const mark=(id:string,status:Session['status'])=>
    setSt(s=>({...s,sessions:s.sessions.map(x=>x.id===id?{...x,status}:x)}))

  const reset=()=>{
    clearState(demo)
    setSt(demo?demoState():blankState())
    go(demo?'MyWeek':'Landing')
  }

  const loadMiteData=()=>{
    const combinedEvents = dedupe([...MITE_TIMETABLE_EVENTS, ...MITE_CIE_EVENTS, ...MITE_ACADEMIC_EVENTS]).kept
    setSt(s => ({
      ...s,
      profile: {
        name: 'Abhiram (CSE1)',
        college: 'Mangalore Institute of Technology & Engineering',
        dept: 'Computer Science & Engineering',
        year: '3',
        sem: '5'
      },
      events: combinedEvents,
      courses: MITE_COURSES,
      tasks: MITE_TASKS,
      onboarded: true
    }))
    setLog(['MITE CSE Semester 5 Timetable & Courses successfully loaded!'])
    go('MyWeek')
  }

  return (
    <C.Provider value={{
      st,set,demo,toggleDemo,today,page,go,log,setLog,
      dark,setDark,sidebarCollapsed,setSidebarCollapsed,
      colorOf,cname,conflicts,issues,generateNow,mark,reset,
      courseFor,loadMiteData
    }}>
      {children}
    </C.Provider>
  )
}
