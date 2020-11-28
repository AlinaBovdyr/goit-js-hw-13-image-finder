import getRefs from './scripts/getRefs';
import ImagesApiService from './scripts/apiService';
import photoCardsTpl from './templates/photo-card.hbs';
import { alert, error } from '@pnotify/core';
import * as basicLightbox from 'basiclightbox';

import './scss/styles.scss';
import '@pnotify/core/dist/PNotify.css';
import '@pnotify/core/dist/BrightTheme.css';
import '../node_modules/basicLightbox/dist/basicLightbox.min.css';

const { defaults } = require('@pnotify/core');
defaults.delay = '1500';

const refs = getRefs();
const imagesApiService = new ImagesApiService();

const modal = basicLightbox.create(`
        <div class="lightbox__content modal">
            <button id="left-btn" class="modal-btn"><i class="material-icons modal-btn-icon">arrow_back_ios</i></button>
            <img class="lightbox__image" src="" alt="" />
            <button id="right-btn" class="modal-btn"><i class="material-icons modal-btn-icon">arrow_forward_ios</i></button>
        </div>
`);

const observerOptions = {
    rootMargin: '200px',
};

const observer = new IntersectionObserver(onEntry, observerOptions);

observer.observe(refs.observerEl);

refs.searchForm.addEventListener('submit', onSearch);

function onEntry(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting && imagesApiService.query !== '') {
            fetchImages().then(() => {
                refs.upBtn.classList.add('visible');
                refs.upBtn.addEventListener('click', onUpBtnClick);
            });
        }
    });
};

function onSearch(e) {
    e.preventDefault();

    imagesApiService.query = e.currentTarget.elements.query.value;

    if (imagesApiService.query.trim() === '') {
        clearPhotoCardsContainer();

        return alert({
            text: "Please enter a Search query!",
            type: 'info'
        });
    }
    
    imagesApiService.resetPage();
    clearPhotoCardsContainer();
    fetchImages().then(() => {
        refs.galleryContainer.addEventListener('click', onGalleryContainerClick);
    });    
}

function fetchImages() {
    return imagesApiService.fetchImages().then(images => {
        appendPhotoCardsMarkup(images);
    });
}

function appendPhotoCardsMarkup(hits) {
    if (hits.length === 0) {
        return error({
            text: "Photo not found. Please enter a more specific query!"
        });
    }

    refs.galleryContainer.insertAdjacentHTML('beforeend', photoCardsTpl(hits));
}

function clearPhotoCardsContainer() {
    refs.galleryContainer.innerHTML = '';
}

function onGalleryContainerClick(event) {
    if (event.target.closest('img')) {
        openModal();
        changeLightboxImgAttributes(event.target);
    } 
}

function openModal() {
    modal.show();
    window.addEventListener('keydown', onKeyPress);

    const rightModalBtn = document.querySelector('#right-btn');
    const leftModalBtn = document.querySelector('#left-btn');
    rightModalBtn.addEventListener('click', onRightModalBtnClick);
    leftModalBtn.addEventListener('click', onLeftModalBtnClick);
}

function changeLightboxImgAttributes(image) {
    const lightboxImg = document.querySelector('.lightbox__image');
    const urlOriginal = image.dataset.source;
    const altAttribute = image.alt;
    lightboxImg.setAttribute('src', `${urlOriginal}`);
    lightboxImg.setAttribute('alt', `${altAttribute}`);
}

function onKeyPress(event) {
    if (event.key === 'Escape') {
        modal.close();
    }
    
    if (event.key === 'ArrowRight') {
        getNextImage();
    }
    
    if (event.key === 'ArrowLeft') {
        getPreviousImage()
    }
}

function onRightModalBtnClick() {
    getNextImage();
}

function onLeftModalBtnClick() {
    getPreviousImage()
}

function getCurrentModalImage() {
    const lightboxImg = document.querySelector('.lightbox__image');
    const galleryItems = Array.from(refs.galleryContainer.children);
    const currentImage = galleryItems.find(galleryImage => { 
        if (galleryImage.firstElementChild.dataset.source === lightboxImg.getAttribute('src')) {
            return galleryImage
        }
    });
    const currentIndex = galleryItems.indexOf(currentImage);
    const lastImageNum = galleryItems.length - 1;

    return { lightboxImg, galleryItems, currentIndex, lastImageNum };
}

function getNextImage() {
    const modalRefs = getCurrentModalImage();
    if (modalRefs.currentIndex === modalRefs.lastImageNum) {
            fetchImages();
    }

    modalRefs.lightboxImg.setAttribute('src', modalRefs.galleryItems[modalRefs.currentIndex + 1].firstElementChild.dataset.source);
}

function getPreviousImage() {
    const modalRefs = getCurrentModalImage();
    if (modalRefs.currentIndex === 0) {
            return;
    }

    modalRefs.lightboxImg.setAttribute('src', modalRefs.galleryItems[modalRefs.currentIndex - 1].firstElementChild.dataset.source);
}

function onUpBtnClick() {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

    refs.upBtn.classList.remove('visible');
}