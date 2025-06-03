/**
 * CareerShala - Main JavaScript File
 * Handles common functionality across all pages
 */

// Global variables
window.CareerShala = {
    state: null,
    sector: null,
    career: null,
    cache: new Map()
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

/**
 * Initialize the application
 */
function initializeApp() {
    // Set up global event listeners
    setupGlobalEventListeners();
    
    // Initialize tooltips if Bootstrap tooltips are available
    if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }
    
    // Add smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Initialize page-specific functionality
    initializePageSpecific();
}

/**
 * Set up global event listeners
 */
function setupGlobalEventListeners() {
    // Handle network errors
    window.addEventListener('offline', function() {
        showNotification('You are currently offline. Some features may not work.', 'warning');
    });
    
    window.addEventListener('online', function() {
        showNotification('Connection restored.', 'success');
    });
    
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', function(event) {
        console.error('Unhandled promise rejection:', event.reason);
        showNotification('An unexpected error occurred. Please try again.', 'danger');
    });
}

/**
 * Initialize page-specific functionality based on current page
 */
function initializePageSpecific() {
    const path = window.location.pathname;
    
    switch(path) {
        case '/':
            initializeHomePage();
            break;
        case '/sectors':
            initializeSectorsPage();
            break;
        case '/careers':
            initializeCareersPage();
            break;
        case '/career-detail':
            initializeCareerDetailPage();
            break;
        default:
            break;
    }
}

/**
 * Initialize home page functionality
 */
function initializeHomePage() {
    // Add keyboard navigation for state selection
    document.querySelectorAll('.state-btn').forEach(button => {
        button.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });
}

/**
 * Initialize sectors page functionality
 */
function initializeSectorsPage() {
    // Get state from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const state = urlParams.get('state');
    
    if (state) {
        window.CareerShala.state = state;
        // Additional sectors page initialization can go here
    }
}

/**
 * Initialize careers page functionality
 */
function initializeCareersPage() {
    // Get parameters from URL
    const urlParams = new URLSearchParams(window.location.search);
    const state = urlParams.get('state');
    const sector = urlParams.get('sector');
    
    if (state && sector) {
        window.CareerShala.state = state;
        window.CareerShala.sector = sector;
        // Additional careers page initialization can go here
    }
}

/**
 * Initialize career detail page functionality
 */
function initializeCareerDetailPage() {
    // Get parameters from URL
    const urlParams = new URLSearchParams(window.location.search);
    const state = urlParams.get('state');
    const sector = urlParams.get('sector');
    const career = urlParams.get('career');
    
    if (state && sector && career) {
        window.CareerShala.state = state;
        window.CareerShala.sector = sector;
        window.CareerShala.career = career;
        // Additional career detail page initialization can go here
    }
}

/**
 * Utility function to make API calls with caching
 */
async function apiCall(url, options = {}) {
    const cacheKey = `${url}_${JSON.stringify(options)}`;
    
    // Check cache first
    if (window.CareerShala.cache.has(cacheKey)) {
        return window.CareerShala.cache.get(cacheKey);
    }
    
    try {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Cache successful responses
        window.CareerShala.cache.set(cacheKey, data);
        
        return data;
    } catch (error) {
        console.error('API call failed:', error);
        throw error;
    }
}

/**
 * Show notification to user
 */
function showNotification(message, type = 'info', duration = 5000) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    notification.style.cssText = `
        top: 20px;
        right: 20px;
        z-index: 1050;
        min-width: 300px;
        max-width: 500px;
    `;
    
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto-remove after duration
    setTimeout(() => {
        if (notification.parentNode) {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 150);
        }
    }, duration);
}

/**
 * Utility function to get URL parameters
 */
function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

/**
 * Utility function to update URL parameters without page reload
 */
function updateUrlParameter(key, value) {
    const url = new URL(window.location);
    url.searchParams.set(key, value);
    window.history.pushState({}, '', url);
}

/**
 * Utility function to format currency
 */
function formatCurrency(amount, currency = '₹') {
    if (typeof amount === 'string') {
        return amount; // Already formatted
    }
    return `${currency}${amount.toLocaleString('en-IN')}`;
}

/**
 * Utility function to debounce function calls
 */
function debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            if (!immediate) func(...args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func(...args);
    };
}

/**
 * Utility function to throttle function calls
 */
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Load and display loading state
 */
function showLoading(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `
            <div class="text-center py-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-3 text-muted">Loading...</p>
            </div>
        `;
    }
}

/**
 * Hide loading state
 */
function hideLoading(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
        const loadingElement = container.querySelector('.spinner-border');
        if (loadingElement) {
            loadingElement.closest('.text-center').remove();
        }
    }
}

/**
 * Error handling utility
 */
function handleError(error, containerId = null, message = 'An error occurred. Please try again.') {
    console.error('Error:', error);
    
    if (containerId) {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = `
                <div class="alert alert-danger" role="alert">
                    <i data-feather="alert-circle" class="me-2"></i>
                    ${message}
                </div>
            `;
            // Re-initialize feather icons
            if (typeof feather !== 'undefined') {
                feather.replace();
            }
        }
    } else {
        showNotification(message, 'danger');
    }
}

/**
 * Accessibility helpers
 */
function announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.style.cssText = `
        position: absolute;
        left: -10000px;
        width: 1px;
        height: 1px;
        overflow: hidden;
    `;
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
        document.body.removeChild(announcement);
    }, 1000);
}

/**
 * Focus management for better accessibility
 */
function focusElement(selector) {
    const element = document.querySelector(selector);
    if (element) {
        element.focus();
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// Export functions for use in other scripts
window.CareerShala.utils = {
    apiCall,
    showNotification,
    getUrlParameter,
    updateUrlParameter,
    formatCurrency,
    debounce,
    throttle,
    showLoading,
    hideLoading,
    handleError,
    announceToScreenReader,
    focusElement
};

// Analytics helper (placeholder for future implementation)
window.CareerShala.analytics = {
    trackPageView: function(page) {
        console.log('Page view:', page);
        // Implement analytics tracking here
    },
    
    trackEvent: function(action, category, label) {
        console.log('Event:', { action, category, label });
        // Implement event tracking here
    }
};
