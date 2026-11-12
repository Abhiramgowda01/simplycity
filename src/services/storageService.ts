import {Ev,Course,Task,Prefs,Session,Result,Profile} from '../types'
import {demoEvents,demoCourses,demoTasks,defaultPrefs} from '../data/demo'
import {addDays} from '../utils/time'
export interface State{profile:Profile;events:Ev[];courses:Course[];tasks:Task[];prefs:Prefs;sessions:Session[];report:Result|null;layers:Record<string,boolean>;onboarded:boolean}
export const realToday=()=>new Date().toISOString().slice(0,10)
const layers={class:true,event:true,cie:true,sie:true,personal:true,study:true,free:true}
export const blankState=():State=>({profile:{name:'',college:'',dept:'',year:'',sem:''},events:[],courses:[],tasks:[],prefs:{...defaultPrefs,unavailable:[],startDate:realToday(),endDate:addDays(realToday(),30)},sessions:[],report:null,layers,onboarded:false})
export const demoState=():State=>({profile:{name:'Demo Student',college:'Demo College',dept:'CSE',year:'2',sem:'3'},events:demoEvents,courses:demoCourses,tasks:demoTasks,prefs:defaultPrefs,sessions:[],report:null,layers,onboarded:true})
const key=(demo:boolean)=>demo?'smartstudy:demo':'smartstudy:user'
export const getMode=()=>localStorage.getItem('smartstudy:mode')==='demo'
export const setMode=(d:boolean)=>localStorage.setItem('smartstudy:mode',d?'demo':'user')
export function loadState(demo:boolean):State{const base=demo?demoState():blankState();try{const s=localStorage.getItem(key(demo));return s?{...base,...JSON.parse(s)}:base}catch{return base}}
export const saveState=(demo:boolean,s:State)=>localStorage.setItem(key(demo),JSON.stringify(s))
export const clearState=(demo:boolean)=>localStorage.removeItem(key(demo))
