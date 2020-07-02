// This script requires jQuery

// Set up carousels
function handleGameCarouselChange (index) {
  heroCarousel.goToIndex(index);
}

function handleHeroCarouselChange (index) {
  gameCarousel.goToIndex(index);
}

const gameCarousel = new Carousel('#game-carousel', {
  onChange: handleGameCarouselChange
});
const heroCarousel = new Carousel('#hero-carousel', {
  autoAdvance: 5 * 1000,
  onChange: handleHeroCarouselChange
});
