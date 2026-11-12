export type EType='class'|'lab'|'event'|'holiday'|'cie'|'sie'|'personal'
export interface Ev{id:string;title:string;code?:string;type:EType;source:string;date?:string;dow?:number;start:number;end:number;recurring:boolean;fixed:boolean;verified:boolean;confidence?:number}
export interface Iv{s:number;e:number;title:string;id:string}
export interface AcademicSource{id:string;fileName:string;sourceType:EType;uploadDate:string;processingStatus:'ok'|'partial'|'failed';entries:number}
