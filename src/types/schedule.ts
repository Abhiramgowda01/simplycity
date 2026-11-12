import {Ev} from './academicEvent'
import {Course} from './course'
import {Task} from './deadline'
export interface Unavail{start:number;end:number;days?:number[];label?:string}
export interface Prefs{startDate:string;endDate:string;start:number;end:number;dailyTarget:number;session:number;breakMin:number;studyDays:number[];unavailable:Unavail[]}
export interface Session{id:string;courseId:string;taskId?:string;date:string;start:number;end:number;status:'planned'|'done'|'missed';kind:'study'|'revision';notes?:string}
export interface Input{events:Ev[];courses:Course[];tasks:Task[];prefs:Prefs;locked:Session[];today:string;from?:string}
export interface Result{sessions:Session[];unscheduled:{key:string;courseId:string;minutes:number}[];requiredMin:number;scheduledMin:number}
