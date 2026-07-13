// ========================================
// 1. SCROLL REVEAL ANIMATIONS
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
        // If reduced motion, make all elements visible immediately
        document.querySelectorAll('.reveal, .reveal-stagger, .image-reveal').forEach(function(el) {
            el.classList.add('is-visible');
        });
        return;
    }
    
    // Intersection Observer for scroll reveal
    const revealObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                // Once revealed, stop observing
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px' // Trigger slightly before element enters viewport
    });
    
    // Observe all reveal elements
    document.querySelectorAll('.reveal, .reveal-stagger, .image-reveal').forEach(function(el) {
        revealObserver.observe(el);
    });
    
    // Also observe individual grid items with data-delay
    document.querySelectorAll('[data-delay]').forEach(function(el) {
        // Add reveal class if parent doesn't have stagger
        if (!el.closest('.reveal-stagger')) {
            el.classList.add('reveal');
            revealObserver.observe(el);
        }
    });
    
    // If elements with data-delay are inside a stagger container, they'll be handled by the parent
    // If they're standalone, they need to be observed
    document.querySelectorAll('[data-delay]').forEach(function(el) {
        const parent = el.parentElement;
        if (!parent.classList.contains('reveal-stagger')) {
            el.classList.add('reveal');
            revealObserver.observe(el);
        }
    });
});

// ========================================
// 2. ANIMATED COUNTERS
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    const counterElements = document.querySelectorAll('.stat-number');
    
    if (counterElements.length === 0) return;
    
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
        // If reduced motion, just show the final numbers
        counterElements.forEach(function(el) {
            const target = parseInt(el.getAttribute('data-count'), 10);
            if (!isNaN(target)) {
                el.textContent = target;
            }
        });
        return;
    }
    
    let countersStarted = false;
    
    // Intersection Observer for counters
    const counterObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting && !countersStarted) {
                countersStarted = true;
                startCounters();
                counterObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.3
    });
    
    // Observe the first counter element or its container
    const firstCounter = counterElements[0];
    if (firstCounter) {
        const container = firstCounter.closest('.stats-grid') || firstCounter.parentElement;
        counterObserver.observe(container);
    }
    
    function startCounters() {
        counterElements.forEach(function(el) {
            const target = parseInt(el.getAttribute('data-count'), 10);
            if (isNaN(target)) return;
            
            const duration = 2000; // 2 seconds
            const startTime = performance.now();
            const startValue = 0;
            
            function updateCounter(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Ease out cubic
                const eased = 1 - Math.pow(1 - progress, 3);
                const current = Math.floor(eased * target);
                
                el.textContent = current;
                
                if (progress < 1) {
                    requestAnimationFrame(updateCounter);
                } else {
                    el.textContent = target;
                }
            }
            
            requestAnimationFrame(updateCounter);
        });
    }
});