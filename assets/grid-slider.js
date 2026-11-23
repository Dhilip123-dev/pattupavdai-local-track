/*
* @Author: Alex Dong
* @Date:   2020-07-29 13:21:07
 * @Last Modified by: Alex Dong
 * @Last Modified time: 2022-07-30 17:56:37
*/

(function($) {
	"use strict";
    $.gridSlider = function(element, options) {
        var _ = this,
        	defaults = {
	            selector: '.grid-slider',
	            IntersectionObserver: true
	        },
            $element = $(element);
        _.settings = {};
        _.init = function() {
            _.settings = $.extend({}, defaults, options);
            _._initSlider();
        }
		_.uniqid = function (length) {
			length = length || 10;
            var result       	   = '',
            	characters 	   = 'abcdefghijklmnopqrstuvwxyz0123456789',
            	charactersLength = characters.length;
            for ( var i = 0; i < length; i++ ) {
            	result += characters.charAt(Math.floor(Math.random() * charactersLength));
           	}
           	return result;
		};
	    _._initSlider = function () {
	    	var settings = _.settings,
	        	useIntersectionObserver = settings.IntersectionObserver,
	        	$head = $('head'),
	        	elements = $element.find(settings.selector);
	        if(!elements.length) elements = $element;
	        elements.each(function() {
	            var element = $(this),
                    isRTL   = $('body').hasClass('rtl'),
	            	selector = 'grid-slider-' + _.uniqid();
	            var styleId  = selector;
	            element.addClass(selector);
	            selector = '.' + selector;
	            if(isRTL){
	                element.attr('dir', 'rtl');
	                element.data( 'rtl', true );
	            }
	            var azInit = element.find('> .slick-list > .slick-track');
	            if(azInit.length){
	            	azInit.children().addClass('alo-item');
	            }else{
	            	element.children().addClass('alo-item');
	            }
	            var iClass = '.alo-item';

	            var options = element.data(),
					rows 	= ((options || {}).rows === void 0) ? 1 : options.rows,
					classes	= rows ? selector + ' '+ iClass : selector + ' .slick-track > '+ iClass,
	            	padding = ((options || {}).padding === void 0) ? 0 : options.padding,
	            	style 	= classes + '{padding: 0 '+padding+'px; box-sizing: border-box} ' + selector + '{margin: 0 -'+padding+'px; }' + selector + '.grid-init{visibility: visible; opacity: 1;}';
              		style  += classes + '{float: left; min-height: 1px; min-width: 1px;}';
              		style  += '.rtl ' + classes + '{float: right; min-height: 1px; min-width: 1px;}';
	            if(style) $head.append('<style type="text/css" >'+style+'</style>');
	            style 		= '';

	            if (typeof options.responsive === 'string') {
	                try {
	                    options.responsive = JSON.parse(options.responsive);
	                } catch(e) {
	                    options.responsive = [];
	                }
	            }

	            var winW = window.innerWidth || $(window).width();
	            var activeCols = parseInt(options.visible) || parseInt(options.slidesToShow) || 5;
	            if (options.responsive && Array.isArray(options.responsive)) {
	                for (var r = 0; r < options.responsive.length; r++) {
	                    var item = options.responsive[r];
	                    if (item && item.breakpoint && item.settings && item.settings.slidesToShow) {
	                        if (winW < item.breakpoint) {
	                            activeCols = parseInt(item.settings.slidesToShow);
	                        }
	                    }
	                }
	            }
	            options.slidesToShow = activeCols;

	            if(options.slidesToShow){
					if ("IntersectionObserver" in window && useIntersectionObserver) {
						var nthChild = activeCols + 1;
						style += selector + ':not(.slick-initialized) .alo-item:nth-child(n+ ' + nthChild + '), ' + selector + ':not(.slick-initialized) .product-item:nth-child(n+ ' + nthChild + '){display: none;} ' + selector +  ':not(.slick-initialized) .alo-item, ' + selector + ':not(.slick-initialized) .product-item{float:left};';
						var gridSliderObserver = new IntersectionObserver(function(entries, observer) {
							entries.forEach(function(entry) {
								if (entry.isIntersecting) {
									var el  = entry.target;
									var $el = $(el);
									observer.unobserve(el);
									$el.one('init', function() {
										$head.find('#' + styleId).remove();
									});
									_.sliderRender($el);
									// Fallback removal if already initialized
									setTimeout(function() {
										$head.find('#' + styleId).remove();
									}, 100);
								}
							});
						}, { rootMargin: '800px 0px' });
						element.each(function(index, el){
                            var $el = $(el);
                            if($el.is(':visible')){
                                gridSliderObserver.observe(el);
                            }else {
                              _.sliderRender($el);
                            }
					    });
					} else {
						_.sliderRender(element);
					}
	            }
	            if(options.appendArrows || options.appendDots){
                  	var wrapper = options.wrapper ? element.find(options.wrapper) : element.parent();
                	if(options.appendArrows) element.data('append-Arrows', wrapper.find(options.appendArrows));
                  	if(options.appendDots) element.data('append-Dots', wrapper.find(options.appendDots));
	            }
	            var bpMap = {};
	            if (options.responsive && Array.isArray(options.responsive)) {
	                options.responsive.forEach(function(item) {
	                    if (item && item.breakpoint && item.settings && item.settings.slidesToShow) {
	                        bpMap[item.breakpoint] = parseInt(item.settings.slidesToShow);
	                    }
	                });
	            }

	            var visibleCol = parseInt(options.slidesToShow) || 5;
	            style += ' @media (min-width: 1920px) { ' + selector + '{margin: 0 -'+padding+'px} ' + classes + '{padding: 0 '+padding+'px; box-sizing: border-box; width: calc(100% / ' + visibleCol + '); float: left;} }';

	            var bpRanges = [
	                { min: 1480, max: 1919, bp: 1920 },
	                { min: 1200, max: 1479, bp: 1480 },
	                { min: 992,  max: 1199, bp: 1200 },
	                { min: 768,  max: 991,  bp: 992  },
	                { min: 576,  max: 767,  bp: 768  },
	                { min: 480,  max: 575,  bp: 576  },
	                { min: 360,  max: 479,  bp: 480  },
	                { min: 0,    max: 359,  bp: 360  }
	            ];

	            bpRanges.forEach(function(range) {
	                var col = bpMap[range.bp];
	                if (!col) return;
	                var mediaQuery = range.min === 0 
	                    ? '@media (max-width: ' + range.max + 'px)' 
	                    : '@media (min-width: ' + range.min + 'px) and (max-width: ' + range.max + 'px)';

	                var clearRtl = (rows != 1) ? classes + ':nth-child('+col+'n+1){clear: left}' : ' ';
	                clearRtl += (rows != 1) ? '.rtl ' + classes+':nth-child('+col+'n+1){clear: right}' : ' ';

	                style += ' ' + mediaQuery + ' { ' + selector + '{margin: 0 -'+padding+'px} ' + classes + '{padding: 0 '+padding+'px; box-sizing: border-box; width: calc(100% / ' + col + '); float: left;} ' + clearRtl + ' }';
	            });

	            $head.append('<style type="text/css" id="' + styleId + '" >'+style+'</style>');
	            element.addClass('grid-init');	
	        });
	        return this;
	    };
	    _.getPesponsive = function (options) {
	    	if(!options.responsive) return;
            if(!options.slidesToShow) return options.responsive.reverse();
			var responsive 	= options.responsive,
				length = Object.keys(responsive).length,
				gridResponsive = [];
			$.each( responsive, function( key, value ) { 
				var breakpoint = {};
				breakpoint[value.breakpoint] = parseInt(value.settings.slidesToShow);
				gridResponsive.push(breakpoint);
			 });
			return gridResponsive.reverse();
	    };
	    _.sliderRender = function (el) {
	    	if(el.hasClass('slick-initialized')){
	    		el.slick("refresh");
	    		return;
	    	}
	    	var options = el.data(),
				lazy    = el.find('img.lazyload');
	        if(lazy.length){
	            lazy.each(function(index) {
	                $(this).data('lazy', $(this).data('src'));
	            });
	        }
	        if (typeof options.responsive === 'string') {
	            try {
	                options.responsive = JSON.parse(options.responsive);
	            } catch(e) {
	                options.responsive = [];
	            }
	        }
	        var winW = window.innerWidth || $(window).width();
	        if (options.responsive && Array.isArray(options.responsive)) {
	            for (var r = 0; r < options.responsive.length; r++) {
	                var item = options.responsive[r];
	                if (item && item.breakpoint && item.settings && item.settings.slidesToShow) {
	                    if (winW < item.breakpoint) {
	                        options.slidesToShow = parseInt(item.settings.slidesToShow);
	                    }
	                }
	            }
	        }
	        el.on('init', function(event, slick){
	        	$('body').trigger('contentUpdated'); // support lazyload
	            var video = $(this).find('.external-video'),
                    slide     = slick.$slides.get(0);
	            video.on('click', function(e) {
	            	e.preventDefault();
	            	if($this.hasClass('embed')) return;
	                var $this = $(this), img = $this.find('img'), url = $(this).data('video');
	                url = url.replace("://vimeo.com/", "://player.vimeo.com/video/");
	                url = url.replace("://www.youtube.com/watch?v=", "://youtube.com/embed/");
	                url = url + '?autoplay=1&badge=0';
	                var iframe = '<iframe class="iframe-video" src="' + url + '" width="' + img.width() + '" height="' + img.height()  + '" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>'; 
	                $this.append(iframe).addClass('embed');
	                img.hide();
	            });
                _.playVideo(slide);
	        });
	        if(options.autoplay && (!options.autoplaySpeed || parseInt(options.autoplaySpeed) < 5500)){
	            options.autoplaySpeed = 6000;
	        }
	        var slider = el.slick(options);
	        el.on('beforeChange', function(event, slick, currentSlide, nextSlide){
  	            var video     = $(this).find('.external-video'),
                    nextSlide = slick.$slides.get(nextSlide);
	            video.removeClass('embed').find('img').show();
	            video.find('.iframe-video').remove();
                _.playVideo(nextSlide);
	        });
	        slider.on( "click", ".item", function() {
	            el.slick('slickSetOption', "autoplay",false,false);
	        });
	    };
        _.playVideo = function(slide){
              var $slide    = $(slide),
                  video     = $slide.find('video').not('.init'),
                  videoPlay = $slide.find('.video-play');
              if(video.length && videoPlay.length){
                  video.addClass('init');
                  video = video.get(0);
                  videoPlay.on('click', '.btn-play', function(){
                      if (video.paused) {
                        video.play();
                      } else {
                        video.pause();
                      }
                      videoPlay.toggleClass('pause');
                  });                  
              }
        }
        _.init();
    }
    $.fn.gridSlider = function(options) {
        return this.each(function() {
            if (undefined == $(this).data('gridSlider')) {
                var plugin = new $.gridSlider(this, options);
                $(this).data('gridSlider', plugin);
            }
        });
    }
    if(!localStorage.getItem("touch") && window.matchMedia('(max-width: 768px)').matches && window.matchMedia("(pointer: coarse)").matches) {
        document.addEventListener("DOMContentLoaded", function() {
          document.body.addEventListener("touchstart", (event) => {
              if(document.body.classList.contains('touch')) return;
              localStorage.setItem("touch", true);
              document.body.classList.add('touch');
              $(".grid-slider").not('grid-slider, .exception').each(function() {
                  $(this).gridSlider();
              });             
          });  
        }); 
    }else{
        var initDesktopSliders = function() {
            $(".grid-slider").not('grid-slider, .exception, .slick-initialized').each(function() {
                $(this).gridSlider();
            });
        };
        if (document.readyState === "complete" || document.readyState === "interactive") {
            initDesktopSliders();
        } else {
            document.addEventListener("DOMContentLoaded", initDesktopSliders);
        }
    }
    $(document).on('contentUpdated', function (event) {
		$(".grid-slider").not('grid-slider, .exception, .grid-init, .slick-initialized').each(function() {
			$(this).gridSlider();
		});
    });
    $(document).on('Alothemes:SwitchRTL:reload', function (event) {
		$(".grid-slider").not('.exception').each(function() {
            if($('body').hasClass('rtl')){
              	$(this).attr('dir', 'rtl').data('rtl', true);
            }else {
              	$(this).attr('dir', 'ltr').data('rtl', false);            
            }
          	if($(this).hasClass('slick-initialized')){
          		$(this).slick("unslick").slick($(this).data());
          	}
		});
    });

	if (!customElements.get('grid-slider')) {
		class GridSlider extends HTMLElement {
			constructor() {
				super();
				var $this = this;
				document.addEventListener("GridSliderUpdated", function (event) {
					$this.initialized();
				});
			}

			connectedCallback() {
                if(this.slick){
                  $(this).slick("refresh")
                }else{
                  if(!this.classList.contains('ajax')) this.initialized();
                }
			}
		    initialized() {
		    	$(this).not('.exception, .grid-init, .slick-initialized').each(function() {
					$(this).gridSlider();
				});
		    }
		}
		customElements.define("grid-slider", GridSlider);
  	}
})(window.$$ || jQuery);
