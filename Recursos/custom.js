function showAndHide(_show, _hide) {
    if(_show != null) {
        document.querySelector(_show).classList.add('active');
    }
    if(_hide != null) {
        document.querySelector(_hide).classList.remove('active');
    }
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