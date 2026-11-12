import React, {useState} from 'react'
import {useStore} from '../hooks/useStore'
import {fmt} from '../engine'
import {dayName} from '../services/documentParser'
import {
  Clock,
  BookOpen,
  Filter,
  Upload,
  Sparkles,
  Info
} from 'lucide-react'

const DAYS = [1, 2, 3, 4, 5, 6] // Mon to Sat

export default function CollegeTimetable() {
  const {st, go, loadMiteData} = useStore()
  const [selectedDay, setSelectedDay] = useState<number | 'all'>('all')

  const classEvents = st.events.filter(e => (e.type === 'class' || e.type === 'lab') && e.recurring)

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <div className="page-header">
        <div className="page-title-row">
          <h1 className="page-title">
            <Clock size={22} color="var(--accent)" />
            College Timetable & Class Schedule
          </h1>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary btn-sm" onClick={loadMiteData}>
              <Sparkles size={14} /> Load MITE CSE Timetable
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => go('Documents')}>
              <Upload size={14} /> Upload Timetable
            </button>
          </div>
        </div>
        <p className="page-subtitle">
          Recurring weekly class schedule, laboratory sessions, breaks, and classroom assignments.
        </p>
      </div>

      {/* FILTER BAR */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, overflowX: 'auto', paddingBottom: 4 }}>
        <button
          className={`btn btn-sm ${selectedDay === 'all' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setSelectedDay('all')}
        >
          All Days (Mon–Sat)
        </button>
        {DAYS.map(d => (
          <button
            key={d}
            className={`btn btn-sm ${selectedDay === d ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setSelectedDay(d)}
          >
            {dayName(d)}
          </button>
        ))}
      </div>

      {/* WEEKLY GRID MATRIX */}
      <div className="notion-card">
        <div className="card-header">
          <span className="card-title">
            Weekly Class Matrix
          </span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {classEvents.length} scheduled periods
          </span>
        </div>

        {classEvents.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-secondary)' }}>
            <p style={{ marginBottom: 12 }}>No recurring timetable records found.</p>
            <button className="btn btn-accent btn-sm" onClick={loadMiteData}>
              <Sparkles size={14} /> Load MITE Department of CSE Timetable
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {DAYS.filter(d => selectedDay === 'all' || selectedDay === d).map(d => {
              const dayEvs = classEvents
                .filter(e => e.dow === d)
                .sort((a, b) => a.start - b.start)

              return (
                <div key={d} style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: 14 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)' }} />
                    {dayName(d)}
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 400 }}>
                      ({dayEvs.length} classes/labs)
                    </span>
                  </div>

                  {dayEvs.length === 0 ? (
                    <div style={{ fontSize: 12.5, color: 'var(--text-muted)', paddingLeft: 16 }}>
                      No classes scheduled.
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10, paddingLeft: 16 }}>
                      {dayEvs.map(e => {
                        const isLab = e.type === 'lab'
                        return (
                          <div
                            key={e.id}
                            style={{
                              padding: '10px 12px',
                              borderRadius: 'var(--radius-md)',
                              backgroundColor: isLab ? '#F5F3FF' : '#EFF6FF',
                              border: `1px solid ${isLab ? '#DDD6FE' : '#BFDBFE'}`,
                              borderLeft: `4px solid ${isLab ? '#7C3AED' : '#2563EB'}`
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                              <span style={{ fontSize: 11, fontWeight: 600, color: isLab ? '#6D28D9' : '#1D4ED8' }}>
                                {fmt(e.start)} – {fmt(e.end)}
                              </span>
                              <span className={`event-badge ${isLab ? 'event-lab' : 'event-lecture'}`} style={{ fontSize: 10 }}>
                                {isLab ? 'Laboratory' : 'Lecture'}
                              </span>
                            </div>
                            <div style={{ fontWeight: 600, fontSize: 12.5, color: 'var(--text-primary)', lineHeight: 1.3 }}>
                              {e.title}
                            </div>
                            {e.code && (
                              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                                Code: <b>{e.code}</b>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* TIMETABLE BREAKS & PERIOD TIMINGS LEGEND */}
      <div className="notion-card" style={{ marginTop: 16 }}>
        <h4 style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Info size={15} color="var(--accent)" />
          Timetable Period & Break Structure (MITE Reference)
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10, fontSize: 12.5 }}>
          <div style={{ padding: 8, background: 'var(--secondary-bg)', borderRadius: 6 }}>
            <b>Period 1:</b> 09:00 – 09:55
          </div>
          <div style={{ padding: 8, background: '#FEF3C7', color: '#92400E', borderRadius: 6 }}>
            <b>☕ Tea Break:</b> 09:55 – 10:15
          </div>
          <div style={{ padding: 8, background: 'var(--secondary-bg)', borderRadius: 6 }}>
            <b>Period 2:</b> 10:15 – 11:10
          </div>
          <div style={{ padding: 8, background: 'var(--secondary-bg)', borderRadius: 6 }}>
            <b>Period 3:</b> 11:10 – 12:05
          </div>
          <div style={{ padding: 8, background: '#FEF3C7', color: '#92400E', borderRadius: 6 }}>
            <b>🍱 Lunch Break:</b> 12:05 – 12:50
          </div>
          <div style={{ padding: 8, background: 'var(--secondary-bg)', borderRadius: 6 }}>
            <b>Period 4:</b> 12:50 – 13:45
          </div>
          <div style={{ padding: 8, background: 'var(--secondary-bg)', borderRadius: 6 }}>
            <b>Period 5:</b> 13:45 – 14:40
          </div>
          <div style={{ padding: 8, background: 'var(--secondary-bg)', borderRadius: 6 }}>
            <b>Period 6 & 7:</b> 14:40 – 16:30
          </div>
        </div>
      </div>
    </div>
  )
}
