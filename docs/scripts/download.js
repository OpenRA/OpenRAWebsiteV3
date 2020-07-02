const instructionsCarousel = new Carousel('#instructions-carousel', {
});

console.log('instructionsCarousel', instructionsCarousel);

const osOrder = ['windows', 'osx', 'linux', 'free-bsd', 'source'];

$('input[name="operating-system"]').on('change', function (event, other) {
  instructionsCarousel.goToIndex(osOrder.indexOf(event.target.value));
});