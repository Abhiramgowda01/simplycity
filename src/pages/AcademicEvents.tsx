import React, {useState} from 'react'
import {useStore} from '../hooks/useStore'
import {fmt} from '../engine'
import {
  CalendarDays,
  Plus,
  Trash2,
  CheckCircle2,
  Calendar,
  Clock,
  Flag
} from 'lucide-react'

export default function AcademicEvents() {
  const {st, set, go} = useStore()
  const [filter, setFilter] = useState<'all'|'holiday'|'event'>('all')

  const events = st.events.filter(e => e.type === 'event' || e.type === 'holiday')

  const toggleEventFixed = (id: string, current: boolean) => {
    set({
      events: st.events.map(e => e.id === id ? {...e, fixed: !current} : e)
    })
  }

  const deleteEvent = (id: string) => {
    set({
      events: st.events.filter(e => e.id !== id)
    })
  }

  const filtered = events.filter(e => filter === 'all' || e.type === filter)

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <div className="page-header">
        <div className="page-title-row">
          <h1 className="page-title">
            <CalendarDays size={22} color="var(--accent)" />
            Academic Events & Institutional Calendar
          </h1>
          <button className="btn btn-secondary btn-sm" onClick={() => go('Documents')}>
            Upload Event Calendar
          </button>
        </div>
        <p className="page-subtitle">
          College holidays, technical fests, symposiums, guest lectures, and institutional activities.
        </p>
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        <button
          className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setFilter('all')}
        >
          All Events ({events.length})
        </button>
        <button
          className={`btn btn-sm ${filter === 'holiday' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setFilter('holiday')}
        >
          Holidays ({events.filter(e => e.type === 'holiday').length})
        </button>
        <button
          className={`btn btn-sm ${filter === 'event' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setFilter('event')}
        >
          Activities & Fests ({events.filter(e => e.type === 'event').length})
        </button>
      </div>

      <div className="notion-table-container">
        <table className="notion-table">
          <thead>
            <tr>
              <th>Event Title</th>
              <th style={{ width: 110 }}>Type</th>
              <th style={{ width: 140 }}>Date</th>
              <th style={{ width: 130 }}>Time</th>
              <th style={{ width: 130 }}>Blocks Study</th>
              <th style={{ width: 60 }}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(e => (
              <tr key={e.id}>
                <td>
                  <span style={{ fontWeight: 500 }}>{e.title}</span>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    Source: {e.source}
                  </div>
                </td>
                <td>
                  <span className={`event-badge ${e.type === 'holiday' ? 'event-holiday' : 'event-event'}`}>
                    {e.type.toUpperCase()}
                  </span>
                </td>
                <td>
                  <span style={{ fontSize: 12.5, fontFamily: 'monospace' }}>
                    {e.date || 'Weekly'}
                  </span>
                </td>
                <td>
                  <span style={{ fontSize: 12.5 }}>
                    {e.start === 0 && e.end === 1440 ? 'All Day' : `${fmt(e.start)} – ${fmt(e.end)}`}
                  </span>
                </td>
                <td>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={e.fixed}
                      onChange={() => toggleEventFixed(e.id, e.fixed)}
                    />
                    <span style={{ fontSize: 12 }}>{e.fixed ? 'Yes (Fixed)' : 'No (Optional)'}</span>
                  </label>
                </td>
                <td>
                  <button className="btn-icon" onClick={() => deleteEvent(e.id)}>
                    <Trash2 size={13} color="var(--danger)" />
                  </button>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: 24, color: 'var(--text-secondary)' }}>
                  No academic events found in this category.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

