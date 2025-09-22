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
      let currentRenderTask: any | null = null
      async function render() {
        const page = await doc.getPage(pageNumber)
        const viewport = page.getViewport({ scale })
        const canvas = canvasRef.current
        if (!canvas) return
        const context = canvas.getContext('2d')
        if (!context) return

        const devicePixelRatio = window.devicePixelRatio || 1
        const outputScaleX = devicePixelRatio
        const outputScaleY = devicePixelRatio

        canvas.width = Math.floor(viewport.width * outputScaleX)
        canvas.height = Math.floor(viewport.height * outputScaleY)
        canvas.style.width = `${Math.floor(viewport.width)}px`
        canvas.style.height = `${Math.floor(viewport.height)}px`

        const transform = (outputScaleX !== 1 || outputScaleY !== 1)
          ? [outputScaleX, 0, 0, outputScaleY, 0, 0]
          : undefined

        const renderContext: any = { canvasContext: context, viewport, transform }
        currentRenderTask = page.render(renderContext)
        try {
          await currentRenderTask.promise
        } catch (_) {
          // игнорируем отмену
        }
        if (cancelled) return
      }
      render()
      return () => {
        cancelled = true
        try {
          currentRenderTask?.cancel?.()
        } catch { /* noop */ }
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
  const [fitReady, setFitReady] = useState<boolean>(false)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const firstPageWidthRef = useRef<number | null>(null)
  const pageRefs = useRef<Array<HTMLDivElement | null>>([])
  const lastFittedScaleRef = useRef<number | null>(null)
  const userAdjustedRef = useRef<boolean>(false)

  function computeAvailableWidth(): number | null {
    const el = containerRef.current
    if (!el) return null
    const styles = window.getComputedStyle(el)
    const paddingLeft = parseFloat(styles.paddingLeft || '0')
    const paddingRight = parseFloat(styles.paddingRight || '0')
    const containerInner = el.clientWidth - paddingLeft - paddingRight
    // Учитываем внутренние отступы и рамку у .pdf-page (см. App.css)
    const PAGE_PADDING_X = 8 * 2
    const PAGE_BORDER_X = 1 * 2
    const SAFETY = 2 // защищаемся от округлений/скроллбара
    const available = containerInner - PAGE_PADDING_X - PAGE_BORDER_X - SAFETY
    return Math.max(0, Math.floor(available))
  }

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
        // Автоподгон по ширине при открытии (без rAF, рассчитываем немедленно)
        const pageW = firstPageWidthRef.current
        const availableW = computeAvailableWidth()
        if (availableW !== null && pageW) {
          const fit = availableW > 0 ? availableW / pageW : 1
          const fitted = Math.max(0.3, Math.min(5, fit))
          lastFittedScaleRef.current = fitted
          setScale(fitted)
          // Повторный пересчёт в следующий кадр — учитываем появление вертикального скроллбара
          requestAnimationFrame(() => {
            const aw2 = computeAvailableWidth()
            if (aw2 === null) return
            const fit2 = aw2 > 0 ? aw2 / (firstPageWidthRef.current || pageW) : 1
            const fitted2 = Math.max(0.3, Math.min(5, fit2))
            if (Math.abs(fitted2 - (lastFittedScaleRef.current || 0)) > 0.001) {
              lastFittedScaleRef.current = fitted2
              setScale(fitted2)
            }
            setFitReady(true)
          })
        }
      } catch (e) {
        setError('Не удалось загрузить PDF')
      }
    }
    load()
    return () => {
      destroyed = true
      if (doc) {
        try { (doc as any).destroy?.() } catch {}
      }
    }
  }, [url])

  // Без авто-подгона: оставляем масштаб 100%
  // Пересчёт под ширину при ресайзе, если пользователь не менял масштаб
  useEffect(() => {
    function onResize() {
      const pageW = firstPageWidthRef.current
      const availableW = computeAvailableWidth()
      if (!pageW || availableW === null) return
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

  // Точный автоподгон по ширине при изменении размеров контейнера (в т.ч. появление скроллбара, изменение модалки)
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const pageW = firstPageWidthRef.current
    const ro = new ResizeObserver(() => {
      if (!pageW) return
      const availableW = computeAvailableWidth()
      if (availableW === null) return
      const fit = availableW > 0 ? availableW / pageW : 1
      const fitted = Math.max(0.3, Math.min(5, fit))
      if (!userAdjustedRef.current || (lastFittedScaleRef.current !== null && Math.abs(scale - lastFittedScaleRef.current) < 0.001)) {
        lastFittedScaleRef.current = fitted
        setScale(fitted)
      }
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [scale])

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
        {doc && fitReady && pages.map((n) => (
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


