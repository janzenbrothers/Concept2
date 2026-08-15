import { useEffect } from 'react'

const DESIGN_W = 1280
const DESIGN_H = 800

/** The design is drawn at 1280x800. Rather than letterbox it, the app keeps the
 *  design's proportions and type scale — one uniform factor derived from the
 *  smaller viewport dimension — while the layout itself fills whatever the
 *  tablet actually reports. On a 1280x800 screen the factor is exactly 1. */
export function useViewportScale() {
  useEffect(() => {
    const apply = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      const scale = Math.min(width / DESIGN_W, height / DESIGN_H)
      const root = document.documentElement.style
      root.setProperty('--app-scale', String(scale))
      root.setProperty('--app-w', width / scale + 'px')
      root.setProperty('--app-h', height / scale + 'px')
    }

    apply()
    window.addEventListener('resize', apply)
    window.addEventListener('orientationchange', apply)
    window.visualViewport?.addEventListener('resize', apply)
    return () => {
      window.removeEventListener('resize', apply)
      window.removeEventListener('orientationchange', apply)
      window.visualViewport?.removeEventListener('resize', apply)
    }
  }, [])
}
