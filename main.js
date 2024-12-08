import * as THREE from 'three';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import gsap from 'gsap';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(25, window.innerWidth / window.innerHeight, 0.1, 100);
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('canvas'),
  antialias: true
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));

const loader = new RGBELoader();
loader.load('https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/buikslotermeerplein_1k.hdr', function(texture) {
  texture.mapping = THREE.EquirectangularReflectionMapping;
  scene.environment = texture;
});


const radius = 1.3;
const segments = 64;
const orbitRadius = 3;
const spheres = new THREE.Group();
const textures = [
    'https://ik.imagekit.io/yashyadav/planets/earthmap1k.jpg?updatedAt=1733679161443',
    './earth/map.jpg',
    './venus/map.jpg',
    './volcanic/color.png'
]

const starTexture = new THREE.TextureLoader().load('./stars.jpg');
starTexture.colorSpace = THREE.SRGBColorSpace;
const starSphereGeometry = new THREE.SphereGeometry(20, 64, 64);
const starSphereMaterial = new THREE.MeshStandardMaterial({ 
    map: starTexture,
    side: THREE.BackSide,
    opacity: 0.5,
    transparent: true

 });
const starSphere = new THREE.Mesh(starSphereGeometry, starSphereMaterial);
scene.add(starSphere);

const spheresMesh = [];

for(let i = 0; i<4; i++){
    const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load(textures[i]);
texture.colorSpace = THREE.SRGBColorSpace;

const geometry = new THREE.SphereGeometry(radius, segments, segments);
const material = new THREE.MeshStandardMaterial({ map: texture });
const sphere = new THREE.Mesh(geometry, material);

spheresMesh.push(sphere);

const angle = (i/4) * (Math.PI * 2);

sphere.position.x = orbitRadius * Math.cos(angle);
sphere.position.z = orbitRadius * Math.sin(angle);
spheres.add(sphere);


}

spheres.rotation.x = .2;
spheres.position.y = -.8;
scene.add(spheres);


// setInterval(() => {
//   gsap.to(spheres.rotation, {
//     y: `+=${Math.PI / 2}`,
//     duration: 2,
//     ease: 'expo.inOut'
//   });
// }, 2500);



// const controls = new OrbitControls(camera, renderer.domElement);

window.addEventListener('resize', function() {
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
  const direction = event.deltaY > 0 ? 'down' : 'up';
  scrollCount = (scrollCount +1) % 4;
  const heading = document.querySelectorAll('.heading');

  if (direction === 'down') {
    gsap.to(heading, {
      duration: 1,
      y: `-=${100}%`,
      ease: 'power2.out'
    });

    gsap.to(spheres.rotation, {
      duration: 1,
      y: `-=${Math.PI / 2}`,
      ease: 'power2.out'
    });
  } else if (direction === 'up') {
    gsap.to(heading, {
      duration: 1,
      y: `0`,
      ease: 'power2.out'
    });

    gsap.to(spheres.rotation, {
      duration: 1,
      y: `+=${Math.PI / 2}`,
      ease: 'power2.out'
    });
  }

  if (scrollCount === 0) {
    gsap.to(heading, {
      y: `0`,
      duration: 1,
      ease: 'power2.out'
    });
  }
}

window.addEventListener('wheel', throttleWheelHandler);

const clock = new THREE.Clock();

function animate() {
  for(let i= 0; i<spheresMesh.length;i++){
    spheresMesh[i].rotation.y = clock.getElapsedTime() * 0.02;
  }
  requestAnimationFrame(animate);
  // controls.update();
  renderer.render(scene, camera);
}
animate();


