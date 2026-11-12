import {useEffect,useMemo,useState} from 'react'
import {Ev,EType,Course,Task,Prefs,Session,Result,generate,reschedule,validate,detectConflicts,dedupe,priority,busyFor,freeSlots,datesBetween,dayDiff,isExam,fmt,hm,dowOf} from './engine'
import {parseCSV,parseICS,dayName} from './importers'
import {demoEvents,demoCourses,demoTasks,defaultPrefs,TODAY} from './demo'

interface State{profile:{name:string;college:string;dept:string;year:string;sem:string};events:Ev[];courses:Course[];tasks:Task[];prefs:Prefs;sessions:Session[];report:Result|null}
const real=new Date().toISOString().slice(0,10)
const blank:State={profile:{name:'',college:'',dept:'',year:'',sem:''},events:[],courses:[],tasks:[],prefs:{...defaultPrefs,startDate:real,endDate:new Date(Date.now()+30*864e5).toISOString().slice(0,10)},sessions:[],report:null}
const demoState:State={profile:{name:'Demo Student',college:'Demo College',dept:'CSE',year:'2',sem:'3'},events:demoEvents,courses:demoCourses,tasks:demoTasks,prefs:defaultPrefs,sessions:[],report:null}
const load=(demo:boolean):State=>{try{const s=localStorage.getItem(demo?'smartstudy:demo':'smartstudy:user');return s?JSON.parse(s):(demo?demoState:blank)}catch{return demo?demoState:blank}}
const uid=()=>Math.random().toString(36).slice(2,10)
const TABS=['Dashboard','Import','Preferences','Courses & Tasks','Study Plan','Calendar','Progress'] as const
const CATS:[string,EType][]=[['Regular timetable (classes)','class'],['Event calendar','event'],['CIE timetable','cie'],['SIE timetable','sie'],['Additional schedule','personal']]

function Form({fields,onSubmit,label}:{fields:{k:string;l:string;t?:string;o?:string[];d?:string}[];onSubmit:(v:Record<string,string>)=>void;label:string}){
  const init=()=>Object.fromEntries(fields.map(f=>[f.k,f.d??(f.o?f.o[0]:'')]))
  const[v,setV]=useState(init)
  return <div className="row">{fields.map(f=><label key={f.k}>{f.l}{f.o?<select value={v[f.k]} onChange={e=>setV({...v,[f.k]:e.target.value})}>{f.o.map(o=><option key={o}>{o}</option>)}</select>:<input type={f.t??'text'} value={v[f.k]} onChange={e=>setV({...v,[f.k]:e.target.value})}/>}</label>)}<button onClick={()=>{onSubmit(v);setV(init())}}>{label}</button></div>
}

export default function App(){
  const[demo,setDemo]=useState(()=>localStorage.getItem('smartstudy:mode')==='demo')
  const[st,setSt]=useState<State>(()=>load(demo))
  const[tab,setTab]=useState<string>('Dashboard')
  const[msg,setMsg]=useState<string[]>([])
  const[preview,setPreview]=useState<ReturnType<typeof reschedule>|null>(null)
  const[dark,setDark]=useState(false)
  const today=demo?TODAY:real
  useEffect(()=>{localStorage.setItem(demo?'smartstudy:demo':'smartstudy:user',JSON.stringify(st))},[st,demo])
  useEffect(()=>{document.documentElement.dataset.theme=dark?'dark':'light'},[dark])
  const set=(p:Partial<State>)=>setSt(s=>({...s,...p}))
  const toggleDemo=(d:boolean)=>{localStorage.setItem('smartstudy:mode',d?'demo':'user');setDemo(d);setSt(load(d));setPreview(null);setMsg([])}
  const cname=(id:string)=>st.courses.find(c=>c.id===id)?.name??'?'
  const inp={events:st.events,courses:st.courses,tasks:st.tasks,prefs:st.prefs,today}
  const conflicts=useMemo(()=>detectConflicts(st.events),[st.events])
  const issues=useMemo(()=>validate(st.sessions,st.events,st.tasks,st.prefs),[st])
  const doGenerate=()=>{const locked=st.sessions.filter(s=>s.status==='done');const r=generate({...inp,locked,from:today});set({sessions:[...locked,...r.sessions],report:r})}
  const mark=(id:string,status:Session['status'])=>set({sessions:st.sessions.map(s=>s.id===id?{...s,status}:s)})
  const sessionsOn=(d:string)=>st.sessions.filter(s=>s.date===d&&s.status!=='missed').sort((a,b)=>a.start-b.start)
  const upd=(sel:Partial<State>)=>set(sel)

  const Dash=()=>{
    const busy=busyFor(st.events,today),slots=freeSlots(today,busy,st.prefs),free=slots.reduce((a,[s,e])=>a+e-s,0)
    const planned=sessionsOn(today).reduce((a,s)=>a+s.end-s.start,0)
    const wk=st.sessions.filter(s=>s.date>=today&&dayDiff(today,s.date)<7)
    const upcoming=st.tasks.filter(t=>t.status!=='done'&&t.deadline>=today).sort((a,b)=>a.deadline.localeCompare(b.deadline))
    const nxt=st.sessions.filter(s=>s.status==='planned'&&s.date>=today).sort((a,b)=>(a.date+fmt(a.start)).localeCompare(b.date+fmt(b.start)))[0]
    const mins:Record<string,number>={};st.sessions.filter(s=>s.status!=='missed').forEach(s=>mins[s.courseId]=(mins[s.courseId]||0)+s.end-s.start)
    const max=Math.max(1,...Object.values(mins))
    return <>
      <div className="cards">
        <Card l="Today's classes" v={busy.filter(b=>!/holiday/i.test(b.title)).length}/><Card l="Free hours today" v={(free/60).toFixed(1)}/><Card l="Scheduled today" v={(planned/60).toFixed(1)+'h'}/>
        <Card l="Pending tasks" v={upcoming.filter(t=>!isExam(t.type)).length}/><Card l="Upcoming CIE" v={upcoming.filter(t=>t.type==='cie').length}/><Card l="Upcoming SIE" v={upcoming.filter(t=>t.type==='sie').length}/>
        <Card l="Sessions done" v={st.sessions.filter(s=>s.status==='done').length}/><Card l="Next 7 days done" v={wk.length?Math.round(100*wk.filter(s=>s.status==='done').length/wk.length)+'%':'0%'}/></div>
      {st.report&&st.report.unscheduled.length>0&&<div className="warn">Workload warning: {Math.round(st.report.unscheduled.reduce((a,u)=>a+u.minutes,0)/60*10)/10}h of preparation could not be scheduled. See Study Plan.</div>}
      <div className="grid2">
        <section><h3>Next recommended</h3>{nxt?<p><b>{cname(nxt.courseId)}</b> — {nxt.date} {fmt(nxt.start)}–{fmt(nxt.end)} ({nxt.kind})</p>:<p>No planned sessions. Generate a plan.</p>}
          <h3>Today's schedule</h3>{sessionsOn(today).map(s=><div key={s.id}>{fmt(s.start)}–{fmt(s.end)} {cname(s.courseId)} <i>{s.status}</i></div>)||null}{!sessionsOn(today).length&&<p>Nothing scheduled.</p>}
          <h3>Today's commitments</h3>{busy.map(b=><div key={b.id}>{fmt(b.s)}–{fmt(Math.min(b.e,1439))} {b.title}</div>)}{!busy.length&&<p>None.</p>}</section>
        <section><h3>Countdowns & deadlines</h3>{upcoming.slice(0,8).map(t=>{const d=dayDiff(today,t.deadline);return <div key={t.id}><span className={'tag '+t.type}>{t.type}</span> {t.title} — {d===0?'today':d+' days'}{d<=1?' ⚠':''}</div>})}
          <h3>Study distribution (planned+done)</h3>{st.courses.map(c=><div key={c.id} className="bar"><span>{c.code}</span><i style={{width:(100*(mins[c.id]||0)/max)+'%'}}/><span>{((mins[c.id]||0)/60).toFixed(1)}h</span></div>)}</section></div></>
  }
  const Import=()=>{
    const[cat,setCat]=useState<EType>('class')
    const onFiles=async(fs:FileList|null)=>{
      if(!fs)return;let all:Ev[]=[];const out:string[]=[]
      for(const f of Array.from(fs)){
        const ext=f.name.split('.').pop()!.toLowerCase()
        if(['csv','ics'].includes(ext)){const t=await f.text();const r=ext==='csv'?parseCSV(t,f.name,cat):parseICS(t,f.name,cat);all=all.concat(r.events);out.push(`${f.name}: ${r.events.length} entries`,...r.errors)}
        else out.push(`${f.name}: ${['pdf','jpg','jpeg','png'].includes(ext)?'PDF/image OCR is not implemented in this prototype — convert to CSV or add entries manually.':'unsupported format'}`)
      }
      const d=dedupe([...st.events,...all]);set({events:d.kept});setMsg([...out,d.dropped.length?`${d.dropped.length} duplicate(s) ignored`:''].filter(Boolean))
    }
    return <>
      <section><h3>Upload academic schedules (CSV / ICS)</h3><p className="muted">CSV columns: <code>title,day_or_date,start,end[,type]</code> — e.g. <code>DSA Lecture,Mon,09:00,10:00</code> or <code>DSA CIE,2026-11-23,09:00,12:00</code>. Skip any category you don't have.</p>
        <div className="row"><label>Document type<select value={cat} onChange={e=>setCat(e.target.value as EType)}>{CATS.map(([l,v])=><option key={v} value={v}>{l}</option>)}</select></label><input type="file" multiple accept=".csv,.ics,.pdf,.png,.jpg,.jpeg" onChange={e=>onFiles(e.target.files)}/></div>
        {msg.map((m,i)=><div key={i} className="note">{m}</div>)}</section>
      <section><h3>Add entry manually</h3><Form label="Add" fields={[{k:'title',l:'Title'},{k:'type',l:'Type',o:['class','lab','event','holiday','cie','sie','personal']},{k:'when',l:'Day (Mon..) or date',d:'Mon'},{k:'s',l:'Start',t:'time',d:'09:00'},{k:'e',l:'End',t:'time',d:'10:00'}]} onSubmit={v=>{const r=parseCSV(`${v.title},${v.when},${v.s},${v.e},${v.type}`,'manual',v.type as EType);if(r.errors.length)return setMsg(r.errors);set({events:dedupe([...st.events,...r.events.map(e=>({...e,verified:true}))]).kept})}}/></section>
      <section><h3>Review combined schedule ({st.events.length})</h3>
        {conflicts.length>0&&<div className="warn"><b>{conflicts.length} conflict(s)</b> — review before planning:{conflicts.map(([a,b],i)=><div key={i}>{a.title} ({a.source}) ⟷ {b.title} ({b.source}) — {a.recurring?dayName(a.dow!):a.date}/{b.recurring?dayName(b.dow!):b.date}</div>)}</div>}
        <table><thead><tr><th>Title</th><th>Type</th><th>When</th><th>Time</th><th>Source</th><th>Blocks study</th><th>Verified</th><th></th></tr></thead><tbody>
        {[...st.events].sort((a,b)=>(a.date??'0')<(b.date??'0')?-1:1).map(e=><tr key={e.id}><td><input value={e.title} onChange={x=>set({events:st.events.map(y=>y.id===e.id?{...y,title:x.target.value}:y)})}/></td><td>{e.type}</td><td>{e.recurring?'Every '+dayName(e.dow!):e.date}</td><td>{fmt(e.start)}–{fmt(e.end>=1440?1439:e.end)}</td><td>{e.source}</td>
          <td><input type="checkbox" checked={e.fixed} onChange={x=>set({events:st.events.map(y=>y.id===e.id?{...y,fixed:x.target.checked}:y)})}/></td><td><input type="checkbox" checked={e.verified} onChange={x=>set({events:st.events.map(y=>y.id===e.id?{...y,verified:x.target.checked}:y)})}/></td>
          <td><button className="ghost" onClick={()=>set({events:st.events.filter(y=>y.id!==e.id)})}>Delete</button></td></tr>)}</tbody></table></section></>
  }
  const Prefs=()=>{
    const p=st.prefs,sp=(x:Partial<Prefs>)=>set({prefs:{...p,...x}})
    return <section><h3>Profile</h3><div className="row">{(['name','college','dept','year','sem'] as const).map(k=><label key={k}>{k}<input value={st.profile[k]} onChange={e=>set({profile:{...st.profile,[k]:e.target.value}})}/></label>)}</div>
      <h3>Study period & timings</h3><div className="row">
        <label>Plan start<input type="date" value={p.startDate} onChange={e=>sp({startDate:e.target.value})}/></label><label>Plan end<input type="date" value={p.endDate} onChange={e=>sp({endDate:e.target.value})}/></label>
        <label>Earliest<input type="time" value={fmt(p.start)} onChange={e=>sp({start:hm(e.target.value)})}/></label><label>Latest<input type="time" value={fmt(p.end)} onChange={e=>sp({end:hm(e.target.value)})}/></label>
        <label>Hours/day<input type="number" min={0.5} step={0.5} value={p.dailyTarget} onChange={e=>sp({dailyTarget:+e.target.value})}/></label>
        <label>Session (min)<input type="number" min={30} step={15} value={p.session} onChange={e=>sp({session:+e.target.value})}/></label><label>Break (min)<input type="number" min={0} step={5} value={p.breakMin} onChange={e=>sp({breakMin:+e.target.value})}/></label></div>
      <h3>Study days</h3><div className="row">{[1,2,3,4,5,6,0].map(d=><label key={d} className="chk"><input type="checkbox" checked={p.studyDays.includes(d)} onChange={e=>sp({studyDays:e.target.checked?[...p.studyDays,d]:p.studyDays.filter(x=>x!==d)})}/>{dayName(d)}</label>)}</div>
      <h3>Unavailable periods (meals, travel, sports…)</h3>{p.unavailable.map((u,i)=><div key={i}>{fmt(u.start)}–{fmt(u.end)} {u.days?u.days.map(dayName).join(','):'every day'} <button className="ghost" onClick={()=>sp({unavailable:p.unavailable.filter((_,j)=>j!==i)})}>Remove</button></div>)}
      <Form label="Add" fields={[{k:'s',l:'From',t:'time',d:'13:00'},{k:'e',l:'To',t:'time',d:'14:00'},{k:'d',l:'Day (blank = every day)',d:''}]} onSubmit={v=>{const di=v.d?[['sun','mon','tue','wed','thu','fri','sat'].indexOf(v.d.slice(0,3).toLowerCase())].filter(x=>x>=0):undefined;sp({unavailable:[...p.unavailable,{start:hm(v.s),end:hm(v.e),days:di}]})}}/></section>
  }
  const Courses=()=>{
    const matchCourse=(title:string)=>st.courses.find(c=>title.toLowerCase().includes(c.code.toLowerCase())||title.toLowerCase().includes(c.name.toLowerCase().split(' ')[0]))
    return <>
    <section><h3>Courses</h3><table><thead><tr><th>Name</th><th>Code</th><th>Difficulty</th><th>Understanding</th><th>Importance</th><th>Prep h</th><th>Priority</th><th></th></tr></thead><tbody>
      {st.courses.map(c=><tr key={c.id}><td>{c.name}</td><td>{c.code}</td><td>{['','Easy','Medium','Hard'][c.difficulty]}</td><td>{['','Low','Medium','High'][c.understanding]}</td><td>{c.importance}</td>
        <td><input type="number" value={c.estimatedHours} onChange={e=>set({courses:st.courses.map(x=>x.id===c.id?{...x,estimatedHours:+e.target.value}:x)})}/></td><td>{priority(c,st.tasks,today).score.toFixed(0)}</td><td><button className="ghost" onClick={()=>set({courses:st.courses.filter(x=>x.id!==c.id),tasks:st.tasks.filter(t=>t.courseId!==c.id)})}>Delete</button></td></tr>)}</tbody></table>
      <Form label="Add course" fields={[{k:'name',l:'Name'},{k:'code',l:'Code'},{k:'diff',l:'Difficulty',o:['Easy','Medium','Hard'],d:'Medium'},{k:'und',l:'Understanding',o:['Low','Medium','High'],d:'Medium'},{k:'imp',l:'Importance 1-5',t:'number',d:'3'},{k:'h',l:'Prep hours',t:'number',d:'6'}]}
        onSubmit={v=>set({courses:[...st.courses,{id:uid(),name:v.name,code:v.code,difficulty:(['Easy','Medium','Hard'].indexOf(v.diff)+1) as 1,understanding:(['Low','Medium','High'].indexOf(v.und)+1) as 1,importance:Math.min(5,Math.max(1,+v.imp)) as 1,estimatedHours:+v.h}]})}/></section>
    <section><h3>Tasks & exams</h3><button onClick={()=>{const add:Task[]=[];st.events.filter(e=>isExam(e.type)).forEach(e=>{const c=matchCourse(e.title);if(c&&!st.tasks.some(t=>t.deadline===e.date&&t.courseId===c.id&&t.type===e.type))add.push({id:uid(),title:e.title,courseId:c.id,type:e.type as 'cie',deadline:e.date!,estimatedHours:0,status:'pending'})});set({tasks:[...st.tasks,...add]});setMsg([`${add.length} exam task(s) created from imported exam timetables`])}}>Create exam tasks from imported CIE/SIE entries</button>{msg.map((m,i)=><div key={i} className="note">{m}</div>)}
      <table><thead><tr><th>Title</th><th>Course</th><th>Type</th><th>Deadline</th><th>Hours</th><th>Due</th><th>Done</th><th></th></tr></thead><tbody>
      {[...st.tasks].sort((a,b)=>a.deadline.localeCompare(b.deadline)).map(t=>{const d=dayDiff(today,t.deadline);const flag=t.status==='done'?'':d<0?'overdue':d<=1?'<24h':d<=3?'≤3d':d<=7?'≤7d':''
        return <tr key={t.id}><td>{t.title}</td><td>{cname(t.courseId)}</td><td><span className={'tag '+t.type}>{t.type}</span></td><td>{t.deadline}</td><td>{t.estimatedHours}</td><td>{flag}</td><td><input type="checkbox" checked={t.status==='done'} onChange={e=>set({tasks:st.tasks.map(x=>x.id===t.id?{...x,status:e.target.checked?'done':'pending'}:x)})}/></td><td><button className="ghost" onClick={()=>set({tasks:st.tasks.filter(x=>x.id!==t.id)})}>Delete</button></td></tr>})}</tbody></table>
      {st.courses.length>0&&<Form label="Add task" fields={[{k:'title',l:'Title'},{k:'course',l:'Course',o:st.courses.map(c=>c.code)},{k:'type',l:'Type',o:['assignment','quiz','project','cie','sie','other']},{k:'dl',l:'Deadline',t:'date',d:today},{k:'h',l:'Hours',t:'number',d:'2'}]} onSubmit={v=>set({tasks:[...st.tasks,{id:uid(),title:v.title,courseId:st.courses.find(c=>c.code===v.course)!.id,type:v.type as 'other',deadline:v.dl,estimatedHours:+v.h,status:'pending'}]})}/>}</section></>
  }
  const Plan=()=>{
    const r=st.report,dates=[...new Set(st.sessions.map(s=>s.date))].sort()
    const excluded=st.tasks.filter(t=>isExam(t.type)&&(t.deadline<st.prefs.startDate||t.deadline>st.prefs.endDate))
    return <>
      <section><div className="row"><button onClick={doGenerate} disabled={!st.courses.length}>Generate study plan</button>
        <button onClick={()=>setPreview(reschedule(inp,st.sessions))} disabled={!st.sessions.length}>Regenerate remaining schedule…</button></div>
        {!st.courses.length&&<p className="muted">Add courses first.</p>}
        {excluded.length>0&&<div className="note">Excluded from plan (outside date range): {excluded.map(t=>t.title).join(', ')}</div>}
        {preview&&<div className="note"><b>Preview:</b> {preview.removed.length} sessions removed, {preview.added.length} added (done/missed/past sessions preserved).<div className="row"><button onClick={()=>{set({sessions:preview.sessions,report:preview});setPreview(null)}}>Apply</button><button className="ghost" onClick={()=>setPreview(null)}>Cancel</button></div></div>}</section>
      {r&&<section><h3>Coverage</h3><p>Required: <b>{(r.requiredMin/60).toFixed(1)}h</b> · Scheduled: <b>{(r.scheduledMin/60).toFixed(1)}h</b> · Unscheduled: <b>{((r.requiredMin-r.scheduledMin)/60>0?r.unscheduled.reduce((a,u)=>a+u.minutes,0)/60:0).toFixed(1)}h</b></p>
        {r.unscheduled.length>0?<div className="warn"><b>Insufficient availability.</b> Not fully covered: {r.unscheduled.map(u=>`${st.tasks.find(t=>t.id===u.key)?.title??cname(u.courseId)+' prep'} (${(u.minutes/60).toFixed(1)}h)`).join('; ')}. Suggestions: raise daily hours, widen the study window, add study days, or lower estimates.</div>:<div className="ok">All preparation requirements are scheduled.</div>}</section>}
      <section><h3>Validation</h3>{st.sessions.length===0?<p className="muted">No plan yet.</p>:issues.length===0?<div className="ok">✔ Clash-free: no overlaps, range/window/target limits respected.</div>:<div className="warn">{issues.slice(0,10).map((x,i)=><div key={i}>{x}</div>)}</div>}</section>
      <section><h3>Sessions</h3>{dates.map(d=><div key={d}><b>{d} ({dayName(dowOf(d))})</b>{st.sessions.filter(s=>s.date===d).sort((a,b)=>a.start-b.start).map(s=><div key={s.id} className={'sess '+s.status}>{fmt(s.start)}–{fmt(s.end)} {cname(s.courseId)}{s.taskId?` · ${st.tasks.find(t=>t.id===s.taskId)?.title}`:''} {s.kind==='revision'&&<span className="tag cie">revision</span>} <i>{s.status}</i>
        <button className="ghost" onClick={()=>mark(s.id,'done')}>Done</button><button className="ghost" onClick={()=>mark(s.id,'missed')}>Missed</button><button className="ghost" onClick={()=>mark(s.id,'planned')}>Reset</button></div>)}</div>)}</section></>
  }
  const Cal=()=>{
    const[off,setOff]=useState(0);const days=datesBetween(new Date(Date.parse(today)+off*7*864e5).toISOString().slice(0,10),new Date(Date.parse(today)+(off*7+6)*864e5).toISOString().slice(0,10))
    return <section><div className="row"><button className="ghost" onClick={()=>setOff(off-1)}>◀ Prev week</button><button className="ghost" onClick={()=>setOff(0)}>This week</button><button className="ghost" onClick={()=>setOff(off+1)}>Next week ▶</button></div>
      <div className="week">{days.map(d=>{const items=[...busyFor(st.events,d).map(b=>({k:b.id,s:b.s,e:Math.min(b.e,1439),t:b.title,c:'busy'})),...sessionsOn(d).map(s=>({k:s.id,s:s.start,e:s.end,t:cname(s.courseId),c:'study '+s.status}))].sort((a,b)=>a.s-b.s)
        return <div key={d} className="day"><b>{dayName(dowOf(d))} {d.slice(5)}</b>{st.tasks.filter(t=>t.deadline===d&&t.status!=='done').map(t=><div key={t.id} className={'tag '+t.type}>{t.title}</div>)}{items.map(i=><div key={i.k} className={'item '+i.c}>{fmt(i.s)}–{fmt(i.e)} {i.t}</div>)}</div>})}</div></section>
  }
  const Progress=()=>{
    const done=st.sessions.filter(s=>s.status==='done'),missed=st.sessions.filter(s=>s.status==='missed')
    const m=(l:Session[])=>l.reduce((a,s)=>a+s.end-s.start,0)/60
    return <section><p>Completed: <b>{done.length}</b> sessions ({m(done).toFixed(1)}h actual) · Missed: <b>{missed.length}</b> ({m(missed).toFixed(1)}h) · Only sessions you mark Done count as progress.</p>
      <table><thead><tr><th>Course</th><th>Done h</th><th>Target h</th><th>Progress</th></tr></thead><tbody>{st.courses.map(c=>{const h=m(done.filter(s=>s.courseId===c.id));return <tr key={c.id}><td>{c.name}</td><td>{h.toFixed(1)}</td><td>{c.estimatedHours}</td><td><div className="bar"><i style={{width:Math.min(100,100*h/Math.max(1,c.estimatedHours))+'%'}}/></div></td></tr>})}</tbody></table>
      <h3>Daily</h3>{[...new Set(done.map(s=>s.date))].sort().map(d=><div key={d}>{d}: {m(done.filter(s=>s.date===d)).toFixed(1)}h</div>)}</section>
  }
  const pages:Record<string,()=>JSX.Element>={Dashboard:Dash,Import,Preferences:Prefs,'Courses & Tasks':Courses,'Study Plan':Plan,Calendar:Cal,Progress}
  const Page=pages[tab]
  return <div className="app"><aside><h1>SmartStudy</h1>{TABS.map(t=><button key={t} className={t===tab?'nav on':'nav'} onClick={()=>{setTab(t);setMsg([])}}>{t}</button>)}
    <hr/><button className="nav" onClick={()=>toggleDemo(!demo)}>{demo?'Exit demo mode':'Load demo data'}</button><button className="nav" onClick={()=>setDark(!dark)}>{dark?'Light':'Dark'} mode</button>
    <button className="nav" onClick={()=>{if(confirm('Erase all data in this mode?')){localStorage.removeItem(demo?'smartstudy:demo':'smartstudy:user');setSt(demo?demoState:blank)}}}>Reset data</button></aside>
    <main><header><h2>{tab}</h2><span className="muted">{demo?'DEMO MODE · today = '+TODAY:st.profile.name||'Set up your profile in Preferences'}</span></header><Page/></main></div>
}
const Card=({l,v}:{l:string;v:string|number})=><div className="card"><div className="v">{v}</div><div className="muted">{l}</div></div>
