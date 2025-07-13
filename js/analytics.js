// Comprehensive Analytics Tracking System
class Analytics {
    constructor() {
        this.events = [];
        this.sessionId = this.generateSessionId();
        this.userId = this.getUserId();
        this.pageViews = 0;
        this.startTime = Date.now();
        
        this.init();
    }

    init() {
        // Track page view
        this.trackPageView();
        
        // Track user engagement
        this.trackEngagement();
        
        // Track form submissions
        this.trackFormSubmissions();
        
        // Track podcast interactions
        this.trackPodcastInteractions();
        
        // Track navigation
        this.trackNavigation();
        
        // Track conversions
        this.trackConversions();
        
        // Track errors
        this.trackErrors();
        
        // Send data periodically
        this.startPeriodicReporting();
    }

    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    getUserId() {
        let userId = localStorage.getItem('prism_user_id');
        if (!userId) {
            userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('prism_user_id', userId);
        }
        return userId;
    }

    trackEvent(eventName, properties = {}) {
        const event = {
            event: eventName,
            properties: {
                ...properties,
                timestamp: Date.now(),
                sessionId: this.sessionId,
                userId: this.userId,
                url: window.location.href,
                userAgent: navigator.userAgent,
                screenSize: `${screen.width}x${screen.height}`,
                viewport: `${window.innerWidth}x${window.innerHeight}`
            }
        };

        this.events.push(event);
        
        // Log in development
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.log('Analytics Event:', event);
        }

        // Send to analytics service if available
        this.sendToAnalytics(event);
    }

    trackPageView() {
        this.pageViews++;
        this.trackEvent('page_view', {
            page: window.location.pathname,
            title: document.title,
            referrer: document.referrer,
            pageViews: this.pageViews
        });
    }

    trackEngagement() {
        // Track scroll depth
        let maxScroll = 0;
        window.addEventListener('scroll', () => {
            const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
            if (scrollPercent > maxScroll) {
                maxScroll = scrollPercent;
                if (maxScroll % 25 === 0) { // Track at 25%, 50%, 75%, 100%
                    this.trackEvent('scroll_depth', { depth: maxScroll });
                }
            }
        });

        // Track time on page
        window.addEventListener('beforeunload', () => {
            const timeOnPage = Date.now() - this.startTime;
            this.trackEvent('time_on_page', { 
                duration: timeOnPage,
                page: window.location.pathname 
            });
        });
    }

    trackFormSubmissions() {
        document.addEventListener('submit', (e) => {
            const form = e.target;
            const formName = form.name || form.id || 'unknown_form';
            
            this.trackEvent('form_submit', {
                formName: formName,
                formAction: form.action,
                formMethod: form.method
            });
        });
    }

    trackPodcastInteractions() {
        // Track podcast episode plays
        document.addEventListener('click', (e) => {
            const target = e.target;
            
            // Spotify embed clicks
            if (target.closest('.spotify-embed')) {
                this.trackEvent('podcast_play', {
                    platform: 'spotify',
                    episode: this.getEpisodeInfo(target.closest('.episode-card'))
                });
            }
            
            // Platform link clicks
            if (target.closest('.platform-links a')) {
                const platform = target.closest('.platform-links a').getAttribute('href');
                this.trackEvent('podcast_platform_click', {
                    platform: platform,
                    episode: this.getEpisodeInfo(target.closest('.episode-card'))
                });
            }
        });
    }

    getEpisodeInfo(card) {
        if (!card) return null;
        
        const title = card.querySelector('h3')?.textContent;
        const parsha = card.querySelector('.parsha-badge')?.textContent;
        
        return {
            title: title,
            parsha: parsha
        };
    }

    trackNavigation() {
        // Track internal link clicks
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (link && link.href && link.href.includes(window.location.origin)) {
                this.trackEvent('internal_link_click', {
                    linkText: link.textContent.trim(),
                    linkUrl: link.href,
                    linkLocation: this.getElementLocation(link)
                });
            }
        });
    }

    getElementLocation(element) {
        const rect = element.getBoundingClientRect();
        return {
            x: Math.round(rect.x),
            y: Math.round(rect.y),
            visible: rect.top >= 0 && rect.bottom <= window.innerHeight
        };
    }

    trackConversions() {
        // Track newsletter subscriptions
        document.addEventListener('submit', (e) => {
            const form = e.target;
            if (form.name === 'newsletter') {
                this.trackEvent('newsletter_signup', {
                    source: window.location.pathname
                });
            }
        });

        // Track book purchases (when implemented)
        document.addEventListener('click', (e) => {
            if (e.target.textContent.toLowerCase().includes('buy') || 
                e.target.textContent.toLowerCase().includes('purchase')) {
                this.trackEvent('purchase_intent', {
                    product: 'book',
                    location: window.location.pathname
                });
            }
        });
    }

    trackErrors() {
        window.addEventListener('error', (e) => {
            this.trackEvent('javascript_error', {
                message: e.message,
                filename: e.filename,
                lineno: e.lineno,
                colno: e.colno,
                error: e.error?.stack
            });
        });

        window.addEventListener('unhandledrejection', (e) => {
            this.trackEvent('unhandled_promise_rejection', {
                reason: e.reason
            });
        });
    }

    trackError(error, context = {}) {
        this.trackEvent('error', {
            message: error.message,
            stack: error.stack,
            context: context
        });
    }

    sendToAnalytics(event) {
        // Send to Google Analytics if available
        if (window.gtag) {
            window.gtag('event', event.event, event.properties);
        }

        // Send to custom endpoint
        fetch('/api/analytics', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(event)
        }).catch(err => {
            // Silently fail in production
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                console.warn('Analytics send failed:', err);
            }
        });
    }

    startPeriodicReporting() {
        // Send events every 30 seconds
        setInterval(() => {
            if (this.events.length > 0) {
                this.sendBatchEvents();
            }
        }, 30000);
    }

    sendBatchEvents() {
        const batch = this.events.splice(0, this.events.length);
        
        fetch('/api/analytics/batch', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                events: batch,
                sessionId: this.sessionId,
                userId: this.userId
            })
        }).catch(err => {
            // Silently fail in production
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                console.warn('Analytics batch send failed:', err);
            }
        });
    }

    // Public methods for manual tracking
    trackConversion(type, value = null) {
        this.trackEvent('conversion', {
            type: type,
            value: value
        });
    }

    trackCustomEvent(eventName, properties = {}) {
        this.trackEvent(eventName, properties);
    }
}

// Initialize analytics
window.analytics = new Analytics();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Analytics;
} 