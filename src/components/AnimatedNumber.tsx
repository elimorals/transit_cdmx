import { useEffect, useState } from 'react'

interface Props {
  value: number
  duration?: number
  format?: (n: number) => string
}

export function AnimatedNumber({ value, duration = 1200, format }: Props) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    const start = performance.now()
    const from = 0

    function tick(now: number) {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = Math.round(from + (value - from) * eased)
      setDisplay(current)
      if (progress < 1) requestAnimationFrame(tick)
    }

    requestAnimationFrame(tick)
  }, [value, duration])

  return <>{format ? format(display) : display.toLocaleString('es-MX')}</>
}
