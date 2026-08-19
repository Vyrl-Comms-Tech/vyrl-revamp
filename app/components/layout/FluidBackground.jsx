"use client";

import { Canvas } from "@react-three/fiber";
import { EffectComposer } from "@react-three/postprocessing";
import { Fluid } from "@whatisjery/react-fluid-distortion";

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
        background: "transparent",
        opacity: 0.1,
        zIndex: 9999,
        // mixBlendMode: "difference" previously made this layer invert
        // every pixel underneath it site-wide — including fixed-color
        // text like HeroModelSection's white heading, which stopped
        // reading as plain white and effectively "disappeared" against
        // whatever it was inverting against. There's no way to exclude
        // specific elements from a full-viewport blend mode; it applies
        // to everything in the same stacking context uniformly. Back to
        // a plain translucent overlay (opacity above) instead — it
        // won't auto-invert to stay visible on both light and dark
        // sections the way difference did, but it no longer corrupts
        // real page content either.
      }}
    >
      <EffectComposer>
        {/* The shader mixes the rendered frame with a flat fluidColor
            by `intensity` — at intensity={10} that mix leans almost
            entirely toward the flat color, painting a mostly-opaque
            smoke shape rather than a light tint. Lowered so it stays a
            light, translucent trail instead of fighting the opacity
            above. */}
        <Fluid
          fluidColor="#808080"
          curl={30}
          intensity={0.5}
          distortion={0.6}
          showBackground={false}
        />
      </EffectComposer>
    </Canvas>
  );
}
