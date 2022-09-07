import { LoaderFiles } from './loaderfiles.js';
import { Game3d } from "./game.js";
import { LiquidButton } from './liquidbutton.js';
import { utils } from './utils';

const activeModel = false;
const game3d = new Game3d();
const preload = new LoaderFiles();

let bd = document.body;
let layerMain = document.getElementById('LayerMain');
let scrollBar = document.querySelector('.scroll-bar .bar');
let layerContent = document.getElementById('LayerContent');
let layerPreload = document.getElementById('LayerPreload');
let btnMenuMovile = document.querySelector('.btn-menu-movile');
let menuList = document.querySelector('.menu-list');
let menuItem = document.querySelectorAll('.menu-item');

let points = { mouseX: 0, mouseY: 0 };
let currentPosition = 0,
    lastPosition = -1;

let slideDirection = '';
let scrollDirection = '';

let cameraPoints = [
    { id: 1, satelite: 'dodecaedro_centro2', geometry: 'dodecaedro_centro2', bgColor: '#E7CDF9', speed: 2000 },
    { id: 2, satelite: 'EsferaCubo', geometry: 'cubo', bgColor: '#E7CDF9', speed: 1000 },  
    { id: 3, satelite: 'EsferaEsfera', geometry: 'esfera', bgColor: '#E7CDF9',  speed: 1000 },
    { id: 4, satelite: 'OctaedroEsfera', geometry: 'octaedro', bgColor: '#E7CDF9', speed: 1000 },
    { id: 5, satelite: 'OctaedroEsfera', geometry: 'octaedro', bgColor: '#E7CDF9', speed: 1000 }
];

preload.addContents([
	{ id: '1', src: 'dist/html/1.html' },
    { id: '2', src: 'dist/html/2.html' },
    { id: '3', src: 'dist/html/3.html' },
    { id: '4', src: 'dist/html/4.html' },
    { id: '5', src: 'dist/html/5.html' }
]);

preload.addImages([
    { id: 'logo', src: 'dist/img/logo.png' },
    { id: 'arrow-left', src: 'dist/img/arrow-left.png' },
    { id: 'arrow-right', src: 'dist/img/arrow-right.png' },
    { id: 'control', src: 'dist/img/control.png' },
    { id: 'videogame_1a', src: 'dist/img/videogame_1a.png' },
    { id: 'videogame_1b', src: 'dist/img/videogame_1b.png' },
    { id: 'videogame_1c', src: 'dist/img/videogame_1c.png' },
    { id: 'videogame_2a', src: 'dist/img/videogame_2a.png' },
    { id: 'videogame_3a', src: 'dist/img/videogame_3a.png' },
    { id: 'videogame_3b', src: 'dist/img/videogame_3b.png' },
    { id: 'videogame_4a', src: 'dist/img/videogame_4a.png' },
    { id: 'videogame_4b', src: 'dist/img/videogame_4b.png' }

]);

// preload.addModels([
// 	{ id: 'modelo1', path: 'models/' , src: 'sistema.gltf', type: 'gltf' }
// ]);

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
    if(activeModel)
    {
        game3d.addModel(Library.models['modelo1'], 'gltf');
        game3d.resize();
    }
    loop();
    fn_load();
}

function fn_load(){
    let scrollProgress = ((currentPosition + 1) / cameraPoints.length * 100);
    scrollDirection = currentPosition > lastPosition ? "down": "up";
    if(currentPosition !== lastPosition) {
        layerContent.innerHTML = '';
        //layerMain.style.display = 'none';
        if(activeModel) game3d.moveCamera(cameraPoints[currentPosition]);
        layerContent.innerHTML = Library.contents[currentPosition+1];
        checkScrollDirection();
        checkLiquidButton();
        checkParallax();
        document.body.setAttribute('data-page', currentPosition);
        scrollBar.style.width = scrollProgress + '%';
        utils.loadImages();
        utils.parseScript(Library.contents[currentPosition+1]);
        lastPosition = currentPosition;
    }
    else {
        scrollDirection = "keep";
    }
}

function setEvents() {
    let prevTime = new Date().getTime();
    let mc = new Hammer(bd);
    
    mc.get('pan').set({ direction: Hammer.DIRECTION_ALL });   
    mc.on('panleft panright panup pandown tap press', function(ev) {
        let curTime = new Date().getTime();
        let timeDiff = curTime-prevTime;
        prevTime = curTime;
        if(timeDiff > 200) {
            let scrollContainer = document.querySelector('.scroll');

            if(ev.type == "panup"){
                slideDirection = 'down';
                currentPosition += 1;
            }

            if(ev.type == "pandown"){
                slideDirection = 'up';
                currentPosition -= 1;
            }

            if(scrollContainer == null) {
                checkArrows();
                fn_load();                 
            }
            
            checkCarrousel(slideDirection);
        }
    });
    
    Hamster(bd).wheel(function(event, delta, deltaX, deltaY) {
        
        let curTime = new Date().getTime();
        let timeDiff = curTime-prevTime;
        prevTime = curTime;
        if(timeDiff > 200) {
            let scrollContainer = document.querySelector('.scroll');
            if(delta == -1){
                slideDirection = 'down';
                currentPosition += 1;
            }
            else {
                slideDirection = 'up';
                currentPosition -= 1;
            }

            if(scrollContainer == null) {
                checkArrows();
                fn_load();                 
            }
            
            checkCarrousel(slideDirection);
        }

    });


    btnMenuMovile.addEventListener('click', function() {
        menuList.classList.add('active');
    });

    menuItem.forEach((_item) => {
        /*
        _item.addEventListener('click', function() {
            let pos = parseInt(this.getAttribute('data-html'));
            currentPosition = pos;
            menuList.classList.remove('active');
            deactiveBullets();
            this.classList.add('active');
            fn_load();
        });
        */
    });


    window.addEventListener('resize', function() {
        if(activeModel) game3d.resize();
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
                let gx, gy, gw, gh, gscale;
                let bx, by;
                let hiddenImage = imageReveal.getAttribute('data-hiddenImage');
                let srcHiddenImage = Library.images[hiddenImage].src;
                let rects = imageReveal.getBoundingClientRect();
                gw = glass.offsetWidth / 2;
                gh = glass.offsetHeight / 2;
                gx = _ev.clientX - gw;
                gy = _ev.clientY - gh;
                gx = gx - window.pageXOffset;
                gy = gy - window.pageYOffset;
                bx = gx - rects.x;
                by = gy - rects.y;
                if(gx > rects.x && gx < (rects.width + rects.x - glass.offsetWidth) && gy > rects.y && gy < (rects.height + rects.y - glass.offsetHeight))
                {
                    glass.style.opacity = 1;
                    
                    gscale = 1;
                   
                }
                else {
                    glass.style.opacity = 0;
                    gscale = 0;
                }

                //glass.pxstyle.transform = 'translate('+gx+'px,'+gy+'px) scale('+gscale+')';
                glass.style.transform = 'scale('+gscale+')';
                glass.style.left = gx + 'px';
                glass.style.top = gy + 'px';
                glass.style.backgroundImage = 'url('+srcHiddenImage+')';
                glass.style.backgroundRepeat = 'no-repeat';
                glass.style.backgroundSize = (rects.width) + "px " + (rects.height) + "px";
                glass.style.backgroundPosition = "-" + (bx) + "px -" + (by) + "px";
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
    
    //deactiveBullets();
    //menuItem[currentPosition].classList.add('active');
}

function checkScrollDirection() {
    let scroll = document.querySelector('.scroll');
    let slides = document.querySelectorAll('.slide');
    let cantSlides = slides.length - 1;
    if(scroll !== null) {
        if(scrollDirection == "down") {
            slides[0].classList.add('active');
            scroll.setAttribute('data-pos', 0);
        }
        if(scrollDirection == "up") {
            slides[cantSlides].classList.add('active');
            scroll.setAttribute('data-pos', cantSlides);
        }
    }
}

function checkCarrousel(_slideDirection) {
    let carrousel = document.querySelector('.carrousel.scroll');
    let slides = document.querySelectorAll('.slide');
    if(carrousel !== null) {
        let init = parseInt(carrousel.getAttribute('data-init'));
        let pos = parseInt(carrousel.getAttribute('data-pos'));
        let cantSlides = slides.length - 1;

        if(init) {
            carrousel.setAttribute('data-init', 0);
        }
        else {
            if(pos == 0) {
                if( _slideDirection == "up")
                {
                    console.log('Cambiar Anterior Pagina');
                    checkArrows();
                    fn_load();
                }
                else {
                    currentPosition -= 1;
                    console.log("Cambiar Siguiente Slide");
                    carrousel.setAttribute('data-pos', (pos + 1));
                    slides.forEach(_slide => { _slide.classList.remove('active'); })
                    slides[pos + 1].classList.add('active');
                }
            }
            else if(pos == cantSlides) {
                if( _slideDirection == "down")
                {
                    console.log("CambiarSiguientePagina");
                    checkArrows();
                    fn_load();
                }
                else {
                    currentPosition += 1;
                    console.log("Cambiar Anterior Slide");
                    carrousel.setAttribute('data-pos', (pos - 1));
                    slides.forEach(_slide => { _slide.classList.remove('active'); })
                    slides[pos - 1].classList.add('active');
                }
            }
            else {
                if( _slideDirection == "down")
                {
                    currentPosition -= 1;
                    console.log("Cambiar Anterior Slide");
                    carrousel.setAttribute('data-pos', (pos + 1));
                    slides.forEach(_slide => { _slide.classList.remove('active'); })
                    slides[pos + 1].classList.add('active');
                }

                if( _slideDirection == "up")
                {
                    currentPosition += 1;
                    console.log("Cambiar Anterior Slide");
                    carrousel.setAttribute('data-pos', (pos - 1));
                    slides.forEach(_slide => { _slide.classList.remove('active'); })
                    slides[pos - 1].classList.add('active');
                }

            }
        }
    }
}

function checkLiquidButton() {
    let buttons = document.getElementsByClassName("liquid-button");
    for (let buttonIndex = 0; buttonIndex < buttons.length; buttonIndex++) {
        let button = buttons[buttonIndex];
        button.liquidButton = new LiquidButton(button);
    }
}

function checkParallax() {
    let parallaxScene = document.querySelector('.parallax-scene');
    if(parallaxScene !== null) {
        new Parallax(parallaxScene);
    }
}

function deactiveBullets () {
    menuItem.forEach(_el => _el.classList.remove('active'));
}

function loop() {
    requestAnimationFrame(loop);
    if(activeModel) game3d.update(points);
}