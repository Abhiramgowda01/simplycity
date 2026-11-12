import React, {useState} from 'react'
import {useStore} from '../hooks/useStore'
import {dayDiff, isExam, Task, TType} from '../engine'
import {
  CheckSquare,
  Plus,
  Trash2,
  Calendar,
  AlertTriangle,
  Clock,
  Filter,
  Search
} from 'lucide-react'

type TabType = 'all' | 'today' | 'upcoming' | 'overdue' | 'completed'

export default function TasksPage() {
  const {st, set, today, cname, colorOf, go} = useStore()
  const [activeTab, setActiveTab] = useState<TabType>('all')
  const [search, setSearch] = useState('')
  const [newTask, setNewTask] = useState({
    title: '',
    courseId: st.courses[0]?.id || '',
    type: 'assignment' as TType,
    deadline: today,
    estimatedHours: 2
  })

  const toggleTaskStatus = (id: string, current: string) => {
    set({
      tasks: st.tasks.map(t => t.id === id ? {...t, status: current === 'done' ? 'pending' : 'done'} : t)
    })
  }

  const deleteTask = (id: string) => {
    set({
      tasks: st.tasks.filter(t => t.id !== id)
    })
  }

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTask.title) return
    const created: Task = {
      id: Math.random().toString(36).slice(2, 9),
      title: newTask.title,
      courseId: newTask.courseId || (st.courses[0]?.id || 'gen'),
      type: newTask.type,
      deadline: newTask.deadline,
      estimatedHours: newTask.estimatedHours,
      status: 'pending'
    }
    set({tasks: [...st.tasks, created]})
    setNewTask({
      title: '',
      courseId: st.courses[0]?.id || '',
      type: 'assignment',
      deadline: today,
      estimatedHours: 2
    })
  }

  // Filter tasks based on active tab and search
  const filteredTasks = st.tasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) ||
                          cname(t.courseId).toLowerCase().includes(search.toLowerCase())
    if (!matchesSearch) return false

    const diff = dayDiff(today, t.deadline)
    if (activeTab === 'completed') return t.status === 'done'
    if (activeTab === 'today') return t.status !== 'done' && diff === 0
    if (activeTab === 'upcoming') return t.status !== 'done' && diff > 0
    if (activeTab === 'overdue') return t.status !== 'done' && diff < 0
    return true
  }).sort((a, b) => a.deadline.localeCompare(b.deadline))

  const countFor = (tab: TabType) => {
    return st.tasks.filter(t => {
      const diff = dayDiff(today, t.deadline)
      if (tab === 'completed') return t.status === 'done'
      if (tab === 'today') return t.status !== 'done' && diff === 0
      if (tab === 'upcoming') return t.status !== 'done' && diff > 0
      if (tab === 'overdue') return t.status !== 'done' && diff < 0
      return true
    }).length
  }

  const getUrgencyBadge = (t: Task) => {
    if (t.status === 'done') return <span className="tag-pill tag-easy">Completed</span>
    const diff = dayDiff(today, t.deadline)
    if (diff < 0) return <span className="tag-pill tag-hard">Overdue ({Math.abs(diff)}d)</span>
    if (diff === 0) return <span className="tag-pill tag-hard">Due Today</span>
    if (diff === 1) return <span className="tag-pill tag-hard">&lt;24h</span>
    if (diff <= 3) return <span className="tag-pill tag-medium">≤3 days</span>
    if (diff <= 7) return <span className="tag-pill tag-easy">≤7 days</span>
    return <span className="tag-pill" style={{ background: 'var(--secondary-bg)', color: 'var(--text-secondary)' }}>in {diff}d</span>
  }

  const getCategoryBadge = (type: TType) => {
    switch(type) {
      case 'cie': return <span className="event-badge event-cie">CIE</span>
      case 'sie': return <span className="event-badge event-sie">SIE</span>
      case 'assignment': return <span className="event-badge event-assignment">Assignment</span>
      case 'quiz': return <span className="event-badge event-lab">Quiz</span>
      case 'project': return <span className="event-badge event-lecture">Project</span>
      default: return <span className="event-badge event-personal">Task</span>
    }
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <div className="page-header">
        <div className="page-title-row">
          <h1 className="page-title">
            <CheckSquare size={22} color="var(--accent)" />
            Tasks & Academic Deadlines
          </h1>
          <button className="btn btn-primary btn-sm" onClick={() => go('StudyPlan')}>
            Generate Study Plan →
          </button>
        </div>
        <p className="page-subtitle">
          Track assignments, quizzes, project submissions, and examination deadlines in a Notion database view.
        </p>
      </div>

      {/* DATABASE CONTAINER */}
      <div className="notion-table-container">
        {/* DATABASE TABS & SEARCH */}
        <div className="notion-table-toolbar">
          <div className="table-tabs">
            {(['all', 'today', 'upcoming', 'overdue', 'completed'] as TabType[]).map(tab => (
              <button
                key={tab}
                className={`table-tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                <span style={{ fontSize: 11, opacity: 0.7 }}>({countFor(tab)})</span>
              </button>
            ))}
          </div>

          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={13} style={{ position: 'absolute', left: 8, color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Filter tasks..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                paddingLeft: 24,
                paddingRight: 8,
                paddingTop: 3,
                paddingBottom: 3,
                fontSize: 12,
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                background: 'var(--card-bg)'
              }}
            />
          </div>
        </div>

        {/* DATABASE TABLE */}
        <div style={{ overflowX: 'auto' }}>
          <table className="notion-table">
            <thead>
              <tr>
                <th style={{ width: 40 }}>Done</th>
                <th>Task Title</th>
                <th style={{ width: 180 }}>Subject / Course</th>
                <th style={{ width: 110 }}>Category</th>
                <th style={{ width: 120 }}>Deadline</th>
                <th style={{ width: 120 }}>Urgency</th>
                <th style={{ width: 90 }}>Est. Hours</th>
                <th style={{ width: 50 }}></th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map(t => {
                const isCompleted = t.status === 'done'
                return (
                  <tr key={t.id} style={{ opacity: isCompleted ? 0.6 : 1 }}>
                    <td>
                      <input
                        type="checkbox"
                        checked={isCompleted}
                        onChange={() => toggleTaskStatus(t.id, t.status)}
                        style={{ cursor: 'pointer' }}
                      />
                    </td>
                    <td>
                      <span style={{ fontWeight: 500, textDecoration: isCompleted ? 'line-through' : 'none' }}>
                        {t.title}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            backgroundColor: colorOf(t.courseId),
                            display: 'inline-block'
                          }}
                        />
                        <span style={{ fontSize: 12.5 }}>{cname(t.courseId)}</span>
                      </div>
                    </td>
                    <td>
                      {getCategoryBadge(t.type)}
                    </td>
                    <td>
                      <span style={{ fontSize: 12.5, fontFamily: 'monospace' }}>
                        {t.deadline}
                      </span>
                    </td>
                    <td>
                      {getUrgencyBadge(t)}
                    </td>
                    <td>
                      <span style={{ fontSize: 12.5 }}>
                        {isExam(t.type) ? '—' : `${t.estimatedHours}h`}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn-icon"
                        title="Delete task"
                        onClick={() => deleteTask(t.id)}
                      >
                        <Trash2 size={13} color="var(--danger)" />
                      </button>
                    </td>
                  </tr>
                )
              })}

              {filteredTasks.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: 24, color: 'var(--text-secondary)' }}>
                    No tasks match this filter. Add a new task below.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD NEW TASK ROW */}
      <div className="notion-card">
        <h4 style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 12 }}>+ Add New Academic Task</h4>
        <form onSubmit={handleAddTask} style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-end' }}>
          <div style={{ flex: '1 1 240px' }}>
            <label className="form-label">Task Title</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Lab Exercise 4, Milestone 2, CIE-1 Preparation"
              value={newTask.title}
              onChange={e => setNewTask({...newTask, title: e.target.value})}
              required
            />
          </div>

          <div style={{ flex: '1 1 180px' }}>
            <label className="form-label">Course</label>
            <select
              className="form-select"
              value={newTask.courseId}
              onChange={e => setNewTask({...newTask, courseId: e.target.value})}
            >
              {st.courses.map(c => (
                <option key={c.id} value={c.id}>
                  {c.code} – {c.name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ width: 130 }}>
            <label className="form-label">Category</label>
            <select
              className="form-select"
              value={newTask.type}
              onChange={e => setNewTask({...newTask, type: e.target.value as TType})}
            >
              <option value="assignment">Assignment</option>
              <option value="quiz">Quiz</option>
              <option value="project">Project</option>
              <option value="cie">CIE Exam</option>
              <option value="sie">SIE Exam</option>
              <option value="other">Other Task</option>
            </select>
          </div>

          <div style={{ width: 140 }}>
            <label className="form-label">Deadline</label>
            <input
              type="date"
              className="form-input"
              value={newTask.deadline}
              onChange={e => setNewTask({...newTask, deadline: e.target.value})}
              required
            />
          </div>

          <div style={{ width: 90 }}>
            <label className="form-label">Hours</label>
            <input
              type="number"
              step="0.5"
              min="0.5"
              className="form-input"
              value={newTask.estimatedHours}
              onChange={e => setNewTask({...newTask, estimatedHours: Number(e.target.value)})}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ height: 35 }}>
            <Plus size={14} /> Add Task
          </button>
        </form>
      </div>
    </div>
  )
}

