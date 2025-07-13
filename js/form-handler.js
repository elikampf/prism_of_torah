// Enhanced Form Handler with Unified Button System
class FormHandler {
    constructor() {
        this.forms = document.querySelectorAll('form');
        this.init();
    }

    init() {
        this.forms.forEach(form => {
            // Only handle forms with data-netlify attribute
            if (form.hasAttribute('data-netlify')) {
                form.addEventListener('submit', (e) => this.handleNetlifyForm(e));
            }
            
            const submitButton = form.querySelector('button[type="submit"]');
            if (submitButton) {
                console.log('Form handler initialized - using unified button system');
            }
        });
    }

    async handleNetlifyForm(e) {
        e.preventDefault();
        const form = e.target;
        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = submitButton ? submitButton.textContent : 'Submit';
        
        try {
            // Show loading state
            this.showLoadingState(form, submitButton);
            
            // Create FormData
            const formData = new FormData(form);
            
            // Submit to Netlify
            const response = await fetch('/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams(formData).toString()
            });
            
            if (response.ok) {
                this.showSuccessMessage(form, 'Thank you! Your message has been sent successfully.');
                form.reset();
            } else {
                throw new Error('Form submission failed');
            }
            
        } catch (error) {
            console.error('Form submission error:', error);
            this.showErrorMessage(form, 'Sorry, there was an error sending your message. Please try again.');
        } finally {
            // Reset button state
            setTimeout(() => {
                this.resetButtonState(submitButton, originalText);
            }, 2000);
        }
    }

    // Legacy methods kept for backward compatibility but delegated to unified system
    showLoadingState(form, submitButton) {
        // Delegate to unified system
        if (window.setButtonLoadingState) {
            window.setButtonLoadingState(submitButton, true);
        } else {
            // Fallback for backward compatibility
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.innerHTML = '<span class="loading-spinner loading-spinner-sm"></span> Submitting...';
            }
        }
    }

    resetButtonState(submitButton, originalText) {
        // Delegate to unified system
        if (window.setButtonLoadingState) {
            window.setButtonLoadingState(submitButton, false, originalText);
        } else {
            // Fallback for backward compatibility
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.innerHTML = originalText;
            }
        }
    }

    showSuccessMessage(form, message = 'Success! Your submission has been received.') {
        // Delegate to unified system
        if (window.showFormSuccess) {
            window.showFormSuccess(form);
        } else {
            // Fallback for backward compatibility
            const successMessage = document.createElement('div');
            successMessage.className = 'success-message';
            successMessage.innerHTML = `<span style="color: green;">✓ ${message}</span>`;
            form.appendChild(successMessage);
            
            setTimeout(() => {
                successMessage.remove();
            }, 5000);
        }
    }

    showErrorMessage(form, message = 'An error occurred. Please try again.') {
        // Delegate to unified system
        if (window.showFormError) {
            window.showFormError(form, message);
        } else {
            // Fallback for backward compatibility
            const errorMessage = document.createElement('div');
            errorMessage.className = 'error-message';
            errorMessage.innerHTML = `<span style="color: red;">⚠ ${message}</span>`;
            form.appendChild(errorMessage);
            
            setTimeout(() => {
                errorMessage.remove();
            }, 5000);
        }
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const formHandler = new FormHandler();
    
    // Expose utility functions to global scope for unified system
    window.formHandler = formHandler;
}); 