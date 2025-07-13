// Enhanced Form Handler with Unified Button System
class FormHandler {
    constructor() {
        this.forms = document.querySelectorAll('form');
        this.init();
    }

    init() {
        this.forms.forEach(form => {
            // Use unified button system instead of duplicating logic
            const submitButton = form.querySelector('button[type="submit"]');
            if (submitButton) {
                // The unified button system in app.js handles this
                // No need to duplicate the loading state logic here
                console.log('Form handler initialized - using unified button system');
            }
        });
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

    async submitForm(form, formData) {
        // This method can be overridden for different submission endpoints
        // For now, simulate submission
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulate random success/failure for testing
                if (Math.random() > 0.1) {
                    resolve({ success: true, message: 'Form submitted successfully' });
                } else {
                    reject(new Error('Network error'));
                }
            }, 1500);
        });
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const formHandler = new FormHandler();
    
    // Expose utility functions to global scope for unified system
    window.formHandler = formHandler;
}); 