"use client";

import { Canvas } from "@react-three/fiber";
import { EffectComposer } from "@react-three/postprocessing";
import { Fluid } from "@whatisjery/react-fluid-distortion";

// Full-viewport, mouse-reactive fluid distortion layered over the whole
// site. pointer-events:none is load-bearing — without it this fixed,
// full-screen canvas would sit on top of (and swallow clicks meant
// for) every bit of real page content underneath it, since it's
// painted after everything else in the DOM.
export default function FluidBackground() {
  return (
    <Canvas
      gl={{ alpha: true }}
      camera={{ position: [0, 0, 10], fov: 50 }}
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        // zIndex: 9999,
      }}
    >
      <EffectComposer>
        <Fluid fluidColor="#ffffff" curl={30} />
      </EffectComposer>
    </Canvas>
  );
}
