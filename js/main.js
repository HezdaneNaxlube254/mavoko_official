// ========================================
// 1. PAGE LOADER
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    const currentYear = document.getElementById('currentYear');
    if (currentYear) {
        currentYear.textContent = new Date().getFullYear();
    }

    const loader = document.getElementById('loader');
    const maxLoadTime = 2500; // 2.5 seconds max
    
    // Hide loader when page is fully loaded or after timeout
    function hideLoader() {
        loader.classList.add('hidden');
        // Enable scroll after loader hides
        document.body.style.overflow = '';
    }
    
    // Hide loader after timeout if not already hidden
    const timeoutId = setTimeout(hideLoader, maxLoadTime);
    
    // Hide loader when everything is loaded
    window.addEventListener('load', function() {
        clearTimeout(timeoutId);
        hideLoader();
    });
    
    // Initially disable scroll until loader hides
    document.body.style.overflow = 'hidden';
});

// ========================================
// 2. NAVIGATION
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    const header = document.querySelector('.site-header');
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const body = document.body;
    
    // Sticky shrink nav on scroll
    let lastScrollY = 0;
    
    window.addEventListener('scroll', function() {
        const scrollY = window.scrollY;
        
        // Add/remove scrolled class
        if (scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        lastScrollY = scrollY;
    }, { passive: true });
    
    // Mobile menu toggle
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            const isOpen = navMenu.classList.toggle('open');
            navToggle.setAttribute('aria-expanded', isOpen);
            
            // Prevent body scroll when menu is open
            if (isOpen) {
                body.style.overflow = 'hidden';
            } else {
                body.style.overflow = '';
            }
        });
        
        // Close menu on link click (mobile)
        navMenu.querySelectorAll('a').forEach(function(link) {
            link.addEventListener('click', function() {
                navMenu.classList.remove('open');
                navToggle.setAttribute('aria-expanded', 'false');
                body.style.overflow = '';
            });
        });
        
        // Close menu on outside click
        document.addEventListener('click', function(e) {
            if (!header.contains(e.target)) {
                navMenu.classList.remove('open');
                navToggle.setAttribute('aria-expanded', 'false');
                body.style.overflow = '';
            }
        });
    }
});

// ========================================
// 3. BACK TO TOP BUTTON
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    const backToTop = document.getElementById('backToTop');
    const hero = document.querySelector('#hero');
    
    if (backToTop && hero) {
        window.addEventListener('scroll', function() {
            const heroHeight = hero.offsetHeight;
            
            if (window.scrollY > heroHeight) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        }, { passive: true });
        
        backToTop.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
});

// ========================================
// 4. SCROLL PROGRESS BAR
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    const progressBar = document.getElementById('scrollProgress');
    
    if (progressBar) {
        window.addEventListener('scroll', function() {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = (scrollTop / docHeight) * 100;
            
            progressBar.style.width = scrollPercent + '%';
            progressBar.setAttribute('aria-valuenow', Math.round(scrollPercent));
        }, { passive: true });
    }
});

// ========================================
// 5. SMOOTH ANCHOR SCROLLING
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            
            if (targetId === '#') return;
            
            const target = document.querySelector(targetId);
            
            if (target) {
                e.preventDefault();
                
                const headerOffset = 80; // Height of sticky header
                const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerOffset;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
});
// ========================================
// 6. IMAGE PLACEHOLDER HANDLER
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    // Check if images exist and show/hide placeholders
    function checkImage(img, placeholder) {
        if (!img || !placeholder) return;
        
        // If image has a src and it's not empty
        if (img.src && img.src !== '') {
            // Create a temporary image to check if it loads
            const testImg = new Image();
            testImg.onload = function() {
                img.style.display = 'block';
                placeholder.style.display = 'none';
            };
            testImg.onerror = function() {
                img.style.display = 'none';
                placeholder.style.display = 'flex';
            };
            testImg.src = img.src;
        } else {
            img.style.display = 'none';
            placeholder.style.display = 'flex';
        }
    }
    
    // Hero image
    const heroImg = document.getElementById('heroImage');
    const heroPlaceholder = document.getElementById('heroPlaceholder');
    if (heroImg && heroPlaceholder) {
        checkImage(heroImg, heroPlaceholder);
    }
    
    // Facility images
    document.querySelectorAll('.facility-image').forEach(function(container) {
        const img = container.querySelector('img');
        const placeholder = container.querySelector('.image-placeholder');
        if (img && placeholder) {
            checkImage(img, placeholder);
        }
    });
    
    // Logo images
    document.querySelectorAll('.logo-wrapper, .footer-logo-wrapper, .loader-logo-container').forEach(function(container) {
        const img = container.querySelector('img');
        const placeholder = container.querySelector('.logo-placeholder, .footer-logo-placeholder, .loader-placeholder');
        if (img && placeholder) {
            // For logos, we check differently
            if (img.src && img.src !== '') {
                const testImg = new Image();
                testImg.onload = function() {
                    img.style.display = 'inline-block';
                    placeholder.style.display = 'none';
                };
                testImg.onerror = function() {
                    img.style.display = 'none';
                    placeholder.style.display = 'inline';
                };
                testImg.src = img.src;
            } else {
                img.style.display = 'none';
                placeholder.style.display = 'inline';
            }
        }
    });
});
// ========================================
// 6. WHATSAPP FLOATING BUTTON - SET PHONE NUMBER
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    const whatsappBtn = document.querySelector('.whatsapp-float');
    if (whatsappBtn) {
        // Replace XXXXXXXXX with actual phone number
        // Format: country code + number without + sign
        // Example: 254712345678
        const phoneNumber = '254XXXXXXXXX';
        whatsappBtn.href = `https://wa.me/${phoneNumber}`;
    }
});
// ========================================
// 7. NEWSLETTER FORM HANDLER
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    const newsletterForm = document.getElementById('newsletterForm');
    const messageDiv = document.getElementById('newsletterMessage');
    
    if (newsletterForm && messageDiv) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const emailInput = document.getElementById('newsletterEmail');
            const email = emailInput.value.trim();
            
            // Basic email validation
            if (!email || !email.includes('@') || !email.includes('.')) {
                messageDiv.textContent = 'Please enter a valid email address.';
                messageDiv.className = 'form-message error';
                return;
            }
            
            // Success message
            messageDiv.textContent = 'Thank you for subscribing! You will receive updates shortly.';
            messageDiv.className = 'form-message success';
            emailInput.value = '';
            
            // Clear message after 5 seconds
            setTimeout(function() {
                messageDiv.textContent = '';
                messageDiv.className = 'form-message';
            }, 5000);
        });
    }
});

// ========================================
// 8. TABS INTERACTION
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.tab-button').forEach(function(button) {
        button.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            const parent = this.closest('.tabs-card');

            if (!parent) return;

            parent.querySelectorAll('.tab-button').forEach(function(tab) {
                tab.classList.toggle('active', tab === button);
                tab.setAttribute('aria-selected', String(tab === button));
            });

            parent.querySelectorAll('.tab-panel').forEach(function(panel) {
                panel.classList.toggle('active', panel.id === tabName);
            });
        });
    });
});

// ========================================
// 9. NEWS FILTERS AND SEARCH
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    const newsSearch = document.querySelector('.news-search');
    const filterButtons = document.querySelectorAll('.news-filter-btn');
    const newsCards = document.querySelectorAll('.news-card-page');

    if (!newsSearch && filterButtons.length === 0 && newsCards.length === 0) return;

    function applyNewsFilters() {
        const query = (newsSearch ? newsSearch.value : '').toLowerCase();
        const activeFilter = document.querySelector('.news-filter-btn.active')?.getAttribute('data-filter') || 'all';

        newsCards.forEach(function(card) {
            const text = card.textContent.toLowerCase();
            const category = card.getAttribute('data-category') || '';
            const matchesQuery = text.includes(query);
            const matchesFilter = activeFilter === 'all' || category === activeFilter;
            card.style.display = matchesQuery && matchesFilter ? 'block' : 'none';
        });
    }

    if (newsSearch) {
        newsSearch.addEventListener('input', applyNewsFilters);
    }

    filterButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            filterButtons.forEach(function(btn) {
                btn.classList.toggle('active', btn === button);
            });
            applyNewsFilters();
        });
    });

    applyNewsFilters();
});

// ========================================
// 8. GALLERY IMAGE HANDLER
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    // Handle gallery images
    document.querySelectorAll('.gallery-item').forEach(function(item) {
        const img = item.querySelector('img');
        const placeholder = item.querySelector('.gallery-placeholder');
        
        if (img && placeholder) {
            // Check if image exists
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
// ========================================
// 8. GALLERY CAROUSEL
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.gallery-carousel').forEach(function(carousel) {
        const track = carousel.querySelector('.gallery-track');
        const slides = carousel.querySelectorAll('.gallery-slide');
        const dots = carousel.querySelectorAll('.gallery-dot');
        const prevBtn = carousel.querySelector('.gallery-prev');
        const nextBtn = carousel.querySelector('.gallery-next');
        
        if (!track || slides.length === 0) return;
        
        let currentIndex = 0;
        const totalSlides = slides.length;
        let autoPlayInterval = null;
        const AUTO_PLAY_DELAY = 4000; // 4 seconds
        
        // Check for reduced motion
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        // Function to update gallery positions
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
        
        function startAutoPlay() {
            if (prefersReducedMotion) return;
            if (autoPlayInterval) clearInterval(autoPlayInterval);
            autoPlayInterval = setInterval(nextSlide, AUTO_PLAY_DELAY);
        }
        
        function stopAutoPlay() {
            if (autoPlayInterval) {
                clearInterval(autoPlayInterval);
                autoPlayInterval = null;
            }
        }
        
        function resetAutoPlay() {
            stopAutoPlay();
            startAutoPlay();
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
        
        carousel.addEventListener('mouseenter', function() {
            stopAutoPlay();
        });
        
        carousel.addEventListener('mouseleave', function() {
            startAutoPlay();
        });
        
        carousel.addEventListener('touchstart', function() {
            stopAutoPlay();
        });
        
        carousel.addEventListener('touchend', function() {
            startAutoPlay();
        });
        
        updateGallery(0);
        
        if (!prefersReducedMotion) {
            startAutoPlay();
        }
        
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
});