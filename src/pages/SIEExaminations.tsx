import React from 'react'
import {useStore} from '../hooks/useStore'
import {fmt, dayDiff} from '../engine'
import {
  GraduationCap,
  Calendar,
  Clock,
  Sparkles,
  BookOpen
} from 'lucide-react'

export default function SIEExaminations() {
  const {st, today, go} = useStore()

  const sieEvents = st.events
    .filter(e => e.type === 'sie')
    .sort((a, b) => (a.date || '').localeCompare(b.date || ''))

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <div className="page-header">
        <div className="page-title-row">
          <h1 className="page-title">
            <GraduationCap size={22} color="var(--danger)" />
            SIE Examinations (Semester End Evaluation)
          </h1>
          <button className="btn btn-primary btn-sm" onClick={() => go('StudyPlan')}>
            <Sparkles size={14} /> Plan SIE Revision
          </button>
        </div>
        <p className="page-subtitle">
          University / Semester End final examinations, VTU schedule, and comprehensive subject revision plans.
        </p>
      </div>

      {sieEvents.length === 0 ? (
        <div className="notion-card" style={{ textAlign: 'center', padding: '40px 20px' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 12 }}>
            No SIE final examinations are currently scheduled in this planning window.
          </p>
          <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginBottom: 16 }}>
            SIE examinations typically occur towards the end of the academic semester (January / June).
          </p>
          <button className="btn btn-secondary btn-sm" onClick={() => go('Documents')}>
            Upload SIE Notification Circular
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {sieEvents.map(e => {
            const diff = dayDiff(today, e.date || today)
            return (
              <div
                key={e.id}
                className="notion-card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderLeft: '4px solid var(--danger)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span className="event-badge event-sie">SIE FINAL EXAM</span>
                    {e.code && (
                      <span style={{ fontSize: 12, fontWeight: 600 }}>{e.code}</span>
                    )}
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                    {e.title}
                  </div>
                  <div style={{ display: 'flex', gap: 16, fontSize: 12.5, color: 'var(--text-muted)' }}>
                    <span><Calendar size={13} /> {e.date}</span>
                    <span><Clock size={13} /> {fmt(e.start)} – {fmt(e.end)}</span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span className="tag-pill tag-hard" style={{ fontSize: 12, padding: '4px 10px' }}>
                    {diff === 0 ? 'Today!' : `in ${diff} days`}
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
