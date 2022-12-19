import { Notify } from 'notiflix/build/notiflix-notify-aio';
import ImagesApi from './api';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

// =====Refs===========
const searchFormRef = document.querySelector('#search-form');
const galleryRef = document.querySelector('.gallery');

// =======СlassInstances========
const imagesApi = new ImagesApi();

// ====Listeners=========
searchFormRef.addEventListener('submit', onSearch);

let simpleLightbox = null;

async function onSearch(evt) {
  evt.preventDefault();

  imagesApi.query = evt.currentTarget.elements.searchQuery.value;

  if (imagesApi.query === '') {
    return Notify.failure('Enter something');
  }

  imagesApi.resetPage();
  clearImagesBox();

  try {
    const { hits, totalHits } = await imagesApi.fetchImages();

    if (!hits.length) {
      Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    } else {
      Notify.success(`Hooray! We found ${totalHits} images.`);

      createImagesBox(hits);
      makeSimpleLightbox();

      observer.observe(galleryRef.lastElementChild);
    }
  } catch (error) {
    console.log(error.message);
  }
}

function clearImagesBox() {
  galleryRef.innerHTML = '';
}

function createImagesBox(images) {
  const markup = images
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => {
        return `<a class="simplelightbox-gallery" href="${largeImageURL}"
  ><div class="photo-card">
    <img src="${webformatURL}" alt="${tags}" width="430" height="240" loading="lazy" />
    <div class="info">
      <p class="info-item">
        <b>Likes <span class="info__value">${likes}</span></b>
      </p>
      <p class="info-item">
        <b>Views <span class="info__value">${views}</span></b>
      </p>
      <p class="info-item">
        <b>Comments <span class="info__value">${comments}</span></b>
      </p>
      <p class="info-item">
        <b>Downloads <span class="info__value">${downloads}</span></b>
      </p>
    </div>
  </div></a
>`;
      }
    )
    .join('');
  galleryRef.insertAdjacentHTML('beforeend', markup);
}

function makeSimpleLightbox() {
  simpleLightbox = new SimpleLightbox('.gallery a');
}
function refreshSimpleLightbox() {
  simpleLightbox.refresh();
}

// infinite scrolling
const onInfiniteScroll = async function (entries, observer) {
  try {
    if (entries[0].isIntersecting) {
      observer.unobserve(entries[0].target);
      const { hits } = await imagesApi.fetchImages();
      createImagesBox(hits);
      refreshSimpleLightbox();

      if (hits.length < imagesApi.per_page) {
        observer.unobserve(entries[0].target);
        Notify.failure(
          "We're sorry, but you've reached the end of search results."
        );
      } else {
        observer.observe(galleryRef.lastElementChild);
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};
const observer = new IntersectionObserver(onInfiniteScroll, { threshold: 0.7 });