import {Ev,Course,Task,Prefs,hm} from './engine'
let n=0;const E=(title:string,type:Ev['type'],source:string,dd:number|string,s:string,e:string):Ev=>({id:'d'+n++,title,type,source,dow:typeof dd==='number'?dd:undefined,date:typeof dd==='string'?dd:undefined,start:hm(s),end:hm(e),recurring:typeof dd==='number',fixed:true,verified:true})
export const TODAY='2026-11-13'
const tt:Ev[]=[]
for(const d of [1,2,3,4,5]){const f='demo-timetable.csv';tt.push(E('DSA Lecture','class',f,d,'09:00','10:00'),E('DBMS Lecture','class',f,d,'10:00','11:00'),E('Maths Lecture','class',f,d,'11:15','12:15'),E(d%2?'OS Lecture':'Networks Lecture','class',f,d,'13:00','14:00'),E('Lab','lab',f,d,'14:00','16:00'))}
export const demoEvents:Ev[]=[...tt,
 E('Technical Workshop','event','demo-calendar.ics','2026-11-20','10:00','13:00'),
 E('Diwali Holiday','holiday','demo-calendar.ics','2026-11-27','00:00','23:59'),
 E('DSA CIE-2','cie','demo-cie.csv','2026-11-23','09:00','12:00'),
 E('DBMS CIE-2','cie','demo-cie.csv','2026-11-25','09:00','12:00'),
 E('DSA SIE','sie','demo-sie.csv','2026-12-04','14:00','17:00'),
 E('OS SIE','sie','demo-sie.csv','2026-12-08','14:00','17:00'),
 E('Mathematics SIE','sie','demo-sie.csv','2026-12-10','14:00','17:00'),
 E('DBMS SIE','sie','demo-sie.csv','2026-12-12','14:00','17:00'),
 E('Networks SIE','sie','demo-sie.csv','2026-12-14','14:00','17:00')]
export const demoCourses:Course[]=[
 {id:'dsa',name:'Data Structures and Algorithms',code:'CS201',difficulty:3,understanding:1,importance:5,estimatedHours:12},
 {id:'dbms',name:'Database Systems',code:'CS202',difficulty:2,understanding:2,importance:4,estimatedHours:8},
 {id:'math',name:'Mathematics',code:'MA201',difficulty:3,understanding:2,importance:4,estimatedHours:10},
 {id:'os',name:'Operating Systems',code:'CS203',difficulty:2,understanding:3,importance:3,estimatedHours:6},
 {id:'net',name:'Computer Networks',code:'CS204',difficulty:1,understanding:3,importance:2,estimatedHours:5}]
const T=(id:string,title:string,courseId:string,type:Task['type'],deadline:string,estimatedHours:number):Task=>({id,title,courseId,type,deadline,estimatedHours,status:'pending'})
export const demoTasks:Task[]=[
 T('t1','DSA CIE-2','dsa','cie','2026-11-23',0),T('t2','DBMS CIE-2','dbms','cie','2026-11-25',0),
 T('t3','DSA SIE','dsa','sie','2026-12-04',0),T('t4','OS SIE','os','sie','2026-12-08',0),T('t5','Mathematics SIE','math','sie','2026-12-10',0),
 T('t6','DBMS SIE','dbms','sie','2026-12-12',0),T('t7','Networks SIE','net','sie','2026-12-14',0),
 T('t8','DBMS Assignment 3','dbms','assignment','2026-11-18',3),T('t9','Maths Quiz Prep','math','quiz','2026-11-20',2),T('t10','OS Lab Record','os','project','2026-11-30',3)]
export const defaultPrefs:Prefs={startDate:TODAY,endDate:'2026-12-15',start:hm('17:00'),end:hm('22:00'),dailyTarget:3,session:60,breakMin:10,studyDays:[0,1,2,3,4,5,6],unavailable:[{start:hm('19:30'),end:hm('20:15')}]}
