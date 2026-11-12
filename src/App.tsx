import React from 'react'
import {StoreProvider, useStore, Page} from './hooks/useStore'
import Sidebar from './components/layout/Sidebar'
import MyWeek from './pages/MyWeek'
import CalendarView from './pages/CalendarView'
import StudyPlan from './pages/StudyPlan'
import Courses from './pages/Courses'
import TasksPage from './pages/TasksPage'
import CollegeTimetable from './pages/CollegeTimetable'
import CIEExaminations from './pages/CIEExaminations'
import SIEExaminations from './pages/SIEExaminations'
import AcademicEvents from './pages/AcademicEvents'
import DocumentsPage from './pages/DocumentsPage'
import Progress from './pages/Progress'
import Settings from './pages/Settings'
import LandingPage from './pages/LandingPage'
import Onboarding from './pages/Onboarding'
import {PanelLeft, Sparkles} from 'lucide-react'

const PAGES: Record<Page, React.ComponentType> = {
  MyWeek,
  Calendar: CalendarView,
  StudyPlan,
  Courses,
  Tasks: TasksPage,
  Timetable: CollegeTimetable,
  CIE: CIEExaminations,
  SIE: SIEExaminations,
  Events: AcademicEvents,
  Documents: DocumentsPage,
  Progress,
  Settings,
  Setup: Settings,
  Landing: LandingPage,
  Onboarding,
  // Legacy aliases
  Dashboard: MyWeek,
  Planner: CalendarView,
  Plan: StudyPlan,
  Deadlines: TasksPage,
  Upload: DocumentsPage,
  Analysis: DocumentsPage,
  Review: DocumentsPage
}

const BREADCRUMBS: Partial<Record<Page, string>> = {
  MyWeek: 'My Week',
  Calendar: 'Calendar',
  StudyPlan: 'Study Plan',
  Courses: 'My Courses',
  Tasks: 'Tasks & Deadlines',
  Timetable: 'College Timetable',
  CIE: 'CIE Examinations',
  SIE: 'SIE Examinations',
  Events: 'Academic Events',
  Documents: 'Documents',
  Progress: 'Progress',
  Settings: 'Settings',
  Setup: 'Study Setup',
  Dashboard: 'My Week',
  Planner: 'Calendar',
  Plan: 'Study Plan',
  Deadlines: 'Tasks & Deadlines',
  Upload: 'Documents',
  Analysis: 'Document Analysis',
  Review: 'Timetable Review'
}

function Shell() {
  const {
    page,
    demo,
    today,
    st,
    sidebarCollapsed,
    setSidebarCollapsed,
    loadMiteData
  } = useStore()

  const PageComponent = PAGES[page] || MyWeek

  if (page === 'Landing') {
    return (
      <div className="landing">
        <LandingPage />
      </div>
    )
  }

  if (page === 'Onboarding') {
    return (
      <div className="landing">
        <Onboarding />
      </div>
    )
  }

  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-workspace">
        {/* TOP BAR */}
        <div className="top-bar">
          <div className="top-bar-left">
            {sidebarCollapsed && (
              <button
                className="btn-icon"
                title="Expand sidebar"
                onClick={() => setSidebarCollapsed(false)}
              >
                <PanelLeft size={16} />
              </button>
            )}
            <div className="breadcrumb">
              <span>SmartStudy</span>
              <span>/</span>
              <span className="breadcrumb-current">
                {BREADCRUMBS[page] || page}
              </span>
            </div>
          </div>

          <div className="top-bar-right">
            {!st.events.length && (
              <button className="btn btn-accent btn-sm" onClick={loadMiteData}>
                <Sparkles size={13} />
                Load MITE Timetable
              </button>
            )}
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {demo ? `DEMO DATA · today = ${today}` : (st.profile.name || 'Student Workspace')}
            </span>
          </div>
        </div>

        {/* WORKSPACE SCROLL CONTENT */}
        <div className="workspace-scroll">
          <PageComponent />
        </div>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  )
}
