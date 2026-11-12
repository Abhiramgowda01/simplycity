// Tesseract.js OCR (loaded lazily; first run downloads English language data from a CDN, so it needs internet).
export async function ocrImage(src:File|HTMLCanvasElement|Blob):Promise<{text:string;confidence:number}>{
  const {createWorker}=await import('tesseract.js')
  const w=await createWorker('eng');const r=await w.recognize(src as any);await w.terminate()
  return{text:r.data.text,confidence:r.data.confidence}
}
