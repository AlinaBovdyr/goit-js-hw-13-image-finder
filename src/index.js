import './scss/styles.scss';
import getRefs from './scripts/getRefs';
import ImagesApiService from './scripts/apiService';
import photoCardsTpl from './templates/photo-card.hbs';

const refs = getRefs();
const imagesApiService = new ImagesApiService();

refs.searchForm.addEventListener('submit', onSearch);
refs.loadMoreBtn.addEventListener('click', onLoadMore);

function onSearch(e) {
    e.preventDefault();
    clearPhotoCardsContainer();

    imagesApiService.query = e.currentTarget.elements.query.value;
    imagesApiService.resetPage();
    imagesApiService.fetchImages().then(appendPhotoCardsMarkup);
}

function onLoadMore() {
    imagesApiService.fetchImages().then(appendPhotoCardsMarkup);
}

function appendPhotoCardsMarkup(hits) {
    refs.galleryContainer.insertAdjacentHTML('beforeend', photoCardsTpl(hits));
}

function clearPhotoCardsContainer() {
    refs.galleryContainer.innerHTML = '';
}


