import React, {useState} from 'react'
import {useStore} from '../hooks/useStore'
import {Unavail} from '../types'
import {fmt} from '../engine'
import {
  Settings as SettingsIcon,
  User,
  Sliders,
  Clock,
  Sparkles,
  Database,
  Trash2,
  Plus,
  Save,
  CheckCircle2
} from 'lucide-react'

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function Settings() {
  const {st, set, demo, toggleDemo, reset, loadMiteData} = useStore()
  const [profile, setProfile] = useState(st.profile)
  const [prefs, setPrefs] = useState(st.prefs)
  const [newUnavail, setNewUnavail] = useState({
    label: '',
    start: '12:00',
    end: '13:00'
  })
  const [savedNote, setSavedNote] = useState(false)

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    set({profile})
    showSaved()
  }

  const handleSavePrefs = (e: React.FormEvent) => {
    e.preventDefault()
    set({prefs})
    showSaved()
  }

  const showSaved = () => {
    setSavedNote(true)
    setTimeout(() => setSavedNote(false), 2500)
  }

  const toggleStudyDay = (dayIndex: number) => {
    const current = prefs.studyDays || []
    const updated = current.includes(dayIndex)
      ? current.filter(d => d !== dayIndex)
      : [...current, dayIndex].sort()
    setPrefs({...prefs, studyDays: updated})
  }

  const addUnavailable = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newUnavail.label) return
    const [sh, sm] = newUnavail.start.split(':').map(Number)
    const [eh, em] = newUnavail.end.split(':').map(Number)
    const sMin = sh * 60 + sm
    const eMin = eh * 60 + em
    if (sMin >= eMin) {
      alert('End time must be after start time')
      return
    }

    const item: Unavail = {
      label: newUnavail.label,
      start: sMin,
      end: eMin
    }
    const updated = [...(prefs.unavailable || []), item]
    setPrefs({...prefs, unavailable: updated})
    set({prefs: {...st.prefs, unavailable: updated}})
    setNewUnavail({label: '', start: '12:00', end: '13:00'})
  }

  const removeUnavailable = (index: number) => {
    const updated = prefs.unavailable.filter((_, i) => i !== index)
    setPrefs({...prefs, unavailable: updated})
    set({prefs: {...st.prefs, unavailable: updated}})
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <div className="page-header">
        <h1 className="page-title">
          <SettingsIcon size={22} color="var(--accent)" />
          Workspace Settings & Preferences
        </h1>
        <p className="page-subtitle">
          Configure your student profile, study planning window, daily targets, and personal unavailable periods.
        </p>
      </div>

      {savedNote && (
        <div className="notion-banner ok">
          <CheckCircle2 size={16} /> Preferences saved successfully!
        </div>
      )}

      {/* STUDENT PROFILE SECTION */}
      <div className="notion-card">
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
          <User size={16} color="var(--accent)" />
          Student Academic Profile
        </h3>
        <form onSubmit={handleSaveProfile} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          <div>
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-input"
              value={profile.name}
              onChange={e => setProfile({...profile, name: e.target.value})}
              placeholder="e.g. Abhiram Gowda"
            />
          </div>
          <div>
            <label className="form-label">Institution / College</label>
            <input
              type="text"
              className="form-input"
              value={profile.college}
              onChange={e => setProfile({...profile, college: e.target.value})}
              placeholder="e.g. MITE Mangalore"
            />
          </div>
          <div>
            <label className="form-label">Department / Branch</label>
            <input
              type="text"
              className="form-input"
              value={profile.dept}
              onChange={e => setProfile({...profile, dept: e.target.value})}
              placeholder="e.g. Computer Science & Engineering"
            />
          </div>
          <div>
            <label className="form-label">Semester & Section</label>
            <input
              type="text"
              className="form-input"
              value={profile.sem}
              onChange={e => setProfile({...profile, sem: e.target.value})}
              placeholder="e.g. Sem 5 · CSE1"
            />
          </div>
          <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
            <button type="submit" className="btn btn-secondary btn-sm">
              <Save size={13} /> Save Profile
            </button>
          </div>
        </form>
      </div>

      {/* STUDY PLANNING PREFERENCES WIZARD */}
      <div className="notion-card">
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Sliders size={16} color="var(--accent)" />
          Study Planning & Window Configuration
        </h3>
        <form onSubmit={handleSavePrefs}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 16 }}>
            {/* Planning Date Range */}
            <div>
              <label className="form-label">Planning Start Date</label>
              <input
                type="date"
                className="form-input"
                value={prefs.startDate}
                onChange={e => setPrefs({...prefs, startDate: e.target.value})}
              />
            </div>
            <div>
              <label className="form-label">Planning End Date</label>
              <input
                type="date"
                className="form-input"
                value={prefs.endDate}
                onChange={e => setPrefs({...prefs, endDate: e.target.value})}
              />
            </div>

            {/* Daily Study Window */}
            <div>
              <label className="form-label">Daily Window: Earliest Start</label>
              <input
                type="time"
                className="form-input"
                value={`${String(Math.floor(prefs.start / 60)).padStart(2, '0')}:${String(prefs.start % 60).padStart(2, '0')}`}
                onChange={e => {
                  const [h, m] = e.target.value.split(':').map(Number)
                  setPrefs({...prefs, start: h * 60 + m})
                }}
              />
            </div>
            <div>
              <label className="form-label">Daily Window: Latest End</label>
              <input
                type="time"
                className="form-input"
                value={`${String(Math.floor(prefs.end / 60)).padStart(2, '0')}:${String(prefs.end % 60).padStart(2, '0')}`}
                onChange={e => {
                  const [h, m] = e.target.value.split(':').map(Number)
                  setPrefs({...prefs, end: h * 60 + m})
                }}
              />
            </div>

            {/* Target Hours & Session Length */}
            <div>
              <label className="form-label">Daily Study Target (Hours)</label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="10"
                className="form-input"
                value={prefs.dailyTarget}
                onChange={e => setPrefs({...prefs, dailyTarget: Number(e.target.value)})}
              />
            </div>
            <div>
              <label className="form-label">Preferred Session Length (Mins)</label>
              <select
                className="form-select"
                value={prefs.session}
                onChange={e => setPrefs({...prefs, session: Number(e.target.value)})}
              >
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>60 minutes</option>
                <option value={90}>90 minutes</option>
              </select>
            </div>
            <div>
              <label className="form-label">Buffer Break Duration (Mins)</label>
              <select
                className="form-select"
                value={prefs.breakMin}
                onChange={e => setPrefs({...prefs, breakMin: Number(e.target.value)})}
              >
                <option value={5}>5 minutes</option>
                <option value={10}>10 minutes</option>
                <option value={15}>15 minutes</option>
                <option value={20}>20 minutes</option>
              </select>
            </div>
          </div>

          {/* Preferred Study Days */}
          <div style={{ marginBottom: 16 }}>
            <label className="form-label" style={{ marginBottom: 6 }}>Preferred Study Days</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {DAY_LABELS.map((day, idx) => {
                const isSelected = prefs.studyDays.includes(idx)
                return (
                  <button
                    key={day}
                    type="button"
                    className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => toggleStudyDay(idx)}
                  >
                    {day}
                  </button>
                )
              })}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary btn-sm">
              <Save size={13} /> Save Planning Preferences
            </button>
          </div>
        </form>
      </div>

      {/* PERSONAL AVAILABILITY (UNAVAILABLE PERIODS) */}
      <div className="notion-card">
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Clock size={16} color="var(--accent)" />
          Personal Unavailable Blocks (Meals, Commute, Sports, Sleep)
        </h3>
        <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginBottom: 14 }}>
          SmartStudy strictly avoids scheduling study sessions during these personal hours.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
          {(prefs.unavailable || []).map((u, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                background: 'var(--secondary-bg)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)'
              }}
            >
              <div>
                <span style={{ fontWeight: 500, fontSize: 13 }}>{u.label || 'Unavailable'}</span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 8 }}>
                  {fmt(u.start)} – {fmt(u.end)}
                </span>
              </div>
              <button className="btn-icon" onClick={() => removeUnavailable(idx)}>
                <Trash2 size={13} color="var(--danger)" />
              </button>
            </div>
          ))}

          {(!prefs.unavailable || prefs.unavailable.length === 0) && (
            <p style={{ color: 'var(--text-muted)', fontSize: 12.5 }}>No personal unavailable blocks configured.</p>
          )}
        </div>

        {/* Add unavailable row */}
        <form onSubmit={addUnavailable} style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 180px' }}>
            <label className="form-label">Activity</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Dinner, Commute, Gym"
              value={newUnavail.label}
              onChange={e => setNewUnavail({...newUnavail, label: e.target.value})}
              required
            />
          </div>
          <div style={{ width: 120 }}>
            <label className="form-label">Start</label>
            <input
              type="time"
              className="form-input"
              value={newUnavail.start}
              onChange={e => setNewUnavail({...newUnavail, start: e.target.value})}
              required
            />
          </div>
          <div style={{ width: 120 }}>
            <label className="form-label">End</label>
            <input
              type="time"
              className="form-input"
              value={newUnavail.end}
              onChange={e => setNewUnavail({...newUnavail, end: e.target.value})}
              required
            />
          </div>
          <button type="submit" className="btn btn-secondary btn-sm" style={{ height: 35 }}>
            <Plus size={14} /> Add Block
          </button>
        </form>
      </div>

      {/* DATA MANAGEMENT */}
      <div className="notion-card">
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Database size={16} color="var(--accent)" />
          Data Management & Test Profiles
        </h3>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn btn-secondary btn-sm" onClick={loadMiteData}>
            <Sparkles size={14} /> Load MITE CSE Test Profile
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => toggleDemo(!demo)}>
            <Database size={14} /> {demo ? 'Exit Demo Mode' : 'Switch to Demo Mode'}
          </button>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => {
              if (confirm('Are you sure you want to reset all workspace data?')) {
                reset()
              }
            }}
          >
            <Trash2 size={14} color="var(--danger)" /> Reset Workspace Data
          </button>
        </div>
      </div>
    </div>
  )
}
