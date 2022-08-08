import { LoaderFiles } from './loaderfiles.js';
import { Game3d } from "./game.js";
import { utils } from './utils';
import { RectAreaLight } from './libs/three/three.module.js';

const game3d = new Game3d(); 
const preload = new LoaderFiles();

let bd = document.body;
let layerMain = document.getElementById('LayerMain');
let layerContent = document.getElementById('LayerContent');
let layerPreload = document.getElementById('LayerPreload');
let btnMenuMovile = document.querySelector('.btn-menu-movile');
let menuList = document.querySelector('.menu-list');
let menuItem = document.querySelectorAll('.menu-item');

let points = { mouseX: 0, mouseY: 0 };
let currentPosition = 0;


let cameraPoints = [
    //x,y,z corresponde a la posicion de la cubo //cx, cy, cz corresponde a la posición del camara
    { id: 0, satelite: 'dodecaedro_centro2', geometry: 'dodecaedro_centro2', bgColor: '#000', speed: 2000 },
    { id: 1, satelite: 'EsferaCubo', geometry: 'cubo', bgColor: '#000', speed: 1000 },  
    { id: 2, satelite: 'EsferaEsfera', geometry: 'esfera', bgColor: '#000',  speed: 1000 },
    { id: 3, satelite: 'OctaedroEsfera', geometry: 'octaedro', bgColor: '#000', speed: 1000 },
    { id: 4, satelite: 'IcosaedroEsfera', geometry: 'icosaedro', bgColor: '#000', speed: 1000 },
    { id: 5, satelite: 'DodecaedroEsfera', geometry: 'dodecaedro', bgColor: '#000', speed: 1000 }
];

preload.addContents([
	{ id: '1', src: 'dist/html/1.html' },
    { id: '2', src: 'dist/html/2.html' },
    { id: '3', src: 'dist/html/3.html' },
    { id: '4', src: 'dist/html/4.html' },
    { id: '5', src: 'dist/html/5.html' },
    { id: '6', src: 'dist/html/6.html' }
]);

preload.addImages([
    { id: 'logo', src: 'dist/img/logo.png' },
    { id: 'home_1a', src: 'dist/img/home_1a.png' },
    { id: 'home_1b', src: 'dist/img/home_1b.png' },
    { id: 'home_2a', src: 'dist/img/home_2a.png' },
    { id: 'home_3a', src: 'dist/img/home_3a.png' },
    { id: 'home_4a', src: 'dist/img/home_4a.png' },
    { id: 'home_4b', src: 'dist/img/home_4b.png' },
]);

preload.addModels([
	{ id: 'modelo1', path: 'models/' , src: 'sistema.gltf', type: 'gltf' }
]);

preload.addSounds([

]);


preload.load(function (_progress) {
	layerPreload.innerHTML = '<h1>'+_progress + '%</h1>';
}).then(function () {
    init();
    anime({
        targets: layerPreload,
        opacity: 0,
        top: "100%",
        easing: 'easeInQuad',
        duration: 400,
        delay: 600,
        complete: function() {
            layerPreload.style.display = 'none';
        }
    });
});


function init() {
    setEvents();
    game3d.addModel(Library.models['modelo1'], 'gltf');
    game3d.resize();
    loop();
    fn_load();
}

function fn_load(){
    layerContent.innerHTML = '';
    //layerMain.style.display = 'none';
    game3d.moveCamera(cameraPoints[currentPosition]);
    layerContent.innerHTML = Library.contents[currentPosition+1];
    document.body.setAttribute('data-page', currentPosition);
    utils.loadImages();
    utils.parseScript(Library.contents[currentPosition+1]);
}

function setEvents() {
    let prevTime = new Date().getTime();
    let mc = new Hammer(bd);
    /*
    mc.get('pan').set({ direction: Hammer.DIRECTION_ALL });   
    mc.on('panleft panright panup pandown tap press', function(ev) {
        let curTime = new Date().getTime();
        let timeDiff = curTime-prevTime;
        prevTime = curTime;
        if(timeDiff > 200) {
            if(ev.type == "panup"){
                currentPosition += 1;
                checkArrows();
                fn_load();
            }

            if(ev.type == "pandown"){
                currentPosition -= 1;
                checkArrows();
                fn_load();
            }
        }
    });
    
    Hamster(bd).wheel(function(event, delta, deltaX, deltaY){
        let curTime = new Date().getTime();
        let timeDiff = curTime-prevTime;
        prevTime = curTime;

       
         if(timeDiff > 200) {
            if(delta == -1){
                currentPosition += 1;
            }
            else {
                currentPosition -= 1;
            }
            checkArrows();
            fn_load();
        }
    });
    */

    btnMenuMovile.addEventListener('click', function() {
        menuList.classList.add('active');
    });

    menuItem.forEach((_item) => {
        _item.addEventListener('click', function() {
            let pos = parseInt(this.getAttribute('data-html'));
            currentPosition = pos;
            menuList.classList.remove('active');
            deactiveBullets();
            this.classList.add('active');
            fn_load();
        });
    });


    window.addEventListener('resize', function() {
        game3d.resize();
    });

    window.addEventListener('endmovement', function() {
        console.log('eventomoviemiento');
    });

    document.body.addEventListener('mousemove', (_ev) => {
        try 
        {
            let imageReveal = document.querySelector('.front-image');
            let glass = document.querySelector('.glass');
            if(imageReveal !== null){
                _ev.preventDefault();
                let x, y, w, h;
                let hiddenImage = imageReveal.getAttribute('data-hiddenImage');
                let srcHiddenImage = Library.images[hiddenImage].src;
                let rects = imageReveal.getBoundingClientRect();
                w = glass.offsetWidth / 2;
                h = glass.offsetHeight / 2;
                x = _ev.clientX - w;
                y = _ev.clientY - h;
                x = x - window.pageXOffset;
                y = y - window.pageYOffset;
                glass.style.transform = 'translate('+x+'px,'+y+'px)';
                glass.style.backgroundImage = 'url('+srcHiddenImage+')';
                glass.style.backgroundRepeat = 'no-repeat';
                glass.style.backgroundSize = (rects.width) + "px " + (rects.height) + "px";
                glass.style.backgroundPosition = "-" + (x) + "px -" + (y) + "px";
            }   
        }
        catch(err) {
            console.log(err);
        } 
    });
}

function checkArrows() {
    if(currentPosition <= 0) {
        currentPosition = 0;
    }

    if(currentPosition >= cameraPoints.length - 1) {
        currentPosition = cameraPoints.length - 1;
    }
    
    deactiveBullets();
    menuItem[currentPosition].classList.add('active');
}

function deactiveBullets () {
    menuItem.forEach(_el => _el.classList.remove('active'));
}

function loop() {
    requestAnimationFrame(loop);
    game3d.update(points);
}