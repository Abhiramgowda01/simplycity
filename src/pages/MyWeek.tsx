import React from 'react'
import {useStore} from '../hooks/useStore'
import {busyFor, freeSlots, dayDiff, isExam, fmt, addDays, dowOf} from '../engine'
import {dayName} from '../services/documentParser'
import {
  Calendar,
  Clock,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Flame,
  ArrowRight,
  Sparkles,
  CheckSquare,
  FileText
} from 'lucide-react'

export default function MyWeek() {
  const {st, today, cname, colorOf, go, mark, loadMiteData} = useStore()

  // Calculate current greeting
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  const studentName = st.profile.name ? st.profile.name.split(' ')[0] : 'Student'

  // Weekly date range calculation (Monday to Sunday)
  const currentDow = dowOf(today)
  const monOffset = -((currentDow + 6) % 7)
  const weekStart = addDays(today, monOffset)
  const weekEnd = addDays(weekStart, 6)

  // Today's commitments (classes, labs, breaks)
  const todayBusy = busyFor(st.events, today).sort((a, b) => a.s - b.s)
  
  // Today's scheduled study sessions
  const todaySessions = st.sessions
    .filter(s => s.date === today && s.status !== 'missed')
    .sort((a, b) => a.start - b.start)

  // Upcoming assignments / tasks
  const upcomingTasks = st.tasks
    .filter(t => t.status !== 'done' && !isExam(t.type) && t.deadline >= today)
    .sort((a, b) => a.deadline.localeCompare(b.deadline))

  // Upcoming examinations (CIE & SIE)
  const upcomingExams = st.events
    .filter(e => isExam(e.type) && e.date && e.date >= today)
    .sort((a, b) => (a.date || '').localeCompare(b.date || ''))

  // Weekly study progress
  const weekSessions = st.sessions.filter(s => s.date >= weekStart && s.date <= weekEnd)
  const completedWeekSessions = weekSessions.filter(s => s.status === 'done')
  const completedMinutes = completedWeekSessions.reduce((acc, s) => acc + (s.end - s.start), 0)
  const targetWeeklyHours = (st.prefs.dailyTarget || 2) * (st.prefs.studyDays?.length || 5)
  const progressPercent = targetWeeklyHours > 0 
    ? Math.min(100, Math.round((completedMinutes / 60 / targetWeeklyHours) * 100))
    : 0

  const freeToday = freeSlots(today, todayBusy, st.prefs)
    .reduce((a, [s, e]) => a + e - s, 0)

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      {/* GREETING & HEADER */}
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div className="page-title-row">
          <h1 className="page-title">
            <span>👋</span> {greeting}, {studentName}
          </h1>
          <div style={{ display: 'flex', gap: 8 }}>
            {!st.events.length && (
              <button className="btn btn-accent btn-sm" onClick={loadMiteData}>
                <Sparkles size={14} />
                Load MITE Timetable Test Document
              </button>
            )}
            <button className="btn btn-secondary btn-sm" onClick={() => go('Calendar')}>
              <Calendar size={14} /> Open Calendar
            </button>
          </div>
        </div>
        <p className="page-subtitle">
          Today is <b>{today}</b> · Week of <b>{weekStart}</b> to <b>{weekEnd}</b>
        </p>
      </div>

      {/* WORKLOAD WARNING IF APPLICABLE */}
      {st.report && st.report.unscheduled.length > 0 && (
        <div className="notion-banner warn">
          <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            <b>Academic Workload Alert:</b> {(st.report.unscheduled.reduce((a, u) => a + u.minutes, 0) / 60).toFixed(1)}h of required preparation cannot fit within your current study window.{' '}
            <a onClick={() => go('StudyPlan')} style={{ textDecoration: 'underline', cursor: 'pointer', fontWeight: 500 }}>
              Adjust in Study Plan
            </a>
          </div>
        </div>
      )}

      {/* QUICK WEEKLY OVERVIEW METRICS */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-label">TODAY'S CLASSES & LABS</div>
          <div className="stat-value">{todayBusy.filter(b => b.e < 1440 || b.s > 0).length}</div>
          <div className="stat-sub">Fixed commitments today</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">FREE TIME TODAY</div>
          <div className="stat-value">{(freeToday / 60).toFixed(1)}h</div>
          <div className="stat-sub">Outside class hours</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">PLANNED STUDY TODAY</div>
          <div className="stat-value">
            {(todaySessions.reduce((a, s) => a + s.end - s.start, 0) / 60).toFixed(1)}h
          </div>
          <div className="stat-sub">{todaySessions.length} sessions scheduled</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">WEEKLY STUDY PROGRESS</div>
          <div className="stat-value">{(completedMinutes / 60).toFixed(1)} / {targetWeeklyHours}h</div>
          <div className="stat-sub">{progressPercent}% of weekly target</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: 20 }}>
        {/* COLUMN 1: TODAY'S ACADEMIC COMMITMENTS */}
        <div>
          {/* TODAY'S CLASSES */}
          <div className="notion-card">
            <div className="card-header">
              <span className="card-title">
                <Clock size={16} color="var(--accent)" />
                Today's College Classes & Labs
              </span>
              <button className="btn btn-ghost btn-sm" onClick={() => go('Timetable')}>
                View Timetable <ArrowRight size={12} />
              </button>
            </div>

            {todayBusy.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', fontSize: 13, padding: '8px 0' }}>
                No college classes scheduled for today. Enjoy your day!
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {todayBusy.map(b => {
                  const isLab = b.title.toLowerCase().includes('lab')
                  return (
                    <div
                      key={b.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--secondary-bg)',
                        border: '1px solid var(--border-color)',
                        borderLeft: `4px solid ${isLab ? '#8B5CF6' : 'var(--accent)'}`
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 500, fontSize: 13 }}>{b.title}</div>
                        <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                          {fmt(b.s)} – {fmt(Math.min(b.e, 1439))}
                        </div>
                      </div>
                      <span className={`event-badge ${isLab ? 'event-lab' : 'event-lecture'}`}>
                        {isLab ? 'Laboratory' : 'Lecture'}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* TODAY'S PLANNED STUDY SESSIONS */}
          <div className="notion-card">
            <div className="card-header">
              <span className="card-title">
                <BookOpen size={16} color="var(--success)" />
                Today's Planned Study Sessions
              </span>
              <button className="btn btn-ghost btn-sm" onClick={() => go('StudyPlan')}>
                Manage Plan <ArrowRight size={12} />
              </button>
            </div>

            {todaySessions.length === 0 ? (
              <div style={{ padding: '8px 0', color: 'var(--text-secondary)', fontSize: 13 }}>
                No study sessions scheduled for today.{' '}
                <a onClick={() => go('StudyPlan')} style={{ color: 'var(--accent)', cursor: 'pointer', fontWeight: 500 }}>
                  Generate study plan →
                </a>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {todaySessions.map(s => {
                  const course = st.courses.find(c => c.id === s.courseId)
                  return (
                    <div
                      key={s.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: s.status === 'done' ? '#F0FDF4' : 'var(--secondary-bg)',
                        border: '1px solid var(--border-color)',
                        borderLeft: `4px solid ${colorOf(s.courseId)}`
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 500, fontSize: 13, textDecoration: s.status === 'done' ? 'line-through' : 'none' }}>
                          {course?.name || cname(s.courseId)}
                          {s.kind === 'revision' && <span className="event-badge event-cie" style={{ marginLeft: 6 }}>Revision</span>}
                        </div>
                        <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                          {fmt(s.start)} – {fmt(s.end)} ({s.end - s.start} mins)
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 4 }}>
                        {s.status !== 'done' ? (
                          <button
                            className="btn btn-secondary btn-sm"
                            title="Mark as done"
                            onClick={() => mark(s.id, 'done')}
                          >
                            <CheckCircle2 size={13} color="var(--success)" /> Done
                          </button>
                        ) : (
                          <button
                            className="btn btn-ghost btn-sm"
                            title="Reset to planned"
                            onClick={() => mark(s.id, 'planned')}
                          >
                            Reset
                          </button>
                        )}
                        <button
                          className="btn btn-ghost btn-sm"
                          title="Mark missed"
                          onClick={() => mark(s.id, 'missed')}
                        >
                          Missed
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* COLUMN 2: EXAMS & DEADLINES */}
        <div>
          {/* UPCOMING EXAMINATIONS */}
          <div className="notion-card">
            <div className="card-header">
              <span className="card-title">
                <Flame size={16} color="var(--warning)" />
                Upcoming Examinations (CIE & SIE)
              </span>
              <button className="btn btn-ghost btn-sm" onClick={() => go('CIE')}>
                View CIE <ArrowRight size={12} />
              </button>
            </div>

            {upcomingExams.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', fontSize: 13, padding: '8px 0' }}>
                No exams scheduled in this period.{' '}
                <a onClick={() => go('Documents')} style={{ color: 'var(--accent)', cursor: 'pointer' }}>
                  Upload CIE circular →
                </a>
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {upcomingExams.slice(0, 5).map(e => {
                  const d = dayDiff(today, e.date || today)
                  const isSoon = d <= 3
                  return (
                    <div
                      key={e.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: isSoon ? '#FFFBEB' : 'var(--secondary-bg)',
                        border: '1px solid var(--border-color)',
                        borderLeft: `4px solid ${e.type === 'cie' ? '#F97316' : '#DC2626'}`
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 500, fontSize: 13 }}>{e.title}</div>
                        <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                          {e.date} · {fmt(e.start)} – {fmt(e.end)}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span className={`tag-pill ${isSoon ? 'tag-hard' : 'tag-medium'}`}>
                          {d === 0 ? 'Today!' : d === 1 ? 'Tomorrow' : `in ${d} days`}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* UPCOMING ASSIGNMENTS & TASKS */}
          <div className="notion-card">
            <div className="card-header">
              <span className="card-title">
                <CheckSquare size={16} color="var(--accent)" />
                Assignments & Deadlines
              </span>
              <button className="btn btn-ghost btn-sm" onClick={() => go('Tasks')}>
                All Tasks <ArrowRight size={12} />
              </button>
            </div>

            {upcomingTasks.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', fontSize: 13, padding: '8px 0' }}>
                No pending assignment deadlines!{' '}
                <a onClick={() => go('Tasks')} style={{ color: 'var(--accent)', cursor: 'pointer' }}>
                  + Add task
                </a>
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {upcomingTasks.slice(0, 5).map(t => {
                  const d = dayDiff(today, t.deadline)
                  const course = st.courses.find(c => c.id === t.courseId)
                  return (
                    <div
                      key={t.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--secondary-bg)',
                        border: '1px solid var(--border-color)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <input
                          type="checkbox"
                          checked={t.status === 'done'}
                          onChange={() => {
                            const updated = st.tasks.map(x => x.id === t.id ? {...x, status: 'done' as const} : x)
                            st.tasks = updated
                          }}
                          style={{ cursor: 'pointer' }}
                        />
                        <div>
                          <div style={{ fontWeight: 500, fontSize: 13 }}>{t.title}</div>
                          <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                            {course?.code || ''} · Due {t.deadline}
                          </div>
                        </div>
                      </div>

                      <span className="tag-pill tag-medium">
                        {d === 0 ? 'Today' : d === 1 ? 'Tomorrow' : `${d}d left`}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
