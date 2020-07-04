// Make Carousel available

function NO_OP () {}

function Carousel (carouselReference, options) {
  const $carousel = $(carouselReference);
  const $carouselItems = $('.carousel__items', $carousel);
  const $carouselItem = $('.carousel__item', $carousel);
  const $carouselPreviousButton = $('.carousel__previous__button', $carousel);
  const $carouselNextButton = $('.carousel__next__button', $carousel);
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

    // move elements accordingly
    const newOffset = getOffsetByIndex(index);
    $carouselItems.css('transform', `translate3d(${newOffset}px, 0, 0)`);

    // set current item
    $carouselItem.removeClass('carousel__item--current');
    $carouselItem.eq(index).addClass('carousel__item--current');

    // disable / enable prev/next buttons
    $carouselPreviousButton.prop('disabled', currentIndex === 0);
    $carouselNextButton.prop('disabled', currentIndex >= carouselItemsCount - 1);

    // set current page
    $carouselPage.removeClass('carousel__page--current');
    $carouselPage.eq(index).addClass('carousel__page--current');

    // early exit to prevent loops when linked
    if (currentIndex === index) { return; }

    // set the index store
    currentIndex = index;

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

  $carouselPreviousButton.on('click', function clickPrevious () {
    goToIndex(currentIndex - 1);
  });

  $carouselNextButton.on('click', function clickNext () {
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
console.log('go to index')
console.log($carouselPreviousButton)
  goToIndex(0);
}

// Set up mobile menu button
$('.site-header__menu-toggle').on('click', function toggleMenu () {
  $('.site').toggleClass('site--menu-active');
});

$('.site-header__menu-close').on('click', function closeMenu () {
  $('.site').removeClass('site--menu-active');
});