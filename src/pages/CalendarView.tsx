import React, {useState} from 'react'
import {useStore, EVENT_STYLES} from '../hooks/useStore'
import {Ev, Session, addDays, datesBetween, dowOf, fmt, occursOn, freeSlots, busyFor, validate, normEnd} from '../engine'
import {dayName} from '../services/documentParser'
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Upload,
  Calendar as CalIcon,
  Clock,
  Sparkles,
  CheckCircle,
  XCircle,
  Trash2,
  X
} from 'lucide-react'

const H0 = 6   // 6 AM
const H1 = 24  // 12 Midnight
const PX = 48  // pixels per hour

export default function CalendarView() {
  const {st, set, today, cname, colorOf, courseFor, mark, go} = useStore()
  const [view, setView] = useState<'month'|'week'|'day'>(window.innerWidth < 800 ? 'day' : 'week')
  const [anchor, setAnchor] = useState(today)
  const [selectedEvent, setSelectedEvent] = useState<{kind: 'event'|'session'; id: string} | null>(null)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [newEvent, setNewEvent] = useState({
    title: '',
    type: 'class',
    when: today,
    start: '09:00',
    end: '10:00'
  })

  // Date calculation
  const step = view === 'month' ? 30 : view === 'week' ? 7 : 1
  const dow = dowOf(anchor)
  const monOffset = -((dow + 6) % 7)
  const weekStart = addDays(anchor, monOffset)

  const days: string[] = view === 'day' 
    ? [anchor] 
    : view === 'week' 
      ? datesBetween(weekStart, addDays(weekStart, 6))
      : (() => {
          const firstDayOfMonth = anchor.slice(0, 8) + '01'
          const startOffset = -((dowOf(firstDayOfMonth) + 6) % 7)
          const start = addDays(firstDayOfMonth, startOffset)
          return datesBetween(start, addDays(start, 41)) // 6 weeks
        })()

  // Format month or range label
  const monthName = new Date(anchor + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const dateRangeLabel = view === 'day'
    ? new Date(anchor + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
    : view === 'week'
      ? `${new Date(weekStart + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${new Date(addDays(weekStart, 6) + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
      : monthName

  // Event getters
  const getEventsForDay = (d: string): Ev[] => {
    return st.events.filter(e => e.fixed && occursOn(e, d))
  }

  const getSessionsForDay = (d: string): Session[] => {
    return st.sessions.filter(s => s.date === d && s.status !== 'missed')
  }

  const getEventBadgeClass = (type: string) => {
    switch(type) {
      case 'class': return 'event-lecture'
      case 'lab': return 'event-lab'
      case 'cie': return 'event-cie'
      case 'sie': return 'event-sie'
      case 'assignment': return 'event-assignment'
      case 'event': return 'event-event'
      case 'holiday': return 'event-holiday'
      default: return 'event-personal'
    }
  }

  // Handle Drag & Drop move
  const onDrop = (d: string, e: React.DragEvent) => {
    e.preventDefault()
    const data = e.dataTransfer.getData('text')
    const rect = e.currentTarget.getBoundingClientRect()
    const m = Math.min(H1 * 60 - 60, H0 * 60 + Math.round((e.clientY - rect.top) / PX * 4) * 15)

    if (data.startsWith('s:')) {
      const id = data.slice(2)
      const session = st.sessions.find(x => x.id === id)
      if (!session) return
      const moved: Session = {
        ...session,
        date: d,
        start: m,
        end: m + (session.end - session.start)
      }
      const others = st.sessions.map(x => x.id === id ? moved : x)
      const beforeErrs = validate(st.sessions, st.events, st.tasks, st.prefs).length
      const afterErrs = validate(others, st.events, st.tasks, st.prefs)
      if (afterErrs.length > beforeErrs) {
        alert('Cannot move session here: clash detected with another commitment!')
        return
      }
      set({sessions: others})
    }
  }

  // Handle Add New Event
  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newEvent.title) return
    const [sh, sm] = newEvent.start.split(':').map(Number)
    const [eh, em] = newEvent.end.split(':').map(Number)
    const sMin = sh * 60 + sm
    const eMin = eh * 60 + em
    if (sMin >= eMin) {
      alert('End time must be after start time')
      return
    }

    const created: Ev = {
      id: Math.random().toString(36).slice(2, 9),
      title: newEvent.title,
      type: newEvent.type as any,
      source: 'manual',
      date: newEvent.when,
      start: sMin,
      end: eMin,
      recurring: false,
      fixed: true,
      verified: true
    }

    set({events: [...st.events, created]})
    setAddModalOpen(false)
    setNewEvent({title: '', type: 'class', when: today, start: '09:00', end: '10:00'})
  }

  // Active selected detail
  const activeEv = selectedEvent?.kind === 'event' ? st.events.find(e => e.id === selectedEvent.id) : null
  const activeSess = selectedEvent?.kind === 'session' ? st.sessions.find(s => s.id === selectedEvent.id) : null

  return (
    <div className="calendar-container">
      {/* NOTION CALENDAR HEADER */}
      <div className="calendar-header">
        <div className="calendar-nav-group">
          <button className="btn btn-secondary btn-sm" onClick={() => setAnchor(today)}>
            Today
          </button>
          <button className="btn-icon" onClick={() => setAnchor(addDays(anchor, -step))}>
            <ChevronLeft size={16} />
          </button>
          <button className="btn-icon" onClick={() => setAnchor(addDays(anchor, step))}>
            <ChevronRight size={16} />
          </button>
          <div className="calendar-title-date">
            {dateRangeLabel}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="view-switcher">
            <button
              className={`view-btn ${view === 'month' ? 'active' : ''}`}
              onClick={() => setView('month')}
            >
              Month
            </button>
            <button
              className={`view-btn ${view === 'week' ? 'active' : ''}`}
              onClick={() => setView('week')}
            >
              Week
            </button>
            <button
              className={`view-btn ${view === 'day' ? 'active' : ''}`}
              onClick={() => setView('day')}
            >
              Day
            </button>
          </div>

          <button className="btn btn-secondary btn-sm" onClick={() => go('Documents')}>
            <Upload size={14} /> Upload Timetable
          </button>

          <button className="btn btn-primary btn-sm" onClick={() => setAddModalOpen(true)}>
            <Plus size={14} /> Add Event
          </button>
        </div>
      </div>

      {/* MONTH VIEW */}
      {view === 'month' && (
        <div className="month-grid">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
            <div key={day} className="month-day-head">{day}</div>
          ))}
          {days.map(d => {
            const isToday = d === today
            const isDiffMonth = d.slice(5, 7) !== anchor.slice(5, 7)
            const dayEvents = getEventsForDay(d)
            const daySessions = getSessionsForDay(d)
            const dayTasks = st.tasks.filter(t => t.deadline === d && t.status !== 'done')

            return (
              <div
                key={d}
                className={`month-day-cell ${isToday ? 'today' : ''} ${isDiffMonth ? 'dim' : ''}`}
                onClick={() => {
                  setAnchor(d)
                  setView('day')
                }}
              >
                <div className="day-number">{parseInt(d.slice(8))}</div>

                {/* Exams / Fixed classes */}
                {dayEvents.slice(0, 2).map(e => (
                  <div
                    key={e.id}
                    className={`event-badge ${getEventBadgeClass(e.type)}`}
                    style={{ fontSize: 10, padding: '1px 4px', textOverflow: 'ellipsis', overflow: 'hidden' }}
                    onClick={(ev) => {
                      ev.stopPropagation()
                      setSelectedEvent({kind: 'event', id: e.id})
                    }}
                  >
                    {e.title}
                  </div>
                ))}

                {/* Study sessions */}
                {daySessions.length > 0 && (
                  <div className="event-badge event-study" style={{ fontSize: 10, padding: '1px 4px' }}>
                    {daySessions.length} study session{daySessions.length > 1 ? 's' : ''}
                  </div>
                )}

                {/* Tasks due */}
                {dayTasks.map(t => (
                  <div key={t.id} className="event-badge event-assignment" style={{ fontSize: 10, padding: '1px 4px' }}>
                    Due: {t.title}
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      )}

      {/* WEEK VIEW (HOURLY MATRIX) */}
      {view === 'week' && (
        <div className="week-grid-container">
          <div className="week-grid-header">
            <div className="week-gutter" />
            {days.map(d => {
              const isToday = d === today
              const dowIdx = dowOf(d)
              const tasksDue = st.tasks.filter(t => t.deadline === d && t.status !== 'done').length
              return (
                <div key={d} className={`week-day-col-header ${isToday ? 'today' : ''}`}>
                  <div style={{ fontSize: 11, color: isToday ? 'var(--accent)' : 'var(--text-secondary)', fontWeight: 600 }}>
                    {dayName(dowIdx).toUpperCase()}
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: isToday ? 'var(--accent)' : 'var(--text-primary)' }}>
                    {parseInt(d.slice(8))}
                  </div>
                  {tasksDue > 0 && (
                    <span className="tag-pill tag-medium" style={{ fontSize: 9.5, marginTop: 2 }}>
                      {tasksDue} due
                    </span>
                  )}
                </div>
              )
            })}
          </div>

          <div className="week-grid-body">
            {/* Gutter with hourly labels */}
            <div className="week-gutter">
              {Array.from({length: H1 - H0}, (_, i) => {
                const h = H0 + i
                const label = `${h % 12 || 12} ${h < 12 ? 'AM' : 'PM'}`
                return (
                  <div key={i} className="time-slot-label">
                    {label}
                  </div>
                )
              })}
            </div>

            {/* Columns for each day */}
            {days.map(d => {
              const isToday = d === today
              const busyItems = busyFor(st.events, d)
              const sessionItems = getSessionsForDay(d)
              const allBusy = busyItems.concat(sessionItems.map(s => ({s: s.start, e: s.end, title: 's', id: s.id})))
              const freeGaps = st.prefs.studyDays.includes(dowOf(d))
                ? freeSlots(d, allBusy, st.prefs, 45)
                : []

              return (
                <div
                  key={d}
                  className={`week-col ${isToday ? 'today' : ''}`}
                  style={{ height: (H1 - H0) * PX }}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => onDrop(d, e)}
                >
                  {/* Horizontal hour lines */}
                  {Array.from({length: H1 - H0}, (_, i) => (
                    <div key={i} className="hour-line" style={{ top: i * PX }} />
                  ))}

                  {/* Free gaps indicator */}
                  {freeGaps.map(([a, b], i) => {
                    const top = ((a - H0 * 60) / 60) * PX
                    const h = ((b - a) / 60) * PX
                    return (
                      <div key={'free-' + i} className="cal-free-gap" style={{ top, height: h }}>
                        {(Math.round((b - a) / 6) / 10)}h free
                      </div>
                    )
                  })}

                  {/* Fixed events (classes, labs, exams) */}
                  {getEventsForDay(d).map(e => {
                    const top = ((Math.max(e.start, H0 * 60) - H0 * 60) / 60) * PX
                    const height = Math.max(22, ((normEnd(e) - e.start) / 60) * PX)
                    const isLab = e.type === 'lab'
                    const isExamType = e.type === 'cie' || e.type === 'sie'
                    const badgeClass = getEventBadgeClass(e.type)

                    return (
                      <div
                        key={e.id}
                        className={`cal-event-block ${badgeClass} ${isLab ? 'lab' : ''} ${isExamType ? 'exam' : ''}`}
                        style={{ top, height }}
                        onClick={() => setSelectedEvent({kind: 'event', id: e.id})}
                      >
                        <div style={{ fontWeight: 600, fontSize: 11, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {e.title}
                        </div>
                        <div style={{ fontSize: 10, opacity: 0.85 }}>
                          {fmt(e.start)} – {fmt(normEnd(e))}
                        </div>
                      </div>
                    )
                  })}

                  {/* Study sessions */}
                  {sessionItems.map(s => {
                    const top = ((Math.max(s.start, H0 * 60) - H0 * 60) / 60) * PX
                    const height = Math.max(22, ((s.end - s.start) / 60) * PX)
                    const isDone = s.status === 'done'

                    return (
                      <div
                        key={s.id}
                        draggable
                        className={`cal-event-block event-study study ${isDone ? 'done' : ''}`}
                        style={{ top, height, left: 6, right: 6 }}
                        onDragStart={ev => ev.dataTransfer.setData('text', 's:' + s.id)}
                        onClick={() => setSelectedEvent({kind: 'session', id: s.id})}
                      >
                        <div style={{ fontWeight: 600, fontSize: 11, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {cname(s.courseId)} {isDone ? '✓' : ''}
                        </div>
                        <div style={{ fontSize: 10, opacity: 0.85 }}>
                          {fmt(s.start)} – {fmt(s.end)} ({s.kind})
                        </div>
                      </div>
                    )
                  })}

                  {/* Red Current Time Line */}
                  {isToday && (
                    <div
                      className="current-time-line"
                      style={{
                        top: ((new Date().getHours() * 60 + new Date().getMinutes() - H0 * 60) / 60) * PX
                      }}
                    >
                      <div className="current-time-circle" />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* DAY VIEW (CHRONOLOGICAL TIMELINE) */}
      {view === 'day' && (
        <div style={{ maxWidth: 700, margin: '0 auto', width: '100%' }}>
          <div className="notion-card">
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>
              {new Date(anchor + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </h3>

            {/* List all commitments and study sessions sorted by time */}
            {(() => {
              const dayEvs = getEventsForDay(anchor).map(e => ({
                id: e.id,
                title: e.title,
                start: e.start,
                end: normEnd(e),
                type: e.type,
                kind: 'event' as const
              }))
              const daySess = getSessionsForDay(anchor).map(s => ({
                id: s.id,
                title: `${cname(s.courseId)} (${s.kind})`,
                start: s.start,
                end: s.end,
                type: 'study' as const,
                kind: 'session' as const,
                status: s.status
              }))
              const combined = [...dayEvs, ...daySess].sort((a, b) => a.start - b.start)

              if (combined.length === 0) {
                return (
                  <p style={{ color: 'var(--text-secondary)', padding: 12 }}>
                    No events or study sessions scheduled for this day.
                  </p>
                )
              }

              return (
                <div className="day-timeline">
                  {combined.map(item => (
                    <div key={item.id} className="timeline-item">
                      <div className="timeline-time">
                        {fmt(item.start)} – {fmt(item.end)}
                      </div>
                      <div className="timeline-body">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontWeight: 600, fontSize: 13.5 }}>{item.title}</span>
                          <span className={`event-badge ${getEventBadgeClass(item.type)}`}>
                            {item.type}
                          </span>
                        </div>
                        {item.kind === 'session' && (
                          <div style={{ marginTop: 6, display: 'flex', gap: 6 }}>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => mark(item.id, 'done')}
                            >
                              <CheckCircle size={12} color="var(--success)" /> Mark Done
                            </button>
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() => mark(item.id, 'missed')}
                            >
                              <XCircle size={12} color="var(--danger)" /> Mark Missed
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )
            })()}
          </div>
        </div>
      )}

      {/* EVENT DETAIL MODAL */}
      {(activeEv || activeSess) && (
        <div className="modal-overlay" onClick={() => setSelectedEvent(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                {activeEv ? activeEv.title : `${cname(activeSess!.courseId)} Study Session`}
              </div>
              <button className="btn-icon" onClick={() => setSelectedEvent(null)}>
                <X size={16} />
              </button>
            </div>

            {activeEv && (
              <div>
                <div style={{ marginBottom: 12 }}>
                  <span className={`event-badge ${getEventBadgeClass(activeEv.type)}`}>
                    {activeEv.type.toUpperCase()}
                  </span>
                  <span style={{ marginLeft: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
                    Source: {activeEv.source}
                  </span>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
                  Time: <b>{fmt(activeEv.start)} – {fmt(normEnd(activeEv))}</b>
                  {activeEv.recurring ? ` (Every ${dayName(activeEv.dow!)})` : ` on ${activeEv.date}`}
                </p>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      set({events: st.events.filter(x => x.id !== activeEv.id)})
                      setSelectedEvent(null)
                    }}
                  >
                    <Trash2 size={13} color="var(--danger)" /> Delete Event
                  </button>
                  <button className="btn btn-primary btn-sm" onClick={() => setSelectedEvent(null)}>
                    Done
                  </button>
                </div>
              </div>
            )}

            {activeSess && (
              <div>
                <div style={{ marginBottom: 12 }}>
                  <span className="event-badge event-study">STUDY SESSION</span>
                  <span style={{ marginLeft: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
                    Status: <b>{activeSess.status.toUpperCase()}</b>
                  </span>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
                  Date: <b>{activeSess.date}</b> ({fmt(activeSess.start)} – {fmt(activeSess.end)})
                </p>

                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      mark(activeSess.id, 'done')
                      setSelectedEvent(null)
                    }}
                  >
                    <CheckCircle size={13} color="var(--success)" /> Mark Completed
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      mark(activeSess.id, 'missed')
                      setSelectedEvent(null)
                    }}
                  >
                    <XCircle size={13} color="var(--danger)" /> Mark Missed
                  </button>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => {
                      mark(activeSess.id, 'planned')
                      setSelectedEvent(null)
                    }}
                  >
                    Reset
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ADD NEW EVENT MODAL */}
      {addModalOpen && (
        <div className="modal-overlay" onClick={() => setAddModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Create Academic Event</div>
              <button className="btn-icon" onClick={() => setAddModalOpen(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateEvent}>
              <div className="form-group">
                <label className="form-label">Title</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Operating Systems Lecture, Project Review"
                  value={newEvent.title}
                  onChange={e => setNewEvent({...newEvent, title: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Event Category</label>
                <select
                  className="form-select"
                  value={newEvent.type}
                  onChange={e => setNewEvent({...newEvent, type: e.target.value})}
                >
                  <option value="class">Lecture</option>
                  <option value="lab">Laboratory</option>
                  <option value="cie">CIE Examination</option>
                  <option value="sie">SIE Examination</option>
                  <option value="event">College Event</option>
                  <option value="holiday">Holiday</option>
                  <option value="personal">Personal Commitment</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Date (YYYY-MM-DD)</label>
                <input
                  type="date"
                  className="form-input"
                  value={newEvent.when}
                  onChange={e => setNewEvent({...newEvent, when: e.target.value})}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Start Time</label>
                  <input
                    type="time"
                    className="form-input"
                    value={newEvent.start}
                    onChange={e => setNewEvent({...newEvent, start: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">End Time</label>
                  <input
                    type="time"
                    className="form-input"
                    value={newEvent.end}
                    onChange={e => setNewEvent({...newEvent, end: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => setAddModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Add to Calendar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
