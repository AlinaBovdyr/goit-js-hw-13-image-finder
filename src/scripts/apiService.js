const BASE_URL = 'https://pixabay.com/api/';
const KEY = '19151711-be14d41e7a0bdcd70a93cb54b';
        
export default class ImagesApiService {
    constructor() {
        this.searchQuery = '';
        this.page = 1;
    }

    fetchImages() {
        const searchParams = new URLSearchParams({
            q: this.searchQuery,
            image_type: 'photo',
            orientation: 'horizontal',
            page: this.page,
            per_page: 12,
            key: KEY,
        });

        const url = `${BASE_URL}?${searchParams}`;

        return fetch(url)
            .then(response => response.json())
            .then(({hits}) => {
                this.page += 1; 

                return hits;
            });
    }

    resetPage() {
        this.page = 1;
    }

    get query() {
        return this.searchQuery;
    }

    set query(newQuery) {
        this.searchQuery = newQuery;
    }
}