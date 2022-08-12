import * as THREE from './libs/three/three.module.js';
import { OrbitControls } from './libs/three/OrbitControls.js';
import { RoomEnvironment } from './libs/three/RoomEnvironment.js';

class Game3d {
    constructor () {
        let pmremGenerator;
        let debugHelpers = false;
        this.mixer;
        this.modelAnimation;
        this.clock = new THREE.Clock();
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color( 0x000000 );
        
        this.eventEndMovement = new Event('endmovement');
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            canvas: document.getElementById('Lienzo')
        });
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize( window.innerWidth, window.innerHeight );

        pmremGenerator = new THREE.PMREMGenerator( this.renderer );
        this.scene.environment = pmremGenerator.fromScene( new RoomEnvironment(), 0.04 ).texture;


        this.camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.01, 100)
        this.camera.position.set( 0, 0, -0.0367);
        this.camera.lookAt(new THREE.Vector3(0,0,0));

        /**CREATE OBJECTS */
        this.cube = new THREE.Mesh( new THREE.BoxGeometry(), new THREE.MeshBasicMaterial( { color: 0x00ff00, wireframe: true }));
        this.cube.scale.x = 1;
        this.cube.scale.y = 1;
        this.cube.scale.z = 1;
        this.cube.visible = debugHelpers;

        this.satelite = new THREE.Mesh( new THREE.BoxGeometry(), new THREE.MeshBasicMaterial( { color: 0xffff00, wireframe: true }));
        this.satelite.scale.x = 0.02;
        this.satelite.scale.y = 0.02;
        this.satelite.scale.z = 0.02;
        this.satelite.visible = debugHelpers;

        this.satelite2 = new THREE.Mesh( new THREE.BoxGeometry(), new THREE.MeshBasicMaterial( { color: 0x0000ff, wireframe: true }));
        this.satelite2.scale.x = 0.02;
        this.satelite2.scale.y = 0.02;
        this.satelite2.scale.z = 0.02;
        this.satelite2.visible = debugHelpers;


        let particlesGeometry = new THREE.BufferGeometry();
        let count = 0;
        let positions = new Float32Array(count * 3);
        let colors = new Float32Array(count * 3);

        for(let i = 0; i < count * 3; i++) {
            positions[i] = (Math.random() - 0.5) * 10;
            colors[i] = Math.random();
        }

        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        let textureLoader = new THREE.TextureLoader();
        let particleTexture = textureLoader.load('/dist/img/particle/star_06.png');
        let particlesMaterial = new THREE.PointsMaterial();
        particlesMaterial.size = 0.04;
        particlesMaterial.sizeAttenuation = true;
        //particlesMaterial.color = new THREE.Color('#ff0');
        particlesMaterial.transparent = true;
        particlesMaterial.alphaMap = particleTexture;
        //particlesMaterial.alphaTest = 0.001;
        //particlesMaterial.depthTest = false;
        particlesMaterial.depthWrite = false;
        particlesMaterial.blending = THREE.AdditiveBlending;
        particlesMaterial.vertexColors = true;
        

        this.particle = new THREE.Points(particlesGeometry, particlesMaterial);
        this.scene.add(this.particle);

        this.scene.add(this.cube);
        this.scene.add(this.satelite);
        this.scene.add(this.satelite2);
        
        this.controls();
    }

    controls() {
        let _this = this;
        this.ctrl = new OrbitControls(this.camera, this.renderer.domElement);
        this.ctrl.target.set(0,0.5,0);
        this.ctrl.update();
        this.ctrl.enablePan = true;
        this.ctrl.enableDamping = true;
        this.ctrl.addEventListener('end', function() {
            //_this.camera.lookAt(_this.cube.position);
        });
       
    }

    moveCamera(_point){
        let _this = this;

        let geometry = this.model.getObjectByName(_point.geometry);
        let child = this.model.getObjectByName(_point.satelite);
        let originalPoint = {
            posX: this.camera.position.x,
            posY: this.camera.position.y,
            posZ: this.camera.position.z,
            color: '#'+this.scene.background.getHexString(),
        }
        this.satelite.position.x = child.position.x;
        this.satelite.position.y = child.position.y;
        this.satelite.position.z = child.position.z;
        
        this.satelite2.position.x = child.position.x;
        this.satelite2.position.y = child.position.y;
        if(_point.id === 1) {
            this.playAnimation();
            this.satelite2.position.z = child.position.z > 0 ? child.position.z + 0.2 : child.position.z - 0.2;
        }
        else{
            this.stopAnimation();
            this.satelite2.position.z = child.position.z;
        }

        anime({
            targets: originalPoint,
            posX: _this.satelite2.position.x,
            posY: _this.satelite2.position.y,
            posZ: _this.satelite2.position.z,
            color: _point.bgColor,
            easing: 'easeOutSine',
            duration: 800,
            update: function() {
                _this.camera.position.x = originalPoint.posX;
                _this.camera.position.y = originalPoint.posY;
                _this.camera.position.z = originalPoint.posZ;
                _this.scene.background = new THREE.Color( originalPoint.color);
                _this.camera.lookAt(geometry.position);
            },
            complete: function() {
                dispatchEvent(_this.eventEndMovement);
                // document.getElementById(_point.hotSpot).classList.add('active');
                // contentButtons.style.display = "flex";
            }
        });
    }

    addModel(_model, _type) {
        if(_type == 'gltf') {
            this.model = _model.scene;
            this.modelAnimation = _model;
            this.model.position.set(0,0,0);
            this.model.rotation.set(0,0,0);
            this.mixer = new THREE.AnimationMixer(this.model);
            this.modelAnimation.animations.forEach((_item) => {
                this.mixer.clipAction(_item).play();
            });
            this.model.getObjectByName('EsferaCubo').visible = false;
            this.model.getObjectByName('EsferaEsfera').visible = false;
            this.model.getObjectByName('OctaedroEsfera').visible = false;
            this.model.getObjectByName('IcosaedroEsfera').visible = false;
            this.model.getObjectByName('DodecaedroEsfera').visible = false;

            this.playAnimation();
        }
        else {
            this.model = _model;
        }
        this.scene.add(this.model);
    }

    playAnimation() {
        this.modelAnimation.animations.forEach((_item) => {
            this.mixer.clipAction(_item).paused = false;
        });
    }

    stopAnimation() {
        this.modelAnimation.animations.forEach((_item) => {
            this.mixer.clipAction(_item).paused = true;
        });
    }


    resize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    update(_obj) {
        let delta = this.clock.getDelta();
        let elapsedTime = this.clock.getElapsedTime();
        /*
        this.camera.position.x = this.model.getObjectByName('EsferaCubo').position.x;
        this.camera.position.y = this.model.getObjectByName('EsferaCubo').position.y;
        this.camera.position.z = this.model.getObjectByName('EsferaCubo').position.z;
        this.camera.lookAt(this.model.getObjectByName('cubo').position);
        */
        this.particle.rotation.y = elapsedTime * 0.02;

        this.mixer.update(delta);
        this.renderer.render(this.scene,this.camera);
    }
}

export { Game3d }