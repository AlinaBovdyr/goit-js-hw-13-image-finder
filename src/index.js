import getRefs from './scripts/getRefs';
import ImagesApiService from './scripts/apiService';
import photoCardsTpl from './templates/photo-card.hbs';
import LoadMoreBtn from './scripts/loadMoreBtn';
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
const loadMoreBtn = new LoadMoreBtn({
  selector: '[data-action="load-more"]',
  hidden: true,
});

const modal = basicLightbox.create(`
        <div class="lightbox__content">
            <img class="lightbox__image" src="" alt="" />
        </div>
`);

refs.searchForm.addEventListener('submit', onSearch);
loadMoreBtn.refs.button.addEventListener('click', onLoadMore);

function onSearch(e) {
    e.preventDefault();

    imagesApiService.query = e.currentTarget.elements.query.value;

    if (imagesApiService.query.trim() === '') {
        clearPhotoCardsContainer();
        loadMoreBtn.hide();

        return alert({
            text: "Please enter a Search query!",
            type: 'info'
        });
     }
    
    loadMoreBtn.show();
    imagesApiService.resetPage();
    clearPhotoCardsContainer();
    fetchImages().then(() => {
        refs.galleryContainer.addEventListener('click', onGalleryContainerClick);
    });    
}

function onLoadMore() {
    fetchImages().then(() => {
        const position = getElementPositionToScroll(refs.galleryContainer);
        
        window.scrollTo({
            top: position,
            behavior: "smooth"
        });
    });
}

function fetchImages() {
    loadMoreBtn.disable();
    return imagesApiService.fetchImages().then(images => {
        loadMoreBtn.enable();
        appendPhotoCardsMarkup(images);
    });
}

function appendPhotoCardsMarkup(hits) {
    if (hits.length === 0) {
        loadMoreBtn.hide();

        return error({
            text: "An unexpected search query"
        });
    }

    refs.galleryContainer.insertAdjacentHTML('beforeend', photoCardsTpl(hits));
}

function clearPhotoCardsContainer() {
    refs.galleryContainer.innerHTML = '';
}

function getElementPositionToScroll(element) {
    const { bottom } = element.getBoundingClientRect();
    const screenHeight = document.body.clientHeight;
    
    return screenHeight - (bottom - bottom/3);
}

function onGalleryContainerClick(event) {
    console.log(event.target);
    if (event.target.closest('img')) {
        openModal();
        changeLightboxImgAttributes(event.target);
    }
}

function openModal() {
    modal.show();
    window.addEventListener('keydown', onKeyPress);
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
}