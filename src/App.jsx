import { useEffect, useMemo, useRef, useState } from 'react'

const GLYPHS = '01<>/\\{}[]#*+~アイウエオカキクケコサシスセソタチツテト'
const pick = () => GLYPHS[(Math.random() * GLYPHS.length) | 0]
const rand = (a, b) => a + Math.random() * (b - a)
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches

/* glyph dust drifting up out of the dark */
function AsciiField() {
  const items = useMemo(() => {
    const n = matchMedia('(max-width: 640px)').matches ? 45 : 110
    return Array.from({ length: n }, () => ({
      ch: pick(),
      left: rand(-4, 100),
      top: rand(0, 140),
      size: rand(9, 22),
      dur: rand(22, 60),
      delay: -rand(0, 60),
      op: rand(0.06, 0.34),
      streak: Math.random() < 0.08,
      drift: rand(-8, 8),
    }))
  }, [])

  return (
    <div className="field" aria-hidden="true">
      {items.map((g, i) => (
        <span
          key={i}
          className={g.streak ? 'glyph streak' : 'glyph'}
          style={{
            left: `${g.left}%`,
            top: `${g.top}%`,
            fontSize: `${g.size}px`,
            opacity: g.op,
            animationDuration: `${g.streak ? g.dur / 4 : g.dur}s`,
            animationDelay: `${g.delay}s`,
            '--drift': `${g.drift}vw`,
          }}
        >
          {g.ch}
        </span>
      ))}
    </div>
  )
}

function Fog() {
  return (
    <div className="fog" aria-hidden="true">
      <div className="fog-layer f1" />
      <div className="fog-layer f2" />
      <div className="fog-layer f3" />
    </div>
  )
}

/* scramble-on-hover word: glyph noise settles into the real string */
function Scramble({ text }) {
  const [out, setOut] = useState(text)
  const timer = useRef(null)

  const run = () => {
    if (timer.current || REDUCED) return
    let f = 0
    timer.current = setInterval(() => {
      f++
      if (f > 9) {
        clearInterval(timer.current)
        timer.current = null
        setOut(text)
        return
      }
      setOut(
        [...text].map((c) => (c === ' ' || Math.random() > 0.5 ? c : pick())).join(''),
      )
    }, 45)
  }

  useEffect(() => () => clearInterval(timer.current), [])

  return (
    <span className="glitch" onMouseEnter={run} onFocus={run} tabIndex={0}>
      {out}
    </span>
  )
}

function Boot({ onDone }) {
  const [txt, setTxt] = useState('')

  useEffect(() => {
    const start = performance.now()
    const id = setInterval(() => {
      setTxt(
        performance.now() - start < 1000
          ? Array.from({ length: 34 }, pick).join('')
          : 'SIGNAL ACQUIRED',
      )
    }, 60)
    const to = setTimeout(onDone, 1600)
    const skip = () => onDone()
    addEventListener('wheel', skip, { once: true, passive: true })
    addEventListener('touchmove', skip, { once: true, passive: true })
    return () => {
      clearInterval(id)
      clearTimeout(to)
      removeEventListener('wheel', skip)
      removeEventListener('touchmove', skip)
    }
  }, [onDone])

  return (
    <div className="boot" onClick={onDone} role="presentation">
      <div className="boot-txt">{txt}</div>
    </div>
  )
}

/* reveal each beat once it enters the viewport */
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.beat')
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => e.isIntersecting && e.target.classList.add('in')),
      { threshold: 0.25 },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
}

/* freeze CSS animation loops while the tab is hidden */
function useHiddenPause() {
  useEffect(() => {
    const onVis = () => document.documentElement.classList.toggle('paused', document.hidden)
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])
}

const LINKS = [
  ['GITHUB', 'https://github.com/JohnyCore'],
  ['TELEGRAM', 'https://t.me/Johny_Core'],
  ['INSTAGRAM', 'https://instagram.com/johny._.core'],
]

export default function App() {
  const [booting, setBooting] = useState(() => sessionStorage.getItem('booted') !== '1')
  useReveal()
  useHiddenPause()

  const done = () => {
    sessionStorage.setItem('booted', '1')
    setBooting(false)
  }

  return (
    <>
      <AsciiField />
      <Fog />
      {booting && <Boot onDone={done} />}

      <header className="hud">
        <span className="hud-name">JOHNNY CORE</span>
        <nav className="hud-links">
          {LINKS.map(([label, href]) => (
            <a key={label} href={href} target="_blank" rel="noreferrer">
              {label}
            </a>
          ))}
        </nav>
      </header>

      <main>
        <section className="beat hero">
          <p className="eyebrow">SIGNAL 001</p>
          <h1 className="q">WHO ARE YOU?</h1>
          <p className="name">JOHNNY CORE</p>
          <p className="body">
            Computer engineering student from Iran. Most of this page is made of
            characters.
          </p>
        </section>

        <section className="beat">
          <p className="eyebrow">SIGNAL 002</p>
          <h2 className="q">WHAT DO YOU DO?</h2>
          <p className="body">Most days, these.</p>

          <div className="groups">
            <div className="group">
              <h3 className="label">LANGUAGES</h3>
              <div className="tags">
                {['Python', 'JavaScript', 'C++'].map((s) => (
                  <span key={s} className="tag sketch">
                    <Scramble text={s} />
                  </span>
                ))}
              </div>
            </div>
            <div className="group">
              <h3 className="label">ELSEWHERE</h3>
              <div className="tags">
                {['Dropshipping Entrepreneur', 'Computer Engineering', 'IT'].map((s) => (
                  <span key={s} className="tag sketch">
                    <Scramble text={s} />
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="beat">
          <p className="eyebrow">SIGNAL 003</p>
          <h2 className="q">WHERE DO YOU GO?</h2>
          <p className="body">Three places. Pick one.</p>

          <ul className="places">
            {LINKS.map(([label, href], i) => (
              <li key={label}>
                <a className="sketch" href={href} target="_blank" rel="noreferrer">
                  <span className="idx">0{i + 1}</span>
                  <span className="glitch">{label}</span>
                  <span className="arr">→</span>
                </a>
              </li>
            ))}
          </ul>

          <p className="foot">end of signal · {new Date().getFullYear()}</p>
        </section>
      </main>
    </>
  )
}
