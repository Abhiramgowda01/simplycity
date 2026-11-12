import {Ev,Course,Task} from '../types'
import {hm} from '../utils/time'

// MITE Department of Computer Science & Engineering - Semester 5, Section CSE1
// Academic Year 2026-27 (Odd Semester)
export const MITE_COLLEGE_NAME = 'Mangalore Institute of Technology & Engineering'
export const MITE_DEPT = 'Department of Computer Science & Engineering'
export const MITE_SEM_SECTION = 'Semester 5 · Section CSE1 · Room 201/203/205/309'
export const MITE_ADVISOR = 'Dr. Sumalatha'

export interface CourseMapping {
  code: string
  name: string
  faculty: string
  difficulty: 1|2|3
  understanding: 1|2|3
  importance: 1|2|3|4|5
  estimatedHours: number
  color: string
}

export const MITE_COURSE_MAPPINGS: Record<string, CourseMapping> = {
  '23HMCC301': {
    code: '23HMCC301',
    name: 'Management & Finance',
    faculty: 'Ms. Akshitha',
    difficulty: 1,
    understanding: 2,
    importance: 3,
    estimatedHours: 4,
    color: '#b8c7fa' // soft blue
  },
  '23CSPC302': {
    code: '23CSPC302',
    name: 'Formal Language & Automata Theory',
    faculty: 'Ms. Sunitha N V',
    difficulty: 3,
    understanding: 1,
    importance: 5,
    estimatedHours: 8,
    color: '#f5a8e0' // soft pink/purple
  },
  '23CSPC303': {
    code: '23CSPC303',
    name: 'Database Management Systems',
    faculty: 'Dr. Sumalatha',
    difficulty: 2,
    understanding: 2,
    importance: 4,
    estimatedHours: 6,
    color: '#99e0d5' // soft teal
  },
  '23CSPC305': {
    code: '23CSPC305',
    name: 'Computer Networks',
    faculty: 'Ms. Anitha',
    difficulty: 3,
    understanding: 2,
    importance: 5,
    estimatedHours: 7,
    color: '#fdb99a' // soft orange
  },
  '23CSPE311': {
    code: '23CSPE311',
    name: 'Full-Stack Development',
    faculty: 'Mr. Shivaprasad',
    difficulty: 2,
    understanding: 3,
    importance: 4,
    estimatedHours: 6,
    color: '#c4b5fd' // soft violet
  },
  '23CSPL306': {
    code: '23CSPL306',
    name: 'Database Management Systems Lab',
    faculty: 'Dr. Sumalatha / Team',
    difficulty: 2,
    understanding: 2,
    importance: 4,
    estimatedHours: 4,
    color: '#a7f3d0' // soft mint green
  },
  '23CSPL307': {
    code: '23CSPL307',
    name: 'Computer Networks Lab',
    faculty: 'Ms. Anitha / Team',
    difficulty: 2,
    understanding: 2,
    importance: 4,
    estimatedHours: 4,
    color: '#fde68a' // soft yellow
  },
  '23NMCC321': {
    code: '23NMCC321',
    name: 'Communication Skills',
    faculty: 'Mr. Vijay Anand R V',
    difficulty: 1,
    understanding: 3,
    importance: 2,
    estimatedHours: 2,
    color: '#e5e7eb' // soft grey
  },
  'OPEN_ELECTIVE': {
    code: 'OE-301',
    name: 'Open Elective (Robotics / UAV / Drones)',
    faculty: 'Deepak Poojary / Team',
    difficulty: 2,
    understanding: 2,
    importance: 3,
    estimatedHours: 4,
    color: '#fed7aa'
  },
  'PLACEMENT': {
    code: 'TRAIN-01',
    name: 'Placement Training',
    faculty: 'Ms. Suma',
    difficulty: 2,
    understanding: 2,
    importance: 4,
    estimatedHours: 3,
    color: '#e0e7ff'
  },
  'SALESFORCE': {
    code: 'SKILL-02',
    name: 'Wipro / Salesforce Training',
    faculty: 'Ms. Amrutha',
    difficulty: 2,
    understanding: 2,
    importance: 3,
    estimatedHours: 3,
    color: '#f3e8ff'
  },
  'CLUBS': {
    code: 'CLUB-01',
    name: 'Club Activities',
    faculty: 'Faculty Coordinators',
    difficulty: 1,
    understanding: 3,
    importance: 1,
    estimatedHours: 0,
    color: '#f1f5f9'
  }
}

// Convert mappings into Course objects for the store
export const MITE_COURSES: Course[] = Object.values(MITE_COURSE_MAPPINGS).map(m => ({
  id: m.code.toLowerCase().replace(/[^a-z0-9]/g, '-'),
  name: m.name,
  code: m.code,
  difficulty: m.difficulty,
  understanding: m.understanding,
  importance: m.importance,
  estimatedHours: m.estimatedHours,
  color: m.color
}))

// Recurring weekly timetable events extracted from the MITE CSE-1 Timetable Matrix
export const MITE_TIMETABLE_EVENTS: Ev[] = [
  // MONDAY (dow: 1)
  // Merged Morning Lab (Periods 1-3: 09:00 - 12:05)
  {
    id: 'mite-mon-lab',
    title: 'DBMS Lab / CN Lab (23CSPL306 / 23CSPL307)',
    code: '23CSPL306',
    type: 'lab',
    source: 'MITE Timetable (CSE-1)',
    dow: 1,
    start: hm('09:00'),
    end: hm('12:05'),
    recurring: true,
    fixed: true,
    verified: true,
    confidence: 96
  },
  // Monday Afternoon Lectures
  {
    id: 'mite-mon-flat',
    title: 'Formal Language & Automata Theory (23CSPC302) [201]',
    code: '23CSPC302',
    type: 'class',
    source: 'MITE Timetable (CSE-1)',
    dow: 1,
    start: hm('12:50'),
    end: hm('13:45'),
    recurring: true,
    fixed: true,
    verified: true,
    confidence: 98
  },
  {
    id: 'mite-mon-fsd-1',
    title: 'Full-Stack Development (23CSPE311) [309]',
    code: '23CSPE311',
    type: 'class',
    source: 'MITE Timetable (CSE-1)',
    dow: 1,
    start: hm('13:45'),
    end: hm('14:40'),
    recurring: true,
    fixed: true,
    verified: true,
    confidence: 97
  },
  {
    id: 'mite-mon-fsd-2',
    title: 'Full-Stack Development (23CSPE311) [309]',
    code: '23CSPE311',
    type: 'class',
    source: 'MITE Timetable (CSE-1)',
    dow: 1,
    start: hm('14:40'),
    end: hm('15:35'),
    recurring: true,
    fixed: true,
    verified: true,
    confidence: 97
  },
  {
    id: 'mite-mon-mf',
    title: 'Management & Finance (23HMCC301) [203]',
    code: '23HMCC301',
    type: 'class',
    source: 'MITE Timetable (CSE-1)',
    dow: 1,
    start: hm('15:35'),
    end: hm('16:30'),
    recurring: true,
    fixed: true,
    verified: true,
    confidence: 98
  },

  // TUESDAY (dow: 2)
  {
    id: 'mite-tue-cn',
    title: 'Computer Networks (23CSPC305) [201]',
    code: '23CSPC305',
    type: 'class',
    source: 'MITE Timetable (CSE-1)',
    dow: 2,
    start: hm('09:00'),
    end: hm('09:55'),
    recurring: true,
    fixed: true,
    verified: true,
    confidence: 98
  },
  {
    id: 'mite-tue-oe',
    title: 'Open Elective (Robotics / UAV / Drones) [Audi-3]',
    code: 'OE-301',
    type: 'class',
    source: 'MITE Timetable (CSE-1)',
    dow: 2,
    start: hm('10:15'),
    end: hm('11:10'),
    recurring: true,
    fixed: true,
    verified: true,
    confidence: 90
  },
  {
    id: 'mite-tue-dbms',
    title: 'Database Management Systems (23CSPC303) [203]',
    code: '23CSPC303',
    type: 'class',
    source: 'MITE Timetable (CSE-1)',
    dow: 2,
    start: hm('11:10'),
    end: hm('12:05'),
    recurring: true,
    fixed: true,
    verified: true,
    confidence: 98
  },
  {
    id: 'mite-tue-flat',
    title: 'Formal Language & Automata Theory (23CSPC302) [203]',
    code: '23CSPC302',
    type: 'class',
    source: 'MITE Timetable (CSE-1)',
    dow: 2,
    start: hm('12:50'),
    end: hm('13:45'),
    recurring: true,
    fixed: true,
    verified: true,
    confidence: 97
  },
  // Merged Afternoon Placement Training (Periods 5-7: 13:45 - 16:30)
  {
    id: 'mite-tue-placement',
    title: 'Placement Training [Room 203]',
    code: 'TRAIN-01',
    type: 'class',
    source: 'MITE Timetable (CSE-1)',
    dow: 2,
    start: hm('13:45'),
    end: hm('16:30'),
    recurring: true,
    fixed: true,
    verified: true,
    confidence: 95
  },

  // WEDNESDAY (dow: 3)
  {
    id: 'mite-wed-dbms',
    title: 'Database Management Systems (23CSPC303) [205]',
    code: '23CSPC303',
    type: 'class',
    source: 'MITE Timetable (CSE-1)',
    dow: 3,
    start: hm('09:00'),
    end: hm('09:55'),
    recurring: true,
    fixed: true,
    verified: true,
    confidence: 98
  },
  {
    id: 'mite-wed-mf',
    title: 'Management & Finance (23HMCC301) [205]',
    code: '23HMCC301',
    type: 'class',
    source: 'MITE Timetable (CSE-1)',
    dow: 3,
    start: hm('10:15'),
    end: hm('11:10'),
    recurring: true,
    fixed: true,
    verified: true,
    confidence: 98
  },
  {
    id: 'mite-wed-fsd',
    title: 'Full-Stack Development (23CSPE311) [312/205]',
    code: '23CSPE311',
    type: 'class',
    source: 'MITE Timetable (CSE-1)',
    dow: 3,
    start: hm('11:10'),
    end: hm('12:05'),
    recurring: true,
    fixed: true,
    verified: true,
    confidence: 94
  },
  {
    id: 'mite-wed-cnt',
    title: 'Computer Networks Tutorial 23CSPC305(T) [205]',
    code: '23CSPC305',
    type: 'class',
    source: 'MITE Timetable (CSE-1)',
    dow: 3,
    start: hm('12:50'),
    end: hm('13:45'),
    recurring: true,
    fixed: true,
    verified: true,
    confidence: 95
  },
  {
    id: 'mite-wed-comm',
    title: 'Communication Skills (23NMCC321) [205]',
    code: '23NMCC321',
    type: 'class',
    source: 'MITE Timetable (CSE-1)',
    dow: 3,
    start: hm('13:45'),
    end: hm('15:35'),
    recurring: true,
    fixed: true,
    verified: true,
    confidence: 93
  },

  // THURSDAY (dow: 4)
  {
    id: 'mite-thu-oe',
    title: 'Open Elective (Robotics / UAV / Drones) [Audi-3]',
    code: 'OE-301',
    type: 'class',
    source: 'MITE Timetable (CSE-1)',
    dow: 4,
    start: hm('09:00'),
    end: hm('09:55'),
    recurring: true,
    fixed: true,
    verified: true,
    confidence: 90
  },
  {
    id: 'mite-thu-flat',
    title: 'Formal Language & Automata Theory (23CSPC302) [201]',
    code: '23CSPC302',
    type: 'class',
    source: 'MITE Timetable (CSE-1)',
    dow: 4,
    start: hm('10:15'),
    end: hm('11:10'),
    recurring: true,
    fixed: true,
    verified: true,
    confidence: 98
  },
  {
    id: 'mite-thu-cn',
    title: 'Computer Networks (23CSPC305) [201]',
    code: '23CSPC305',
    type: 'class',
    source: 'MITE Timetable (CSE-1)',
    dow: 4,
    start: hm('11:10'),
    end: hm('12:05'),
    recurring: true,
    fixed: true,
    verified: true,
    confidence: 98
  },
  {
    id: 'mite-thu-mf',
    title: 'Management & Finance (23HMCC301) [201]',
    code: '23HMCC301',
    type: 'class',
    source: 'MITE Timetable (CSE-1)',
    dow: 4,
    start: hm('12:50'),
    end: hm('13:45'),
    recurring: true,
    fixed: true,
    verified: true,
    confidence: 98
  },
  // Merged Afternoon Lab (Periods 5-7: 13:45 - 16:30)
  {
    id: 'mite-thu-lab',
    title: 'DBMS Lab / CN Lab (23CSPL306 / 23CSPL307)',
    code: '23CSPL307',
    type: 'lab',
    source: 'MITE Timetable (CSE-1)',
    dow: 4,
    start: hm('13:45'),
    end: hm('16:30'),
    recurring: true,
    fixed: true,
    verified: true,
    confidence: 96
  },

  // FRIDAY (dow: 5)
  {
    id: 'mite-fri-flat',
    title: 'Formal Language & Automata Theory (23CSPC302) [203]',
    code: '23CSPC302',
    type: 'class',
    source: 'MITE Timetable (CSE-1)',
    dow: 5,
    start: hm('09:00'),
    end: hm('09:55'),
    recurring: true,
    fixed: true,
    verified: true,
    confidence: 98
  },
  {
    id: 'mite-fri-oe',
    title: 'Open Elective (Robotics / UAV / Drones) [Audi-3]',
    code: 'OE-301',
    type: 'class',
    source: 'MITE Timetable (CSE-1)',
    dow: 5,
    start: hm('10:15'),
    end: hm('11:10'),
    recurring: true,
    fixed: true,
    verified: true,
    confidence: 90
  },
  {
    id: 'mite-fri-mf',
    title: 'Management & Finance (23HMCC301) [203]',
    code: '23HMCC301',
    type: 'class',
    source: 'MITE Timetable (CSE-1)',
    dow: 5,
    start: hm('11:10'),
    end: hm('12:05'),
    recurring: true,
    fixed: true,
    verified: true,
    confidence: 98
  },
  {
    id: 'mite-fri-fsd',
    title: 'Full-Stack Development (23CSPE311) [312/203]',
    code: '23CSPE311',
    type: 'class',
    source: 'MITE Timetable (CSE-1)',
    dow: 5,
    start: hm('12:50'),
    end: hm('13:45'),
    recurring: true,
    fixed: true,
    verified: true,
    confidence: 94
  },
  {
    id: 'mite-fri-lab',
    title: 'Project & Drones Lab [L&A302]',
    code: '23CSPE311',
    type: 'lab',
    source: 'MITE Timetable (CSE-1)',
    dow: 5,
    start: hm('13:45'),
    end: hm('16:30'),
    recurring: true,
    fixed: true,
    verified: true,
    confidence: 92
  },

  // SATURDAY (dow: 6)
  {
    id: 'mite-sat-dbms',
    title: 'Database Management Systems (23CSPC303) [205]',
    code: '23CSPC303',
    type: 'class',
    source: 'MITE Timetable (CSE-1)',
    dow: 6,
    start: hm('09:00'),
    end: hm('09:55'),
    recurring: true,
    fixed: true,
    verified: true,
    confidence: 98
  },
  {
    id: 'mite-sat-mf',
    title: 'Management & Finance (23HMCC301) [205]',
    code: '23HMCC301',
    type: 'class',
    source: 'MITE Timetable (CSE-1)',
    dow: 6,
    start: hm('10:15'),
    end: hm('11:10'),
    recurring: true,
    fixed: true,
    verified: true,
    confidence: 98
  },
  {
    id: 'mite-sat-comm',
    title: 'Communication Skills [205]',
    code: '23NMCC321',
    type: 'class',
    source: 'MITE Timetable (CSE-1)',
    dow: 6,
    start: hm('11:10'),
    end: hm('12:05'),
    recurring: true,
    fixed: true,
    verified: true,
    confidence: 92
  },
  {
    id: 'mite-sat-wipro',
    title: 'Wipro / Salesforce Training',
    code: 'SKILL-02',
    type: 'class',
    source: 'MITE Timetable (CSE-1)',
    dow: 6,
    start: hm('12:50'),
    end: hm('14:40'),
    recurring: true,
    fixed: true,
    verified: true,
    confidence: 94
  },
  {
    id: 'mite-sat-clubs',
    title: 'Club Activities & Innovation Hub',
    code: 'CLUB-01',
    type: 'event',
    source: 'MITE Timetable (CSE-1)',
    dow: 6,
    start: hm('14:40'),
    end: hm('16:30'),
    recurring: true,
    fixed: false,
    verified: true,
    confidence: 90
  }
]

// MITE Continuous Internal Evaluation (CIE-1) examinations schedule
export const MITE_CIE_EVENTS: Ev[] = [
  {
    id: 'mite-cie-mf',
    title: 'CIE-1: Management & Finance (23HMCC301)',
    code: '23HMCC301',
    type: 'cie',
    source: 'MITE CIE Circular 2026-27',
    date: '2026-11-23',
    start: hm('09:30'),
    end: hm('11:00'),
    recurring: false,
    fixed: true,
    verified: true,
    confidence: 99
  },
  {
    id: 'mite-cie-flat',
    title: 'CIE-1: Formal Language & Automata Theory (23CSPC302)',
    code: '23CSPC302',
    type: 'cie',
    source: 'MITE CIE Circular 2026-27',
    date: '2026-11-24',
    start: hm('09:30'),
    end: hm('11:00'),
    recurring: false,
    fixed: true,
    verified: true,
    confidence: 99
  },
  {
    id: 'mite-cie-dbms',
    title: 'CIE-1: Database Management Systems (23CSPC303)',
    code: '23CSPC303',
    type: 'cie',
    source: 'MITE CIE Circular 2026-27',
    date: '2026-11-25',
    start: hm('09:30'),
    end: hm('11:00'),
    recurring: false,
    fixed: true,
    verified: true,
    confidence: 99
  },
  {
    id: 'mite-cie-cn',
    title: 'CIE-1: Computer Networks (23CSPC305)',
    code: '23CSPC305',
    type: 'cie',
    source: 'MITE CIE Circular 2026-27',
    date: '2026-11-26',
    start: hm('09:30'),
    end: hm('11:00'),
    recurring: false,
    fixed: true,
    verified: true,
    confidence: 99
  },
  {
    id: 'mite-cie-fsd',
    title: 'CIE-1: Full-Stack Development (23CSPE311)',
    code: '23CSPE311',
    type: 'cie',
    source: 'MITE CIE Circular 2026-27',
    date: '2026-11-27',
    start: hm('09:30'),
    end: hm('11:00'),
    recurring: false,
    fixed: true,
    verified: true,
    confidence: 99
  }
]

// MITE Academic Event Calendar entries
export const MITE_ACADEMIC_EVENTS: Ev[] = [
  {
    id: 'mite-event-inaug',
    title: 'Department Technical Fest Inauguration',
    type: 'event',
    source: 'MITE Academic Calendar',
    date: '2026-11-19',
    start: hm('14:00'),
    end: hm('16:30'),
    recurring: false,
    fixed: true,
    verified: true,
    confidence: 98
  },
  {
    id: 'mite-holiday-kanaka',
    title: 'Kanakadasa Jayanthi (General Holiday)',
    type: 'holiday',
    source: 'MITE Academic Calendar',
    date: '2026-11-28',
    start: 0,
    end: 1440,
    recurring: false,
    fixed: true,
    verified: true,
    confidence: 100
  }
]

// Sample academic tasks & deadlines for MITE CSE Sem 5
export const MITE_TASKS: Task[] = [
  {
    id: 'mite-task-dbms-hw',
    title: 'DBMS SQL Complex Queries & Triggers Assignment',
    courseId: '23cspc303',
    type: 'assignment',
    deadline: '2026-11-18',
    estimatedHours: 3,
    status: 'pending',
    description: 'Solve ER modeling questions and write nested SQL aggregation queries.'
  },
  {
    id: 'mite-task-flat-quiz',
    title: 'FLAT DFA/NFA Minimization Quiz Prep',
    courseId: '23cspc302',
    type: 'quiz',
    deadline: '2026-11-20',
    estimatedHours: 2,
    status: 'pending',
    description: 'Practice Myhill-Nerode theorem and conversion from regular expression to DFA.'
  },
  {
    id: 'mite-task-fsd-proj',
    title: 'Full-Stack Development Project Milestone 1',
    courseId: '23cspe311',
    type: 'project',
    deadline: '2026-11-22',
    estimatedHours: 5,
    status: 'pending',
    description: 'React client setup with REST API endpoints for authentication.'
  },
  {
    id: 'mite-task-cn-lab',
    title: 'Computer Networks Packet Tracer Lab Record',
    courseId: '23cspc305',
    type: 'assignment',
    deadline: '2026-11-21',
    estimatedHours: 2.5,
    status: 'pending',
    description: 'Submit routing simulation topologies and Wireshark trace analysis.'
  },
  // Linked CIE exam preparation tasks
  {
    id: 'mite-task-exam-mf',
    title: 'CIE-1: Management & Finance',
    courseId: '23hmcc301',
    type: 'cie',
    deadline: '2026-11-23',
    estimatedHours: 4,
    status: 'pending'
  },
  {
    id: 'mite-task-exam-flat',
    title: 'CIE-1: Formal Language & Automata Theory',
    courseId: '23cspc302',
    type: 'cie',
    deadline: '2026-11-24',
    estimatedHours: 6,
    status: 'pending'
  },
  {
    id: 'mite-task-exam-dbms',
    title: 'CIE-1: Database Management Systems',
    courseId: '23cspc303',
    type: 'cie',
    deadline: '2026-11-25',
    estimatedHours: 5,
    status: 'pending'
  },
  {
    id: 'mite-task-exam-cn',
    title: 'CIE-1: Computer Networks',
    courseId: '23cspc305',
    type: 'cie',
    deadline: '2026-11-26',
    estimatedHours: 5,
    status: 'pending'
  },
  {
    id: 'mite-task-exam-fsd',
    title: 'CIE-1: Full-Stack Development',
    courseId: '23cspe311',
    type: 'cie',
    deadline: '2026-11-27',
    estimatedHours: 4,
    status: 'pending'
  }
]
