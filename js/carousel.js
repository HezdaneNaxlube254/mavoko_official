// ========================================
// HERO CAROUSEL WITH BACKGROUND IMAGES
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    const carousel = document.getElementById('heroCarousel');
    
    if (!carousel) return;
    
    const slides = carousel.querySelectorAll('.carousel-slide');
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
    
    // Initialize carousel
    function initCarousel() {
        if (prefersReducedMotion) {
            // If reduced motion, show only the first slide
            goToSlide(0);
            // Hide controls
            document.querySelectorAll('.carousel-controls, .carousel-dots, .carousel-pause').forEach(function(el) {
                el.style.display = 'none';
            });
            return;
        }
        
        // Show first slide
        goToSlide(0);
        
        // Start auto-advance
        if (autoAdvance) {
            startAutoAdvance();
        }
        
        // Event listeners
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
        
        // Dot navigation
        dots.forEach(function(dot, index) {
            dot.addEventListener('click', function() {
                goToSlide(index);
                resetAutoAdvance();
            });
        });
        
        // Pause/Play toggle
        if (pauseBtn) {
            pauseBtn.addEventListener('click', function() {
                toggleAutoAdvance();
            });
        }
        
        // Pause on hover
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
        
        // Keyboard navigation
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
    
    // Go to specific slide
    function goToSlide(index) {
        // Update text slides
        slides.forEach(function(slide) {
            slide.classList.remove('active');
        });
        slides[index].classList.add('active');
        
        // Update background slides
        bgSlides.forEach(function(bgSlide) {
            bgSlide.classList.remove('active');
        });
        bgSlides[index].classList.add('active');
        
        // Update dots
        dots.forEach(function(dot) {
            dot.classList.remove('active');
            dot.setAttribute('aria-selected', 'false');
        });
        dots[index].classList.add('active');
        dots[index].setAttribute('aria-selected', 'true');
        
        currentSlide = index;
    }
    
    // Next slide
    function nextSlide() {
        const next = (currentSlide + 1) % totalSlides;
        goToSlide(next);
    }
    
    // Previous slide
    function prevSlide() {
        const prev = (currentSlide - 1 + totalSlides) % totalSlides;
        goToSlide(prev);
    }
    
    // Auto-advance functions
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
    
    // Initialize
    initCarousel();
    
    // Handle image placeholders
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
            // Check if image loaded
            if (!img.complete) {
                // Still loading
            } else if (img.naturalWidth === 0) {
                img.onerror();
            } else {
                img.onload();
            }
        }
    });
});