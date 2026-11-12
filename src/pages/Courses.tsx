import React, {useState} from 'react'
import {useStore, PALETTE} from '../hooks/useStore'
import {priority, isExam, Task, Course} from '../engine'
import {
  BookOpen,
  Plus,
  Trash2,
  ExternalLink,
  X,
  Search,
  Filter
} from 'lucide-react'

export default function Courses() {
  const {st, set, today, colorOf, courseFor, go} = useStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [newCourse, setNewCourse] = useState({
    name: '',
    code: '',
    difficulty: 2 as 1|2|3,
    understanding: 2 as 1|2|3,
    importance: 3 as 1|2|3|4|5,
    estimatedHours: 6
  })

  const updateCourse = (id: string, partial: Partial<Course>) => {
    set({
      courses: st.courses.map(c => c.id === id ? {...c, ...partial} : c)
    })
  }

  const handleAddCourse = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCourse.name || !newCourse.code) return
    const id = newCourse.code.toLowerCase().replace(/[^a-z0-9]/g, '-')
    const created: Course = {
      id,
      name: newCourse.name,
      code: newCourse.code.toUpperCase(),
      difficulty: newCourse.difficulty,
      understanding: newCourse.understanding,
      importance: newCourse.importance,
      estimatedHours: newCourse.estimatedHours,
      color: PALETTE[st.courses.length % PALETTE.length]
    }
    set({courses: [...st.courses, created]})
    setNewCourse({name: '', code: '', difficulty: 2, understanding: 2, importance: 3, estimatedHours: 6})
  }

  const handleDeleteCourse = (id: string) => {
    set({
      courses: st.courses.filter(c => c.id !== id),
      tasks: st.tasks.filter(t => t.courseId !== id)
    })
  }

  // Auto-sync CIE / SIE tasks
  const handleCreateExamTasks = () => {
    const add: Task[] = []
    st.events.filter(e => isExam(e.type)).forEach(e => {
      const c = courseFor(e.title)
      if (c && !st.tasks.some(t => t.deadline === e.date && t.courseId === c.id && t.type === e.type)) {
        add.push({
          id: Math.random().toString(36).slice(2, 9),
          title: e.title,
          courseId: c.id,
          type: e.type as 'cie',
          deadline: e.date!,
          estimatedHours: 4,
          status: 'pending'
        })
      }
    })
    set({tasks: [...st.tasks, ...add]})
    alert(`Created ${add.length} exam preparation tasks from imported CIE/SIE schedule.`)
  }

  const filteredCourses = st.courses.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <div className="page-header">
        <div className="page-title-row">
          <h1 className="page-title">
            <BookOpen size={22} color="var(--accent)" />
            My Courses & Academic Database
          </h1>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary btn-sm" onClick={handleCreateExamTasks}>
              Sync Exam Tasks
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => go('Tasks')}>
              View Tasks & Deadlines →
            </button>
          </div>
        </div>
        <p className="page-subtitle">
          Manage enrolled subjects, course codes, difficulty ratings, and preparation hour allocations.
        </p>
      </div>

      {/* NOTION DATABASE TABLE */}
      <div className="notion-table-container">
        <div className="notion-table-toolbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search size={14} style={{ position: 'absolute', left: 8, color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{
                  paddingLeft: 26,
                  paddingRight: 8,
                  paddingTop: 4,
                  paddingBottom: 4,
                  fontSize: 12.5,
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  background: 'var(--card-bg)'
                }}
              />
            </div>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="notion-table">
            <thead>
              <tr>
                <th style={{ width: 44 }}>Color</th>
                <th>Course Name</th>
                <th style={{ width: 120 }}>Course Code</th>
                <th style={{ width: 110 }}>Difficulty</th>
                <th style={{ width: 110 }}>Understanding</th>
                <th style={{ width: 90 }}>Priority</th>
                <th style={{ width: 100 }}>Prep Hours</th>
                <th style={{ width: 140 }}>Study Progress</th>
                <th style={{ width: 60 }}></th>
              </tr>
            </thead>
            <tbody>
              {filteredCourses.map(c => {
                const prio = priority(c, st.tasks, today).score
                const doneMins = st.sessions
                  .filter(s => s.courseId === c.id && s.status === 'done')
                  .reduce((a, s) => a + (s.end - s.start), 0)
                const targetMins = c.estimatedHours * 60
                const pct = targetMins > 0 ? Math.min(100, Math.round((doneMins / targetMins) * 100)) : 0

                return (
                  <tr key={c.id}>
                    <td>
                      <input
                        type="color"
                        value={colorOf(c.id).startsWith('#') ? colorOf(c.id).slice(0, 7) : '#E0EDFD'}
                        onChange={e => updateCourse(c.id, {color: e.target.value})}
                        style={{ width: 26, height: 26, padding: 0, border: 'none', borderRadius: 4, cursor: 'pointer' }}
                      />
                    </td>
                    <td>
                      <div
                        style={{ fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                        onClick={() => setSelectedCourse(c)}
                      >
                        {c.name}
                        <ExternalLink size={12} color="var(--text-muted)" />
                      </div>
                    </td>
                    <td>
                      <span className="event-badge event-personal" style={{ fontWeight: 600 }}>
                        {c.code}
                      </span>
                    </td>
                    <td>
                      <select
                        value={c.difficulty}
                        onChange={e => updateCourse(c.id, {difficulty: Number(e.target.value) as 1|2|3})}
                      >
                        <option value={1}>Easy</option>
                        <option value={2}>Medium</option>
                        <option value={3}>Hard</option>
                      </select>
                    </td>
                    <td>
                      <select
                        value={c.understanding}
                        onChange={e => updateCourse(c.id, {understanding: Number(e.target.value) as 1|2|3})}
                      >
                        <option value={1}>Low</option>
                        <option value={2}>Medium</option>
                        <option value={3}>High</option>
                      </select>
                    </td>
                    <td>
                      <span className="tag-pill tag-medium" style={{ fontWeight: 600 }}>
                        {prio.toFixed(0)}
                      </span>
                    </td>
                    <td>
                      <input
                        type="number"
                        min={0}
                        value={c.estimatedHours}
                        onChange={e => updateCourse(c.id, {estimatedHours: Math.max(0, Number(e.target.value))})}
                        style={{ width: 60 }}
                      />
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ flex: 1, height: 6, backgroundColor: 'var(--border-color)', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', backgroundColor: 'var(--accent)' }} />
                        </div>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)', width: 32 }}>
                          {pct}%
                        </span>
                      </div>
                    </td>
                    <td>
                      <button
                        className="btn-icon"
                        title="Delete course"
                        onClick={() => handleDeleteCourse(c.id)}
                      >
                        <Trash2 size={13} color="var(--danger)" />
                      </button>
                    </td>
                  </tr>
                )
              })}

              {filteredCourses.length === 0 && (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: 24, color: 'var(--text-secondary)' }}>
                    No courses found. Add a course below or upload your college timetable to auto-import.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD COURSE INLINE FORM */}
      <div className="notion-card">
        <h4 style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 12 }}>+ Add New Course</h4>
        <form onSubmit={handleAddCourse} style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-end' }}>
          <div style={{ flex: '1 1 200px' }}>
            <label className="form-label">Course Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Distributed Systems"
              value={newCourse.name}
              onChange={e => setNewCourse({...newCourse, name: e.target.value})}
              required
            />
          </div>

          <div style={{ flex: '1 1 120px' }}>
            <label className="form-label">Course Code</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. 23CS501"
              value={newCourse.code}
              onChange={e => setNewCourse({...newCourse, code: e.target.value})}
              required
            />
          </div>

          <div style={{ width: 110 }}>
            <label className="form-label">Difficulty</label>
            <select
              className="form-select"
              value={newCourse.difficulty}
              onChange={e => setNewCourse({...newCourse, difficulty: Number(e.target.value) as 1|2|3})}
            >
              <option value={1}>Easy</option>
              <option value={2}>Medium</option>
              <option value={3}>Hard</option>
            </select>
          </div>

          <div style={{ width: 110 }}>
            <label className="form-label">Understanding</label>
            <select
              className="form-select"
              value={newCourse.understanding}
              onChange={e => setNewCourse({...newCourse, understanding: Number(e.target.value) as 1|2|3})}
            >
              <option value={1}>Low</option>
              <option value={2}>Medium</option>
              <option value={3}>High</option>
            </select>
          </div>

          <div style={{ width: 90 }}>
            <label className="form-label">Prep Hours</label>
            <input
              type="number"
              min={1}
              className="form-input"
              value={newCourse.estimatedHours}
              onChange={e => setNewCourse({...newCourse, estimatedHours: Number(e.target.value)})}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ height: 35 }}>
            <Plus size={14} /> Add Course
          </button>
        </form>
      </div>

      {/* COURSE DETAIL MODAL */}
      {selectedCourse && (
        <div className="modal-overlay" onClick={() => setSelectedCourse(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                {selectedCourse.name} ({selectedCourse.code})
              </div>
              <button className="btn-icon" onClick={() => setSelectedCourse(null)}>
                <X size={16} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div className="stat-card">
                <div className="stat-label">COURSE PRIORITY SCORE</div>
                <div className="stat-value">{priority(selectedCourse, st.tasks, today).score.toFixed(0)}</div>
                <div className="stat-sub">Based on exam urgency & difficulty</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">TARGET PREP HOURS</div>
                <div className="stat-value">{selectedCourse.estimatedHours}h</div>
                <div className="stat-sub">Required study allocation</div>
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Linked Tasks & Deadlines</h4>
              {st.tasks.filter(t => t.courseId === selectedCourse.id).length === 0 ? (
                <p style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>No tasks registered for this course.</p>
              ) : (
                st.tasks.filter(t => t.courseId === selectedCourse.id).map(t => (
                  <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 8px', borderBottom: '1px solid var(--border-light)', fontSize: 12.5 }}>
                    <span>{t.title}</span>
                    <span className="tag-pill tag-medium">Due {t.deadline}</span>
                  </div>
                ))
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setSelectedCourse(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
