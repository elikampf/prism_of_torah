// Heatmap and Session Recording System
class HeatmapTracker {
    constructor() {
        this.isRecording = false;
        this.clicks = [];
        this.moves = [];
        this.scrolls = [];
        this.events = [];
        this.sessionId = this.generateSessionId();
        this.heatmapEndpointAvailable = true; // Will be set to false if endpoint fails
        
        this.init();
    }

    init() {
        // Start recording after user consent or automatically in development
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            this.startRecording();
        } else {
            // In production, wait for user consent
            this.requestConsent();
        }
    }

    generateSessionId() {
        return 'heatmap_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    requestConsent() {
        // Check if user has already given consent
        if (localStorage.getItem('prism_heatmap_consent') === 'true') {
            this.startRecording();
            return;
        }

        // Show consent banner
        this.showConsentBanner();
    }

    showConsentBanner() {
        const banner = document.createElement('div');
        banner.id = 'heatmap-consent-banner';
        banner.innerHTML = `
            <div class="consent-content">
                <p>We use heatmap tracking to improve your experience. This helps us understand how you interact with our site.</p>
                <div class="consent-buttons">
                    <button id="accept-heatmap" class="btn btn-primary">Accept</button>
                    <button id="decline-heatmap" class="btn btn-secondary">Decline</button>
                </div>
            </div>
        `;
        
        banner.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            right: 20px;
            background: var(--pure-radiance);
            border: 1px solid var(--border-color);
            border-radius: var(--radius-lg);
            padding: var(--space-lg);
            box-shadow: var(--shadow-lg);
            z-index: 10000;
            max-width: 500px;
            margin: 0 auto;
        `;

        document.body.appendChild(banner);

        // Add event listeners
        document.getElementById('accept-heatmap').addEventListener('click', () => {
            localStorage.setItem('prism_heatmap_consent', 'true');
            this.startRecording();
            banner.remove();
        });

        document.getElementById('decline-heatmap').addEventListener('click', () => {
            localStorage.setItem('prism_heatmap_consent', 'false');
            banner.remove();
        });
    }

    startRecording() {
        this.isRecording = true;
        this.trackClicks();
        this.trackMouseMovement();
        this.trackScrolling();
        this.trackFormInteractions();
        this.trackPageChanges();
        
        // Send data periodically
        this.startPeriodicSending();
    }

    trackClicks() {
        document.addEventListener('click', (e) => {
            if (!this.isRecording) return;

            const element = e.target;
            const rect = element.getBoundingClientRect();
            
            this.clicks.push({
                x: e.clientX,
                y: e.clientY,
                element: {
                    tagName: element.tagName,
                    className: element.className,
                    id: element.id,
                    text: element.textContent?.substring(0, 50) || '',
                    href: element.href || ''
                },
                timestamp: Date.now() - this.startTime,
                page: window.location.pathname
            });
        });
    }

    trackMouseMovement() {
        let lastMove = 0;
        document.addEventListener('mousemove', (e) => {
            if (!this.isRecording) return;

            // Throttle to avoid too many events
            const now = Date.now();
            if (now - lastMove < 100) return; // Only track every 100ms
            lastMove = now;

            this.moves.push({
                x: e.clientX,
                y: e.clientY,
                timestamp: now - this.startTime
            });
        });
    }

    trackScrolling() {
        let lastScroll = 0;
        window.addEventListener('scroll', (e) => {
            if (!this.isRecording) return;

            const now = Date.now();
            if (now - lastScroll < 200) return; // Only track every 200ms
            lastScroll = now;

            this.scrolls.push({
                scrollY: window.scrollY,
                scrollX: window.scrollX,
                maxScroll: document.body.scrollHeight - window.innerHeight,
                timestamp: now - this.startTime
            });
        });
    }

    trackFormInteractions() {
        // Track form focus
        document.addEventListener('focusin', (e) => {
            if (!this.isRecording) return;

            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
                this.trackEvent('form_focus', {
                    element: e.target.tagName,
                    name: e.target.name,
                    type: e.target.type,
                    timestamp: Date.now() - this.startTime
                });
            }
        });

        // Track form blur
        document.addEventListener('focusout', (e) => {
            if (!this.isRecording) return;

            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
                this.trackEvent('form_blur', {
                    element: e.target.tagName,
                    name: e.target.name,
                    type: e.target.type,
                    value: e.target.value?.length || 0,
                    timestamp: Date.now() - this.startTime
                });
            }
        });
    }

    trackPageChanges() {
        // Track before page unload
        window.addEventListener('beforeunload', () => {
            if (!this.isRecording) return;

            this.sendHeatmapData();
        });

        // Track navigation changes (for SPA)
        let currentUrl = window.location.href;
        setInterval(() => {
            if (window.location.href !== currentUrl) {
                this.trackEvent('page_change', {
                    from: currentUrl,
                    to: window.location.href,
                    timestamp: Date.now() - this.startTime
                });
                currentUrl = window.location.href;
            }
        }, 1000);
    }

    trackEvent(eventName, data) {
        const event = {
            event: eventName,
            data: data,
            sessionId: this.sessionId,
            timestamp: Date.now()
        };

        // Store in memory for batch sending
        if (!this.events) this.events = [];
        this.events.push(event);
    }

    startPeriodicSending() {
        // Send data every 30 seconds
        setInterval(() => {
            if (this.isRecording) {
                this.sendHeatmapData();
            }
        }, 30000);
    }

    isHeatmapEndpointAvailable() {
        // Check if we're in development
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            return true;
        }
        
        // For production, check if we've confirmed the endpoint exists
        return this.heatmapEndpointAvailable !== false;
    }

    sendHeatmapData() {
        if (this.clicks.length === 0 && this.moves.length === 0 && this.scrolls.length === 0) {
            return;
        }

        const data = {
            sessionId: this.sessionId,
            url: window.location.href,
            timestamp: new Date().toISOString(),
            clicks: this.clicks.slice(),
            moves: this.moves.slice(),
            scrolls: this.scrolls.slice(),
            events: this.events.slice(),
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            }
        };

        // Clear data for next batch
        this.clicks = [];
        this.moves = [];
        this.scrolls = [];
        this.events = [];

        // Send to server only if endpoint is available
        if (this.isHeatmapEndpointAvailable()) {
            fetch('/api/heatmap', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            }).catch(err => {
                // Mark endpoint as unavailable if it fails
                this.heatmapEndpointAvailable = false;
                if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                    console.warn('Heatmap send failed:', err);
                }
            });
        }
    }

    // Generate heatmap visualization (for development)
    generateHeatmap() {
        if (this.clicks.length === 0) return;

        const canvas = document.createElement('canvas');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            pointer-events: none;
            z-index: 9999;
            opacity: 0.7;
        `;

        const ctx = canvas.getContext('2d');
        
        // Draw heatmap
        this.clicks.forEach(click => {
            const gradient = ctx.createRadialGradient(click.x, click.y, 0, click.x, click.y, 50);
            gradient.addColorStop(0, 'rgba(255, 0, 0, 0.8)');
            gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(click.x - 25, click.y - 25, 50, 50);
        });

        document.body.appendChild(canvas);

        // Remove after 5 seconds
        setTimeout(() => {
            canvas.remove();
        }, 5000);
    }

    // Public methods
    stopRecording() {
        this.isRecording = false;
    }

    resumeRecording() {
        if (localStorage.getItem('prism_heatmap_consent') === 'true') {
            this.startRecording();
        }
    }

    clearData() {
        this.clicks = [];
        this.moves = [];
        this.scrolls = [];
        this.events = [];
    }
}

// Initialize heatmap tracker
window.heatmapTracker = new HeatmapTracker();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HeatmapTracker;
} 