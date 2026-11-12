import React from 'react'
import {useStore} from '../hooks/useStore'
import {fmt, dayDiff} from '../engine'
import {
  Flame,
  Calendar,
  Clock,
  Sparkles,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

export default function CIEExaminations() {
  const {st, today, go, loadMiteData} = useStore()

  const cieEvents = st.events
    .filter(e => e.type === 'cie')
    .sort((a, b) => (a.date || '').localeCompare(b.date || ''))

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <div className="page-header">
        <div className="page-title-row">
          <h1 className="page-title">
            <Flame size={22} color="var(--warning)" />
            CIE Examinations (Continuous Internal Evaluation)
          </h1>
          <button className="btn btn-primary btn-sm" onClick={() => go('StudyPlan')}>
            <Sparkles size={14} /> Plan CIE Revision
          </button>
        </div>
        <p className="page-subtitle">
          Internal assessment exam timetable, subject dates, time slots, and priority preparation tracking.
        </p>
      </div>

      {cieEvents.length === 0 ? (
        <div className="notion-card" style={{ textAlign: 'center', padding: '40px 20px' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>
            No CIE examinations currently loaded in your schedule.
          </p>
          <button className="btn btn-accent btn-sm" onClick={loadMiteData}>
            <Sparkles size={14} /> Load MITE CIE-1 Exam Schedule
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {cieEvents.map(e => {
            const diff = dayDiff(today, e.date || today)
            const isImminent = diff <= 3 && diff >= 0
            const isPast = diff < 0

            return (
              <div
                key={e.id}
                className="notion-card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderLeft: `4px solid ${isPast ? 'var(--text-muted)' : isImminent ? '#EA580C' : '#F97316'}`,
                  backgroundColor: isImminent ? '#FFFBEB' : 'var(--card-bg)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span className="event-badge event-cie">CIE EXAM</span>
                    {e.code && (
                      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
                        {e.code}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                    {e.title}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 12.5, color: 'var(--text-muted)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Calendar size={13} /> {e.date}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={13} /> {fmt(e.start)} – {fmt(e.end)}
                    </span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span
                    className={`tag-pill ${isPast ? '' : isImminent ? 'tag-hard' : 'tag-medium'}`}
                    style={{ fontSize: 12, padding: '4px 10px' }}
                  >
                    {isPast ? 'Completed' : diff === 0 ? 'Today!' : diff === 1 ? 'Tomorrow' : `in ${diff} days`}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
