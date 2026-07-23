"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

export default function FooterLogo3D({ modelUrl = "/Vyrl Footer 1.0.glb" }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const hasWebGL = (() => {
      try {
        return (
          !!document.createElement("canvas").getContext("webgl2") ||
          !!document.createElement("canvas").getContext("webgl") ||
          !!document.createElement("canvas").getContext("experimental-webgl")
        );
      } catch {
        return false;
      }
    })();
    if (!hasWebGL) return;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      35,
      mount.clientWidth / mount.clientHeight,
      0.1,
      100,
    );
    camera.position.set(0, 0, 6);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    // MeshPhysicalMaterial's transmission (KHR_materials_transmission,
    // what this GLB's "Glass" material uses) refracts/reflects whatever
    // scene.environment provides. It does NOT require scene.background —
    // leaving background unset keeps the canvas fully transparent (so the
    // footer's own black shows through) while the glass still has the
    // room's PMREM lighting to bend and catch highlights from.
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTexture = pmremGenerator.fromScene(
      new RoomEnvironment(),
      0.02,
    ).texture;
    scene.environment = envTexture;

    const key = new THREE.DirectionalLight(0xffffff, 7);
    key.position.set(5, 6, 5);
    scene.add(key);

    const fill = new THREE.DirectionalLight(0xffffff, 3);
    fill.position.set(-5, 2, -4);
    scene.add(fill);

    const rim = new THREE.DirectionalLight(0xffffff, 5.5);
    rim.position.set(0, 4, -8);
    scene.add(rim);

    const underGlow = new THREE.PointLight(0xffffff, 22, 20);
    underGlow.position.set(0, -1, 3);
    scene.add(underGlow);

    // Small, tight-radius point lights read as sharp specular glints on
    // glass — a big soft key light alone gives even shading, not sparkle.
    const glintA = new THREE.PointLight(0xffffff, 14, 8);
    glintA.position.set(2.2, 2, 3.5);
    scene.add(glintA);

    const glintB = new THREE.PointLight(0xffffff, 10, 8);
    glintB.position.set(-2.5, -1.5, 3);
    scene.add(glintB);

    scene.add(new THREE.AmbientLight(0xffffff, 1));

    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath(
      "https://www.gstatic.com/draco/versioned/decoders/1.5.7/",
    );
    dracoLoader.setDecoderConfig({ type: "js" });

    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);

    // Pivot sits at the model's own center so tilting always rotates it
    // in place instead of swinging it off to one side.
    const pivot = new THREE.Group();
    scene.add(pivot);

    let model = null;

    loader.load(modelUrl, (gltf) => {
      model = gltf.scene;
      pivot.add(model);

      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      model.position.sub(center);

      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z) || 1;
      const fitScale = 4 / maxDim;
      pivot.scale.setScalar(fitScale);

      // The source GLB only sets transmissionFactor/roughness — no
      // ior/thickness/envMapIntensity, so glTF import left those at flat
      // defaults. Dialing them in here is what turns "grey plastic" into
      // glass with real depth and specular punch. roughness/clearcoatRoughness
      // pushed near 0 for a harder, shinier surface; ior raised toward
      // crystal/diamond range for stronger, more visible bending of light.
      model.traverse((obj) => {
        if (obj.isMesh && obj.material) {
          const mat = obj.material;
          mat.transmission = 1;
          mat.roughness = 0;
          mat.metalness = 0;
          mat.ior = 1.8;
          mat.thickness = 1.6;
          mat.envMapIntensity = 3.2;
          mat.clearcoat = 1;
          mat.clearcoatRoughness = 0.02;
          mat.attenuationColor = new THREE.Color(0xffffff);
          mat.attenuationDistance = 1.8;
          mat.specularIntensity = 1.2;
          mat.needsUpdate = true;
        }
      });
    });

    // ------------------------------------------------
    // Mouse-driven tilt — stays anchored in place, just leans toward the
    // cursor from its resting rotation rather than orbiting/spinning away.
    // ------------------------------------------------
    const MAX_TILT = 0.35; // radians (~20deg)
    let targetTiltX = 0;
    let targetTiltY = 0;
    let currentTiltX = 0;
    let currentTiltY = 0;

    const handlePointerMove = (e) => {
      const rect = mount.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width - 0.5;
      const ny = (e.clientY - rect.top) / rect.height - 0.5;
      targetTiltY = THREE.MathUtils.clamp(nx, -0.5, 0.5) * MAX_TILT * 2;
      targetTiltX = THREE.MathUtils.clamp(ny, -0.5, 0.5) * MAX_TILT * 2;
    };

    const handlePointerLeave = () => {
      targetTiltX = 0;
      targetTiltY = 0;
    };

    window.addEventListener("pointermove", handlePointerMove);
    mount.addEventListener("pointerleave", handlePointerLeave);

    const handleResize = () => {
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    let rafId;
    const animate = () => {
      rafId = requestAnimationFrame(animate);

      currentTiltX = THREE.MathUtils.lerp(currentTiltX, targetTiltX, 0.06);
      currentTiltY = THREE.MathUtils.lerp(currentTiltY, targetTiltY, 0.06);

      pivot.rotation.x = currentTiltX;
      pivot.rotation.y = currentTiltY;

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      mount.removeEventListener("pointerleave", handlePointerLeave);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(rafId);

      renderer.dispose();
      dracoLoader.dispose();
      pmremGenerator.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }

      scene.traverse((obj) => {
        if (obj.isMesh) {
          obj.geometry?.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else {
            obj.material?.dispose();
          }
        }
      });
    };
  }, [modelUrl]);

  return <div className="footer-logo-3d" ref={mountRef} />;
}
