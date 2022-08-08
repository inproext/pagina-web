import * as THREE from './libs/three/three.module.js';
import { GLTFLoader } from './libs/three/GLTFLoader.js';
import { DRACOLoader } from './libs/three/DRACOLoader.js';
import { OBJLoader } from './libs/three/OBJLoader.js';
import { utils } from './utils.js';

window.Library = {
	images: {},
	models: {},
    sounds: {},
    scenes: {},
	textures: {},
	contents: {}
};

class LoaderFiles {
	constructor() {
		this.pathLoader = "dist/";
		this.imageSources = [];
		this.soundSources =  [];
		this.sceneSources = [];
		this.contentSources = [];
		this.modelSources = [];
		this.textureSources = [];
		this.onPreloaded = new CustomEvent('preloaded');
	}

	load(_progressCallback) {
		let _this = this;
		let totalAssets = this.imageSources.length + this.soundSources.length + this.sceneSources.length + this.contentSources.length + this.modelSources.length + this.textureSources.length;
		let assetsLoaded = 0;
		window.addEventListener('preloaded', () => {
			assetsLoaded++;
			_progressCallback(Math.round((100/totalAssets) * assetsLoaded));
		});
	
		return new Promise((resolve) => {
			let loadPromises = [];
			_this.imageSources.forEach(function(config){
				loadPromises.push(_this.loadImage(config));
			});
	
			_this.soundSources.forEach(function(config){
				loadPromises.push(_this.loadSound(config));
			});
	
			_this.sceneSources.forEach(function(config){
				loadPromises.push(_this.loadScene(config));
			});
	
			_this.modelSources.forEach(function(config) {
				loadPromises.push(_this.loadModel(config));
			});

			_this.textureSources.forEach(function(config) {
				loadPromises.push(_this.loadTexture(config));
			});
	
			_this.contentSources.forEach(function(config){
				loadPromises.push(_this.loadContent(config));
			});
	
			Promise.all(loadPromises).then(resolve);
		});
	}

	addImages(imageConfigs) { 
		this.imageSources = this.imageSources.concat(imageConfigs);
	}

	loadImage(imageConfig) {
		let _this = this;
		return new Promise(function(resolve){
			fetch(imageConfig.src)
				.then(response => response.blob())
				.then(blobData => utils.createImageBitmap(blobData))
				.then(bitmap => {
					bitmap.hackSrc = imageConfig.src;
					Library.images[imageConfig.id] = bitmap;
					dispatchEvent(_this.onPreloaded);
					resolve();
				});
		});
	}

	addSounds(soundConfigs) {
		this.soundSources = this.soundSources.concat(soundConfigs);
	}

	loadSound(soundConfig) {
		let _this = this;
		return new Promise(function(resolve){
			let sound = new Howl({
				src: [soundConfig.src]
			});
			Library.sounds[soundConfig.id] = sound;
			sound.once("load",function(){
				dispatchEvent(_this.onPreloaded);
				resolve();
			});
		});
	}

	addScenes(sceneConfigs) {
		this.sceneSources = this.sceneSources.concat(sceneConfigs);
	}

	loadScene(sceneConfig) {
		let _this = this;
		return new Promise(function(resolve){
			let xhr = new XMLHttpRequest();
			xhr.open("GET", sceneConfig.src);
			xhr.onload = function() {
				if(xhr.status===200){
					Library.scenes[sceneConfig.id] = JSON.parse(xhr.responseText);
					dispatchEvent(_this.onPreloaded);
					resolve();
				}
			};
			xhr.send();
		});
	}

	addModels(modelConfigs) {
		this.modelSources = this.modelSources.concat(modelConfigs);
	}

	loadModel(modelConfig) {
		let _this = this;
		
		switch(modelConfig.type) {
			case 'gltf':
				return new Promise(function(resolve){
					let glbLoader = new GLTFLoader();
					let dracoLoader = new DRACOLoader();
					dracoLoader.setDecoderPath( 'js/draco/' );
					glbLoader.setDRACOLoader( dracoLoader );
					glbLoader.setPath(modelConfig.path);
					glbLoader.load(modelConfig.src, function(_obj) {       
						Library.models[modelConfig.id] = _obj;
						dispatchEvent(_this.onPreloaded);
						resolve();
					},
					function ( xhr ) {
					// called while loading is progressing
					},
					// called when loading has errors
					function ( error ) {
						console.log( 'An error happened', error );
					});
				});
				break;
			case 'obj':
				return new Promise(function(resolve){
					let objLoader = new OBJLoader();
					objLoader.load(modelConfig.path + modelConfig.src, function(_obj) {
						Library.models[modelConfig.id] = _obj;
						dispatchEvent(_this.onPreloaded);
						resolve();
					},
					function ( xhr ) {
						// called while loading is progressing
					},
					function ( error ) {
						console.log( 'An error happened', error );
					});
				});
				break;
		}
		

		
	}

	addTextures(textureConfigs) {
		this.textureSources = this.textureSources.concat(textureConfigs);
	}

	loadTexture(textureConfig) {
		let _this = this;
		return new Promise(function(resolve) {
			let textureLoader = new THREE.TextureLoader();
			textureLoader.load(textureConfig.src, function(_txtr) {
				Library.textures[textureConfig.id] = new THREE.MeshBasicMaterial({
					map: _txtr
				});
				dispatchEvent(_this.onPreloaded);
				resolve();
			});
		});
	}

	addContents(contentConfigs) {
		this.contentSources = this.contentSources.concat(contentConfigs);
	}

	loadContent(contentConfig) {
		let _this = this;
		return new Promise(function(resolve){
			var xhr = new XMLHttpRequest();
			xhr.open("GET", contentConfig.src);
			xhr.onload = function() {
				if(xhr.status===200){
					Library.contents[contentConfig.id] = xhr.response;
					dispatchEvent(_this.onPreloaded);
					resolve();
				}
			};
			xhr.send();
		});
	}
}

export { LoaderFiles };