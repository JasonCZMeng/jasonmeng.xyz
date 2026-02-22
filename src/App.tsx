import { useState } from 'react'
import SmoothScroll from './components/layout/SmoothScroll'
import Preloader from './components/layout/Preloader'
import Cursor from './components/ui/Cursor'
import Navigation from './components/layout/Navigation'
import Hero from './components/sections/Hero'
import MarqueeStrip from './components/ui/MarqueeStrip'
import About from './components/sections/About'
import Experience from './components/sections/Experience'
import Investments from './components/sections/Investments'
import Writing from './components/sections/Writing'
import Contact from './components/sections/Contact'

export default function App() {
  const [preloaderDone, setPreloaderDone] = useState(false)

  return (
    <>
      {!preloaderDone && (
        <Preloader onComplete={() => setPreloaderDone(true)} />
      )}

      {preloaderDone && (
        <SmoothScroll>
          <Cursor />
          <Navigation />
          <main>
            <Hero />
            <MarqueeStrip />
            <About />
            <Experience />
            <Investments />
            <Writing />
            <Contact />
          </main>
        </SmoothScroll>
      )}
    </>
  )
}
