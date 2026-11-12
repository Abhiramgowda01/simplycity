import React from 'react'
import {useStore} from '../hooks/useStore'
import {fmt, dayDiff} from '../engine'
import {MITE_CIE_EVENTS} from '../data/miteTimetable'
import {
  Flame,
  Calendar,
  Clock,
  Sparkles,
  CheckCircle,
  FileText,
  Award,
  BookOpen,
  ArrowRight
} from 'lucide-react'

export default function CIEExaminations() {
  const {st, today, go, loadMiteData} = useStore()

  // Find all CIE events in store, fallback to official MITE_CIE_EVENTS
  const cieEvents = (st.events.filter(e => e.type === 'cie').length > 0
    ? st.events.filter(e => e.type === 'cie')
    : MITE_CIE_EVENTS
  ).sort((a, b) => {
    const cmp = (a.date || '').localeCompare(b.date || '')
    if (cmp !== 0) return cmp
    return a.start - b.start
  })

  // Group by date for the official grid
  const days = [
    {
      date: '2026-10-31',
      dayLabel: '31-10-2026 Saturday',
      morning: cieEvents.find(e => e.date === '2026-10-31' && e.start < 720),
      afternoon: cieEvents.find(e => e.date === '2026-10-31' && e.start >= 720)
    },
    {
      date: '2026-11-02',
      dayLabel: '02-11-2026 Monday',
      morning: cieEvents.find(e => e.date === '2026-11-02' && e.start < 720),
      afternoon: cieEvents.find(e => e.date === '2026-11-02' && e.start >= 720)
    },
    {
      date: '2026-11-03',
      dayLabel: '03-11-2026 Tuesday',
      morning: cieEvents.find(e => e.date === '2026-11-03' && e.start < 720),
      afternoon: cieEvents.find(e => e.date === '2026-11-03' && e.start >= 720)
    }
  ]

  return (
    <div style={{ maxWidth: 1050, margin: '0 auto' }}>
      <div className="page-header">
        <div className="page-title-row">
          <h1 className="page-title">
            <Flame size={22} color="var(--warning)" />
            Continuous Internal Evaluation (CIE) Test I Time Table
          </h1>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary btn-sm" onClick={loadMiteData}>
              <Sparkles size={14} /> Reload MITE Schedule
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => go('StudyPlan')}>
              <Sparkles size={14} /> Plan CIE Revision
            </button>
          </div>
        </div>
        <p className="page-subtitle">
          Official Internal Assessment Circular · Academic Year 2026–27 · Semester 5 · Department of Computer Science & Engineering
        </p>
      </div>

      {/* OFFICIAL INSTITUTIONAL CIRCULAR CARD */}
      <div className="notion-card" style={{ border: '1px solid #E2E8F0', padding: 24, background: '#FFFFFF', marginBottom: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
        <div style={{ textAlign: 'center', borderBottom: '2px solid #334155', paddingBottom: 16, marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: '#64748B', textTransform: 'uppercase' }}>
            MITE-21 · Autonomous Institute Affiliated to VTU, Belagavi · Accredited by NAAC with A+ Grade
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0F172A', marginTop: 4, letterSpacing: '-0.01em' }}>
            MANGALORE INSTITUTE OF TECHNOLOGY & ENGINEERING
          </h2>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#334155', marginTop: 2 }}>
            DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#BE123C', marginTop: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            CONTINUOUS INTERNAL EVALUATION (CIE) TEST I TIME TABLE
          </div>
          <div style={{ fontSize: 12, color: '#475569', marginTop: 3 }}>
            <b>Academic Year: 2026-27</b> · <b>V Semester (Section CSE1)</b>
          </div>
        </div>

        {/* TIME TABLE MATRIX AS PRESENT IN OFFICIAL DOCUMENT */}
        <div style={{ overflowX: 'auto', marginBottom: 20 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', border: '2px solid #334155', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #334155' }}>
                <th style={{ border: '1px solid #CBD5E1', padding: '12px 14px', width: '22%', textAlign: 'center', fontWeight: 700, color: '#0F172A' }}>
                  TIME <br /> DAY
                </th>
                <th style={{ border: '1px solid #CBD5E1', padding: '12px 14px', width: '39%', textAlign: 'center', fontWeight: 700, color: '#0F172A' }}>
                  09.15 AM – 10.45 AM <br />
                  <span style={{ fontSize: 11, fontWeight: 500, color: '#64748B' }}>(Morning Session)</span>
                </th>
                <th style={{ border: '1px solid #CBD5E1', padding: '12px 14px', width: '39%', textAlign: 'center', fontWeight: 700, color: '#0F172A' }}>
                  1.15 PM – 2.45 PM <br />
                  <span style={{ fontSize: 11, fontWeight: 500, color: '#64748B' }}>(Afternoon Session)</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {days.map((row, i) => (
                <tr key={row.date} style={{ background: i % 2 === 0 ? '#FFFFFF' : '#FAFAFA' }}>
                  <td style={{ border: '1px solid #CBD5E1', padding: '14px', fontWeight: 700, color: '#1E293B', textAlign: 'center', verticalAlign: 'middle' }}>
                    {row.dayLabel}
                  </td>
                  <td style={{ border: '1px solid #CBD5E1', padding: '14px', verticalAlign: 'top' }}>
                    {row.morning ? (
                      <div>
                        <div style={{ fontWeight: 600, color: '#0F172A', fontSize: 13.5 }}>
                          {row.morning.title.replace('CIE-1: ', '')}
                        </div>
                        <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 4 }}>
                          Slot: <b>09:15 AM – 10:45 AM</b> (90 mins)
                        </div>
                      </div>
                    ) : (
                      <span style={{ color: '#94A3B8' }}>—</span>
                    )}
                  </td>
                  <td style={{ border: '1px solid #CBD5E1', padding: '14px', verticalAlign: 'top' }}>
                    {row.afternoon ? (
                      <div>
                        <div style={{ fontWeight: 600, color: '#0F172A', fontSize: 13.5 }}>
                          {row.afternoon.title.replace('CIE-1: ', '')}
                        </div>
                        <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 4 }}>
                          Slot: <b>01:15 PM – 02:45 PM</b> (90 mins)
                        </div>
                      </div>
                    ) : (
                      <span style={{ color: '#94A3B8' }}>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* OFFICIAL SIGNATORIES FOOTER */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, borderTop: '1px dashed #CBD5E1', paddingTop: 16, textAlign: 'center', fontSize: 11.5, color: '#475569' }}>
          <div>
            <div style={{ fontWeight: 600, color: '#0F172A' }}>Amrutha Kamath</div>
            <div>Exam Coordinator</div>
          </div>
          <div>
            <div style={{ fontWeight: 600, color: '#0F172A' }}>Controller of Examinations</div>
            <div>Verified (16/10/26)</div>
          </div>
          <div>
            <div style={{ fontWeight: 600, color: '#0F172A' }}>Dr. Terence K Johnson</div>
            <div>Associate Dean Academics</div>
          </div>
          <div>
            <div style={{ fontWeight: 600, color: '#0F172A' }}>Head of the Department</div>
            <div>Dept. of Comp. Sc. & Engg</div>
          </div>
          <div>
            <div style={{ fontWeight: 600, color: '#0F172A' }}>Principal</div>
            <div>Approved</div>
          </div>
        </div>
      </div>

      {/* DETAILED EXAM CARDS WITH PREPARATION ACTIONS */}
      <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>
        Exam Preparation & Subject Readiness
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 14 }}>
        {cieEvents.map(e => {
          const diff = dayDiff(today, e.date || today)
          const isMorning = e.start < 720
          return (
            <div
              key={e.id}
              className="notion-card"
              style={{
                borderLeft: '4px solid #EA580C',
                padding: '14px 16px',
                marginBottom: 0
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <span className="event-badge event-cie">
                  {isMorning ? 'MORNING 09:15 AM' : 'AFTERNOON 01:15 PM'}
                </span>
                <span style={{ fontSize: 11.5, fontWeight: 600, color: '#EA580C' }}>
                  {e.date}
                </span>
              </div>

              <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', marginBottom: 6, lineHeight: 1.3 }}>
                {e.title}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Clock size={13} /> {fmt(e.start)} – {fmt(e.end)}
                </span>
                <span>•</span>
                <span>Max: 50 Marks</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => go('StudyPlan')}
                >
                  <Sparkles size={13} /> Schedule Study Sessions
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
