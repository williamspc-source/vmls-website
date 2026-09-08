'use client'
import { InlineRichText } from '@/components/RichText/Inline'
import React, { useEffect, useRef, useState } from 'react'

import type { StatsBandBlock as Props } from '@/payload-types'

import { Section, type SectionBackground } from '@/components/Section'
import { SectionHeader } from '@/components/SectionHeader'
import { cn } from '@/utilities/ui'
import { toClassName } from '@/utilities/cssClass'

const CountUp: React.FC<{ value: number; play: boolean }> = ({ value, play }) => {
  const [n, setN] = useState(0)

  useEffect(() => {
    if (!play) return
    let raf = 0
    const start = performance.now()
    const duration = 1500
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1)
      // easeOutCubic
      const eased = 1 - Math.pow(1 - t, 3)
      setN(Math.round(eased * value))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [play, value])

  return <>{n.toLocaleString()}</>
}

export const StatsBandBlock: React.FC<Props & { bare?: boolean }> = ({
  eyebrow,
  heading,
  subheading,
  textColour,
  background,
  stats,
  cssClass,
  elementClasses,
  motion,
  containerWidth,
  bare,
}) => {
  const ref = useRef<HTMLDivElement>(null)
  const [play, setPlay] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setPlay(true)
          observer.disconnect()
        }
      },
      { threshold: 0.3 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  if (!stats || stats.length === 0) return null

  return (
    <Section
      background={background as SectionBackground}
      className={cn('vf-stats-band', toClassName(cssClass))}
      motion={motion}
      containerWidth={containerWidth}
      bare={bare}
    >
      <SectionHeader
        eyebrow={eyebrow}
        title={heading}
        subtitle={subheading}
        colour={textColour}
        align="center"
        titleClassName={toClassName(elementClasses?.heading)}
      />

      <div ref={ref} className="vf-stats">
        {stats.map((stat, i) => (
          <div key={i} className={cn('vf-stat vf-card vf-stats-band__stat', toClassName(elementClasses?.card))}>
            <div className="vf-stat-num vf-stats-band__number">
              <InlineRichText data={stat.prefix} />
              <CountUp value={stat.value} play={play} />
              <InlineRichText data={stat.suffix} />
            </div>
            <InlineRichText as="div" className="vf-stat-label vf-stats-band__label" data={stat.label} />
          </div>
        ))}
      </div>
    </Section>
  )
}
