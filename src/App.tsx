import {StoreProvider,useStore,Page} from './hooks/useStore'
import Sidebar from './components/layout/Sidebar'
import LandingPage from './pages/LandingPage'
import Onboarding from './pages/Onboarding'
import DocumentUpload from './pages/DocumentUpload'
import DocumentAnalysis from './pages/DocumentAnalysis'
import TimetableReview from './pages/TimetableReview'
import StudyPreferences from './pages/StudyPreferences'
import Planner from './pages/Planner'
import Dashboard from './pages/Dashboard'
import Courses from './pages/Courses'
import Deadlines from './pages/Deadlines'
import StudyPlan from './pages/StudyPlan'
import Progress from './pages/Progress'
import Settings from './pages/Settings'
const PAGES:Record<Page,()=>JSX.Element>={Landing:LandingPage,Onboarding,Upload:DocumentUpload,Analysis:DocumentAnalysis,Review:TimetableReview,Setup:StudyPreferences,Planner,Dashboard,Courses,Deadlines,Plan:StudyPlan,Progress,Settings}
const TITLE:Partial<Record<Page,string>>={Upload:'Document upload',Analysis:'Document analysis',Review:'Combined timetable review',Setup:'Study setup',Plan:'Study plan',Deadlines:'Deadlines'}
function Shell(){
  const{page,demo,st,today}=useStore();const Page=PAGES[page]
  if(page==='Landing')return <div className="landing"><Page/></div>
  return <div className="app"><Sidebar/><main className={page==='Planner'?'wide':''}><header><h2>{TITLE[page]??page}</h2><span className="muted">{demo?'DEMO MODE · today = '+today:st.profile.name||'Set up your profile in Settings'}</span></header><Page/></main></div>
}
export default function App(){return <StoreProvider><Shell/></StoreProvider>}
