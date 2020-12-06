// This script requires jQuery

// Set up carousels
function handleGameCarouselChange (index) {
  heroCarousel.goToIndex(index);
}

function handleHeroCarouselChange (index, previousIndex) {
  previousIndex = previousIndex || 0;
  gameCarousel.goToIndex(index);
  console.log(index);
  const videoElements = document.querySelectorAll('#hero-carousel video');
  const videoToStop = videoElements[previousIndex];
  const videoToPlay = videoElements[index];
  console.log('v2p', videoToPlay);
  console.log('v2s', videoToStop);
  if (videoToStop) {
    videoToStop.pause();
  }
  if (videoToPlay) {
    videoToPlay.currentTime = 0;
    videoToPlay.play();
  }
}

const gameCarousel = new Carousel('#game-carousel', {
  onChange: handleGameCarouselChange
});
const heroCarousel = new Carousel('#hero-carousel', {
  autoAdvance: 5 * 1000,
  onChange: handleHeroCarouselChange
});
