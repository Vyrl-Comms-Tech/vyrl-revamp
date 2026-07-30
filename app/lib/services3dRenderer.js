import * as THREE from "three";
import { loadGLTF } from "./glbCache";

// Module-scope singleton — every Services3d mount (home page, /services
// page, and back-and-forth navigation between them) shares this one
// WebGLRenderer instead of each constructing its own. Three.js caches
// compiled shader programs *on the renderer itself* (keyed by material +
// lighting configuration — see WebGLPrograms' getProgram/getProgramCacheKey,
// which is exactly what showed up dominating the CPU profile during the
// freeze). A fresh renderer per mount meant an empty program cache every
// time, so the GPU driver recompiled from scratch on every single mount —
// that synchronous compile is the multi-hundred-ms-to-multi-second stall
// that froze the whole page right as Services3d's section (or, thanks to
// LazySection's early rootMargin on the home page, the section *before*
// it) scrolled into view. Reusing one renderer means only the very first
// compile in a session ever pays that cost.
let sharedRenderer = null;

export function getSharedRenderer() {
  if (!sharedRenderer) {
    try {
      sharedRenderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
      });
    } catch {
      sharedRenderer = null;
    }
  }
  return sharedRenderer;
}

let warmUpPromise = null;

// Called once — from PreLoader.tsx during its ~4-5s idle window, and again
// (idempotently, see below) from Services3d.jsx itself as a fallback —
// building the exact same lights + model Services3d uses and rendering
// them once here means the one unavoidable first-ever compile lands
// hidden, before the user can scroll anywhere, instead of mid-scroll later.
//
// Returns the *same* promise to every caller (module-scope cache), which
// matters for correctness, not just efficiency: Services3d.jsx awaits this
// exact promise before doing its own first real render (see there for why
// racing two independent compiles was unreliable). Must mirror
// Services3d.jsx's own lights setup exactly — Three.js's program cache key
// includes the lighting configuration, so any mismatch (a missing light, a
// different type/intensity) produces a different cache key and Services3d
// would still recompile from scratch on its own first frame.
export function warmUpServices3d(modelUrl = "/cube1.glb") {
  if (warmUpPromise) return warmUpPromise;

  const renderer = getSharedRenderer();
  if (!renderer) {
    warmUpPromise = Promise.resolve();
    return warmUpPromise;
  }

  warmUpPromise = loadGLTF(modelUrl)
    .then((gltf) => {
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
      camera.position.set(0, 0.5, 3);

      scene.add(new THREE.AmbientLight(0xffffff, 2));

      const key = new THREE.DirectionalLight(0xffffff, 4);
      key.position.set(5, 8, 5);
      scene.add(key);

      const fill = new THREE.DirectionalLight(0xffffff, 2);
      fill.position.set(-5, 3, -5);
      scene.add(fill);

      const rim = new THREE.DirectionalLight(0xffffff, 2);
      rim.position.set(0, 5, -10);
      scene.add(rim);

      const mouseLight = new THREE.PointLight(0xffffff, 10, 100);
      mouseLight.position.set(0, 0, 5);
      scene.add(mouseLight);

      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.2;

      // .clone() for the same reason Services3d.jsx clones it: the cached
      // gltf.scene is shared with every other consumer.
      scene.add(gltf.scene.clone(true));

      // Deliberately not calling renderer.setSize() here — this is the
      // SAME shared renderer/canvas any Services3d instance later reuses,
      // and setSize is renderer-wide state, not scene-specific. Since this
      // warm-up can run concurrently with a Services3d instance that's
      // already setting its own real size (e.g. on /services, which isn't
      // lazy and mounts immediately), whichever setSize call happened to
      // run last would win — this warm-up finishing after Services3d's own
      // setup previously shrank the shared canvas to whatever tiny size it
      // used here, breaking the real cube. Rendering at the renderer's
      // existing (default) size compiles the exact same program regardless
      // of target resolution.
      return renderer.compileAsync(scene, camera).then(() => {
        // compileAsync() only truly avoids a stall when the
        // KHR_parallel_shader_compile extension is available — without it
        // (confirmed missing in some of our own target environments),
        // Three.js's WebGLProgram.isReady() just reports "ready"
        // immediately (see its source comment: "flag the program as ready
        // immediately. It may cause a stall when it's first used."), and
        // the actual synchronous, driver-level compile/link cost still
        // lands on whichever render() call is the first to actually *use*
        // that program. Calling render() here — once, hidden, never
        // attached to the visible DOM — is what forces that real cost to
        // happen now instead of during Services3d's own first real frame.
        renderer.render(scene, camera);
      });
    })
    .catch(() => {});

  return warmUpPromise;
}
