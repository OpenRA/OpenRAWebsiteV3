// Set up mobile menu button
$('.site-header__menu-toggle').on('click', function toggleMenu () {
  $('.site').toggleClass('site--menu-active');
});

$('.site-header__menu-close').on('click', function closeMenu () {
  $('.site').removeClass('site--menu-active');
});