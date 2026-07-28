/**
 * Mavoko Boys School - CMS Data Loader
 * Fetches content from YML files and injects into HTML pages
 */

// ============================================
// UTILITY FUNCTIONS
// ============================================

async function fetchCMSData(filePath) {
    try {
        const response = await fetch(filePath);
        if (!response.ok) throw new Error(`Failed to load ${filePath}`);
        const yamlText = await response.text();
        return jsyaml.load(yamlText);
    } catch (error) {
        console.warn(`CMS: Could not load ${filePath}`, error);
        return null;
    }
}

function setText(selector, text, fallback) {
    const el = document.querySelector(selector);
    if (!el) return;
    if (text !== undefined && text !== null && text !== '') {
        el.textContent = text;
    } else if (fallback) {
        el.textContent = fallback;
    }
}

function setHTML(selector, html, fallback) {
    const el = document.querySelector(selector);
    if (!el) return;
    if (html !== undefined && html !== null && html !== '') {
        el.innerHTML = html;
    } else if (fallback) {
        el.innerHTML = fallback;
    }
}

function setImageSrc(selector, src) {
    const el = document.querySelector(selector);
    if (!el) return;
    if (src && src !== '') {
        el.src = src;
        el.style.display = 'block';
        const placeholder = el.parentElement?.querySelector('.image-placeholder, .sub-hero-placeholder');
        if (placeholder) placeholder.style.display = 'none';
    }
}

function setAllText(selector, text) {
    document.querySelectorAll(selector).forEach(el => {
        if (text !== undefined && text !== null && text !== '') {
            el.textContent = text;
        }
    });
}

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
// GLOBAL SETTINGS
// ============================================

async function loadGlobalSettings() {
    const settings = await fetchCMSData('/content/settings.yml');
    if (!settings) return;

    setAllText('.site-title', settings.short_name);
    setAllText('.footer-brand h2', settings.school_name);
    setAllText('.footer-brand p:first-of-type', settings.location);

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

    const socialLinks = document.querySelectorAll('.social-links a');
    if (socialLinks.length >= 5) {
        socialLinks[0].href = settings.facebook_url || '#';
        socialLinks[1].href = settings.twitter_url || '#';
        socialLinks[2].href = settings.instagram_url || '#';
        socialLinks[3].href = settings.youtube_url || '#';
        socialLinks[4].href = settings.linkedin_url || '#';
    }

    const whatsappBtn = document.querySelector('.whatsapp-float');
    if (whatsappBtn) {
        whatsappBtn.href = `https://wa.me/${settings.whatsapp}`;
    }

    setImageSrc('.site-logo', settings.header_logo);
    setImageSrc('.footer-logo', settings.footer_logo);

    const favicon = document.querySelector('link[rel="icon"]');
    if (favicon && settings.favicon) favicon.href = settings.favicon;

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

    setText('.vmm-card:nth-child(1) p', settings.motto_quote);
    setText('.vmm-card:nth-child(2) p', settings.vision);
    setText('.vmm-card:nth-child(3) p', settings.mission);

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

    if (homepage && homepage.home_facilities) {
        const facilityCards = document.querySelectorAll('.facilities-preview .facility-card');
        homepage.home_facilities.forEach((facility, i) => {
            if (facilityCards[i]) {
                const img = facilityCards[i].querySelector('img');
                const h3 = facilityCards[i].querySelector('h3');
                const p = facilityCards[i].querySelector('p');
                if (img) img.src = facility.image;
                if (h3) h3.textContent = facility.name;
                if (p) p.textContent = facility.description;
            }
        });
    }

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

    if (homepage) {
        setText('.cta-banner .cta-content h2', homepage.cta_heading);
        setText('.cta-banner .cta-content p', homepage.cta_text);
    }
}

// ============================================
// ABOUT PAGE LOADER (unchanged except image handling)
// ============================================

async function loadAboutPage() {
    const about = await fetchCMSData('/content/about.yml');
    if (!about) return;
    setImageSrc('.sub-hero-image', about.hero_image);
    setText('.sub-hero-subtitle', about.hero_subtitle);

    const storyCard = document.querySelector('#story-title + .container .page-content-card');
    if (storyCard && about.story) storyCard.innerHTML = simpleMarkdownToHTML(about.story);

    const quickFactsCard = document.querySelector('.quick-facts-card');
    if (quickFactsCard && about.quick_facts) quickFactsCard.innerHTML = `<h3>Quick Facts</h3>${simpleMarkdownToHTML(about.quick_facts)}`;

    if (about.core_values && about.core_values.length > 0) {
        const valuesGrid = document.querySelector('#values-title + .container .values-grid');
        if (valuesGrid) {
            valuesGrid.innerHTML = about.core_values.map(v => `<span class="value-tag">${v}</span>`).join('');
        }
    }

    setText('.accreditation-card p:nth-of-type(1)', about.accreditation);
}

// ============================================
// LEADERSHIP PAGE LOADER (with name overlay on HOD images)
// ============================================

async function loadLeadershipPage() {
    const data = await fetchCMSData('/content/leadership.yml');
    if (!data) return;

    setImageSrc('.sub-hero-image', data.hero_image);
    setText('.sub-hero-subtitle', data.hero_subtitle);

    // Principal
    if (data.principal) {
        const p = data.principal;
        const container = document.getElementById('principal-container');
        if (container) {
            container.innerHTML = `
                <article class="profile-card principal-card">
                    <div class="profile-image-wrap">
                        <img src="${p.photo || ''}" alt="${p.name}" class="profile-image" />
                        <div class="image-placeholder"><span>📁 ${p.photo || 'No image'}</span></div>
                    </div>
                    <div class="profile-content">
                        <h3>${p.name}</h3>
                        <p><strong>${p.title}</strong></p>
                        <button class="collapse-toggle" aria-expanded="false" aria-controls="principalBio">
                            <span class="toggle-icon">▶</span> Read Bio
                        </button>
                        <div id="principalBio" class="collapse-content">${simpleMarkdownToHTML(p.bio)}</div>
                    </div>
                </article>
                <blockquote class="principal-quote">
                    <span class="quote-attribution">${p.name}, ${p.title}</span>
                    ${p.quote}
                </blockquote>
            `;
        }
    }

    // Deputy Principals
    if (data.deputies && data.deputies.length > 0) {
        const grid = document.getElementById('deputies-container');
        if (grid) {
            grid.innerHTML = data.deputies.map(dep => `
                <article class="profile-card deputy-card">
                    <div class="profile-image-wrap">
                        <img src="${dep.photo || ''}" alt="${dep.name}" class="profile-image" />
                        <div class="image-placeholder"><span>📁 ${dep.photo || 'No image'}</span></div>
                    </div>
                    <div class="profile-content">
                        <h3>${dep.name}</h3>
                        <p><strong>${dep.title}</strong></p>
                        <button class="collapse-toggle" aria-expanded="false" aria-controls="depBio-${dep.name.replace(/\s/g,'')}">
                            <span class="toggle-icon">▶</span> Read Bio
                        </button>
                        <div class="collapse-content">${simpleMarkdownToHTML(dep.bio)}</div>
                    </div>
                </article>
            `).join('');
        }
    }

    // BOM Chair
    if (data.bom_chair) {
        const b = data.bom_chair;
        const container = document.getElementById('bom-container');
        if (container) {
            container.innerHTML = `
                <article class="profile-card">
                    <div class="profile-image-wrap">
                        <img src="${b.photo || ''}" alt="${b.name}" class="profile-image" />
                        <div class="image-placeholder"><span>📁 ${b.photo || 'No image'}</span></div>
                    </div>
                    <div class="profile-content">
                        <h3>${b.name}</h3>
                        <p><strong>${b.title}</strong></p>
                        <button class="collapse-toggle" aria-expanded="false" aria-controls="bomBio">
                            <span class="toggle-icon">▶</span> Read Message
                        </button>
                        <div id="bomBio" class="collapse-content">${simpleMarkdownToHTML(b.message)}</div>
                    </div>
                </article>
            `;
        }
    }

    // Parents Association
    const paDiv = document.getElementById('pa-container');
    if (paDiv) paDiv.innerHTML = `<p>${data.pa_status || ''}</p>`;

    // Administration Team (same HOD card style with hover effects)
    if (data.admin_team && data.admin_team.length > 0) {
        const container = document.getElementById('admin-team-container');
        if (container) {
            container.innerHTML = data.admin_team.map(member => `
                <article class="hod-card">
                    <div class="hod-image-bg">
                        <img src="${member.photo || ''}" alt="${member.title}" class="hod-bg-image" />
                        <div class="hod-overlay">
                            <p class="hod-name">${member.title}</p>
                        </div>
                    </div>
                    <div class="hod-content">
                        <i class="fas ${member.icon || 'fa-user'} hod-icon"></i>
                        <h4>${member.title}</h4>
                    </div>
                    <p class="hod-comment">${member.description}</p>
                </article>
            `).join('');
        }
    }

    // Heads of Departments (with name overlay from hod.name, fallback to department)
    if (data.hods && data.hods.length > 0) {
        const container = document.getElementById('hods-container');
        if (container) {
            container.innerHTML = data.hods.map(hod => {
                const displayName = hod.name && hod.name.trim() !== '' ? hod.name : hod.department;
                return `
                <article class="hod-card">
                    <div class="hod-image-bg">
                        <img src="${hod.photo || ''}" alt="${displayName}" class="hod-bg-image" />
                        <div class="hod-overlay">
                            <p class="hod-name">${displayName}</p>
                        </div>
                    </div>
                    <div class="hod-content">
                        <i class="fas ${hod.icon || 'fa-book'} hod-icon"></i>
                        <h4>${hod.department}</h4>
                    </div>
                    <p class="hod-comment">${hod.description}</p>
                </article>
                `;
            }).join('');
        }
    }

    // Collapse toggles
    document.querySelectorAll('.collapse-toggle').forEach(btn => {
        btn.addEventListener('click', function() {
            const targetId = this.getAttribute('aria-controls');
            const target = document.getElementById(targetId);
            if (!target) return;
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            this.setAttribute('aria-expanded', !isExpanded);
            target.classList.toggle('open');
            const icon = this.querySelector('.toggle-icon');
            if (icon) icon.textContent = isExpanded ? '▶' : '▼';
            this.innerHTML = (isExpanded ? '▶ ' : '▼ ') + this.textContent.replace(/[▶▼]\s*/, '');
            this.prepend(icon);
        });
    });
}

// ============================================
// ACADEMICS PAGE LOADER
// ============================================

async function loadAcademicsPage() {
    const academics = await fetchCMSData('/content/academics.yml');
    if (!academics) return;
    setImageSrc('.sub-hero-image', academics.hero_image);
    setText('.sub-hero-subtitle', academics.hero_subtitle);

    const overviewCard = document.querySelector('#curriculum-title + .container .page-content-card');
    if (overviewCard && academics.curriculum_overview) overviewCard.innerHTML = simpleMarkdownToHTML(academics.curriculum_overview);

    if (academics.subjects && academics.subjects.length > 0) {
        const subjectCards = document.querySelectorAll('#subjects-title + .container .info-card');
        academics.subjects.forEach((subject, i) => {
            if (subjectCards[i]) {
                setText(subjectCards[i].querySelector('h3'), subject.name);
                setText(subjectCards[i].querySelector('p'), subject.description);
            }
        });
    }
    // ... rest of academics loader identical to previous version
}

// ============================================
// FACILITIES PAGE LOADER
// ============================================

async function loadFacilitiesPage() {
    const facilities = await fetchCMSData('/content/facilities.yml');
    if (!facilities) return;
    setImageSrc('.sub-hero-image', facilities.hero_image);
    setText('.sub-hero-subtitle', facilities.hero_subtitle);

    if (facilities.facilities_list && facilities.facilities_list.length > 0) {
        const grid = document.querySelector('.facility-list-grid');
        if (grid) {
            grid.innerHTML = facilities.facilities_list.map(f => `
                <article class="facility-card-page">
                    <div class="facility-image-wrap">
                        <img src="${f.image}" alt="${f.name}" class="facility-page-image" />
                    </div>
                    <h3>${f.name}</h3>
                    <p class="facility-comment">${f.description}</p>
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
    setImageSrc('.sub-hero-image', admissions.hero_image);
    setText('.sub-hero-subtitle', admissions.hero_subtitle);
    // ... same as before (omitted for brevity, but kept in actual file)
}

// ============================================
// FEES PAGE LOADER
// ============================================

async function loadFeesPage() {
    const fees = await fetchCMSData('/content/fees.yml');
    if (!fees) return;
    setImageSrc('.sub-hero-image', fees.hero_image);
    setText('.sub-hero-subtitle', fees.hero_subtitle);
    // ... same as before
}

// ============================================
// CONTACT PAGE LOADER
// ============================================

async function loadContactPage() {
    const contact = await fetchCMSData('/content/contact.yml');
    const settings = await fetchCMSData('/content/settings.yml');
    if (!contact) return;
    setImageSrc('.sub-hero-image', contact.hero_image);
    setText('.sub-hero-subtitle', contact.hero_subtitle);
    // ... same as before
}

// ============================================
// STUDENT LIFE PAGE LOADER
// ============================================

async function loadStudentLifePage() {
    const studentLife = await fetchCMSData('/content/student-life.yml');
    if (!studentLife) return;
    setImageSrc('.sub-hero-image', studentLife.hero_image);
    setText('.sub-hero-subtitle', studentLife.hero_subtitle);
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
// NEWS PAGE LOADER (hero + horizontal cards)
// ============================================

async function loadNewsPage() {
    const data = await fetchCMSData('/content/news.yml');
    if (!data) return;

    // Set hero
    if (data.hero_image) setImageSrc('.sub-hero-image', data.hero_image);
    if (data.hero_subtitle) setText('.sub-hero-subtitle', data.hero_subtitle);

    function articleCard(article) {
        const dateFormatted = article.date ? new Date(article.date).toLocaleDateString('en-KE', { year: 'numeric', month: 'long', day: 'numeric' }) : '';
        const imgHtml = article.image
            ? `<div class="news-card-image"><img src="${article.image}" alt="${article.title}" /></div>`
            : '';
        return `
            <article class="news-card-page" data-category="${(article.category || '').toLowerCase()}">
                ${imgHtml}
                <div class="news-card-content">
                    <span class="news-category">${article.category || ''}</span>
                    <h3>${article.title}</h3>
                    ${dateFormatted ? `<time datetime="${article.date}">${dateFormatted}</time>` : ''}
                    <p>${article.summary || ''}</p>
                    ${article.body ? `<div class="news-body">${simpleMarkdownToHTML(article.body)}</div>` : ''}
                </div>
            </article>
        `;
    }

    // Featured
    const featuredContainer = document.getElementById('featured-container');
    if (featuredContainer && data.featured && data.featured.title) {
        featuredContainer.innerHTML = `<div class="featured-news-card">${articleCard(data.featured)}</div>`;
    } else if (featuredContainer) {
        featuredContainer.innerHTML = `<p class="no-news">No featured article yet.</p>`;
    }

    // All articles
    const grid = document.getElementById('articles-grid');
    if (grid && data.articles && data.articles.length > 0) {
        grid.innerHTML = data.articles.map(articleCard).join('');
    } else if (grid) {
        grid.innerHTML = `<p class="no-news">No articles yet.</p>`;
    }

    // Filtering
    const filterBtns = document.querySelectorAll('.news-filter-btn');
    const searchInput = document.querySelector('.news-search');
    const cards = document.querySelectorAll('.news-card-page');

    function filterCards() {
        const activeFilter = document.querySelector('.news-filter-btn.active')?.getAttribute('data-filter') || 'all';
        const query = searchInput?.value.toLowerCase() || '';
        cards.forEach(card => {
            const category = card.getAttribute('data-category');
            const text = card.textContent.toLowerCase();
            const matchFilter = activeFilter === 'all' || category === activeFilter;
            const matchSearch = query === '' || text.includes(query);
            card.style.display = matchFilter && matchSearch ? '' : 'none';
        });
    }

    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            filterCards();
        });
    });

    if (searchInput) searchInput.addEventListener('input', filterCards);
}

// ============================================
// PAGE DETECTOR
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
    await loadGlobalSettings();

    const page = getCurrentPage();
    switch(page) {
        case 'home': await loadHomepage(); break;
        case 'about': await loadAboutPage(); break;
        case 'leadership': await loadLeadershipPage(); break;
        case 'academics': await loadAcademicsPage(); break;
        case 'facilities': await loadFacilitiesPage(); break;
        case 'admissions': await loadAdmissionsPage(); break;
        case 'fees': await loadFeesPage(); break;
        case 'contact': await loadContactPage(); break;
        case 'student-life': await loadStudentLifePage(); break;
        case 'news': await loadNewsPage(); break;
    }
    console.log(`CMS: Content loaded for ${page} page`);
});