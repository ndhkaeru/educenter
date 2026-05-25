(function ($) {
	'use strict';

	function applyBackgroundImages() {
		$('[data-background]').each(function () {
			$(this).css({
				'background-image': 'url(' + $(this).data('background') + ')'
			});
		});
	}

	function initHeroSlider() {
		if (!$('.hero-slider').length) {
			return;
		}
		if ($('.hero-slider').hasClass('slick-initialized')) {
			$('.hero-slider').slick('unslick');
		}
		$('.hero-slider').slick({
			autoplay: true,
			autoplaySpeed: 7500,
			pauseOnFocus: false,
			pauseOnHover: false,
			infinite: true,
			arrows: true,
			fade: true,
			prevArrow: '<button type=\'button\' class=\'prevArrow\'><i class=\'ti-angle-left\'></i></button>',
			nextArrow: '<button type=\'button\' class=\'nextArrow\'><i class=\'ti-angle-right\'></i></button>',
			dots: true
		});
		$('.hero-slider').slickAnimation();
	}

	function initVenobox() {
		if ($.fn.venobox) {
			$('.venobox').venobox();
		}
	}

	function initFilters() {
		var containerEl = document.querySelector('.filtr-container');
		if (containerEl) {
			$('.filtr-container').filterizr({});
		}
		$('.filter-controls li').on('click', function () {
			$('.filter-controls li').removeClass('active');
			$(this).addClass('active');
		});
	}

	function initNavbarDropdown() {
		$('.navigation .dropdown-toggle').off('click.navigationDropdown');
		if ($(window).width() < 992) {
			$('.navigation .dropdown-toggle').on('click.navigationDropdown', function (event) {
				event.preventDefault();
				event.stopPropagation();
				$(this).siblings('.dropdown-menu').stop(true, true).animate({
					height: 'toggle'
				}, 300);
			});
		}
	}
	function createQuickContactWidget() {
		var widget = document.getElementById('quick-contact-sticky');
		if (widget) {
			return widget;
		}

		widget = document.createElement('div');
		widget.id = 'quick-contact-sticky';
		widget.className = 'quick-contact-sticky';
		widget.innerHTML =
			'<div class="quick-contact-sticky__panel" aria-label="Liên hệ nhanh">' +
			'  <a class="quick-contact-sticky__link quick-contact-sticky__link--facebook" data-contact="facebook" href="#" aria-label="Facebook"><i class="ti-facebook"></i></a>' +
			'  <a class="quick-contact-sticky__link quick-contact-sticky__link--zalo" data-contact="zalo" href="#" aria-label="Zalo"><i class="icon-zalo"></i></a>' +
			'  <a class="quick-contact-sticky__link quick-contact-sticky__link--phone" data-contact="phone" href="#" aria-label="Gọi điện"><i class="ti-headphone-alt"></i></a>' +
			'</div>';

		document.body.appendChild(widget);

		return widget;
	}

	function syncQuickContactWidget() {
		var widget;
		var phoneHref;
		var zaloHref;
		var facebookHref;

		widget = createQuickContactWidget();

		phoneHref = $('.cms-hotline-link').first().attr('href') || '#';
		zaloHref = $('.cms-zalo-link').first().attr('href') || '#';
		facebookHref = $('.cms-facebook-link').first().attr('href') || '#';

		widget.querySelector('[data-contact="phone"]').setAttribute('href', phoneHref);
		widget.querySelector('[data-contact="zalo"]').setAttribute('href', zaloHref);
		widget.querySelector('[data-contact="facebook"]').setAttribute('href', facebookHref);
	}

	// Preloader js    
	$(window).on('load', function () {
		$('.preloader').fadeOut(700);
	});

	// Sticky Menu
	$(window).scroll(function () {
		var height = $('.top-header').innerHeight();
		if ($('header').offset().top > 10) {
			$('.top-header').addClass('hide');
			$('.navigation').addClass('nav-bg');
			$('.navigation').css('margin-top', '-' + height + 'px');
		} else {
			$('.top-header').removeClass('hide');
			$('.navigation').removeClass('nav-bg');
			$('.navigation').css('margin-top', '-' + 0 + 'px');
		}
	});
	// navbarDropdown
	initNavbarDropdown();

	// Background-images
	applyBackgroundImages();

	//Hero Slider
	initHeroSlider();
	syncQuickContactWidget();

	// venobox popup
	$(document).ready(function () {
		initVenobox();
	});

	// filter
	$(document).ready(function () {
		initFilters();
	});

	//  Count Up
	function counter() {
		var oTop;
		if ($('.count').length !== 0) {
			oTop = $('.count').offset().top - window.innerHeight;
		}
		if ($(window).scrollTop() > oTop) {
			$('.count').each(function () {
				var $this = $(this),
					countTo = $this.attr('data-count');
				$({
					countNum: $this.text()
				}).animate({
					countNum: countTo
				}, {
					duration: 1000,
					easing: 'swing',
					step: function () {
						$this.text(Math.floor(this.countNum));
					},
					complete: function () {
						$this.text(this.countNum);
					}
				});
			});
		}
	}
	$(window).on('scroll', function () {
		counter();
	});

	document.addEventListener('cms:rendered', function () {
		applyBackgroundImages();
		initHeroSlider();
		initVenobox();
		initFilters();
		initNavbarDropdown();
		syncQuickContactWidget();
	});

})(jQuery);

