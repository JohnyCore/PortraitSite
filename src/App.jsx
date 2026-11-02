import { useEffect, useMemo, useRef, useState } from 'react'

const GLYPHS = '01<>/\\{}[]#*+~アイウエオカキクケコサシスセソタチツテト'
const pick = () => GLYPHS[(Math.random() * GLYPHS.length) | 0]
const rand = (a, b) => a + Math.random() * (b - a)
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches
const TOUCH = matchMedia('(pointer: coarse)').matches

/* glyph dust drifting up out of the dark; shoves aside near the cursor */
function AsciiField() {
  const refs = useRef([])

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

  /* pointer repulsion: each glyph's screen position is derived from its own
     animation params, so this costs no getBoundingClientRect reads */
  useEffect(() => {
    if (REDUCED || TOUCH) return
    const t0 = performance.now()
    let raf = 0
    let cx = 0
    let cy = 0
    let inside = false

    const apply = () => {
      raf = 0
      const vw = innerWidth
      const vh = innerHeight
      const now = (performance.now() - t0) / 1000
      items.forEach((g, i) => {
        const el = refs.current[i]
        if (!el) return
        let p = ((now - g.delay) / g.dur) % 1
        if (p < 0) p += 1
        let px = 0
        let py = 0
        if (inside) {
          const x = (g.left / 100) * vw + ((p * g.drift) / 100) * vw
          const y = (g.top / 100) * vh - p * 1.6 * vh
          const dx = x - cx
          const dy = y - cy
          const d = Math.hypot(dx, dy)
          if (d < 150) {
            const f = (1 - d / 150) * 70
            if (d < 8) {
              // dead-centre hit: no reliable direction, push along a fixed angle
              const a = i * 2.399
              px = Math.cos(a) * f
              py = Math.sin(a) * f
            } else {
              px = (dx / d) * f
              py = (dy / d) * f
            }
          }
        }
        el.style.setProperty('--px', `${px.toFixed(1)}px`)
        el.style.setProperty('--py', `${py.toFixed(1)}px`)
      })
    }

    const onMove = (e) => {
      cx = e.clientX
      cy = e.clientY
      inside = true
      if (!raf) raf = requestAnimationFrame(apply)
    }
    const onLeave = () => {
      inside = false
      if (!raf) raf = requestAnimationFrame(apply)
    }

    addEventListener('pointermove', onMove, { passive: true })
    addEventListener('pointerleave', onLeave, { passive: true })
    return () => {
      removeEventListener('pointermove', onMove)
      removeEventListener('pointerleave', onLeave)
      cancelAnimationFrame(raf)
    }
  }, [items])

  return (
    <div className="field" aria-hidden="true">
      {items.map((g, i) => (
        <span
          key={i}
          ref={(el) => (refs.current[i] = el)}
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
          <i>{g.ch}</i>
        </span>
      ))}
    </div>
  )
}

/* the only line on this page that ages. keep it truthful. */
const NOW = 'building this site, and learning C++ properly.'

/* hand-cut 11x7 monogram: 1 = lit cell, 0 = dark */
const MONOGRAM = [
  '11111001110',
  '00010010001',
  '00010010000',
  '00010010000',
  '10010010000',
  '11010010001',
  '01100001110',
]

/* the monogram assembles itself out of loose glyphs when the hero lands */
function Portrait() {
  const cells = useMemo(
    () =>
      MONOGRAM.flatMap((row, r) =>
        [...row].map((bit, c) => ({
          key: `${r}-${c}`,
          on: bit === '1',
          ch: bit === '1' ? (Math.random() < 0.25 ? '@' : '#') : ' ',
          sx: rand(-170, 170),
          sy: rand(-130, 130),
          d: (r + c) * 0.035 + rand(0, 0.18),
        })),
      ),
    [],
  )

  return (
    <div className="portrait" aria-hidden="true">
      {cells.map((c) => (
        <i
          key={c.key}
          className={c.on ? 'pcell' : 'pcell off'}
          style={{ '--sx': `${c.sx}px`, '--sy': `${c.sy}px`, '--d': `${c.d}s` }}
        >
          {c.ch}
        </i>
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

/* hidden command line, summoned with "/" */
const CMDS = {
  whoami: [
    'johnny core — computer engineering student, iran.',
    'builds things. ships things. breaks things on purpose.',
  ],
  skills: [
    'languages  :: python / javascript / c++',
    'elsewhere  :: dropshipping / computer engineering / it',
  ],
  links: [
    'github     :: github.com/JohnyCore',
    'telegram   :: t.me/Johny_Core',
    'instagram  :: instagram.com/johny._.core',
  ],
  stack: [
    'react 19 · vite · tailwind 4',
    'background :: css keyframes · glyphs · 3 fog layers · 1 grain',
    'no canvas. no webgl. no fonts downloaded.',
  ],
  help: ['whoami · skills · links · stack · now · ls · cat <file> · clear · exit'],
  ls: ['about.txt   skills.txt   links.txt   now.txt'],
  'sudo hire me': ['nice try. the door is already open:', '→ t.me/Johny_Core'],
}

const FILES = {
  'about.txt': [
    'johnny core — computer engineering student, iran.',
    'builds things. ships things. breaks things on purpose.',
  ],
  'skills.txt': [
    'languages  :: python / javascript / c++',
    'elsewhere  :: dropshipping / computer engineering / it',
  ],
  'links.txt': [
    'github     :: github.com/JohnyCore',
    'telegram   :: t.me/Johny_Core',
    'instagram  :: instagram.com/johny._.core',
  ],
  'now.txt': [NOW, '— updated whenever it stops being true.'],
}

function Terminal({ open, close }) {
  const [lines, setLines] = useState([{ id: '0', t: "type 'help'. esc to leave.", cmd: true }])
  const [val, setVal] = useState('')
  const input = useRef(null)
  const box = useRef(null)
  const hist = useRef([])
  const hidx = useRef(0)

  const ids = useRef(1)
  const nid = () => String(ids.current++)

  useEffect(() => {
    if (open) input.current?.focus()
  }, [open])

  useEffect(() => {
    box.current?.scrollTo({ top: box.current.scrollHeight })
  }, [lines])

  if (!open) return null

  const run = (e) => {
    e.preventDefault()
    const cmd = val.trim().toLowerCase()
    setVal('')
    if (!cmd) return
    hist.current = [...hist.current, cmd]
    hidx.current = hist.current.length

    if (cmd === 'clear') return setLines([])
    if (cmd === 'exit' || cmd === 'q') return close()

    const out = cmd.startsWith('cat ')
      ? (FILES[cmd.slice(4).trim()] ?? [`cat: ${cmd.slice(4).trim()}: no such file`])
      : CMDS[cmd]

    const add = [
          { id: nid(), t: `> ${cmd}`, cmd: true },
          ...(out ?? [`unknown command: ${cmd} — try 'help'`]).map((t) => ({ id: nid(), t })),
        ]
        setLines((l) => [...l, ...add])
  }

  const keys = (e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (!hist.current.length) return
      hidx.current = Math.max(0, hidx.current - 1)
      setVal(hist.current[hidx.current])
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (hidx.current >= hist.current.length) return
      hidx.current += 1
      setVal(hist.current[hidx.current] ?? '')
    } else if (e.key === 'Tab') {
      e.preventDefault()
      const cands = [...Object.keys(CMDS), ...Object.keys(FILES).map((f) => `cat ${f}`)]
      const hits = cands.filter((c) => c.startsWith(val.trim().toLowerCase()))
      if (hits.length === 1) setVal(hits[0])
      else if (hits.length > 1)
        setLines((l) => [...l, { id: nid(), t: hits.join('   ') }])
    }
  }

  return (
    <div className="term" role="dialog" aria-label="command line">
      <div className="term-out" ref={box}>
        {lines.map((l) => (
          <p key={l.id} className={l.cmd ? 'term-cmd' : ''}>
            {l.t}
          </p>
        ))}
      </div>
      <form onSubmit={run} className="term-in">
        <span className="term-prompt">&gt;</span>
        <input
          ref={input}
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={keys}
          aria-label="command"
          spellCheck="false"
          autoComplete="off"
        />
      </form>
    </div>
  )
}

/* scroll progress -> --depth, drives fog, glyph parallax and the signal bar */
function useScrollDepth() {
  useEffect(() => {
    let raf = 0
    const upd = () => {
      raf = 0
      const max = document.documentElement.scrollHeight - innerHeight
      const d = max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0
      document.documentElement.style.setProperty('--depth', d.toFixed(3))
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(upd)
    }
    upd()
    addEventListener('scroll', onScroll, { passive: true })
    addEventListener('resize', onScroll)
    return () => {
      removeEventListener('scroll', onScroll)
      removeEventListener('resize', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])
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
  const [term, setTerm] = useState(false)
  useReveal()
  useScrollDepth()
  useHiddenPause()

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === '/' && !term && e.target.tagName !== 'INPUT') {
        e.preventDefault()
        setTerm(true)
      } else if (e.key === 'Escape') setTerm(false)
    }
    addEventListener('keydown', onKey)
    return () => removeEventListener('keydown', onKey)
  }, [term])

  const done = () => {
    sessionStorage.setItem('booted', '1')
    setBooting(false)
  }

  return (
    <>
      <div className="signalbar" aria-hidden="true" />
      <AsciiField />
      <Fog />
      {booting && <Boot onDone={done} />}
      <Terminal open={term} close={() => setTerm(false)} />

      <header className="hud">
        <span className="hud-name">JOHNNY CORE</span>
        <span className="hud-hint">press /</span>
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
          <Portrait />
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

          <p className="now">now :: {NOW}</p>

          <p className="foot">end of signal · {new Date().getFullYear()}</p>
        </section>
      </main>
    </>
  )
}
