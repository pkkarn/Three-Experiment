import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { DragControls } from 'three/examples/jsm/controls/DragControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Clock } from 'three';
let clock = new Clock();


let scene, camera, renderer, controls, dragControls, unicorn;
let objects = [];
let stars = [];
let starFadeDirections = [];
let starFadeSpeeds = [];


function createSunTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const context = canvas.getContext('2d');
  
  const gradient = context.createRadialGradient(
    canvas.width / 2,
    canvas.height / 2,
    0,
    canvas.width / 2,
    canvas.height / 2,
    canvas.width / 2
  );
  gradient.addColorStop(0, 'rgba(255, 255, 0, 1)');
  gradient.addColorStop(0.5, 'rgba(255, 204, 0, 1)');
  gradient.addColorStop(1, 'rgba(255, 153, 0, 1)');
  
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);
  
  return new THREE.CanvasTexture(canvas);
}

function createTextTexture(text) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const context = canvas.getContext('2d');
  
  context.font = "Bold 100px Arial";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillStyle = "white"; // Change this line to set the text color to white
  context.fillText(text, canvas.width / 2, canvas.height / 2);
  
  return new THREE.CanvasTexture(canvas);
}

function init() {
  // Set up the scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000); // Black background
  // Define arrays for stars and their directions
  // Define arrays for stars and their directions

  for (let i = 0; i < 2000; i++) {
    let starGeometry = new THREE.SphereGeometry(0.1, 24, 24);
    let starMaterial = new THREE.MeshBasicMaterial({color: 0xffffff, transparent: true, opacity: 1});
    let star = new THREE.Mesh(starGeometry, starMaterial);
  
    star.position.set(
      THREE.MathUtils.randFloatSpread(100),
      THREE.MathUtils.randFloatSpread(100),
      THREE.MathUtils.randFloatSpread(100)
    );
  
    stars.push(star); // Add the star to the array
    starFadeDirections.push(Math.random() > 0.5 ? -1 : 1); // Randomly start fading in or out
    starFadeSpeeds.push(Math.random() * 10 * 2); // Randomize fade speed
    scene.add(star);
  }
  // Add sun
  let sunGeometry = new THREE.SphereGeometry(3, 32, 32);
  let sunMaterial = new THREE.MeshBasicMaterial({
    map: createSunTexture(),
    transparent: true,
    opacity: 0.9
  });
  let sun = new THREE.Mesh(sunGeometry, sunMaterial);
  scene.add(sun);
  
  let sunTextGeometry = new THREE.PlaneGeometry(6, 3, 32, 32);
  let sunTextMaterial = new THREE.MeshBasicMaterial({ 
    map: createTextTexture('TJ'),
    transparent: true, 
    side: THREE.DoubleSide
  });
  let sunText = new THREE.Mesh(sunTextGeometry, sunTextMaterial);

  let textureLoader = new THREE.TextureLoader();
  let imageMaterial = new THREE.MeshBasicMaterial({
    map: textureLoader.load('./public/sun.png'),
    side: THREE.DoubleSide,
    transparent: true
  });

  let imageGeometry = new THREE.PlaneGeometry(1, 1); // Adjust the size to fit your needs
  let imageMesh = new THREE.Mesh(imageGeometry, imageMaterial);
  let imageMesh2 = new THREE.Mesh(imageGeometry, imageMaterial);
  imageMesh.position.set(-40, 2, 3.01);

  // Position the image on the surface of the sphere. You might need to adjust these values
  imageMesh.position.set(0, 0, 3.01);
  sun.add(imageMesh);
  sun.add(imageMesh2);
  sun.add(sunText);

  // Add a light source
  let light = new THREE.PointLight(0xffffff, 1, 1000);
  light.position.set(0, 0, 0); // set the light at the center of the sun
  scene.add(light);

  // Add red planet
  let redPlanetGeometry = new THREE.SphereGeometry(1, 32, 32);
  let redPlanetMaterial = new THREE.MeshPhongMaterial({color: 0xff0000});
  let redPlanet = new THREE.Mesh(redPlanetGeometry, redPlanetMaterial);
  redPlanet.position.x = -5;
  objects.push(redPlanet);
  scene.add(redPlanet);

  // Add blue planet
  let bluePlanetGeometry = new THREE.SphereGeometry(1, 32, 32);
  let bluePlanetMaterial = new THREE.MeshPhongMaterial({color: 0x0000ff});
  let bluePlanet = new THREE.Mesh(bluePlanetGeometry, bluePlanetMaterial);
  bluePlanet.position.x = 5;
  objects.push(bluePlanet);
  scene.add(bluePlanet);

  // Set up the camera
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 20;

  // Set up the renderer
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Set up the controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.update();

  // Set up the drag controls
  dragControls = new DragControls(objects, camera, renderer.domElement);

  let loader = new GLTFLoader();
loader.load(
  './models/scene.gltf',
  function (gltf) {
    unicorn = gltf.scene;

    // Calculate the bounding box of the model
    const box = new THREE.Box3().setFromObject(unicorn);
    const size = box.getSize(new THREE.Vector3());

    // Determine the scaling factor
    const scaleFactor = 10 / Math.max(size.x, size.y, size.z);

     // Traverse the model and change the color of every MeshStandardMaterial
     unicorn.traverse(function (node) {
      if (node.isMesh) {
        // change color to white
        node.material.color.setHex(0xff0000); // Change the color to red
      }
    });

    let skeleton;

    unicorn.traverse(function (node) {
      // for(let i = 10; i < 90; i++) {
      //   if(no === 'Object_92') {
      //     node.children[i].rotation.x += 0.1;
      //   }
      // }
        setInterval(() => {
          node.rotation.x += 0.005;
        }
        , 10);
    });

    
    unicorn.traverse(function (node) {
      if (node.isSkeleton) {
        skeleton = node;
      }
    });

    if (skeleton) {
      // Find the hand bone
      console.log(skeleton.bones)
      const handBone = skeleton.bones.find(bone => bone.name === 'Object_92');

      if (handBone) {
        // Rotate the hand bone
        handBone.rotation.x += 0.1;
      }
    }



    // Set the scale of the model
    unicorn.scale.set(scaleFactor, scaleFactor, scaleFactor);

    scene.add(unicorn);
  },
  undefined,
  function (error) {
    console.error(error);
  }
);

  animate();
}

function animateStars() {
  let delta = clock.getDelta(); // Time elapsed since the last call to this function
  
  for (let i = 0; i < stars.length; i++) {
    let star = stars[i];
    let direction = starFadeDirections[i];
    let speed = starFadeSpeeds[i];
    
    // Adjust the star's opacity based on the direction it's currently fading
    star.material.opacity += direction * delta * speed; // Change the speed based on a randomized factor

    // If the star has fully faded in or out, reverse its direction and randomize speed
    if (star.material.opacity >= 1) {
      star.material.opacity = 1;
      starFadeDirections[i] = -1;
      starFadeSpeeds[i] = Math.random() * 10 * 2;
    } else if (star.material.opacity <= 0) {
      star.material.opacity = 0;
      starFadeDirections[i] = 1;
      starFadeSpeeds[i] = Math.random() * 10 * 2;
    }
  }
}

function animate() {
  requestAnimationFrame(animate);
  animateStars();

  controls.update();

  renderer.render(scene, camera);
}

init();

