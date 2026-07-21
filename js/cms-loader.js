/**
 * Mavoko Boys School - CMS Data Loader
 * Fetches content from YML files and injects into HTML pages
 */

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Fetch and parse a YAML file
async function fetchCMSData(filePath) {
    try {
        const response = await fetch(filePath);
        if (!response.ok) throw new Error(`Failed to load ${filePath}`);
        const yamlText = await response.text();
        return jsyaml.load(yamlText);
    } catch (error) {
        console.warn(`CMS: Could not load ${filePath}, using hardcoded fallback`, error);
        return null;
    }
}

// Safe set text content
function setText(selector, text, fallback) {
    const el = document.querySelector(selector);
    if (!el) return;
    if (text !== undefined && text !== null && text !== '') {
        el.textContent = text;
    } else if (fallback) {
        el.textContent = fallback;
    }
}

// Safe set HTML content
function setHTML(selector, html, fallback) {
    const el = document.querySelector(selector);
    if (!el) return;
    if (html !== undefined && html !== null && html !== '') {
        el.innerHTML = html;
    } else if (fallback) {
        el.innerHTML = fallback;
    }
}

// Safe set image src
function setImageSrc(selector, src, fallback) {
    const el = document.querySelector(selector);
    if (!el) return;
    if (src && src !== '') {
        el.src = src;
        el.style.display = 'block';
        // Hide placeholder if exists
        const placeholder = el.parentElement?.querySelector('.image-placeholder, .sub-hero-placeholder, .gallery-placeholder');
        if (placeholder) placeholder.style.display = 'none';
    } else if (fallback) {
        el.src = fallback;
    }
}

// Set multiple elements by selector
function setAllText(selector, text) {
    document.querySelectorAll(selector).forEach(el => {
        if (text !== undefined && text !== null && text !== '') {
            el.textContent = text;
        }
    });
}

// Convert markdown to HTML (simple version)
function simpleMarkdownToHTML(md) {
    if (!md) return '';
    return md
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n- /g, '\n<li>')
        .replace(/^/, '<p>')
        .replace(/$/, '</p>')
        .replace(/<p><\/p>/g, '');
}

// ============================================
// GLOBAL SETTINGS (Shared across all pages)
// ============================================

async function loadGlobalSettings() {
    const settings = await fetchCMSData('/content/settings.yml');
    if (!settings) return;

    // Site title in header
    setAllText('.site-title', settings.short_name);
    
    // Footer content
    setAllText('.footer-brand h2', settings.school_name);
    setAllText('.footer-brand p:first-of-type', settings.location);
    
    // Contact info in footer
    const phoneLinks = document.querySelectorAll('.footer-contact a[href^="tel:"]');
    phoneLinks.forEach(link => {
        link.href = `tel:${settings.whatsapp}`;
        link.textContent = settings.phone;
    });
    
    const emailLinks = document.querySelectorAll('.footer-contact a[href^="mailto:"]');
    emailLinks.forEach(link => {
        link.href = `mailto:${settings.email}`;
        link.textContent = settings.display_email;
    });
    
    // Social media links
    const socialLinks = document.querySelectorAll('.social-links a');
    if (socialLinks.length >= 5) {
        socialLinks[0].href = settings.facebook_url || '#';
        socialLinks[1].href = settings.twitter_url || '#';
        socialLinks[2].href = settings.instagram_url || '#';
        socialLinks[3].href = settings.youtube_url || '#';
        socialLinks[4].href = settings.linkedin_url || '#';
    }
    
    // WhatsApp floating button
    const whatsappBtn = document.querySelector('.whatsapp-float');
    if (whatsappBtn) {
        whatsappBtn.href = `https://wa.me/${settings.whatsapp}`;
    }
    
    // Logo images
    setImageSrc('.site-logo', settings.logo);
    setImageSrc('.footer-logo', settings.logo);
    
    // Favicon
    const favicon = document.querySelector('link[rel="icon"]');
    if (favicon && settings.favicon) {
        favicon.href = settings.favicon;
    }
    
    // Page meta
    document.title = `${settings.school_name} | Athi River, Machakos — ${settings.motto}`;
    
    return settings;
}

// ============================================
// HOMEPAGE LOADER
// ============================================

async function loadHomepage() {
    const settings = await fetchCMSData('/content/settings.yml');
    const homepage = await fetchCMSData('/content/homepage.yml');
    const testimonials = await fetchCMSData('/content/testimonials.yml');
    
    if (!settings) return;
    
    // Hero Carousel
    if (settings.hero_images && settings.hero_images.length > 0) {
        const carouselSlides = document.getElementById('heroCarousel');
        const bgContainer = document.querySelector('.hero-backgrounds');
        
        if (carouselSlides) {
            carouselSlides.innerHTML = settings.hero_images.map((slide, i) => `
                <div class="carousel-slide ${i === 0 ? 'active' : ''}" data-slide="${i}">
                    <span class="carousel-eyebrow">${slide.caption || ''}</span>
                    <h2 class="carousel-statement">${slide.caption_text || ''}</h2>
                </div>
            `).join('');
        }
        
        if (bgContainer) {
            bgContainer.innerHTML = settings.hero_images.map((slide, i) => `
                <div class="hero-bg-slide ${i === 0 ? 'active' : ''}" data-slide="${i}">
                    <img src="${slide.image}" alt="${slide.alt_text || ''}" class="hero-image" />
                </div>
            `).join('');
        }
    }
    
    // Motto/Vision/Mission Cards
    setText('.vmm-card:nth-child(1) p', settings.motto_quote);
    setText('.vmm-card:nth-child(2) p', settings.vision);
    setText('.vmm-card:nth-child(3) p', settings.mission);
    
    // Stats
    if (homepage && homepage.stats) {
        const stats = homepage.stats;
        const statNumbers = document.querySelectorAll('.stat-number');
        if (statNumbers.length >= 6) {
            statNumbers[0].setAttribute('data-count', stats.established);
            statNumbers[1].setAttribute('data-count', stats.students);
            statNumbers[2].setAttribute('data-count', stats.staff);
            statNumbers[3].setAttribute('data-count', stats.ratio);
            statNumbers[4].setAttribute('data-count', stats.classrooms);
            statNumbers[5].setAttribute('data-count', stats.laboratories);
        }
    }
    
    // Homepage Facilities
    if (homepage && homepage.home_facilities) {
        const facilityCards = document.querySelectorAll('.facilities-preview .facility-card');
        homepage.home_facilities.forEach((facility, i) => {
            if (facilityCards[i]) {
                const img = facilityCards[i].querySelector('img');
                const h3 = facilityCards[i].querySelector('h3');
                const p = facilityCards[i].querySelector('p');
                if (img) setImageSrc(null, facility.image); // handled differently
                if (img) img.src = facility.image;
                if (h3) h3.textContent = facility.name;
                if (p) p.textContent = facility.description;
            }
        });
    }
    
    // Achievements
    if (homepage && homepage.achievements) {
        const achievementCards = document.querySelectorAll('.achievement-card');
        homepage.achievements.forEach((achievement, i) => {
            if (achievementCards[i]) {
                const icon = achievementCards[i].querySelector('.achievement-icon i');
                const h3 = achievementCards[i].querySelector('h3');
                const p = achievementCards[i].querySelector('p');
                if (icon) icon.className = `fas ${achievement.icon}`;
                if (h3) h3.textContent = achievement.title;
                if (p) p.textContent = achievement.description;
            }
        });
    }
    
    // Gallery
    if (homepage && homepage.gallery) {
        const galleryTrack = document.querySelector('#galleryCarousel .gallery-track');
        if (galleryTrack) {
            galleryTrack.innerHTML = homepage.gallery.map((item, i) => `
                <div class="gallery-slide ${i === 0 ? 'center' : i === 1 ? 'left' : i === 2 ? 'right' : ''}" data-index="${i}">
                    <img src="${item.image}" alt="${item.label}" loading="lazy" />
                    <div class="gallery-slide-label">${item.label}</div>
                </div>
            `).join('');
        }
    }
    
    // Testimonials
    if (testimonials && testimonials.items) {
        const testimonialCards = document.querySelectorAll('.testimonial-card');
        testimonials.items.forEach((item, i) => {
            if (testimonialCards[i]) {
                const text = testimonialCards[i].querySelector('.testimonial-text');
                const name = testimonialCards[i].querySelector('.testimonial-info h4');
                const role = testimonialCards[i].querySelector('.testimonial-info span');
                if (text) text.textContent = item.quote;
                if (name) name.textContent = item.name;
                if (role) role.textContent = item.role;
            }
        });
    }
    
    // CTA Banner
    if (homepage) {
        setText('.cta-banner .cta-content h2', homepage.cta_heading);
        setText('.cta-banner .cta-content p', homepage.cta_text);
    }
}

// ============================================
// ABOUT PAGE LOADER
// ============================================

async function loadAboutPage() {
    const about = await fetchCMSData('/content/about.yml');
    if (!about) return;
    
    // Hero
    setImageSrc('.sub-hero-image', about.hero_image);
    setText('.sub-hero-subtitle', about.hero_subtitle);
    
    // Story
    setHTML('#story-title + .page-content-card', about.story ? about.story.replace(/\n\n/g, '</p><p>').replace(/^/, '<p>').replace(/$/, '</p>') : null);
    
    // Quick Facts
    const quickFactsCard = document.querySelector('.quick-facts-card');
    if (quickFactsCard && about.quick_facts) {
        const h3 = quickFactsCard.querySelector('h3');
        const existingContent = quickFactsCard.innerHTML;
        quickFactsCard.innerHTML = `<h3>Quick Facts</h3>${simpleMarkdownToHTML(about.quick_facts)}`;
    }
    
    // Core Values
    if (about.core_values && about.core_values.length > 0) {
        const valuesGrid = document.querySelector('#values-title + .container .values-grid');
        if (valuesGrid) {
            valuesGrid.innerHTML = about.core_values.map(value => 
                `<span class="value-tag">${value}</span>`
            ).join('');
        }
    }
    
    // Accreditation
    setText('.accreditation-card h3', 'Registered');
    setText('.accreditation-card p:nth-of-type(1)', about.accreditation);
    setText('.accreditation-card p:nth-of-type(2) strong', 'Established:');
    
    // Stats
    const statNumbers = document.querySelectorAll('.stats-section .stat-number');
    if (statNumbers.length >= 4) {
        const settings = await fetchCMSData('/content/settings.yml');
        if (settings) {
            statNumbers[0].setAttribute('data-count', settings.student_count);
            statNumbers[1].setAttribute('data-count', settings.staff_count);
            statNumbers[2].setAttribute('data-count', settings.established);
            statNumbers[3].setAttribute('data-count', settings.classroom_count);
        }
    }
}

// ============================================
// LEADERSHIP PAGE LOADER
// ============================================

async function loadLeadershipPage() {
    const leadership = await fetchCMSData('/content/leadership.yml');
    if (!leadership) return;
    
    // Hero
    setImageSrc('.sub-hero-image', leadership.hero_image);
    setText('.sub-hero-subtitle', leadership.hero_subtitle);
    
    // Principal
    if (leadership.principal) {
        const p = leadership.principal;
        setText('.principal-card .profile-content h3', p.name);
        setText('.principal-card .profile-content p strong', p.title);
        setImageSrc('.principal-card .profile-image', p.photo);
        setHTML('#principalBio', simpleMarkdownToHTML(p.bio));
        setText('.principal-quote', p.quote);
        setText('.quote-attribution', `${p.name}, ${p.title}`);
    }
    
    // Deputy Principals
    if (leadership.deputies && leadership.deputies.length >= 2) {
        const deputyCards = document.querySelectorAll('.deputy-card');
        leadership.deputies.forEach((deputy, i) => {
            if (deputyCards[i]) {
                setText(deputyCards[i].querySelector('h3'), deputy.name);
                setText(deputyCards[i].querySelector('p strong'), deputy.title);
                setImageSrc(deputyCards[i].querySelector('.profile-image'), deputy.photo);
                const bioDiv = deputyCards[i].querySelector('.collapse-content');
                if (bioDiv) bioDiv.innerHTML = simpleMarkdownToHTML(deputy.bio);
            }
        });
    }
    
    // BOM Chair
    if (leadership.bom_chair) {
        const bom = leadership.bom_chair;
        const bomCard = document.querySelector('#bom-title + .container .profile-card');
        if (bomCard) {
            setText(bomCard.querySelector('h3'), bom.name);
            setText(bomCard.querySelector('p strong'), bom.title);
            setImageSrc(bomCard.querySelector('.profile-image'), bom.photo);
            setHTML('#bomBio', simpleMarkdownToHTML(bom.message));
        }
    }
    
    // PA Status
    setText('.pending-card p', leadership.pa_status);
    
    // HODs
    if (leadership.hods && leadership.hods.length > 0) {
        const hodGrid = document.querySelector('.hod-grid');
        if (hodGrid) {
            hodGrid.innerHTML = leadership.hods.map(hod => `
                <article class="hod-card">
                    <i class="fas ${hod.icon} hod-icon"></i>
                    <h4>${hod.department}</h4>
                    <p class="hod-comment">${hod.description}</p>
                </article>
            `).join('');
        }
    }
}

// ============================================
// ACADEMICS PAGE LOADER
// ============================================

async function loadAcademicsPage() {
    const academics = await fetchCMSData('/content/academics.yml');
    if (!academics) return;
    
    // Hero
    setImageSrc('.sub-hero-image', academics.hero_image);
    setText('.sub-hero-subtitle', academics.hero_subtitle);
    
    // Curriculum Overview
    const overviewCard = document.querySelector('#curriculum-title + .container .page-content-card');
    if (overviewCard && academics.curriculum_overview) {
        overviewCard.innerHTML = simpleMarkdownToHTML(academics.curriculum_overview);
    }
    
    // Subjects
    if (academics.subjects && academics.subjects.length > 0) {
        const subjectCards = document.querySelectorAll('#subjects-title + .container .info-card');
        academics.subjects.forEach((subject, i) => {
            if (subjectCards[i]) {
                setText(subjectCards[i].querySelector('h3'), subject.name);
                setText(subjectCards[i].querySelector('p'), subject.description);
            }
        });
    }
    
    // Calendar
    const calendarCard = document.querySelector('#calendar-title + .container .page-content-card ul');
    if (calendarCard && academics.calendar) {
        calendarCard.innerHTML = simpleMarkdownToHTML(academics.calendar);
    }
    
    // Facilities Text
    const ratioCard = document.querySelector('.ratio-card div');
    if (ratioCard && academics.facilities_text) {
        ratioCard.innerHTML = simpleMarkdownToHTML(academics.facilities_text);
    }
    
    // Achievements
    const achievementsCard = document.querySelector('#achievements-title + .container .page-content-card');
    if (achievementsCard && academics.achievements) {
        achievementsCard.innerHTML = simpleMarkdownToHTML(academics.achievements);
    }
    
    // Support Programs
    if (academics.support_programs && academics.support_programs.length > 0) {
        const supportCards = document.querySelectorAll('#support-title + .container .info-card');
        academics.support_programs.forEach((program, i) => {
            if (supportCards[i]) {
                setText(supportCards[i].querySelector('h3'), program.name);
                setText(supportCards[i].querySelector('p'), program.description);
            }
        });
    }
}

// ============================================
// FACILITIES PAGE LOADER
// ============================================

async function loadFacilitiesPage() {
    const facilities = await fetchCMSData('/content/facilities.yml');
    if (!facilities) return;
    
    // Hero
    setImageSrc('.sub-hero-image', facilities.hero_image);
    setText('.sub-hero-subtitle', facilities.hero_subtitle);
    
    // Facilities List
    if (facilities.facilities_list && facilities.facilities_list.length > 0) {
        const grid = document.querySelector('.facility-list-grid');
        if (grid) {
            grid.innerHTML = facilities.facilities_list.map(facility => `
                <article class="facility-card-page">
                    <div class="facility-image-wrap">
                        <img src="${facility.image}" alt="${facility.name}" class="facility-page-image" />
                        <div class="image-placeholder">
                            <span>📁 ${facility.image.split('/').pop()}</span>
                            <small>/images/facilities/</small>
                        </div>
                    </div>
                    <h3>${facility.name}</h3>
                    <p class="facility-comment">${facility.description}</p>
                </article>
            `).join('');
        }
    }
}

// ============================================
// ADMISSIONS PAGE LOADER
// ============================================

async function loadAdmissionsPage() {
    const admissions = await fetchCMSData('/content/admissions.yml');
    if (!admissions) return;
    
    // Hero
    setImageSrc('.sub-hero-image', admissions.hero_image);
    setText('.sub-hero-subtitle', admissions.hero_subtitle);
    
    // Period
    setText('#period-title + .container .page-content-card p', admissions.period);
    
    // Requirements Tab
    setHTML('#requirements', simpleMarkdownToHTML(admissions.requirements));
    
    // Documents Tab
    const docList = document.querySelector('#documents .check-list');
    if (docList && admissions.documents) {
        docList.innerHTML = admissions.documents.map(doc => 
            `<li><i class="fas fa-check"></i> ${doc}</li>`
        ).join('');
    }
    
    // Fees Tab
    setHTML('#fees', simpleMarkdownToHTML(admissions.fees_tab));
    
    // Checklist
    const checklistOl = document.querySelector('#checklist-title + .container .info-list');
    if (checklistOl && admissions.checklist) {
        checklistOl.innerHTML = admissions.checklist.map((step, i) => 
            `<li>${step}</li>`
        ).join('');
    }
    
    // Contact
    setText('#contact-admissions-title + .container p:nth-of-type(2) strong', 'Phone:');
    setText('#contact-admissions-title + .container p:nth-of-type(2)', `Phone: ${admissions.admissions_phone}`);
    setText('#contact-admissions-title + .container p:nth-of-type(3)', `Email: ${admissions.admissions_email}`);
}

// ============================================
// FEES PAGE LOADER
// ============================================

async function loadFeesPage() {
    const fees = await fetchCMSData('/content/fees.yml');
    if (!fees) return;
    
    // Hero
    setImageSrc('.sub-hero-image', fees.hero_image);
    setText('.sub-hero-subtitle', fees.hero_subtitle);
    
    // Day Scholars & Boarders
    const feeCards = document.querySelectorAll('#fees-structure-title + .container .info-card');
    if (feeCards[0]) setText(feeCards[0].querySelector('p'), fees.day_scholars);
    if (feeCards[1]) setText(feeCards[1].querySelector('p'), fees.boarders);
    
    // Payment Method
    setText('#payment-method-title + .container .page-content-card p:nth-of-type(2)', fees.payment_method);
    
    // Bank Details
    const bankList = document.querySelector('#bank-details-title + .container .info-list');
    if (bankList) {
        bankList.innerHTML = `<li>${fees.bank_details}</li>`;
    }
    
    // Payment Instructions
    const instructionsOl = document.querySelector('#instructions-title + .container .info-list');
    if (instructionsOl && fees.payment_instructions) {
        instructionsOl.innerHTML = fees.payment_instructions.map(step => 
            `<li>${step}</li>`
        ).join('');
    }
    
    // Important Notes
    const notesList = document.querySelector('#notes-title + .container .info-list');
    if (notesList && fees.important_notes) {
        notesList.innerHTML = fees.important_notes.map(note => 
            `<li>${note}</li>`
        ).join('');
    }
}

// ============================================
// CONTACT PAGE LOADER
// ============================================

async function loadContactPage() {
    const contact = await fetchCMSData('/content/contact.yml');
    const settings = await fetchCMSData('/content/settings.yml');
    if (!contact) return;
    
    // Hero
    setImageSrc('.sub-hero-image', contact.hero_image);
    setText('.sub-hero-subtitle', contact.hero_subtitle);
    
    // Contact info cards
    const infoCards = document.querySelectorAll('#contact-info-title + .container .info-card');
    if (infoCards[0]) setText(infoCards[0].querySelector('p'), contact.physical_address);
    if (infoCards[1] && settings) setText(infoCards[1].querySelector('p'), settings.postal_address);
    if (infoCards[2]) setText(infoCards[2].querySelector('p'), contact.town_county);
    if (infoCards[3] && settings) setText(infoCards[3].querySelector('p'), settings.email);
    if (infoCards[4] && settings) setText(infoCards[4].querySelector('p'), settings.phone);
    
    // Map
    const mapIframe = document.querySelector('.map-card iframe');
    if (mapIframe && contact.map_embed) {
        mapIframe.src = contact.map_embed;
    }
    
    // Office Hours
    const hoursList = document.querySelector('.map-card .info-list');
    if (hoursList && contact.office_hours) {
        hoursList.innerHTML = contact.office_hours.map(hour => 
            `<li>${hour}</li>`
        ).join('');
    }
}

// ============================================
// STUDENT LIFE PAGE LOADER
// ============================================

async function loadStudentLifePage() {
    const studentLife = await fetchCMSData('/content/student-life.yml');
    if (!studentLife) return;
    
    // Hero
    setImageSrc('.site-logo', settings.header_logo);
    setImageSrc('.footer-logo', settings.footer_logo);
    
    // Houses gallery
    if (studentLife.houses && studentLife.houses.length > 0) {
        const galleryTrack = document.querySelector('#houses-title + .container .gallery-track');
        if (galleryTrack) {
            galleryTrack.innerHTML = studentLife.houses.map((house, i) => `
                <div class="gallery-slide ${i === 0 ? 'center' : i === 1 ? 'left' : i === 2 ? 'right' : ''}" data-index="${i}">
                    <img src="${house.image}" alt="${house.name}" loading="lazy" />
                    <div class="gallery-slide-label">${house.name}</div>
                </div>
            `).join('');
        }
    }
}

// ============================================
// NEWS PAGE LOADER
// ============================================

async function loadNewsPage() {
    // Fetch all news articles from the news folder
    try {
        // Since we can't list directory contents with static JS,
        // we'll load individual news files if they exist
        const newsGrid = document.querySelector('.news-grid-page');
        if (!newsGrid) return;
        
        // Try to load known news files
        const newsFiles = [];
        // This is a simplified approach - in production, you'd use
        // Netlify Functions or a build step to list all news files
        
        if (newsFiles.length === 0) {
            // Keep the "coming soon" placeholders
            return;
        }
        
        // If we have news, populate the grid
        // (This will be more useful once news articles are created via CMS)
    } catch (error) {
        console.warn('CMS: Could not load news articles', error);
    }
}

// ============================================
// PAGE DETECTOR - Figures out which page we're on
// ============================================

function getCurrentPage() {
    const path = window.location.pathname;
    
    if (path.endsWith('index.html') || path === '/' || path.endsWith('/')) return 'home';
    if (path.includes('about')) return 'about';
    if (path.includes('leadership')) return 'leadership';
    if (path.includes('academics')) return 'academics';
    if (path.includes('facilities')) return 'facilities';
    if (path.includes('admissions')) return 'admissions';
    if (path.includes('fees')) return 'fees';
    if (path.includes('contact')) return 'contact';
    if (path.includes('student-life')) return 'student-life';
    if (path.includes('news')) return 'news';
    
    return 'unknown';
}

// ============================================
// MAIN INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', async function() {
    // Load global settings first (shared across all pages)
    await loadGlobalSettings();
    
    // Detect current page and load specific content
    const page = getCurrentPage();
    
    switch(page) {
        case 'home':
            await loadHomepage();
            break;
        case 'about':
            await loadAboutPage();
            break;
        case 'leadership':
            await loadLeadershipPage();
            break;
        case 'academics':
            await loadAcademicsPage();
            break;
        case 'facilities':
            await loadFacilitiesPage();
            break;
        case 'admissions':
            await loadAdmissionsPage();
            break;
        case 'fees':
            await loadFeesPage();
            break;
        case 'contact':
            await loadContactPage();
            break;
        case 'student-life':
            await loadStudentLifePage();
            break;
        case 'news':
            await loadNewsPage();
            break;
    }
    
    console.log(`CMS: Content loaded for ${page} page`);
});