const utils = {
    readJsonFile: (file, callback) => {
		var xhr = new XMLHttpRequest();
		xhr.overrideMimeType("application/json");
		xhr.open("GET", file, true);
		xhr.onreadystatechange = function() {
			if (xhr.readyState === 4 && xhr.status == "200") {
				callback(xhr.responseText);
			}
		}
		xhr.send(null);
	},
    createImageBitmap : async (data) => {
        return new Promise((resolve,reject) => {
			let dataURL;
			if (data instanceof Blob) {
				dataURL = URL.createObjectURL(data);
			} else if (data instanceof ImageData) {
				const canvas = document.createElement('canvas');
				const ctx = canvas.getContext('2d');
				canvas.width = data.width;
				canvas.height = data.height;
				ctx.putImageData(data,0,0);
				dataURL = canvas.toDataURL();
			} else {
				throw new Error('createImageBitmap does not handle the provided image source type');
			}
			const img = document.createElement('img');
			img.addEventListener('load',function () {
				resolve(this);
			});
			img.src = dataURL;
		});
    },
	parseScript: (strcode) => {
		var scripts = new Array();
		while(strcode.indexOf("<script") > -1 || strcode.indexOf("</script") > -1) {
			var s = strcode.indexOf("<script");
			var s_e = strcode.indexOf(">", s);
			var e = strcode.indexOf("</script", s);
			var e_e = strcode.indexOf(">", e);
			scripts.push(strcode.substring(s_e+1, e));
			strcode = strcode.substring(0, s) + strcode.substring(e_e+1);
		}
		for(var i=0; i<scripts.length; i++) {
			try {
				eval(scripts[i]);
			}
			catch(ex) {
				console.log(ex);
			}
		}
	},
	sfx: (sound, options) => {
		options = options || {};
		options.volume = options.volume===undefined ? 1 : options.volume;
		options.loop = options.loop===undefined ? false : options.loop;
		let sfx = Library.sounds[sound];
		sfx.volume(options.volume);
		sfx.loop(options.loop);
		sfx.play();
	},
	stopAllSounds: () => {
		Object.keys(Library.sounds).forEach(function(name){
			Library.sounds[name].stop();
		});
	},
	loadImages: () => {
		document.querySelectorAll('.load-image').forEach((img) => {
			let imageId = img.getAttribute('data-image');
			img.src = Library.images[imageId].src;
		});

		document.querySelectorAll('.load-background').forEach((bg) => {
			let bgId = bg.getAttribute('data-image');
			bg.style.backgroundImage = 'url('+Library.images[bgId].src+')';
		});
	},
    degreesToRadians: (_degrees) => {
        let pi = Math.PI;
        return _degrees * (pi/180);
    },
	radiansToDegrees: (_radians) => {
		let pi = Math.PI;
		return _radians * (180/pi);
	},
	animateCss: (element, animation, prefix = 'animate__') => {
		// We create a Promise and return it
		new Promise((resolve, reject) => {
			const animationName = `${prefix}${animation}`;
			const node = document.querySelector(element);
		
			node.classList.add(`${prefix}animated`, animationName);
		
			// When the animation ends, we clean the classes and resolve the Promise
			function handleAnimationEnd(event) {
				event.stopPropagation();
				node.classList.remove(`${prefix}animated`, animationName);
				resolve('Animation ended');
			}
		
			node.addEventListener('animationend', handleAnimationEnd, {once: true});
		});
	}
}

export { utils }