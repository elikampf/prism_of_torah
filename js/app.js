// Prism of Torah - App Scripts
// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Load Google Fonts asynchronously
    loadGoogleFonts();
    
    // Add page load animation
    document.body.classList.add('page-loaded');
    
    // =====================================================
    // UNIFIED BUTTON SYSTEM - Consistent Behavior
    // =====================================================
    
    // Initialize unified button system
    initializeUnifiedButtonSystem();
    
    // Animate elements on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                scrollObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe elements with animation classes
    const animatedElements = document.querySelectorAll('.fade-in-up, .fade-in, .slide-in-left, .slide-in-right');
    animatedElements.forEach(el => scrollObserver.observe(el));

    // =====================================================
    // MOBILE NAVIGATION - Standardized
    // =====================================================

    const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
    const body = document.querySelector('body');
    const mobileNav = document.querySelector('.mobile-nav');

    if (mobileNavToggle) {
        mobileNavToggle.addEventListener('click', () => {
            body.classList.toggle('mobile-nav-active');
            const isExpanded = body.classList.contains('mobile-nav-active');
            mobileNavToggle.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
        });
        
        // Set initial ARIA attributes
        mobileNavToggle.setAttribute('aria-label', 'Toggle mobile navigation menu');
        mobileNavToggle.setAttribute('aria-expanded', 'false');
    }

    // Close mobile nav when clicking outside
    document.addEventListener('click', (e) => {
        if (body.classList.contains('mobile-nav-active') && 
            !e.target.closest('.mobile-nav') && 
            !e.target.closest('.mobile-nav-toggle')) {
            body.classList.remove('mobile-nav-active');
            if (mobileNavToggle) {
                mobileNavToggle.setAttribute('aria-expanded', 'false');
            }
        }
    });

    // Close mobile nav when clicking a link
    const mobileNavLinks = document.querySelectorAll('.mobile-nav a');
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', () => {
            body.classList.remove('mobile-nav-active');
            if (mobileNavToggle) {
                mobileNavToggle.setAttribute('aria-expanded', 'false');
            }
        });
    });

    // =====================================================
    // HEADER SCROLL BEHAVIOR
    // =====================================================
    
    const mainHeader = document.querySelector('.main-header');
    let lastScroll = 0;
    
    if (mainHeader) {
        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            
            if (currentScroll > 100) {
                mainHeader.classList.add('scrolled');
            } else {
                mainHeader.classList.remove('scrolled');
            }
            
            lastScroll = currentScroll;
        });
    }

    // =====================================================
    // FORM HANDLING - Netlify Compatible
    // =====================================================
    
    // Enhanced form submission that works with Netlify Forms
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        const submitButton = form.querySelector('button[type="submit"]');
        const originalButtonText = submitButton ? submitButton.innerHTML : 'Submit';
        
        form.addEventListener('submit', async (e) => {
            // Set loading state
            setButtonLoadingState(submitButton, true);
            
            // For Netlify Forms, we want to let the form submit naturally
            // but provide user feedback during the process
            
            // Small delay to show loading state, then let form submit
            setTimeout(() => {
                // Allow the form to submit to Netlify
                // The form will redirect to Netlify's success page or your custom page
            }, 1000);
        });
        
        // Add accessibility attributes
        if (submitButton && !submitButton.getAttribute('aria-label')) {
            submitButton.setAttribute('aria-label', 'Submit form');
        }
    });

    // =====================================================
    // MODAL SYSTEM - Standardized
    // =====================================================
    
    const modalButtons = document.querySelectorAll('[data-modal-target]');
    modalButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const modal = document.querySelector(`#${button.dataset.modalTarget}`);
            openModal(modal);
        });
    });

    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        const closeButton = modal.querySelector('.close-button');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                closeModal(modal);
            });
        }

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal);
            }
        });
    });

    // =====================================================
    // ENDORSEMENT CAROUSEL
    // =====================================================
    
    const carousel = document.querySelector('.endorsement-carousel');
    if (carousel) {
        const slides = carousel.querySelectorAll('.endorsement-slide');
        let currentSlide = 0;

        const showSlide = (index) => {
            slides.forEach((slide, i) => {
                slide.classList.toggle('active', i === index);
            });
        };

        const nextSlide = () => {
            currentSlide = (currentSlide + 1) % slides.length;
            showSlide(currentSlide);
        };

        setInterval(nextSlide, 5000);
    }

    // =====================================================
    // PODCAST FUNCTIONALITY
    // =====================================================
    
    // Initialize podcast functionality if on podcast page
    if (window.location.pathname.includes('podcast') || document.querySelector('.podcast-section')) {
        initializePodcastFunctionality();
    }

    // =====================================================
    // UNIFIED BUTTON SYSTEM FUNCTIONS
    // =====================================================
    
    function initializeUnifiedButtonSystem() {
        // Add consistent keyboard navigation
        addKeyboardNavigation();
        
        // Add consistent ripple effects
        addRippleEffects();
        
        // Add consistent loading states
        addLoadingStates();
        
        // Add consistent accessibility
        addAccessibilityFeatures();
    }
    
    function addKeyboardNavigation() {
        const allButtons = document.querySelectorAll('.btn, .header-cta, .mobile-nav-toggle, .close-button, .sefer-btn');
        
        allButtons.forEach(button => {
            button.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    button.click();
                }
            });
        });
    }
    
    function addRippleEffects() {
        const buttonsWithRipple = document.querySelectorAll('.btn, .header-cta, .sefer-btn');
        
        buttonsWithRipple.forEach(button => {
            button.addEventListener('click', (e) => {
                const rect = button.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;
                
                const ripple = document.createElement('span');
                ripple.className = 'ripple';
                ripple.style.cssText = `
                    position: absolute;
                    border-radius: 50%;
                    width: ${size}px;
                    height: ${size}px;
                    left: ${x}px;
                    top: ${y}px;
                    background: rgba(255, 255, 255, 0.3);
                    pointer-events: none;
                    animation: ripple-animation 0.6s ease-out;
                `;
                
                button.appendChild(ripple);
                
                setTimeout(() => {
                    ripple.remove();
                }, 600);
            });
        });
        
        // Add ripple animation CSS
        if (!document.querySelector('#ripple-styles')) {
            const style = document.createElement('style');
            style.id = 'ripple-styles';
            style.textContent = `
                @keyframes ripple-animation {
                    to {
                        transform: scale(2);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    function addLoadingStates() {
        // This function is implemented in the form handling section
        // but could be extended for other async operations
    }
    
    function addAccessibilityFeatures() {
        const allButtons = document.querySelectorAll('.btn, .header-cta, .mobile-nav-toggle, .close-button, .sefer-btn');
        
        allButtons.forEach(button => {
            // Ensure proper tabindex
            if (!button.hasAttribute('tabindex')) {
                button.setAttribute('tabindex', '0');
            }
            
            // Add role if not present
            if (!button.hasAttribute('role') && button.tagName !== 'BUTTON') {
                button.setAttribute('role', 'button');
            }
            
            // Add aria-label if missing and text content is unclear
            if (!button.hasAttribute('aria-label') && button.textContent.trim().length < 2) {
                button.setAttribute('aria-label', 'Button');
            }
        });
    }
    
    // =====================================================
    // UTILITY FUNCTIONS
    // =====================================================
    
    function setButtonLoadingState(button, isLoading, originalText = 'Submit') {
        if (!button) return;
        
        if (isLoading) {
            button.disabled = true;
            button.classList.add('loading');
            button.innerHTML = '<span class="loading-spinner loading-spinner-sm"></span> Loading...';
        } else {
            button.disabled = false;
            button.classList.remove('loading');
            button.innerHTML = originalText;
        }
    }
    
    function showFormSuccess(form) {
        const successMessage = document.createElement('div');
        successMessage.className = 'success-message';
        successMessage.innerHTML = '<span style="color: green;">✓ Success! Your message has been sent.</span>';
        
        form.appendChild(successMessage);
        
        setTimeout(() => {
            successMessage.remove();
        }, 5000);
    }
    
    function showFormError(form, message) {
        const errorMessage = document.createElement('div');
        errorMessage.className = 'error-message';
        errorMessage.innerHTML = `<span style="color: red;">⚠ ${message}</span>`;
        
        form.appendChild(errorMessage);
        
        setTimeout(() => {
            errorMessage.remove();
        }, 5000);
    }

    function openModal(modal) {
        if (modal == null) return;
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        
        // Focus management
        const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (focusableElements.length > 0) {
            focusableElements[0].focus();
        }
    }

    function closeModal(modal) {
        if (modal == null) return;
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
    }

    // =====================================================
    // PODCAST FUNCTIONALITY
    // =====================================================
    
    function initializePodcastFunctionality() {
        console.log('Initializing podcast functionality...');
        
        // Initialize podcast-specific functionality
        const TORAH_ORDER = {
            Seforim: ['Bereishis', 'Shemos', 'Vayikra', 'Bamidbar', 'Devarim', 'Chagim'],
            Parshas: {
                'Bereishis': ['Bereishis', 'Noach', 'Lech Lecha', 'Vayera', 'Chayei Sarah', 'Toldos', 'Vayetzei', 'Vayishlach', 'Vayeshev', 'Miketz', 'Vayigash', 'Vayechi'],
                'Shemos': ['Shemos', 'Vaera', 'Bo', 'Beshalach', 'Yisro', 'Mishpatim', 'Terumah', 'Tetzaveh', 'Ki Sisa', 'Vayakhel', 'Pekudei'],
                'Vayikra': ['Vayikra', 'Tzav', 'Shemini', 'Tazria', 'Metzora', 'Achrei Mos', 'Kedoshim', 'Emor', 'Behar', 'Bechukosai'],
                'Bamidbar': ['Bamidbar', 'Nasso', 'Beha\'aloscha', 'Shelach', 'Korach', 'Chukas', 'Balak', 'Pinchas', 'Mattos', 'Masei'],
                'Devarim': ['Devarim', 'Vaeschanan', 'Eikev', 'Re\'eh', 'Shoftim', 'Ki Seitzei', 'Ki Savo', 'Nitzavim', 'Vayeilech', 'Haazinu', 'Vezos Habracha'],
                'Chagim': ['Rosh Hashana', 'Yom Kippur', 'Sukkos', 'Chanuka', 'Tu BiShvat', 'Purim', 'Pesach', 'Lag BaOmer', 'Shavuos', 'Three Weeks', 'Elul']
            }
        };

        let state = {
            episodes: [],
            filteredEpisodes: [],
            filter: {
                sefer: 'All',
                parsha: 'All'
            },
            currentPage: 1,
            episodesPerPage: 10
        };

        // Initialize podcast elements
        const seferNavContainer = document.querySelector('.sefer-nav');
        const episodesList = document.querySelector('#episodes-container'); // Fixed selector
        const loadMoreBtn = document.querySelector('#load-more-btn');

        console.log('Podcast elements found:', {
            seferNavContainer: !!seferNavContainer,
            episodesList: !!episodesList,
            loadMoreBtn: !!loadMoreBtn
        });

        if (seferNavContainer) {
            renderSeferNav();
            setupEventListeners();
            loadEpisodes();
        } else {
            console.warn('Podcast navigation container not found. Are you on the podcast page?');
        }

        function renderSeferNav() {
            const allEpisodesButton = `
                <div class="sefer-dropdown" data-sefer="All">
                    <button class="sefer-btn" data-sefer="All" aria-label="Show all episodes">
                        All Episodes
                    </button>
                </div>
            `;
            
            const seferDropdowns = TORAH_ORDER.Seforim.map((sefer, index) => {
                const parshas = TORAH_ORDER.Parshas[sefer];
                const parshaOptions = parshas.map(parsha => 
                    `<li><a href="#" data-sefer="${sefer}" data-parsha="${parsha}" role="menuitem">${parsha}</a></li>`
                ).join('');
                
                return `
                    <div class="sefer-dropdown" data-sefer="${sefer}">
                        <button class="sefer-btn" data-sefer="${sefer}" aria-label="Show ${sefer} episodes">
                            ${sefer} <span class="dropdown-arrow" aria-hidden="true">▼</span>
                        </button>
                        <div class="dropdown-content" role="menu">
                            <ul>
                                <li><a href="#" data-sefer="${sefer}" data-parsha="All" class="parsha-all" role="menuitem">All ${sefer}</a></li>
                                ${parshaOptions}
                            </ul>
                        </div>
                    </div>
                `;
            }).join('');
            
            seferNavContainer.innerHTML = allEpisodesButton + seferDropdowns;
        }

        function setupEventListeners() {
            if(seferNavContainer) {
                seferNavContainer.addEventListener('click', (e) => {
                    e.preventDefault();
                    
                    // Handle sefer button clicks (toggle dropdown)
                    if(e.target.classList.contains('sefer-btn') || e.target.closest('.sefer-btn')) {
                        const seferBtn = e.target.classList.contains('sefer-btn') ? e.target : e.target.closest('.sefer-btn');
                        const dropdown = seferBtn.closest('.sefer-dropdown');
                        const sefer = seferBtn.dataset.sefer;
                        
                        if (!seferBtn || !dropdown || !sefer) return;
                        
                        // Close all other dropdowns
                        seferNavContainer.querySelectorAll('.sefer-dropdown').forEach(dd => {
                            if (dd !== dropdown) {
                                dd.classList.remove('active');
                            }
                        });
                        
                        // Toggle current dropdown
                        dropdown.classList.toggle('active');
                        
                        // If clicking on a different sefer, update the filter and add selected state
                        if (state.filter.sefer !== sefer) {
                            state.filter.sefer = sefer;
                            state.filter.parsha = 'All';
                            
                            // Update selected state
                            seferNavContainer.querySelectorAll('.sefer-dropdown').forEach(dd => dd.classList.remove('selected'));
                            dropdown.classList.add('selected');
                            
                            updateAndRender();
                        }
                    }
                    
                    // Handle parsha link clicks
                    if(e.target.dataset.parsha) {
                        const sefer = e.target.dataset.sefer;
                        const parsha = e.target.dataset.parsha;
                        
                        state.filter.sefer = sefer;
                        state.filter.parsha = parsha;
                        
                        // Update selected state
                        seferNavContainer.querySelectorAll('.sefer-dropdown').forEach(dd => dd.classList.remove('selected'));
                        const dropdown = seferNavContainer.querySelector(`[data-sefer="${sefer}"]`);
                        if (dropdown) dropdown.classList.add('selected');
                        
                        // Close dropdown
                        dropdown.classList.remove('active');
                        
                        updateAndRender();
                    }
                });
            }

            // Load more button
            if (loadMoreBtn) {
                loadMoreBtn.addEventListener('click', () => {
                    state.currentPage++;
                    renderEpisodes();
                });
            }
        }

        async function loadEpisodes() {
            try {
                const allEpisodes = [];
                const loadingSpinner = document.querySelector('.loading-spinner');
                
                // Show loading state
                if (loadingSpinner) {
                    loadingSpinner.style.display = 'block';
                }
                
                // Test if we can access the Data directory
                console.log('Testing Data directory access...');
                try {
                    const testResponse = await fetch('Data/Bereishis.json');
                    console.log('Data directory accessible:', testResponse.ok);
                    console.log('Response status:', testResponse.status);
                    console.log('Response headers:', Object.fromEntries(testResponse.headers.entries()));
                    if (!testResponse.ok) {
                        console.error('Data directory test failed:', testResponse.status, testResponse.statusText);
                    }
                } catch (testError) {
                    console.error('Data directory not accessible:', testError);
                    console.error('Error details:', {
                        name: testError.name,
                        message: testError.message,
                        stack: testError.stack
                    });
                }
                
                let successCount = 0;
                let errorCount = 0;
                
                for (const sefer of TORAH_ORDER.Seforim) {
                    try {
                        console.log(`Loading ${sefer}.json...`);
                        
                        // Try different path variations for Netlify compatibility
                        let response = null;
                        let dataPath = `Data/${sefer}.json`;
                        
                        // First try the original path
                        response = await fetch(dataPath);
                        
                        // If that fails, try lowercase
                        if (!response.ok) {
                            console.log(`Trying lowercase path for ${sefer}...`);
                            response = await fetch(dataPath.toLowerCase());
                        }
                        
                        // If that fails, try without Data/ prefix
                        if (!response.ok) {
                            console.log(`Trying direct path for ${sefer}...`);
                            response = await fetch(`${sefer}.json`);
                        }
                        
                        if (!response.ok) {
                            console.error(`Failed to load ${sefer}.json: ${response.status} ${response.statusText}`);
                            errorCount++;
                            continue;
                        }
                        
                        const data = await response.json();
                        console.log(`Data structure for ${sefer}:`, data);
                        
                        // Validate JSON structure
                        if (!data) {
                            console.error(`✗ Empty data in ${sefer}.json`);
                            errorCount++;
                            continue;
                        }
                        
                        if (Array.isArray(data)) {
                            // JSON is an array of episodes
                            const episodesWithSefer = data
                                .filter(episode => episode && episode.episode_name && episode.episode_name.trim() !== '')
                                .map(episode => ({
                                    ...episode,
                                    sefer: sefer,
                                    parsha: episode.episode_name && episode.episode_name.includes('Parshas') 
                                        ? episode.episode_name.split('Parshas')[1]?.split('-')[0]?.trim() || 'Unknown'
                                        : 'Unknown'
                                }));
                            allEpisodes.push(...episodesWithSefer);
                            console.log(`✓ Loaded ${episodesWithSefer.length} episodes from ${sefer}`);
                            successCount++;
                        } else if (data && data.episodes && Array.isArray(data.episodes)) {
                            // JSON is { episodes: [...] }
                            const episodesWithSefer = data.episodes
                                .filter(episode => episode && episode.episode_name && episode.episode_name.trim() !== '')
                                .map(episode => ({
                                    ...episode,
                                    sefer: sefer
                                }));
                            allEpisodes.push(...episodesWithSefer);
                            console.log(`✓ Loaded ${episodesWithSefer.length} episodes from ${sefer}`);
                            successCount++;
                        } else if (data && typeof data === 'object') {
                            // Handle other possible structures
                            console.warn(`⚠ Unexpected data structure in ${sefer}.json:`, data);
                            console.warn(`Data type: ${typeof data}, Array: ${Array.isArray(data)}`);
                            
                            // Try to find episodes in various possible locations
                            let episodes = null;
                            if (data.episodes) episodes = data.episodes;
                            else if (data.data) episodes = data.data;
                            else if (data.items) episodes = data.items;
                            
                            if (episodes && Array.isArray(episodes)) {
                                const episodesWithSefer = episodes
                                    .filter(episode => episode && episode.episode_name && episode.episode_name.trim() !== '')
                                    .map(episode => ({
                                        ...episode,
                                        sefer: sefer
                                    }));
                                allEpisodes.push(...episodesWithSefer);
                                console.log(`✓ Loaded ${episodesWithSefer.length} episodes from ${sefer} (fallback)`);
                                successCount++;
                            } else {
                                console.error(`✗ No valid episodes array found in ${sefer}.json`);
                                errorCount++;
                            }
                        } else {
                            console.warn(`⚠ No episodes found in ${sefer}.json, structure:`, data);
                            errorCount++;
                        }
                        
                    } catch (error) {
                        console.error(`✗ Error loading ${sefer}.json:`, error);
                        errorCount++;
                    }
                }
                
                console.log(`Episodes loading complete: ${successCount} successful, ${errorCount} errors`);
                console.log(`Total episodes loaded: ${allEpisodes.length}`);
                
                if (allEpisodes.length === 0) {
                    console.error('No episodes loaded! Check Data directory and JSON files.');
                    // Display error message to user
                    if (episodesList) {
                        episodesList.innerHTML = `
                            <div class="error-message">
                                <h3>Unable to load episodes</h3>
                                <p>There seems to be an issue loading the podcast episodes. Please try refreshing the page.</p>
                                <p>If the problem persists, please contact support.</p>
                                <p>Debug info: ${successCount} files loaded successfully, ${errorCount} errors</p>
                                <button class="btn btn-primary" onclick="location.reload()" style="margin-top: var(--space-md);">
                                    🔄 Retry Loading Episodes
                                </button>
                            </div>
                        `;
                    }
                    return;
                }
                
                // Store episodes in state
                state.episodes = allEpisodes;
                state.filteredEpisodes = allEpisodes;
                
                // Update UI
                updateAndRender();
                
            } catch (error) {
                console.error('Error loading episodes:', error);
                // Display error message to user
                if (episodesList) {
                    episodesList.innerHTML = `
                        <div class="error-message">
                            <h3>Unable to load episodes</h3>
                            <p>There seems to be an issue loading the podcast episodes. Please try refreshing the page.</p>
                            <p>Error: ${error.message}</p>
                            <button class="btn btn-primary" onclick="location.reload()" style="margin-top: var(--space-md);">
                                🔄 Retry Loading Episodes
                            </button>
                        </div>
                    `;
                }
            } finally {
                // Hide loading state
                const loadingSpinner = document.querySelector('.loading-spinner');
                if (loadingSpinner) {
                    loadingSpinner.style.display = 'none';
                }
            }
        }

        function updateAndRender() {
            filterEpisodes();
            state.currentPage = 1;
            renderEpisodes();
        }

        function filterEpisodes() {
            state.filteredEpisodes = state.episodes.filter(episode => {
                // Skip empty episodes
                if (!episode.episode_name || episode.episode_name.trim() === '') {
                    return false;
                }
                
                const seferMatch = state.filter.sefer === 'All' || episode.sefer === state.filter.sefer;
                const parshaMatch = state.filter.parsha === 'All' || episode.parsha === state.filter.parsha;
                
                // Also check if episode name contains the parsha name
                const nameContainsParsha = episode.episode_name && 
                    episode.episode_name.toLowerCase().includes(state.filter.parsha.toLowerCase());
                
                return seferMatch && (parshaMatch || nameContainsParsha);
            });
        }

        function renderEpisodes() {
            if (!episodesList) {
                console.error('episodesList element not found');
                return;
            }

            const startIndex = (state.currentPage - 1) * state.episodesPerPage;
            const endIndex = startIndex + state.episodesPerPage;
            const episodesToShow = state.filteredEpisodes.slice(0, endIndex);
            
            console.log(`Rendering ${episodesToShow.length} episodes (page ${state.currentPage})`);
            
            if (episodesToShow.length === 0) {
                episodesList.innerHTML = '<p>No episodes found for the selected filter.</p>';
                return;
            }
            
            episodesList.innerHTML = episodesToShow.map(episode => {
                const spotify_web_url = episode.spotify_web_url || episode.spotify_url || '#';
                const embed_url = episode.embed_url || '';
                const episode_name = episode.episode_name || episode.name || 'Untitled Episode';
                const episode_description = episode.episode_description || episode.description || 'No description available.';
                const sefer = episode.sefer || 'Unknown';
                const parsha = episode.parsha || 'Unknown';
                const release_date = episode.release_date || '';
                const duration_minutes = episode.duration_minutes || '';
                
                // Create duration display
                const durationDisplay = duration_minutes ? 
                    `${Math.floor(duration_minutes)}:${String(Math.round((duration_minutes % 1) * 60)).padStart(2, '0')}` : '';
                
                return `
                    <div class="episode-card" data-sefer="${sefer}" data-parsha="${parsha}">
                        <div class="episode-header">
                            <h3>${episode_name}</h3>
                            <div class="episode-meta">
                                <span class="parsha-badge">${sefer} • ${parsha}</span>
                                ${release_date ? `<span class="date">${release_date}</span>` : ''}
                                ${durationDisplay ? `<span class="duration">${durationDisplay}</span>` : ''}
                            </div>
                        </div>
                        <div class="episode-content">
                            <div class="episode-desc">
                                <p>${episode_description}</p>
                            </div>
                            ${embed_url ? `
                                <div class="spotify-embed">
                                    <iframe src="${embed_url}" 
                                            width="100%" 
                                            height="152" 
                                            frameborder="0" 
                                            allowtransparency="true" 
                                            allow="encrypted-media"
                                            loading="lazy">
                                    </iframe>
                                </div>
                            ` : ''}
                            <div class="episode-actions">
                                <a href="${spotify_web_url}" target="_blank" rel="noopener" class="btn btn-secondary" aria-label="Listen to ${episode_name} on Spotify">Listen on Spotify</a>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');

            // Manage "Load More" button visibility
            if (loadMoreBtn) {
                loadMoreBtn.style.display = episodesToShow.length < state.filteredEpisodes.length ? 'block' : 'none';
            }
        }
            }

    // =====================================================
    // SUBSCRIBE BUTTON FUNCTIONALITY
    // =====================================================
    
    const subscribeButtons = document.querySelectorAll('.header-cta, .btn[href="#"]');
    subscribeButtons.forEach(button => {
        if (button && button.textContent && button.textContent.includes('Subscribe')) {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                // Find the newsletter form in the footer
                const newsletterForm = document.querySelector('.footer-newsletter');
                if (newsletterForm) {
                    newsletterForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    // Focus on the email input after scrolling
                    setTimeout(() => {
                        const emailInput = newsletterForm.querySelector('input[type="email"]');
                        if (emailInput) emailInput.focus();
                    }, 800);
                }
            });
        }
    });

    // =====================================================
    // Lazy loading image enhancement
    // =====================================================
    
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.classList.add('loaded');
                    observer.unobserve(img);
                }
            });
        });
        
        lazyImages.forEach(img => {
            imageObserver.observe(img);
        });
    } else {
        // Fallback for browsers that don't support IntersectionObserver
        lazyImages.forEach(img => {
            img.classList.add('loaded');
        });
    }
    
    // Add loaded class to images that are already loaded
    lazyImages.forEach(img => {
        if (img.complete) {
            img.classList.add('loaded');
        }
    });

    // =====================================================
    // Intersection Observer for fade-in animations
    // =====================================================
    
    const fadeInObserverOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    
    const fadeInObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                fadeInObserver.unobserve(entry.target);
            }
        });
    }, fadeInObserverOptions);
    
    // Observe all fade-in elements
    document.querySelectorAll('.fade-in-up').forEach(el => {
        fadeInObserver.observe(el);
    });
    
    // =====================================================
    // Add prism spin animation to scroll
    // =====================================================
    
    let lastScrollTop = 0;
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const prismElements = document.querySelectorAll('.prism-light::after');
        
        prismElements.forEach(el => {
            if (el && el.style) {
                const rotation = (scrollTop / 5) % 360;
                el.style.transform = `rotate(${rotation}deg)`;
            }
        });
        
        lastScrollTop = scrollTop;
    });
}); 

// Load Google Fonts asynchronously to avoid blocking
function loadGoogleFonts() {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800&display=swap';
    link.onload = function() {
        console.log('Google Fonts loaded successfully');
    };
    link.onerror = function() {
        console.warn('Google Fonts failed to load, using fallback fonts');
    };
    document.head.appendChild(link);
} 