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
	if ($(window).width() < 992) {
		$('.navigation .dropdown-toggle').on('click', function () {
			$(this).siblings('.dropdown-menu').animate({
				height: 'toggle'
			}, 300);
		});
	}

	// Background-images
	applyBackgroundImages();

	//Hero Slider
	initHeroSlider();

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
	});

})(jQuery);
