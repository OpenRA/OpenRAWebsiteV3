// This script requires jQuery

function NO_OP () {}

function Carousel (carouselReference, options) {
  const $carousel = $(carouselReference);
  const $carouselItems = $('.carousel__items', $carousel);
  const $carouselItem = $('.carousel__item', $carousel);
  const $carouselPrevious = $('.carousel__previous', $carousel);
  const $carouselNext = $('.carousel__next', $carousel);
  const $carouselPage = $('.carousel__page', $carousel);

  options = options || {};
  options.autoAdvance = options.autoAdvance || null;
  options.onChange = options.onChange || NO_OP;

  let currentIndex = 0;
  let timerId;
  const carouselItemsCount = $carouselItems.children().length;

  function getOffsetByIndex (index) {
    return $carouselItems.offset().left - $carouselItem.eq(index).offset().left;
  }

  function goToIndex (index) {
    // normalize index
    if (index >= carouselItemsCount) { index = carouselItemsCount - 1 }
    if (index < 0) { index = 0 }

    // reset the timer
    resetTimer();

    // early exit to prevent loops when linked
    if (currentIndex === index) { return; }

    // set the index store
    currentIndex = index;

    // move elements accordingly
    const newOffset = getOffsetByIndex(index);
    $carouselItems.css('transform', `translate3d(${newOffset}px, 0, 0)`);

    // set current item
    $carouselItem.removeClass('carousel__item--current');
    $carouselItem.eq(index).addClass('carousel__item--current');

    // disable / enable prev/next buttons
    $carouselPrevious.prop('disabled', currentIndex === 0);
    $carouselNext.prop('disabled', currentIndex >= carouselItemsCount - 1);

    // set current page
    $carouselPage.removeClass('carousel__page--current');
    $carouselPage.eq(index).addClass('carousel__page--current');

    // call the change handler
    options.onChange(index);
  }

  function goToNextIndexOrWrap () {
    let nextIndex = currentIndex + 1;
    if (nextIndex >= carouselItemsCount) {
      nextIndex = 0;
    }

    goToIndex(nextIndex);
  }

  function startTimer () {
    if (options.autoAdvance) {
      timerId = window.setInterval(goToNextIndexOrWrap, options.autoAdvance);
    }
  }

  function endTimer () {
    if (timerId) {
      window.clearInterval(timerId);
      timerId = null;
    }
  }

  function resetTimer () {
    endTimer();
    startTimer();
  }

  this.goToIndex = goToIndex;

  $carouselPrevious.on('click', function clickPrevious () {
    goToIndex(currentIndex - 1);
  });

  $carouselNext.on('click', function clickNext () {
    goToIndex(currentIndex + 1);
  });

  $carouselItem.on('click', function clickItem () {
    const itemIndex = $(this).index();
    goToIndex(itemIndex);
  });

  $carouselPage.on('click', function clickPage (event) {
    const pageIndex = $(this).index();
    goToIndex(pageIndex);
  });

  goToIndex(0);
}


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

// Set up mobile menu button
$('.site-header__menu-toggle').on('click', function toggleMenu () {
  $('.site').toggleClass('site--menu-active');
});

$('.site-header__menu-close').on('click', function closeMenu () {
  $('.site').removeClass('site--menu-active');
});
