import * as THREE from '../libs/three/three.module.js';

import { OrbitControls } from '../libs/three/OrbitControls.js';
import { GLTFLoader } from '../libs/three/GLTFLoader.js';

let scene, renderer, sattelite;
let camera, light;

init();
animate();

async function init() {

    let satelliteContainer = document.getElementById("satelliteContainer")
    let canvas = document.getElementById("satModel")

    renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
    renderer.setSize(satelliteContainer.clientWidth , satelliteContainer.clientWidth );
    renderer.setPixelRatio(satelliteContainer.devicePixelRatio);
    satelliteContainer.appendChild(renderer.domElement);

    camera = new THREE.PerspectiveCamera(70, 1, 1, 3000)
    camera.position.z = 5;

    scene = new THREE.Scene();

    light = new THREE.PointLight(0xffffff, 7, 100 );
    light.position.set( -10, 10, 10 );
    camera.add( light );

    scene.add(camera)
    
    const loader = new GLTFLoader();
    loader.load('../assets/models/vaisseau_noytoieur_V2.glb', function (gltf) {
        // console.log(gltf)
        gltf.scene.rotation.x = 0.5
        scene.add(gltf.scene);   

    })
}

let controls = new OrbitControls(camera, renderer.domElement);
controls.enableZoom = false;

async function animate() {

    requestAnimationFrame(animate);

    if(scene.children[1]){
        scene.children[1].rotation.y += 0.005;
    }

    camera.lookAt(scene.position);

    renderer.render(scene, camera);
}

