/**
 * Author: Ivan Lamprea (INPROEXT)
 * DragAndDrop Module Depends on Hammer.js Library
 * https://hammerjs.github.io/
 * CDN: https://hammerjs.github.io/dist/hammer.min.js
 * 
 * 
 */
 class DragAndDrop {
    constructor(_obj) {
        this.dragElements = document.querySelectorAll(_obj.dragElements);
        this.dropElements = document.querySelectorAll(_obj.dropElements);
        this.ticking = false;
        this.transform = { translate: { x: 0, y: 0 }, rx: 1, angle: 0 };
        this.dragSelected = null;
        this.disabledDrag = _obj.disabledDrag;
        this.requiredPair = _obj.requiredPair;
        this.direction = _obj.direction;
        this.reqAnimationFrame = (function() {
            return function (callback) {
                window.setTimeout(callback.bind(this), 100 / 60);
            }
        })();

        this.dragElements.forEach(_dragEl => {
            let dragCoords = _dragEl.getBoundingClientRect();
            let mc = new Hammer.Manager(_dragEl);
            _dragEl.setAttribute('data-posx', dragCoords.x);
            _dragEl.setAttribute('data-posy', dragCoords.y);
            mc.add(new Hammer.Pan({threshold: 1, pointers: 0 }));
            mc.add(new Hammer.Tap());
            mc.on('panstart panmove', this.onPan.bind(this));
            mc.on('hammer.input', this.onInput.bind(this));
        });

        this.dropEvent = new CustomEvent('dropEvent',{
            detail: {
                dropElement: null,
                dragElement: null,
                itemsDroped: 0,
                dragItems: [...this.dragElements].length,
                dropItems: [...this.dropElements].length,
            },
            bubbles: true,
            cancelable: true,
            composed: false
        });
    }

    resetElement () {
        this.dragSelected.classList.add('animate');
        this.transform = {
            translate: { x: 0, y: 0 },
            scale: 1,
            angle: 0,
            rx: 0,
            ry: 0,
            rz: 0
        };
        this.requestElementUpdate();
    }

    updateElementTransform() {
        let translateX = this.direction == 'all' || this.direction == 'horizontal' ? this.transform.translate.x : 0;
        let translateY = this.direction == 'all' || this.direction == 'vertical' ? this.transform.translate.y : 0;
        let value =	'translate3d('+ translateX +'px, '+ translateY + 'px, 0)';

        this.dragSelected.style.webkitTransform = value;
        this.dragSelected.style.mozTransform = value;
        this.dragSelected.style.transform = value;
        this.ticking = false;
    }

    requestElementUpdate () {
        if(!this.ticking) {
            this.reqAnimationFrame(this.updateElementTransform);
            this.ticking = true;
        }
    }

    onPan (_ev) {
        if(_ev.target.hasAttribute('disabled'))
            return 0;
        this.dragSelected = _ev.target;
        this.dragSelected.classList.remove('animate');
        this.transform.translate = {
            x: _ev.deltaX,
            y: _ev.deltaY
        }
        this.requestElementUpdate();
    }

    onInput (_ev) {
        if(_ev.target.hasAttribute('disabled'))
            return 0;

        if(_ev.isFinal) {
            this.dropElements.forEach((drop) => {

                let dropRect = drop.getBoundingClientRect();
                let dragRect = _ev.target.getBoundingClientRect();
                let dropCenter = {x: (dropRect.x + (dropRect.width / 2)), y: (dropRect.y + (dropRect.height / 2)) }
                let dragCenter = {x: (dragRect.x + (dragRect.width / 2)), y: (dragRect.y + (dragRect.height / 2)) }
                let distance = Math.sqrt(((dropCenter.x - dragCenter.x)*(dropCenter.x - dragCenter.x)) + ((dropCenter.y - dragCenter.y)*(dropCenter.y - dragCenter.y)));
                let allowedArea = { w: dropRect.width / 2, h: dropRect.height / 2 };
                
                if(distance <= allowedArea.w && distance <= allowedArea.h){             
                    let dataDrag = _ev.target.getAttribute('data-drag');
                    let dataDrop = drop.getAttribute('data-drop');
                    if((dataDrag == dataDrop) || !this.requiredPair) {
                        let dataChild, childs;

                        if(drop.hasAttribute('disabled'))
                            return 0;

                        drop.append(_ev.target);

                        dataChild = drop.getAttribute('data-child');
                        childs = [...drop.querySelectorAll('.drag')].length;
                        
                        if(dataChild == childs) {
                            drop.setAttribute('disabled', true);
                        }

                        if(this.disabledDrag){
                            _ev.target.setAttribute('disabled', true);
                        }
                        _ev.target.setAttribute('sticked', true);
                       
                        this.dropEvent.detail.dropElement = drop;
                        this.dropEvent.detail.dragElement = _ev.target;
                        this.dropEvent.detail.itemsDroped = [...document.querySelectorAll('[sticked]')].length;
                        dispatchEvent(this.dropEvent);
                    }
                }
                
                
            });
           
            this.resetElement();
        }
    }

    on(_event, _callback) {
        switch(_event)
        {
            case 'dropEvent':
                _callback();
                break;
        }
    }
    
}

export { DragAndDrop }