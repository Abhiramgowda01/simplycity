import React from 'react'
import {useStore, Page} from '../../hooks/useStore'
import {
  CalendarCheck,
  Calendar,
  Sparkles,
  BookOpen,
  CheckSquare,
  Clock,
  Flame,
  GraduationCap,
  CalendarDays,
  FileText,
  BarChart2,
  Settings,
  PanelLeftClose,
  Moon,
  Sun,
  Database
} from 'lucide-react'

interface NavItem {
  id: Page
  label: string
  icon: React.ElementType
  badge?: number | string
}

export default function Sidebar() {
  const {
    page,
    go,
    st,
    demo,
    toggleDemo,
    dark,
    setDark,
    sidebarCollapsed,
    setSidebarCollapsed
  } = useStore()

  const pendingTasksCount = st.tasks.filter(t => t.status !== 'done').length
  const cieCount = st.events.filter(e => e.type === 'cie').length
  const coursesCount = st.courses.length

  const workspaceNav: NavItem[] = [
    { id: 'MyWeek', label: 'My Week', icon: CalendarCheck },
    { id: 'Calendar', label: 'Calendar', icon: Calendar },
    { id: 'StudyPlan', label: 'Study Plan', icon: Sparkles },
    { id: 'Courses', label: 'My Courses', icon: BookOpen, badge: coursesCount || undefined },
    { id: 'Tasks', label: 'Tasks & Deadlines', icon: CheckSquare, badge: pendingTasksCount || undefined }
  ]

  const academicNav: NavItem[] = [
    { id: 'Timetable', label: 'College Timetable', icon: Clock },
    { id: 'CIE', label: 'CIE Examinations', icon: Flame, badge: cieCount || undefined },
    { id: 'SIE', label: 'SIE Examinations', icon: GraduationCap },
    { id: 'Events', label: 'Academic Events', icon: CalendarDays }
  ]

  const managementNav: NavItem[] = [
    { id: 'Documents', label: 'Documents', icon: FileText },
    { id: 'Progress', label: 'Progress', icon: BarChart2 },
    { id: 'Settings', label: 'Settings', icon: Settings }
  ]

  const isSelected = (id: Page) => {
    if (page === id) return true
    // Handle legacy aliases
    if (page === 'Dashboard' && id === 'MyWeek') return true
    if (page === 'Planner' && id === 'Calendar') return true
    if (page === 'Plan' && id === 'StudyPlan') return true
    if (page === 'Deadlines' && id === 'Tasks') return true
    if ((page === 'Upload' || page === 'Analysis' || page === 'Review') && id === 'Documents') return true
    if (page === 'Setup' && id === 'Settings') return true
    return false
  }

  return (
    <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-brand" onClick={() => go('MyWeek')}>
          <div className="brand-icon">🎓</div>
          <span>SmartStudy</span>
        </div>
        <button
          className="sidebar-toggle-btn"
          title="Collapse sidebar"
          onClick={() => setSidebarCollapsed(true)}
        >
          <PanelLeftClose size={16} />
        </button>
      </div>

      <div className="sidebar-nav-scroll">
        {/* WORKSPACE SECTION */}
        <div className="sidebar-section">
          <div className="sidebar-section-title">WORKSPACE</div>
          {workspaceNav.map(item => {
            const Icon = item.icon
            const active = isSelected(item.id)
            return (
              <button
                key={item.id}
                className={`sidebar-item ${active ? 'active' : ''}`}
                onClick={() => go(item.id)}
              >
                <Icon size={16} />
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className="sidebar-badge">{item.badge}</span>
                )}
              </button>
            )
          })}
        </div>

        {/* ACADEMIC SECTION */}
        <div className="sidebar-section">
          <div className="sidebar-section-title">ACADEMIC</div>
          {academicNav.map(item => {
            const Icon = item.icon
            const active = isSelected(item.id)
            return (
              <button
                key={item.id}
                className={`sidebar-item ${active ? 'active' : ''}`}
                onClick={() => go(item.id)}
              >
                <Icon size={16} />
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className="sidebar-badge">{item.badge}</span>
                )}
              </button>
            )
          })}
        </div>

        {/* MANAGEMENT SECTION */}
        <div className="sidebar-section">
          <div className="sidebar-section-title">MANAGEMENT</div>
          {managementNav.map(item => {
            const Icon = item.icon
            const active = isSelected(item.id)
            return (
              <button
                key={item.id}
                className={`sidebar-item ${active ? 'active' : ''}`}
                onClick={() => go(item.id)}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="sidebar-footer">
        <button
          className="sidebar-item"
          onClick={() => toggleDemo(!demo)}
          title="Toggle sample dataset"
        >
          <Database size={15} />
          <span>{demo ? 'Exit Demo' : 'Load Demo Data'}</span>
        </button>

        <button
          className="sidebar-item"
          onClick={() => setDark(!dark)}
          title="Toggle dark mode"
        >
          {dark ? <Sun size={15} /> : <Moon size={15} />}
          <span>{dark ? 'Light Theme' : 'Dark Theme'}</span>
        </button>

        <div className="sidebar-user-pill" onClick={() => go('Settings')}>
          <div className="user-avatar">
            {st.profile.name ? st.profile.name.charAt(0).toUpperCase() : 'S'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 500, fontSize: 12.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {st.profile.name || 'Student Profile'}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {st.profile.dept ? `${st.profile.dept} · Sem ${st.profile.sem || '5'}` : 'Click to configure'}
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
