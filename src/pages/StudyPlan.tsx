import React, {useState} from 'react'
import {useStore} from '../hooks/useStore'
import {reschedule, isExam, fmt, dowOf, dayDiff, Session} from '../engine'
import {dayName} from '../services/documentParser'
import {
  Sparkles,
  RefreshCw,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  ShieldCheck,
  List,
  BookOpen
} from 'lucide-react'

export default function StudyPlan() {
  const {st, set, today, cname, colorOf, generateNow, mark, issues, go} = useStore()
  const [preview, setPreview] = useState<ReturnType<typeof reschedule> | null>(null)
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('list')

  const r = st.report
  const dates = [...new Set(st.sessions.map(s => s.date))].sort()
  const un = r ? r.unscheduled.reduce((a, u) => a + u.minutes, 0) : 0

  const handleRegenerate = () => {
    const res = reschedule(
      {
        events: st.events,
        courses: st.courses,
        tasks: st.tasks,
        prefs: st.prefs,
        today
      },
      st.sessions
    )
    setPreview(res)
  }

  const applyPreview = () => {
    if (!preview) return
    set({sessions: preview.sessions, report: preview})
    setPreview(null)
  }

  return (
    <div style={{ maxWidth: 1050, margin: '0 auto' }}>
      <div className="page-header">
        <div className="page-title-row">
          <h1 className="page-title">
            <Sparkles size={22} color="var(--accent)" />
            Automatic Study Planner & Schedule
          </h1>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={handleRegenerate}
              disabled={!st.sessions.length}
            >
              <RefreshCw size={14} /> Regenerate Remaining
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={generateNow}
              disabled={!st.courses.length}
            >
              <Sparkles size={14} /> Generate Study Plan
            </button>
          </div>
        </div>
        <p className="page-subtitle">
          Planning range: <b>{st.prefs.startDate}</b> to <b>{st.prefs.endDate}</b> · Target: <b>{st.prefs.dailyTarget}h/day</b> ({fmt(st.prefs.start)} – {fmt(st.prefs.end)})
        </p>
      </div>

      {/* REGENERATION DIFF PREVIEW */}
      {preview && (
        <div className="notion-banner info" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <b>Rescheduling Preview:</b> {preview.removed.length} planned future sessions replaced, {preview.added.length} new sessions allocated.
            Past, completed, and missed sessions are preserved.
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="btn btn-primary btn-sm" onClick={applyPreview}>
              Apply Changes
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => setPreview(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* COVERAGE & WORKLOAD SUMMARY */}
      {r && (
        <div className="stats-grid" style={{ marginBottom: 16 }}>
          <div className="stat-card">
            <div className="stat-label">REQUIRED PREPARATION</div>
            <div className="stat-value">{(r.requiredMin / 60).toFixed(1)}h</div>
            <div className="stat-sub">Across all courses & exams</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">SCHEDULED STUDY TIME</div>
            <div className="stat-value">{(r.scheduledMin / 60).toFixed(1)}h</div>
            <div className="stat-sub">Clash-free allocated slots</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">UNSCHEDULED DEFICIT</div>
            <div className="stat-value" style={{ color: un > 0 ? 'var(--warning)' : 'var(--success)' }}>
              {(un / 60).toFixed(1)}h
            </div>
            <div className="stat-sub">{un > 0 ? 'Workload warning' : '100% Covered'}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">VALIDATION STATUS</div>
            <div className="stat-value" style={{ fontSize: 18, color: issues.length === 0 ? 'var(--success)' : 'var(--danger)' }}>
              {issues.length === 0 ? '✓ Clash-Free' : `${issues.length} Clashes`}
            </div>
            <div className="stat-sub">No overlap with classes or exams</div>
          </div>
        </div>
      )}

      {/* WORKLOAD WARNING IF APPLICABLE */}
      {r && r.unscheduled.length > 0 && (
        <div className="notion-banner warn">
          <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <b>Availability Shortage Warning:</b> The following subjects require more study time than can fit within your current daily study window:
            <ul style={{ margin: '4px 0 0 16px', fontSize: 12.5 }}>
              {r.unscheduled.map((u, i) => (
                <li key={i}>
                  <b>{cname(u.courseId)}</b>: {(u.minutes / 60).toFixed(1)}h unscheduled.
                </li>
              ))}
            </ul>
            <div style={{ marginTop: 6, fontSize: 12 }}>
              Recommendation: Increase daily target hours, expand daily study window, or extend planning range in <a onClick={() => go('Settings')} style={{ textDecoration: 'underline', cursor: 'pointer' }}>Settings</a>.
            </div>
          </div>
        </div>
      )}

      {/* CLASH-FREE CONFIRMATION BANNER */}
      {st.sessions.length > 0 && issues.length === 0 && (
        <div className="notion-banner ok">
          <ShieldCheck size={18} color="var(--success)" style={{ flexShrink: 0 }} />
          <span>
            <b>Guaranteed Clash-Free:</b> No overlapping commitments. Study sessions strictly respect college lecture periods, laboratory blocks, breaks, and exam timings.
          </span>
        </div>
      )}

      {/* SESSIONS VIEW */}
      <div className="notion-card">
        <div className="card-header">
          <span className="card-title">
            Scheduled Study Sessions ({st.sessions.length})
          </span>
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              className={`btn btn-sm ${viewMode === 'list' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setViewMode('list')}
            >
              <List size={13} /> Chronological List
            </button>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => go('Calendar')}
            >
              <Calendar size={13} /> Open in Calendar
            </button>
          </div>
        </div>

        {st.sessions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)' }}>
            <p style={{ marginBottom: 12 }}>No study plan generated yet.</p>
            <button className="btn btn-primary btn-sm" onClick={generateNow} disabled={!st.courses.length}>
              <Sparkles size={14} /> Generate Study Plan Now
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {dates.map(d => {
              const daySessions = st.sessions
                .filter(s => s.date === d)
                .sort((a, b) => a.start - b.start)

              return (
                <div key={d} style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: 14 }}>
                  <div style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--text-primary)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Calendar size={14} color="var(--accent)" />
                    {d} ({dayName(dowOf(d))})
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 400 }}>
                      · {daySessions.length} session{daySessions.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {daySessions.map(s => {
                      const course = st.courses.find(c => c.id === s.courseId)
                      const isDone = s.status === 'done'
                      const isMissed = s.status === 'missed'

                      return (
                        <div
                          key={s.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '8px 12px',
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: isDone ? '#F0FDF4' : isMissed ? '#FEF2F2' : 'var(--secondary-bg)',
                            border: '1px solid var(--border-color)',
                            borderLeft: `4px solid ${colorOf(s.courseId)}`
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 500, fontSize: 13, textDecoration: isDone ? 'line-through' : 'none' }}>
                              {course?.name || cname(s.courseId)}
                              {s.kind === 'revision' && (
                                <span className="event-badge event-cie" style={{ marginLeft: 6 }}>
                                  Revision
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                              {fmt(s.start)} – {fmt(s.end)} ({s.end - s.start} mins)
                            </div>
                          </div>

                          <div style={{ display: 'flex', gap: 6 }}>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => mark(s.id, isDone ? 'planned' : 'done')}
                            >
                              <CheckCircle2 size={13} color="var(--success)" />
                              {isDone ? 'Undo' : 'Done'}
                            </button>
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() => mark(s.id, 'missed')}
                            >
                              <XCircle size={13} color="var(--danger)" /> Missed
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
