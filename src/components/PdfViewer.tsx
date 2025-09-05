import { useEffect, useMemo, useRef, useState, forwardRef } from 'react'
import { GlobalWorkerOptions, getDocument, type PDFDocumentProxy } from 'pdfjs-dist'

// Указываем воркер для pdfjs (совместимо с Vite)
GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString()

type PdfViewerProps = {
  url: string
}

const PdfPageCanvas = forwardRef<HTMLDivElement, { doc: PDFDocumentProxy, pageNumber: number, scale: number }>(
  function PdfPageCanvasInner({ doc, pageNumber, scale }, outerRef) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null)

    useEffect(() => {
      let cancelled = false
      async function render() {
        const page = await doc.getPage(pageNumber)
        const viewport = page.getViewport({ scale })
        const canvas = canvasRef.current
        if (!canvas) return
        const context = canvas.getContext('2d')
        if (!context) return
        canvas.width = viewport.width
        canvas.height = viewport.height
        const renderTask = page.render({ canvasContext: context, viewport })
        await renderTask.promise
        if (cancelled) return
      }
      render()
      return () => {
        cancelled = true
      }
    }, [doc, pageNumber, scale])

    return (
      <div className="pdf-page" ref={outerRef}>
        <canvas ref={canvasRef} />
      </div>
    )
  }
)

export default function PdfViewer({ url }: PdfViewerProps) {
  const [doc, setDoc] = useState<PDFDocumentProxy | null>(null)
  const [numPages, setNumPages] = useState<number>(0)
  const [scale, setScale] = useState<number>(1.0)
  const [error, setError] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const firstPageWidthRef = useRef<number | null>(null)
  const pageRefs = useRef<Array<HTMLDivElement | null>>([])
  const lastFittedScaleRef = useRef<number | null>(null)
  const userAdjustedRef = useRef<boolean>(false)

  useEffect(() => {
    let destroyed = false
    async function load() {
      setError(null)
      try {
        const loadingTask = getDocument(url)
        const loadedDoc = await loadingTask.promise
        if (destroyed) return
        setDoc(loadedDoc)
        setNumPages(loadedDoc.numPages)
        // Сохраняем исходную ширину первой страницы для fit-to-width
        const page1 = await loadedDoc.getPage(1)
        const vp = page1.getViewport({ scale: 1 })
        firstPageWidthRef.current = vp.width
        // Автоподгон по ширине при открытии
        requestAnimationFrame(() => {
          const el = containerRef.current
          const pageW = firstPageWidthRef.current
          if (!el || !pageW) return
          const padding = 24
          const availableW = Math.max(0, el.clientWidth - padding)
          const fit = availableW > 0 ? availableW / pageW : 1
          const fitted = Math.max(0.3, Math.min(5, fit))
          lastFittedScaleRef.current = fitted
          setScale(fitted)
        })
      } catch (e) {
        setError('Не удалось загрузить PDF')
      }
    }
    load()
    return () => {
      destroyed = true
      if (doc) {
        // @ts-expect-error закрываем воркеры
        doc.destroy?.()
      }
    }
  }, [url])

  // Без авто-подгона: оставляем масштаб 100%
  // Пересчёт под ширину при ресайзе, если пользователь не менял масштаб
  useEffect(() => {
    function onResize() {
      const el = containerRef.current
      const pageW = firstPageWidthRef.current
      if (!el || !pageW) return
      const padding = 24
      const availableW = Math.max(0, el.clientWidth - padding)
      const fit = availableW > 0 ? availableW / pageW : 1
      const fitted = Math.max(0.3, Math.min(5, fit))
      if (!userAdjustedRef.current || (lastFittedScaleRef.current !== null && Math.abs(scale - lastFittedScaleRef.current) < 0.001)) {
        lastFittedScaleRef.current = fitted
        setScale(fitted)
      }
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [scale])

  const pages = useMemo(() => Array.from({ length: numPages }, (_, i) => i + 1), [numPages])

  function getCurrentIndex(): number {
    const el = containerRef.current
    const refs = pageRefs.current
    if (!el || refs.length === 0) return 0
    const scrollTop = el.scrollTop
    let idx = 0
    for (let i = 0; i < refs.length; i++) {
      const node = refs[i]
      if (!node) continue
      const nodeTop = node.offsetTop
      const nodeMid = nodeTop + node.offsetHeight / 2
      if (nodeMid >= scrollTop) { idx = i; break }
      idx = i
    }
    return idx
  }
  function scrollToIndex(target: number) {
    const refs = pageRefs.current
    const container = containerRef.current
    if (!container) return
    if (target < 0 || target >= refs.length) return
    const node = refs[target]
    if (!node) return
    const top = node.offsetTop
    container.scrollTo({ top, behavior: 'smooth' })
  }
  function scrollLeft() {
    const current = getCurrentIndex()
    scrollToIndex(current - 1)
  }
  function scrollRight() {
    const current = getCurrentIndex()
    scrollToIndex(current + 1)
  }
  function zoomOut() {
    userAdjustedRef.current = true
    setScale((s) => Math.max(0.25, +(s - 0.1).toFixed(2)))
  }
  function zoomIn() {
    userAdjustedRef.current = true
    setScale((s) => Math.min(5, +(s + 0.1).toFixed(2)))
  }
  function setPreset(p: number) {
    userAdjustedRef.current = true
    setScale(p)
  }

  return (
    <div className="pdf-viewer">
      <div className="pdf-toolbar">
        <button className="secondary-button" onClick={scrollLeft}>↑</button>
        <button className="secondary-button" onClick={scrollRight}>↓</button>
        <div className="spacer" />
        <button className="secondary-button" onClick={zoomOut}>−</button>
        <span className="pdf-scale">{Math.round(scale * 100)}%</span>
        <button className="secondary-button" onClick={zoomIn}>+</button>
      </div>
      {error && <div className="pdf-error">{error}</div>}
      <div className="pdf-pages" ref={containerRef}>
        {doc && pages.map((n) => (
          <PdfPageCanvas
            key={n}
            ref={(el) => { pageRefs.current[n - 1] = el }}
            doc={doc}
            pageNumber={n}
            scale={scale}
          />
        ))}
      </div>
    </div>
  )
}


