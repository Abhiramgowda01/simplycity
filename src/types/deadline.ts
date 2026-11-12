export type TType='assignment'|'quiz'|'project'|'cie'|'sie'|'other'
export interface Task{id:string;title:string;courseId:string;type:TType;deadline:string;estimatedHours:number;status:'pending'|'done';description?:string}
