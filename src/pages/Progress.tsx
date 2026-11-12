import React from 'react'
import {useStore} from '../hooks/useStore'
import {dayDiff, fmt} from '../engine'
import {
  BarChart2,
  TrendingUp,
  CheckCircle2,
  Clock,
  BookOpen,
  Calendar
} from 'lucide-react'

export default function Progress() {
  const {st, today, cname, colorOf} = useStore()

  const allSessions = st.sessions
  const completedSessions = allSessions.filter(s => s.status === 'done')
  const missedSessions = allSessions.filter(s => s.status === 'missed')
  const plannedSessions = allSessions.filter(s => s.status === 'planned')

  const totalCompletedMins = completedSessions.reduce((acc, s) => acc + (s.end - s.start), 0)
  const totalPlannedMins = allSessions.reduce((acc, s) => acc + (s.end - s.start), 0)

  const overallRate = totalPlannedMins > 0
    ? Math.round((totalCompletedMins / totalPlannedMins) * 100)
    : 0

  // 7-day completion rate
  const weekSessions = allSessions.filter(s => s.date >= today && dayDiff(today, s.date) < 7)
  const weekDone = weekSessions.filter(s => s.status === 'done').length
  const weekRate = weekSessions.length > 0 ? Math.round((weekDone / weekSessions.length) * 100) : 0

  // Subject distribution
  const subjectMins: Record<string, number> = {}
  completedSessions.forEach(s => {
    subjectMins[s.courseId] = (subjectMins[s.courseId] || 0) + (s.end - s.start)
  })
  const maxSubjectMin = Math.max(1, ...Object.values(subjectMins))

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <div className="page-header">
        <h1 className="page-title">
          <BarChart2 size={22} color="var(--accent)" />
          Study Progress & Analytics
        </h1>
        <p className="page-subtitle">
          Track completed hours, completion rates, and subject distribution across your study sessions.
        </p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">TOTAL STUDY COMPLETED</div>
          <div className="stat-value">{(totalCompletedMins / 60).toFixed(1)}h</div>
          <div className="stat-sub">{completedSessions.length} sessions completed</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">7-DAY COMPLETION RATE</div>
          <div className="stat-value">{weekRate}%</div>
          <div className="stat-sub">{weekDone} of {weekSessions.length} sessions</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">MISSED SESSIONS</div>
          <div className="stat-value">{missedSessions.length}</div>
          <div className="stat-sub">Eligible for dynamic rescheduling</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">PLANNED SESSIONS REMAINING</div>
          <div className="stat-value">{plannedSessions.length}</div>
          <div className="stat-sub">Upcoming in your study plan</div>
        </div>
      </div>

      {/* SUBJECT DISTRIBUTION */}
      <div className="notion-card">
        <div className="card-header">
          <span className="card-title">
            <BookOpen size={16} color="var(--accent)" />
            Subject Study Distribution
          </span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {(totalCompletedMins / 60).toFixed(1)} total hours logged
          </span>
        </div>

        {st.courses.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', padding: '12px 0' }}>No courses configured.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {st.courses.map(c => {
              const mins = subjectMins[c.id] || 0
              const hours = (mins / 60).toFixed(1)
              const pct = Math.round((mins / maxSubjectMin) * 100)

              return (
                <div key={c.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                    <span style={{ fontWeight: 500 }}>
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          backgroundColor: colorOf(c.id),
                          display: 'inline-block',
                          marginRight: 6
                        }}
                      />
                      {c.name} ({c.code})
                    </span>
                    <span style={{ color: 'var(--text-secondary)' }}>{hours}h / {c.estimatedHours}h target</span>
                  </div>
                  <div style={{ width: '100%', height: 8, backgroundColor: 'var(--border-color)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', backgroundColor: colorOf(c.id) }} />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* RECENT SESSION HISTORY */}
      <div className="notion-card">
        <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
          Recent Completed Sessions
        </h4>
        {completedSessions.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
            No sessions marked completed yet. As you finish study sessions on the calendar, they will appear here.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {completedSessions.slice(-8).reverse().map(s => (
              <div
                key={s.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  backgroundColor: 'var(--secondary-bg)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)'
                }}
              >
                <div>
                  <span style={{ fontWeight: 500, fontSize: 13 }}>{cname(s.courseId)}</span>
                  <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                    {s.date} · {fmt(s.start)} – {fmt(s.end)} ({s.end - s.start}m)
                  </div>
                </div>
                <span className="event-badge event-study">✓ Completed</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
