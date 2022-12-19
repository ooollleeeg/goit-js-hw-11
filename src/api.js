const axios = require('axios').default;

const BASE_URL = 'https://pixabay.com/api/';
const API_KEY = '32077090-c2128b2dfd2e1e6fab4ce371e';

export default class ImagesApi {
  constructor() {
    this.searchQuery = '';
    this.page = 1;
    this.per_page = 40;
  }

  fetchImages() {
    const params = new URLSearchParams({
      key: API_KEY,
      q: this.searchQuery,
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: 'true',
      page: this.page,
      per_page: this.per_page,
    });

    const URL = `${BASE_URL}?${params}`;

    return axios.get(URL).then(({ data }) => {
      this.incrementPage();
      return data;
    });
  }

  incrementPage() {
    this.page += 1;
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
