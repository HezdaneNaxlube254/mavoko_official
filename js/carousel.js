// ========================================
// CAROUSEL SYSTEM - Supports both Hero & Gallery
// ========================================

// ========================================
// PART 1: HERO CAROUSEL (Homepage)
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    const heroCarousel = document.getElementById('heroCarousel');
    
    if (!heroCarousel) {
        // No hero carousel on this page, skip to gallery carousels
        initGalleryCarousels();
        return;
    }
    
    // --- HERO CAROUSEL SETUP ---
    const slides = heroCarousel.querySelectorAll('.carousel-slide');
    const bgSlides = document.querySelectorAll('.hero-bg-slide');
    const dots = document.querySelectorAll('.carousel-dot');
    const prevBtn = document.querySelector('.carousel-prev');
    const nextBtn = document.querySelector('.carousel-next');
    const pauseBtn = document.querySelector('.carousel-pause');
    
    let currentSlide = 0;
    let totalSlides = slides.length;
    let autoAdvance = true;
    let autoInterval = null;
    const AUTO_DELAY = 5000; // 5 seconds
    
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    function goToSlide(index) {
        slides.forEach(function(slide) {
            slide.classList.remove('active');
        });
        slides[index].classList.add('active');
        
        bgSlides.forEach(function(bgSlide) {
            bgSlide.classList.remove('active');
        });
        bgSlides[index].classList.add('active');
        
        dots.forEach(function(dot) {
            dot.classList.remove('active');
            dot.setAttribute('aria-selected', 'false');
        });
        dots[index].classList.add('active');
        dots[index].setAttribute('aria-selected', 'true');
        
        currentSlide = index;
    }
    
    function nextSlide() {
        const next = (currentSlide + 1) % totalSlides;
        goToSlide(next);
    }
    
    function prevSlide() {
        const prev = (currentSlide - 1 + totalSlides) % totalSlides;
        goToSlide(prev);
    }
    
    function startAutoAdvance() {
        if (autoInterval) {
            clearInterval(autoInterval);
        }
        autoInterval = setInterval(nextSlide, AUTO_DELAY);
        autoAdvance = true;
        if (pauseBtn) {
            pauseBtn.textContent = '⏸';
            pauseBtn.setAttribute('aria-label', 'Pause auto-rotation');
        }
    }
    
    function stopAutoAdvance() {
        if (autoInterval) {
            clearInterval(autoInterval);
            autoInterval = null;
        }
        autoAdvance = false;
        if (pauseBtn) {
            pauseBtn.textContent = '▶';
            pauseBtn.setAttribute('aria-label', 'Play auto-rotation');
        }
    }
    
    function pauseAutoAdvance() {
        if (autoInterval) {
            clearInterval(autoInterval);
            autoInterval = null;
        }
        if (pauseBtn) {
            pauseBtn.textContent = '▶';
            pauseBtn.setAttribute('aria-label', 'Play auto-rotation');
        }
    }
    
    function resumeAutoAdvance() {
        if (autoAdvance && !autoInterval) {
            autoInterval = setInterval(nextSlide, AUTO_DELAY);
            if (pauseBtn) {
                pauseBtn.textContent = '⏸';
                pauseBtn.setAttribute('aria-label', 'Pause auto-rotation');
            }
        }
    }
    
    function resetAutoAdvance() {
        if (autoAdvance) {
            stopAutoAdvance();
            startAutoAdvance();
        }
    }
    
    function toggleAutoAdvance() {
        if (autoAdvance) {
            stopAutoAdvance();
        } else {
            startAutoAdvance();
        }
    }
    
    // Initialize Hero Carousel
    if (prefersReducedMotion) {
        goToSlide(0);
        document.querySelectorAll('.carousel-controls, .carousel-dots, .carousel-pause').forEach(function(el) {
            el.style.display = 'none';
        });
    } else {
        goToSlide(0);
        startAutoAdvance();
        
        if (prevBtn) {
            prevBtn.addEventListener('click', function() {
                prevSlide();
                resetAutoAdvance();
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', function() {
                nextSlide();
                resetAutoAdvance();
            });
        }
        
        dots.forEach(function(dot, index) {
            dot.addEventListener('click', function() {
                goToSlide(index);
                resetAutoAdvance();
            });
        });
        
        if (pauseBtn) {
            pauseBtn.addEventListener('click', function() {
                toggleAutoAdvance();
            });
        }
        
        const carouselContainer = document.querySelector('.hero-carousel');
        if (carouselContainer) {
            carouselContainer.addEventListener('mouseenter', function() {
                if (autoAdvance) {
                    pauseAutoAdvance();
                }
            });
            
            carouselContainer.addEventListener('mouseleave', function() {
                if (autoAdvance) {
                    resumeAutoAdvance();
                }
            });
        }
        
        document.addEventListener('keydown', function(e) {
            if (e.key === 'ArrowLeft') {
                prevSlide();
                resetAutoAdvance();
            } else if (e.key === 'ArrowRight') {
                nextSlide();
                resetAutoAdvance();
            }
        });
    }
    
    // Hero image placeholders
    document.querySelectorAll('.hero-bg-slide').forEach(function(slide) {
        const img = slide.querySelector('.hero-image');
        const placeholder = slide.querySelector('.hero-placeholder');
        
        if (img && placeholder) {
            img.onerror = function() {
                this.style.display = 'none';
                placeholder.style.display = 'flex';
            };
            img.onload = function() {
                placeholder.style.display = 'none';
                this.style.display = 'block';
            };
            if (!img.complete) {
                // Still loading
            } else if (img.naturalWidth === 0) {
                img.onerror();
            } else {
                img.onload();
            }
        }
    });
    
    // ========================================
    // PART 2: GALLERY CAROUSELS (Student Life, etc.)
    // ========================================
    initGalleryCarousels();
});

// ========================================
// GALLERY CAROUSEL FUNCTION
// ========================================
function initGalleryCarousels() {
    const carousels = document.querySelectorAll('.gallery-carousel');
    
    carousels.forEach(function(carousel) {
        const track = carousel.querySelector('.gallery-track');
        const slides = track ? track.querySelectorAll('.gallery-slide') : [];
        const dots = carousel.querySelectorAll('.gallery-dot');
        const prevBtn = carousel.querySelector('.gallery-prev');
        const nextBtn = carousel.querySelector('.gallery-next');
        
        if (!track || slides.length === 0) return;
        
        // Check if auto-play is disabled via data attribute
        const autoDisabled = carousel.getAttribute('data-auto') === 'false';
        let currentIndex = 0;
        const totalSlides = slides.length;
        let autoAdvance = !autoDisabled;
        let autoInterval = null;
        const AUTO_PLAY_DELAY = 4000;
        
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        function updateGallery(index) {
            slides.forEach(function(slide) {
                slide.classList.remove('center', 'left', 'right', 'hidden-left', 'hidden-right');
            });
            
            const centerIndex = index;
            const leftIndex = (index - 1 + totalSlides) % totalSlides;
            const rightIndex = (index + 1) % totalSlides;
            const hiddenLeftIndex = (index - 2 + totalSlides) % totalSlides;
            const hiddenRightIndex = (index + 2) % totalSlides;
            
            slides[centerIndex].classList.add('center');
            slides[leftIndex].classList.add('left');
            slides[rightIndex].classList.add('right');
            slides[hiddenLeftIndex].classList.add('hidden-left');
            slides[hiddenRightIndex].classList.add('hidden-right');
            
            dots.forEach(function(dot, i) {
                dot.classList.toggle('active', i === index);
            });
            
            currentIndex = index;
        }
        
        function nextSlide() {
            const next = (currentIndex + 1) % totalSlides;
            updateGallery(next);
        }
        
        function prevSlide() {
            const prev = (currentIndex - 1 + totalSlides) % totalSlides;
            updateGallery(prev);
        }
        
        function goToSlide(index) {
            updateGallery(index);
            resetAutoPlay();
        }
        
        function startAutoAdvance() {
            if (autoInterval) {
                clearInterval(autoInterval);
            }
            autoInterval = setInterval(nextSlide, AUTO_PLAY_DELAY);
            autoAdvance = true;
        }
        
        function stopAutoAdvance() {
            if (autoInterval) {
                clearInterval(autoInterval);
                autoInterval = null;
            }
            autoAdvance = false;
        }
        
        function resetAutoPlay() {
            if (autoAdvance && !autoDisabled && !prefersReducedMotion) {
                stopAutoAdvance();
                startAutoAdvance();
            }
        }
        
        if (prevBtn) {
            prevBtn.addEventListener('click', function() {
                prevSlide();
                resetAutoPlay();
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', function() {
                nextSlide();
                resetAutoPlay();
            });
        }
        
        dots.forEach(function(dot, index) {
            dot.addEventListener('click', function() {
                goToSlide(index);
            });
        });
        
        document.addEventListener('keydown', function(e) {
            const rect = carousel.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
            if (!isVisible) return;
            
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                prevSlide();
                resetAutoPlay();
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                nextSlide();
                resetAutoPlay();
            }
        });
        
        if (!autoDisabled && !prefersReducedMotion) {
            carousel.addEventListener('mouseenter', function() {
                if (autoAdvance) {
                    stopAutoAdvance();
                }
            });
            
            carousel.addEventListener('mouseleave', function() {
                if (autoAdvance && !autoDisabled && !prefersReducedMotion) {
                    startAutoAdvance();
                }
            });
            
            carousel.addEventListener('touchstart', function() {
                if (autoAdvance) {
                    stopAutoAdvance();
                }
            });
            
            carousel.addEventListener('touchend', function() {
                if (autoAdvance && !autoDisabled && !prefersReducedMotion) {
                    startAutoAdvance();
                }
            });
        }
        
        updateGallery(0);
        
        if (!autoDisabled && !prefersReducedMotion) {
            startAutoAdvance();
        }
        
        // Gallery image placeholders
        slides.forEach(function(slide) {
            const img = slide.querySelector('img');
            const placeholder = slide.querySelector('.gallery-placeholder');
            
            if (img && placeholder) {
                const testImg = new Image();
                testImg.onload = function() {
                    img.style.display = 'block';
                    placeholder.style.display = 'none';
                };
                testImg.onerror = function() {
                    img.style.display = 'none';
                    placeholder.style.display = 'flex';
                };
                
                if (img.src && img.src !== '') {
                    testImg.src = img.src;
                } else {
                    img.style.display = 'none';
                    placeholder.style.display = 'flex';
                }
            }
        });
    });
}