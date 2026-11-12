import {useStore} from '../hooks/useStore'
import TaskTable from '../components/deadlines/TaskTable'
import TaskForm from '../components/deadlines/TaskForm'
export default function Deadlines(){const{go}=useStore();return <section><h3>Assignments, quizzes, exams, projects</h3><TaskTable/><TaskForm/><button onClick={()=>go('Plan')}>Next: generate plan →</button></section>}
