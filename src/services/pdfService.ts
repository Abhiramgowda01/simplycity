import {ocrImage} from './ocrService'
// PDF.js text extraction; scanned PDFs (no text layer) are rendered to canvas and sent to OCR.
export async function pdfToText(file:File):Promise<{text:string;confidence:number}>{
  const pdfjs:any=await import('pdfjs-dist')
  pdfjs.GlobalWorkerOptions.workerSrc=(await import('pdfjs-dist/build/pdf.worker.min.mjs?url')).default
  const doc=await pdfjs.getDocument({data:await file.arrayBuffer()}).promise
  let text='';const pages:any[]=[]
  for(let i=1;i<=doc.numPages;i++){
    const p=await doc.getPage(i);pages.push(p);const c=await p.getTextContent()
    const rows:Record<number,{x:number;s:string}[]>={}
    for(const it of c.items as any[]){const y=Math.round(it.transform[5]/3);(rows[y]??=[]).push({x:it.transform[4],s:it.str})}
    text+=Object.keys(rows).map(Number).sort((a,b)=>b-a).map(y=>rows[y].sort((a,b)=>a.x-b.x).map(r=>r.s).join(' ')).join('\n')+'\n'
  }
  if(text.replace(/\s/g,'').length>=20)return{text,confidence:100}
  let all='',conf=0
  for(const p of pages){const vp=p.getViewport({scale:2});const cv=document.createElement('canvas');cv.width=vp.width;cv.height=vp.height
    await p.render({canvasContext:cv.getContext('2d'),viewport:vp}).promise;const r=await ocrImage(cv);all+=r.text+'\n';conf+=r.confidence}
  return{text:all,confidence:conf/pages.length}
}
