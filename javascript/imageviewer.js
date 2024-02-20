// From A1111

function closeModal() {
    gradioApp().getElementById("lightboxModal").style.display = "none";
}

function showModal(event) {
    const source = event.target || event.srcElement;
    const modalImage = gradioApp().getElementById("modalImage");
    const lb = gradioApp().getElementById("lightboxModal");
    modalImage.src = source.src;
    if (modalImage.style.display === 'none') {
        lb.style.setProperty('background-image', 'url(' + source.src + ')');
    }
    lb.style.display = "flex";
    lb.focus();

    event.stopPropagation();
}

function negmod(n, m) {
    return ((n % m) + m) % m;
}

function updateOnBackgroundChange() {
    const modalImage = gradioApp().getElementById("modalImage");
    if (modalImage && modalImage.offsetParent) {
        let currentButton = selected_gallery_button();

        if (currentButton?.children?.length > 0 && modalImage.src != currentButton.children[0].src) {
            modalImage.src = currentButton.children[0].src;
            if (modalImage.style.display === 'none') {
                const modal = gradioApp().getElementById("lightboxModal");
                modal.style.setProperty('background-image', `url(${modalImage.src})`);
            }
        }
    }
}

function all_gallery_buttons() {
    var allGalleryButtons = gradioApp().querySelectorAll('.image_gallery .thumbnails > .thumbnail-item.thumbnail-small');
    var visibleGalleryButtons = [];
    allGalleryButtons.forEach(function (elem) {
        if (elem.parentElement.offsetParent) {
            visibleGalleryButtons.push(elem);
        }
    });
    return visibleGalleryButtons;
}

function selected_gallery_button() {
    return all_gallery_buttons().find(elem => elem.classList.contains('selected')) ?? null;
}

function selected_gallery_index() {
    return all_gallery_buttons().findIndex(elem => elem.classList.contains('selected'));
}

function modalImageSwitch(offset) {
    var galleryButtons = all_gallery_buttons();

    if (galleryButtons.length > 1) {
        var currentButton = selected_gallery_button();

        var result = -1;
        galleryButtons.forEach(function (v, i) {
            if (v == currentButton) {
                result = i;
            }
        });

        if (result != -1) {
            var nextButton = galleryButtons[negmod((result + offset), galleryButtons.length)];
            nextButton.click();
            const modalImage = gradioApp().getElementById("modalImage");
            const modal = gradioApp().getElementById("lightboxModal");
            modalImage.src = nextButton.children[0].src;
            if (modalImage.style.display === 'none') {
                modal.style.setProperty('background-image', `url(${modalImage.src})`);
            }
            setTimeout(function () {
                modal.focus();
            }, 10);
        }
    }
}

function saveImage() {

}

function modalSaveImage(event) {
    event.stopPropagation();
}

function modalNextImage(event) {
    modalImageSwitch(1);
    event.stopPropagation();
}

function modalPrevImage(event) {
    modalImageSwitch(-1);
    event.stopPropagation();
}

function modalKeyHandler(event) {
    switch (event.key) {
        case "s":
            saveImage();
            break;
        case "ArrowLeft":
            modalPrevImage(event);
            break;
        case "ArrowRight":
            modalNextImage(event);
            break;
        case "Escape":
            closeModal();
            break;
    }
}

function setupImageForLightbox(e) {
    if (e.dataset.modded) {
        return;
    }

    e.dataset.modded = true;
    e.style.cursor = 'pointer';
    e.style.userSelect = 'none';

    var isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;

    // For Firefox, listening on click first switched to next image then shows the lightbox.
    // If you know how to fix this without switching to mousedown event, please.
    // For other browsers the event is click to make it possiblr to drag picture.
    var event = isFirefox ? 'mousedown' : 'click';

    e.addEventListener(event, function (evt) {
        if (evt.button == 1) {
            open(evt.target.src);
            evt.preventDefault();
            return;
        }
        if (evt.button != 0) return;

        modalZoomSet(gradioApp().getElementById('modalImage'), true);
        evt.preventDefault();
        showModal(evt);
    }, true);

}

function modalZoomSet(modalImage, enable) {
    if (modalImage) modalImage.classList.toggle('modalImageFullscreen', !!enable);
}

function modalZoomToggle(event) {
    var modalImage = gradioApp().getElementById("modalImage");
    modalZoomSet(modalImage, !modalImage.classList.contains('modalImageFullscreen'));
    event.stopPropagation();
}

function modalTileImageToggle(event) {
    const modalImage = gradioApp().getElementById("modalImage");
    const modal = gradioApp().getElementById("lightboxModal");
    const isTiling = modalImage.style.display === 'none';
    if (isTiling) {
        modalImage.style.display = 'block';
        modal.style.setProperty('background-image', 'none');
    } else {
        modalImage.style.display = 'none';
        modal.style.setProperty('background-image', `url(${modalImage.src})`);
    }

    event.stopPropagation();
}

onAfterUiUpdate(function () {
    var fullImg_preview = gradioApp().querySelectorAll('.image_gallery > div > img');
    if (fullImg_preview != null) {
        fullImg_preview.forEach(setupImageForLightbox);
    }
    updateOnBackgroundChange();
});

document.addEventListener("DOMContentLoaded", function () {
    window.deleted_components = []
    //const modalFragment = document.createDocumentFragment();
    const modal = document.createElement('div');
    modal.onclick = closeModal;
    modal.id = "lightboxModal";
    modal.tabIndex = 0;
    modal.addEventListener('keydown', modalKeyHandler, true);

    setInterval(() => {
        if (window.getComputedStyle(document.getElementById("generate_button")).display != 'none') {
            window.deleted_components = []
        } else {
            const components = document.getElementsByClassName('thumbnail-item');  // get the div element
            if (components == null) return;
            for (let i = 0; i < components.length; i++) {
                for (let j = 0; j < window.deleted_components.length; j++) {
                    if (components[i].id == 'thumb-nail-' + window.deleted_components[j] ||
                        components[i].id == 'thumb-nail-' + (window.deleted_components[j] + components.length)) {
                        components[i].style.display = 'none';
                    }
                }
            }

            const final_components_container = document.getElementById("final_gallery")
            const final_components = final_components_container.getElementsByClassName("thumbnail-item")
            if (final_components != null && final_components.length > 0)
                for (let i = 0; i < final_components.length; i++) {
                    for (let j = 0; j < window.deleted_components.length; j++) {
                        if (final_components[i].id == 'thumb-nail-' + (window.deleted_components[j] + final_components.length)) {
                            final_components[i].style.display = 'none';
                        }

                    }
                }

            for (let i = 0; i < components.length; i++) {  // loop over each element
                let component = components[i]
                const childElement = component.querySelector('#close-btn');  // get the child element with id "child"
                if (childElement) {
                } else {
                    component.id = 'thumb-nail-' + i;
                    component.style.position = 'relative'
                    const closeButton = document.createElement('button');  // create a new button element
                    closeButton.id = "close-btn"
                    closeButton.textContent = '×';  // set the button text
                    closeButton.style = "position: absolute; top: 10px; right: 10px;    width: 20px; height: 20px; border: 1px solid gray; border-radius: 5px;"
                    component.removeEventListener('click', () => { })
                    component.getElementsByTagName("img")[0].removeEventListener('click', {})

                    closeButton.addEventListener('click', (e) => {  // add a click event listener to the button
                        component.style.display = 'none';  // hide the div element
                        e.stopPropagation()
                        window.deleted_components.push(i)
                    });
                    component.insertBefore(closeButton, component.firstChild);  // insert the button 
                }

            }
        }


    }, 1000)
    const modalControls = document.createElement('div');
    modalControls.className = 'modalControls gradio-container';
    modal.append(modalControls);

    const modalZoom = document.createElement('span');
    modalZoom.className = 'modalZoom cursor';
    modalZoom.innerHTML = '&#10529;';
    modalZoom.addEventListener('click', modalZoomToggle, true);
    modalZoom.title = "Toggle zoomed view";
    modalControls.appendChild(modalZoom);

    // const modalTileImage = document.createElement('span');
    // modalTileImage.className = 'modalTileImage cursor';
    // modalTileImage.innerHTML = '&#8862;';
    // modalTileImage.addEventListener('click', modalTileImageToggle, true);
    // modalTileImage.title = "Preview tiling";
    // modalControls.appendChild(modalTileImage);
    //
    // const modalSave = document.createElement("span");
    // modalSave.className = "modalSave cursor";
    // modalSave.id = "modal_save";
    // modalSave.innerHTML = "&#x1F5AB;";
    // modalSave.addEventListener("click", modalSaveImage, true);
    // modalSave.title = "Save Image(s)";
    // modalControls.appendChild(modalSave);

    const modalClose = document.createElement('span');
    modalClose.className = 'modalClose cursor';
    modalClose.innerHTML = '&times;';
    modalClose.onclick = closeModal;
    modalClose.title = "Close image viewer";
    modalControls.appendChild(modalClose);

    const modalImage = document.createElement('img');
    modalImage.id = 'modalImage';
    modalImage.onclick = closeModal;
    modalImage.tabIndex = 0;
    modalImage.addEventListener('keydown', modalKeyHandler, true);
    modal.appendChild(modalImage);

    const modalPrev = document.createElement('a');
    modalPrev.className = 'modalPrev';
    modalPrev.innerHTML = '&#10094;';
    modalPrev.tabIndex = 0;
    modalPrev.addEventListener('click', modalPrevImage, true);
    modalPrev.addEventListener('keydown', modalKeyHandler, true);
    modal.appendChild(modalPrev);

    const modalNext = document.createElement('a');
    modalNext.className = 'modalNext';
    modalNext.innerHTML = '&#10095;';
    modalNext.tabIndex = 0;
    modalNext.addEventListener('click', modalNextImage, true);
    modalNext.addEventListener('keydown', modalKeyHandler, true);

    modal.appendChild(modalNext);

    try {
        gradioApp().appendChild(modal);
    } catch (e) {
        gradioApp().body.appendChild(modal);
    }

    document.body.appendChild(modal);

});