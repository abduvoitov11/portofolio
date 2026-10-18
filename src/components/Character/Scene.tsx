import { useEffect, useRef } from "react";
import * as THREE from "three";
import setCharacter from "./utils/character";
import setLighting from "./utils/lighting";
import { useLoading } from "../../context/LoadingProvider";
import handleResize from "./utils/resizeUtils";
import {
  handleMouseMove,
  handleTouchEnd,
  handleHeadRotation,
  handleTouchMove,
} from "./utils/mouseUtils";
import setAnimations from "./utils/animationUtils";
import { setProgress } from "../Loading";

const Scene = () => {
  const canvasDiv = useRef<HTMLDivElement | null>(null);
  const hoverDivRef = useRef<HTMLDivElement>(null);
  const { setLoading } = useLoading();

  useEffect(() => {
    if (!canvasDiv.current) return;

    let isDisposed = false;
    let animId = 0;
    let hoverCleanup: (() => void) | undefined;
    let characterObj: THREE.Object3D | null = null;
    let introTimer: any = null;

    // Clean up any stale canvas elements from previous mounts
    const existingCanvases = canvasDiv.current.querySelectorAll("canvas");
    existingCanvases.forEach((c) => c.remove());

    const scene = new THREE.Scene();

    let rect = canvasDiv.current.getBoundingClientRect();
    const width = rect.width > 0 ? rect.width : window.innerWidth;
    const height = rect.height > 0 ? rect.height : window.innerHeight;
    const aspect = width / height;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: window.devicePixelRatio < 2,
        powerPreference: "high-performance",
      });
      renderer.setClearColor(0x000000, 0);
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1;
      renderer.domElement.style.pointerEvents = "none";
      canvasDiv.current.appendChild(renderer.domElement);
    } catch (e) {
      console.warn("WebGL not supported or initialization failed:", e);
      setLoading(100);
      return;
    }

    const onContextLost = (event: Event) => {
      event.preventDefault();
      console.warn("WebGL context lost, preventing default");
    };
    renderer.domElement.addEventListener("webglcontextlost", onContextLost);

    const camera = new THREE.PerspectiveCamera(14.5, aspect, 0.1, 1000);
    if (window.innerWidth <= 768) {
      camera.position.set(0, 11.2, 26);
      camera.zoom = 0.95;
    } else {
      camera.position.set(0, 13.1, 24.7);
      camera.zoom = 1.1;
    }
    camera.updateProjectionMatrix();

    let headBone: THREE.Object3D | null = null;
    let screenLight: any | null = null;
    let mixer: THREE.AnimationMixer | null = null;

    const clock = new THREE.Clock();
    const light = setLighting(scene);
    let progress = setProgress((value) => setLoading(value));
    const { loadCharacter } = setCharacter(camera);

    let loadedCalled = false;
    const callLoaded = () => {
      if (!loadedCalled) {
        loadedCalled = true;
        progress.loaded();
      }
    };
    const loadSafetyTimer = setTimeout(callLoaded, 2800);

    const onResize = () => {
      if (!isDisposed) {
        handleResize(renderer, camera, canvasDiv, characterObj);
      }
    };
    window.addEventListener("resize", onResize);

    loadCharacter()
      .then((gltf) => {
        if (isDisposed) return;
        clearTimeout(loadSafetyTimer);
        if (gltf) {
          const animations = setAnimations(gltf);
          if (hoverDivRef.current) {
            hoverCleanup = animations.hover(gltf, hoverDivRef.current);
          }
          mixer = animations.mixer;
          characterObj = gltf.scene;
          scene.add(characterObj);
          headBone =
            characterObj.getObjectByName("spine006") ||
            characterObj.getObjectByName("spine.006") ||
            null;
          screenLight = characterObj.getObjectByName("screenlight") || null;
          callLoaded();

          introTimer = setTimeout(() => {
            if (!isDisposed) {
              light.turnOnLights();
              animations.startIntro();
            }
          }, 100);
        }
      })
      .catch((err) => {
        if (isDisposed) return;
        clearTimeout(loadSafetyTimer);
        console.error("Character failed to load:", err);
        callLoaded();
      });

    let mouse = { x: 0, y: 0 };
    let interpolation = { x: 0.1, y: 0.2 };

    const onMouseMove = (event: MouseEvent) => {
      handleMouseMove(event, (x, y) => {
        mouse = { x, y };
      });
    };
    document.addEventListener("mousemove", onMouseMove);

    const onTouchMove = (e: TouchEvent) => {
      handleTouchMove(e, (x, y) => {
        mouse = { x, y };
      });
    };

    const onTouchStart = () => {
      window.addEventListener("touchmove", onTouchMove, { passive: true });
    };

    const onTouchEnd = () => {
      window.removeEventListener("touchmove", onTouchMove);
      handleTouchEnd((x, y, interpolationX, interpolationY) => {
        mouse = { x, y };
        interpolation = { x: interpolationX, y: interpolationY };
      });
    };

    const landingDiv = document.getElementById("landingDiv");
    if (landingDiv) {
      landingDiv.addEventListener("touchstart", onTouchStart, { passive: true });
      landingDiv.addEventListener("touchend", onTouchEnd, { passive: true });
    }

    const animate = () => {
      if (isDisposed) return;
      animId = requestAnimationFrame(animate);

      if (headBone) {
        handleHeadRotation(
          headBone,
          mouse.x,
          mouse.y,
          interpolation.x,
          interpolation.y,
          THREE.MathUtils.lerp
        );
        light.setPointLight(screenLight);
      }
      const delta = Math.min(clock.getDelta(), 0.1);
      if (mixer) {
        mixer.update(delta);
      }
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      isDisposed = true;
      cancelAnimationFrame(animId);
      clearTimeout(loadSafetyTimer);
      clearTimeout(introTimer);
      if (hoverCleanup) hoverCleanup();

      window.removeEventListener("resize", onResize);
      document.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onTouchMove);

      if (landingDiv) {
        landingDiv.removeEventListener("touchstart", onTouchStart);
        landingDiv.removeEventListener("touchend", onTouchEnd);
      }

      renderer.domElement.removeEventListener("webglcontextlost", onContextLost);
      scene.clear();
      renderer.dispose();

      if (canvasDiv.current && renderer.domElement.parentNode === canvasDiv.current) {
        canvasDiv.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <>
      <div className="character-container">
        <div className="character-model" ref={canvasDiv}>
          <div className="character-rim"></div>
          <div className="character-hover" ref={hoverDivRef}></div>
        </div>
      </div>
    </>
  );
};

export default Scene;
