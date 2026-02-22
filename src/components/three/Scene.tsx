import { Suspense, lazy } from 'react'
import { Canvas } from '@react-three/fiber'
import { AdaptiveDpr, AdaptiveEvents } from '@react-three/drei'

const ParticleField = lazy(() => import('./ParticleField'))
const GlowOrb = lazy(() => import('./GlowOrb'))
const GridFloor = lazy(() => import('./GridFloor'))

export default function Scene() {
  return (
    <div className="absolute inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{ antialias: false, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <AdaptiveDpr pixelated />
        <AdaptiveEvents />
        <ambientLight intensity={0.5} />
        <Suspense fallback={null}>
          <ParticleField />
          <GlowOrb />
          <GridFloor />
        </Suspense>
      </Canvas>
    </div>
  )
}
