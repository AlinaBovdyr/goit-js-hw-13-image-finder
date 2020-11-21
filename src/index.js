import './scss/styles.scss';
import getRefs from './scripts/getRefs';
import ImagesApiService from './scripts/apiService';
import photoCardsTpl from './templates/photo-card.hbs';
import LoadMoreBtn from './scripts/loadMoreBtn';

const refs = getRefs();
const imagesApiService = new ImagesApiService();
const loadMoreBtn = new LoadMoreBtn({
  selector: '[data-action="load-more"]',
  hidden: true,
});

refs.searchForm.addEventListener('submit', onSearch);
loadMoreBtn.refs.button.addEventListener('click', onLoadMore);

function onSearch(e) {
    e.preventDefault();

    imagesApiService.query = e.currentTarget.elements.query.value;
    loadMoreBtn.show();
    imagesApiService.resetPage();
    clearPhotoCardsContainer();
    fetchImages();
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



