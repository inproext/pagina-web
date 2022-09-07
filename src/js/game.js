import * as THREE from './libs/three/three.module.js';
import { RoomEnvironment } from './libs/three/RoomEnvironment.js';
class Game3d {
    constructor () {
        let pmremGenerator;
        let debugHelpers = false;

        this.mixer;
        this.modelAnimation;
        this.clock = new THREE.Clock();
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color( 0xFFA4FF );
        
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


        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 100);
        this.camera.position.set( 0.0, 0.07, -0.12);
        this.lastCameraPosition = new THREE.Vector3(0,0,0);

        this.satelite = new THREE.Mesh( new THREE.BoxGeometry(), new THREE.MeshBasicMaterial( { color: 0x000000, wireframe: true }));
        this.satelite.scale.x = 0.01;
        this.satelite.scale.y = 0.01;
        this.satelite.scale.z = 0.01;
        this.satelite.visible = false;

        /**CREATE OBJECTS */
        let particlesGeometry = new THREE.BufferGeometry();
        let count = 0;  //this.stars 500000;
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
        this.scene.add(this.satelite);
        this.scene.add(this.particle);
        
        this.controls();
    }

    controls() {
        this.lerpX = {
            current: 0,
            target: 0,
            ease: 0.1,
        };

        this.lerpY = {
            current: 0,
            target: 0,
            ease: 0.1,
        };

        //console.log(new THREE.Vector3(1,0,0).lerp(new THREE.Vector3(5,5,0), 0.5));
        this.cursor = { x: 0, y: 0 };
        window.addEventListener('mousemove', (_ev) => {
            this.cursor.x = ((_ev.clientX / window.innerWidth - 0.5) * 2);
            this.cursor.y = ((_ev.clientY / window.innerHeight - 0.5) * 2);
            this.lerpX.target = this.cursor.x * 0.01;
            this.lerpY.target = this.cursor.y * 0.01;
        });
    }

    moveCamera(_point){
        let _this = this;
        let geometry = this.model.getObjectByName(_point.geometry);
        if(_point.id === 1) {
            this.playAnimation();
        }
        else{
            this.stopAnimation();
        }

        this.satelite.position.x = geometry.position.x < 0.0 ? -0.025 : +0.025;
        this.satelite.position.y = geometry.position.y + 0.025;
        this.satelite.position.z = geometry.position.z < 0.0 ? -0.025 : +0.025;

        anime({
            targets: _this.lastCameraPosition,
            x: _this.satelite.position.x,
            y: _this.satelite.position.y,
            z: _this.satelite.position.z,
            color: _point.bgColor,
            easing: 'easeOutSine',
            duration: 800,
            update: function() {
                _this.camera.position.x = _this.lastCameraPosition.x;
                _this.camera.position.y = _this.lastCameraPosition.y;
                _this.camera.position.z = _this.lastCameraPosition.z;
                
                _this.camera.lookAt(geometry.position);     
                //_this.scene.background = new THREE.Color( originalPoint.color);  
            },
            complete: function() {
                dispatchEvent(_this.eventEndMovement);
            }
        });
    }

    addModel(_model, _type) {
        this.modeloLineSegment = [];

        if(_type == 'gltf') {
            this.model = _model.scene;
            this.modelAnimation = _model;
            this.model.position.set(0,0,0);
            this.model.rotation.set(0,0,0);
            this.mixer = new THREE.AnimationMixer(this.model);
            this.modelAnimation.animations.forEach((_item) => {
                this.mixer.clipAction(_item).play();
            });
            this.playAnimation();
            this.model.children[0].scale.set(1,1,1);
            this.model.children[0].children.forEach(_item => {
                _item.visible = true;
            });
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
        
        this.lerpX.current = gsap.utils.interpolate(
            this.lerpX.current,
            this.lerpX.target,
            this.lerpX.ease
        );

        this.lerpY.current = gsap.utils.interpolate(
            this.lerpY.current,
            this.lerpY.target,
            this.lerpY.ease
        );

        this.scene.rotation.y = this.lerpX.current;
        this.scene.rotation.x = this.lerpY.current;
        
        this.particle.rotation.y = elapsedTime * 0.02;
        this.mixer.update(delta);
        this.renderer.render(this.scene,this.camera);
    }
}

export { Game3d }