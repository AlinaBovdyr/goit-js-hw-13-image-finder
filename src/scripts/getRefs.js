export default function getRefs() {
    return {
        searchForm: document.querySelector('.search-form'),
        loadMoreBtn: document.querySelector('[data-action="load-more"]'),
        galleryContainer: document.querySelector('.gallery')
    }
}