function showAndHide(_show, _hide) {
    document.querySelector(_show).classList.add('active');
    document.querySelector(_hide).classList.remove('active');
}

function addActive(_element) {
    let hasClass = document.querySelector(_element).classList.contains('active');
    if(hasClass) {
        document.querySelector(_element).classList.remove('active');
    }
    else {
        document.querySelector(_element).classList.add('active');
    }
}

function addCustomClass(_element, _class) {
    console.log(document.querySelector(_element));
    document.querySelector(_element).classList.add(_class);
}

function removeCustomClass(_element, _class) {
    document.querySelector(_element).classList.add(_class);
}