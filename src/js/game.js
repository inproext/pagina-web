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


        this.camera = new THREE.PerspectiveCamera(15, window.innerWidth / window.innerHeight, 0.01, 100)
        this.camera.position.set( -0.82, 0.284, 0.493);
        

        /**CREATE OBJECTS */
        this.cube = new THREE.Mesh( new THREE.BoxGeometry(), new THREE.MeshBasicMaterial( { color: 0x00ff00, wireframe: true }));
        this.cube.scale.x = 1;
        this.cube.scale.y = 1;
        this.cube.scale.z = 1;
        this.cube.visible = debugHelpers;

        this.satelite = new THREE.Mesh( new THREE.BoxGeometry(), new THREE.MeshBasicMaterial( { color: 0xffff00, wireframe: true }));
        this.satelite.visible = debugHelpers;

        this.satelite2 = new THREE.Mesh( new THREE.BoxGeometry(), new THREE.MeshBasicMaterial( { color: 0x0000ff, wireframe: true }));
        this.satelite2.visible = debugHelpers;


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
        this.scene.add(this.particle);

        this.scene.add(this.cube);
        this.scene.add(this.satelite);
        this.scene.add(this.satelite2);
        
        this.controls();
    }

    controls() {
        /*
        let _this = this;
        this.ctrl = new OrbitControls(this.camera, this.renderer.domElement);
        this.ctrl.target.set(0,0.5,0);
        this.ctrl.update();
        this.ctrl.enablePan = true;
        this.ctrl.enableDamping = true;
        this.ctrl.listenToKeyEvents(window);
        this.ctrl.addEventListener('end', function() {
            //_this.camera.lookAt(_this.cube.position);
        });
        */
        this.cursor = { x: 0, y: 0 };
        window.addEventListener('mousemove', (_ev) => {
            this.cursor.x = _ev.clientX / window.innerWidth - 0.5;
            this.cursor.y = _ev.clientY / window.innerHeight - 0.5;
        });
        
    }

    moveCamera(_point){
        /*
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
            //this.playAnimation();
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
            }
        });
        */
        this.camera.lookAt(new THREE.Vector3(0,0,0));
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
          
            this.model.children[0].children.forEach(_item => {
                console.log(_item)
                let edges = new THREE.EdgesGeometry(_item.geometry, 5);
                let ls = new THREE.LineSegments( edges , new THREE.LineBasicMaterial( { color: 0xffffff } ));
                ls.position.x = _item.position.x;
                ls.position.y = _item.position.y;
                ls.position.z = _item.position.z;
                ls.rotation.x = _item.rotation.x;
                ls.rotation.y = _item.rotation.y;
                ls.rotation.z = _item.rotation.z;
                ls.scale.x = _item.scale.x;
                ls.scale.y = _item.scale.y;
                ls.scale.z = _item.scale.z;
                _item.visible = true;
                this.modeloLineSegment.push(ls);
                /*
                _item.material = new THREE.LineDashedMaterial( { 
                    color: 0xffffff,
                    linewidth: 1,
                    dashSize: 3,
	                gapSize: 1,
                });
                */
                
            });
            /*
            this.model.getObjectByName('EsferaCubo').visible = false;
            this.model.getObjectByName('EsferaEsfera').visible = false;
            this.model.getObjectByName('OctaedroEsfera').visible = false;
            this.model.getObjectByName('IcosaedroEsfera').visible = false;
            this.model.getObjectByName('DodecaedroEsfera').visible = false;
            */
            //this.playAnimation();
        }
        else {
            this.model = _model;
        }

        this.modeloLineSegment.forEach(_itemLine => this.scene.add(_itemLine));
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
        this.camera.position.x = Math.sin(this.cursor.x * Math.PI * 2) * 0.05; //this.satelite2.position.x + (this.cursor.x * 0.01);
        this.camera.position.z = Math.cos(this.cursor.x * Math.PI * 2) * 0.05;//this.satelite2.position.y + (this.cursor.y * 0.01);
        this.camera.position.y = (this.cursor.y * 0.05);
        */
        this.camera.lookAt(new THREE.Vector3(0,0,0));
        this.particle.rotation.y = elapsedTime * 0.02;
        

        this.model.children[0].children.forEach((_item, _index) => {

            this.modeloLineSegment[_index].position.x = _item.position.x;
            this.modeloLineSegment[_index].position.y = _item.position.y;
            this.modeloLineSegment[_index].position.z = _item.position.z;
            this.modeloLineSegment[_index].rotation.x = _item.rotation.x;
            this.modeloLineSegment[_index].rotation.y = _item.rotation.y;
            this.modeloLineSegment[_index].rotation.z = _item.rotation.z;
            this.modeloLineSegment[_index].scale.x = _item.scale.x;
            this.modeloLineSegment[_index].scale.y = _item.scale.y;
            this.modeloLineSegment[_index].scale.z = _item.scale.z;
        });

        this.mixer.update(delta);
        this.renderer.render(this.scene,this.camera);
    }
}

export { Game3d }