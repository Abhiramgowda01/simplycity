import React, {useState} from 'react'
import {useStore} from '../hooks/useStore'
import {EType, Ev, dedupe, fmt} from '../engine'
import {dayName, extractFromFile, parseCSV} from '../services/documentParser'
import {extractTimetableMatrix, ExtractedTimetableResult} from '../services/timetableExtractor'
import {
  FileText,
  Upload,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  Clock,
  Trash2,
  Edit2,
  ArrowRight,
  ShieldCheck,
  FileCheck
} from 'lucide-react'

const CATEGORIES: [string, EType, string][] = [
  ['Regular College Timetable', 'class', 'Weekly lecture & laboratory schedule grid'],
  ['Academic Event Calendar', 'event', 'Institutional events, holidays, fests & seminars'],
  ['CIE Examination Timetable', 'cie', 'Continuous Internal Evaluation test dates & slots'],
  ['SIE Examination Timetable', 'sie', 'Semester End University examination schedule'],
  ['Assignment & Project Schedule', 'event', 'Submission deadlines & project review dates'],
  ['Additional Academic Schedule', 'personal', 'Tutorials, coaching, mentoring or labs']
]

export default function DocumentsPage() {
  const {st, set, go, setLog, loadMiteData} = useStore()
  const [selectedCat, setSelectedCat] = useState<number>(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingStatus, setProcessingStatus] = useState<string>('')
  const [reviewState, setReviewState] = useState<{
    events: Ev[]
    gridResult?: ExtractedTimetableResult
    errors: string[]
    fileName: string
  } | null>(null)

  // Handle uploaded files
  const handleFileUpload = async (files: FileList | null, catIdx: number) => {
    if (!files || !files.length) return
    setIsProcessing(true)
    const category = CATEGORIES[catIdx][1]
    const file = files[0]
    setProcessingStatus(`Analyzing document ${file.name} using PDF & OCR service...`)

    try {
      const parsed = await extractFromFile(file, category)
      setReviewState({
        events: parsed.events,
        gridResult: parsed.gridResult,
        errors: parsed.errors,
        fileName: file.name
      })
      setProcessingStatus('')
    } catch (err: any) {
      alert(`Error processing document: ${err?.message || err}`)
      setProcessingStatus('')
    } finally {
      setIsProcessing(false)
    }
  }

  // Load MITE CSE Test Document directly
  const handleLoadMiteDocument = () => {
    setIsProcessing(true)
    setProcessingStatus('Analyzing MITE Department of CSE Semester 5 Timetable Document...')
    setTimeout(() => {
      const grid = extractTimetableMatrix(
        'MANGALORE INSTITUTE OF TECHNOLOGY & ENGINEERING Department of Computer Science & Engineering 23CSPC302 23HMCC301 23CSPC303 23CSPC305 23CSPE311',
        'MITE_CSE_Sem5_Timetable.jpeg'
      )
      setReviewState({
        events: grid.events,
        gridResult: grid,
        errors: grid.errors,
        fileName: 'MITE_CSE_Sem5_Timetable.jpeg'
      })
      setIsProcessing(false)
      setProcessingStatus('')
    }, 400)
  }

  // Confirm extracted records
  const handleConfirmExtraction = () => {
    if (!reviewState) return
    const currentEvents = st.events
    const combined = dedupe([...currentEvents, ...reviewState.events]).kept

    // Also auto-sync discovered courses if any
    let updatedCourses = st.courses
    if (reviewState.gridResult && reviewState.gridResult.courses.length > 0) {
      const existingCodes = new Set(st.courses.map(c => c.code.toLowerCase()))
      const newCourses = reviewState.gridResult.courses.filter(
        c => !existingCodes.has(c.code.toLowerCase())
      )
      updatedCourses = [...st.courses, ...newCourses]
    }

    set({
      events: combined,
      courses: updatedCourses
    })
    setLog([
      `Successfully confirmed ${reviewState.events.length} extracted academic timetable records from ${reviewState.fileName}!`
    ])
    setReviewState(null)
    go('MyWeek')
  }

  // Update item during review
  const updateReviewItem = (id: string, partial: Partial<Ev>) => {
    if (!reviewState) return
    setReviewState({
      ...reviewState,
      events: reviewState.events.map(e => e.id === id ? {...e, ...partial, verified: true} : e)
    })
  }

  const deleteReviewItem = (id: string) => {
    if (!reviewState) return
    setReviewState({
      ...reviewState,
      events: reviewState.events.filter(e => e.id !== id)
    })
  }

  return (
    <div style={{ maxWidth: 1050, margin: '0 auto' }}>
      <div className="page-header">
        <div className="page-title-row">
          <h1 className="page-title">
            <FileText size={22} color="var(--accent)" />
            Academic Document Analysis & OCR
          </h1>
          <button className="btn btn-secondary btn-sm" onClick={handleLoadMiteDocument}>
            <Sparkles size={14} /> Analyze MITE Timetable Test Document
          </button>
        </div>
        <p className="page-subtitle">
          Upload official college documents (PDF, PNG, JPG, CSV, ICS). SmartStudy extracts periods, laboratory blocks, breaks, and exams.
        </p>
      </div>

      {/* PROCESSING INDICATOR */}
      {isProcessing && (
        <div className="notion-banner info">
          <Clock size={16} style={{ animation: 'spin 1s linear infinite' }} />
          <span>{processingStatus}</span>
        </div>
      )}

      {/* REVIEW & CONFIRMATION SCREEN */}
      {reviewState ? (
        <div className="notion-card">
          <div className="card-header">
            <div>
              <span className="card-title" style={{ fontSize: 16 }}>
                <FileCheck size={18} color="var(--success)" />
                Extraction Review: {reviewState.fileName}
              </span>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                {reviewState.gridResult?.instituteName && `${reviewState.gridResult.instituteName} · `}
                {reviewState.gridResult?.semesterSection || 'Extracted Timetable Records'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => setReviewState(null)}>
                Cancel
              </button>
              <button className="btn btn-primary btn-sm" onClick={handleConfirmExtraction}>
                <CheckCircle size={14} /> Confirm & Sync to Workspace ({reviewState.events.length})
              </button>
            </div>
          </div>

          {/* WARNINGS & UNCERTAINTIES */}
          {reviewState.errors.length > 0 && (
            <div className="notion-banner warn" style={{ marginBottom: 16 }}>
              <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <b>Automated Table Alignment Notes:</b>
                <ul style={{ margin: '4px 0 0 16px', fontSize: 12.5 }}>
                  {reviewState.errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* EXTRACTED COURSES CHIP ROW */}
          {reviewState.gridResult?.courses && reviewState.gridResult.courses.length > 0 && (
            <div style={{ marginBottom: 16, padding: '10px 12px', background: 'var(--secondary-bg)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                AUTO-IDENTIFIED COURSE CODES & TITLES ({reviewState.gridResult.courses.length})
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {reviewState.gridResult.courses.map(c => (
                  <span key={c.id} className="event-badge event-personal" style={{ fontSize: 11.5 }}>
                    <b>{c.code}</b>: {c.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* EXTRACTED EVENTS TABLE */}
          <div className="notion-table-container">
            <table className="notion-table">
              <thead>
                <tr>
                  <th>Subject / Title</th>
                  <th style={{ width: 100 }}>Type</th>
                  <th style={{ width: 100 }}>Day / Date</th>
                  <th style={{ width: 130 }}>Time Slot</th>
                  <th style={{ width: 100 }}>Confidence</th>
                  <th style={{ width: 60 }}></th>
                </tr>
              </thead>
              <tbody>
                {reviewState.events.map(e => {
                  const isUncertain = (e.confidence || 100) < 95
                  return (
                    <tr key={e.id} style={{ backgroundColor: isUncertain ? '#FFFBEB' : 'transparent' }}>
                      <td>
                        <input
                          type="text"
                          value={e.title}
                          onChange={ev => updateReviewItem(e.id, {title: ev.target.value})}
                          style={{ fontWeight: 500 }}
                        />
                      </td>
                      <td>
                        <select
                          value={e.type}
                          onChange={ev => updateReviewItem(e.id, {type: ev.target.value as any})}
                        >
                          <option value="class">Lecture</option>
                          <option value="lab">Laboratory</option>
                          <option value="cie">CIE</option>
                          <option value="sie">SIE</option>
                          <option value="event">Event</option>
                        </select>
                      </td>
                      <td>
                        <span style={{ fontSize: 12.5, fontWeight: 500 }}>
                          {e.dow !== undefined ? dayName(e.dow) : e.date}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: 12.5 }}>
                          {fmt(e.start)} – {fmt(e.end)}
                        </span>
                      </td>
                      <td>
                        <span className={`tag-pill ${isUncertain ? 'tag-medium' : 'tag-easy'}`}>
                          {e.confidence || 95}% {isUncertain ? '⚠ Review' : '✓ OK'}
                        </span>
                      </td>
                      <td>
                        <button className="btn-icon" onClick={() => deleteReviewItem(e.id)}>
                          <Trash2 size={13} color="var(--danger)" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
            <button className="btn btn-primary" onClick={handleConfirmExtraction}>
              <CheckCircle size={14} /> Confirm and Load into Workspace
            </button>
          </div>
        </div>
      ) : (
        /* UPLOAD DOCUMENT CATEGORIES */
        <div>
          <div className="notion-card" style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 14.5, fontWeight: 600, marginBottom: 8 }}>
              Select Academic Document Category
            </h3>
            <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginBottom: 16 }}>
              Supported formats: PDF, JPG, PNG, CSV, ICS. SmartStudy automatically detects table grids and handles merged laboratory periods.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 12 }}>
              {CATEGORIES.map(([title, type, desc], i) => (
                <div
                  key={i}
                  style={{
                    padding: '14px 16px',
                    borderRadius: 'var(--radius-lg)',
                    border: `1px solid ${selectedCat === i ? 'var(--accent)' : 'var(--border-color)'}`,
                    backgroundColor: selectedCat === i ? 'var(--accent-muted)' : 'var(--card-bg)',
                    cursor: 'pointer'
                  }}
                  onClick={() => setSelectedCat(i)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontWeight: 600, fontSize: 13.5 }}>{title}</span>
                    <span className="event-badge event-personal" style={{ fontSize: 10.5 }}>
                      {type.toUpperCase()}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12 }}>
                    {desc}
                  </div>

                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.csv,.ics"
                    onChange={e => handleFileUpload(e.target.files, i)}
                    style={{ fontSize: 12, width: '100%' }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* DEDICATED MITE TEST DOCUMENT CALLOUT */}
          <div className="notion-card" style={{ background: 'var(--secondary-bg)', border: '1px dashed var(--accent)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h4 style={{ fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Sparkles size={16} color="var(--accent)" />
                  Test Case: Mangalore Institute of Technology & Engineering (MITE)
                </h4>
                <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginTop: 2 }}>
                  Department of Computer Science & Engineering · Semester 5 · Section CSE1 · Odd Sem 2026–27.
                  Includes merged laboratory sessions, period breaks, and course mapping.
                </p>
              </div>
              <button className="btn btn-accent btn-sm" onClick={handleLoadMiteDocument}>
                <Sparkles size={14} /> Run MITE Extraction Test
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

