import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

// Module-scope cache: shared across every mount of Services3d (home page,
// /services page, and back-and-forth navigation between them) and across
// the preloader's own warmup call — the network fetch + GLTF parse + DRACO
// decode for a given modelUrl only ever happens once per page session.
const gltfCache = new Map();

let sharedDracoLoader = null;
function getDracoLoader() {
  if (!sharedDracoLoader) {
    sharedDracoLoader = new DRACOLoader();
    sharedDracoLoader.setDecoderPath(
      "https://www.gstatic.com/draco/versioned/decoders/1.5.7/",
    );
  }
  return sharedDracoLoader;
}

// Returns the same in-flight/resolved promise for a given URL no matter
// how many components call this concurrently (e.g. the preloader kicking
// off the load, then Services3d mounting and asking for the same model
// before the first load even finished).
export function loadGLTF(modelUrl) {
  if (!gltfCache.has(modelUrl)) {
    const loader = new GLTFLoader();
    loader.setDRACOLoader(getDracoLoader());
    gltfCache.set(
      modelUrl,
      new Promise((resolve, reject) => {
        loader.load(modelUrl, resolve, undefined, reject);
      }),
    );
  }
  return gltfCache.get(modelUrl);
}
