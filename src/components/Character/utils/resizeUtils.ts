import * as THREE from "three";
import { setCharTimeline } from "../../utils/GsapScroll";

export default function handleResize(
  renderer: THREE.WebGLRenderer,
  camera: THREE.PerspectiveCamera,
  canvasDiv: React.RefObject<HTMLDivElement>,
  character: THREE.Object3D | null
) {
  if (!canvasDiv.current) return;
  let canvas3d = canvasDiv.current.getBoundingClientRect();
  const width = canvas3d.width > 0 ? canvas3d.width : window.innerWidth;
  const height = canvas3d.height > 0 ? canvas3d.height : window.innerHeight;
  renderer.setSize(width, height);
  camera.aspect = width / height;
  if (window.innerWidth <= 768) {
    camera.position.set(0, 11.2, 26);
    camera.zoom = 0.95;
  } else {
    camera.position.set(0, 13.1, 24.7);
    camera.zoom = 1.1;
  }
  camera.updateProjectionMatrix();
  if (character) {
    setCharTimeline(character, camera);
  }
}
