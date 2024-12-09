import * as THREE from "three";
import gsap from "gsap";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import { LoadingManager } from "three";

const loadingManager = new LoadingManager(() => {
  initScene();
});

const textureLoader = new THREE.TextureLoader(loadingManager);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  25,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector("canvas"),
  antialias: true,
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const loader = new RGBELoader(loadingManager);
loader.load(
  "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/buikslotermeerplein_1k.hdr",
  function (texture) {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = texture;
  }
);

const radius = 1.3;
const segments = 64;
const orbitRadius = 3;
const spheres = new THREE.Group();
const textures = [
  "./ice.jpg",
  "./jlvqacseq6uo6m1amga6.jpg",
  "./bn28oas0qhpjr4aij8s6.jpg",
  "./avqrz3jwfsekpyntipkn.jpg",
];

const starTexture = textureLoader.load("./stars.jpg");
starTexture.colorSpace = THREE.SRGBColorSpace;
const starSphereGeometry = new THREE.SphereGeometry(20, 64, 64);
const starSphereMaterial = new THREE.MeshStandardMaterial({
  map: starTexture,
  side: THREE.BackSide,
  opacity: 0.5,
  transparent: true,
});
const starSphere = new THREE.Mesh(starSphereGeometry, starSphereMaterial);
scene.add(starSphere);

const spheresMesh = [];
const texturesLoaded = textures.map((texture) => {
  const loadedTexture = textureLoader.load(texture);
  loadedTexture.colorSpace = THREE.SRGBColorSpace;
  return loadedTexture;
});

function initScene() {
  for (let i = 0; i < 4; i++) {
    const geometry = new THREE.SphereGeometry(radius, segments, segments);
    const material = new THREE.MeshStandardMaterial({ map: texturesLoaded[i] });
    const sphere = new THREE.Mesh(geometry, material);
    spheresMesh.push(sphere);

    const angle = (i / 4) * (Math.PI * 2);
    sphere.position.set(
      orbitRadius * Math.cos(angle),
      -0.8,
      orbitRadius * Math.sin(angle)
    );
    spheres.add(sphere);
  }

  spheres.rotation.x = 0.2;
  scene.add(spheres);

  animate();
}

window.addEventListener("resize", function () {
  const width = window.innerWidth;
  const height = window.innerHeight;
  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
});

camera.position.z = 9;

let throttleTimeout = null;
let lastWheelTime = 0;
let scrollCount = 0;
function throttleWheelHandler(event) {
  const currentTime = Date.now();
  if (throttleTimeout || currentTime - lastWheelTime < 2000) return;
  throttleTimeout = setTimeout(() => {
    throttleTimeout = null;
  }, 2000);
  lastWheelTime = currentTime;

  const direction = event.deltaY > 0 ? "down" : "up";
  scrollCount = (scrollCount + 1) % 4;
  const heading = document.querySelectorAll(".heading");

  const headingY = direction === "down" ? `-=${100}%` : `0`;
  const spheresRotationY = direction === "down" ? `-=${Math.PI / 2}` : `+=${Math.PI / 2}`;

  gsap.to(heading, {
    duration: 1,
    y: headingY,
    ease: "power2.out",
  });

  gsap.to(spheres.rotation, {
    duration: 1,
    y: spheresRotationY,
    ease: "power2.out",
  });

  if (scrollCount === 0) {
    gsap.to(heading, {
      y: `0`,
      duration: 1,
      ease: "power2.out",
    });
  }
}

window.addEventListener("wheel", throttleWheelHandler);

const clock = new THREE.Clock();

function animate() {
  for (let i = 0; i < spheresMesh.length; i++) {
    spheresMesh[i].rotation.y = clock.getElapsedTime() * 0.02;
  }
  requestAnimationFrame(animate);

  renderer.render(scene, camera);
}
