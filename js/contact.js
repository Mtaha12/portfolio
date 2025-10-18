// ===== CONTACT FORM HANDLING =====

// ===== CONTACT FORM CONFIGURATION =====
const contactConfig = {
    formspreeEndpoint: 'https://formspree.io/f/xyznorpd', // Replace with your Formspree ID
    emailjsServiceID: 'service_your_id', // Replace with your EmailJS service ID
    emailjsTemplateID: 'template_your_id', // Replace with your EmailJS template ID
    emailjsPublicKey: 'your_public_key', // Replace with your EmailJS public key
    useEmailJS: false, // Set to true if using EmailJS instead of Formspree
    successMessage: 'Thank you! Your message has been sent successfully.',
    errorMessage: 'Sorry, there was an error sending your message. Please try again.',
    validationMessages: {
        name: 'Please enter your name',
        email: 'Please enter a valid email address',
        subject: 'Please enter a subject',
        message: 'Please enter your message'
    }
};

// ===== CONTACT FORM INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    initializeContactForm();
    initializeFormValidation();
    initializeContactMethods();
    initializeSocialLinks();
    initializeContactMap();
    initializeContactStats();
    addNotificationStyles();
});

// ===== CONTACT FORM SETUP =====
function initializeContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;
    
    // Add form fields dynamically for better control
    const formFields = [
        { name: 'name', type: 'text', placeholder: 'Your Name', required: true },
        { name: 'email', type: 'email', placeholder: 'Your Email', required: true },
        { name: 'phone', type: 'tel', placeholder: 'Your Phone (Optional)', required: false },
        { name: 'subject', type: 'text', placeholder: 'Subject', required: true },
        { name: 'message', type: 'textarea', placeholder: 'Your Message', required: true }
    ];
    
    // Create form fields
    contactForm.innerHTML = formFields.map(field => createFormField(field)).join('') + 
        '<button type="submit" class="btn btn-primary"><span>Send Message</span><i class="fas fa-paper-plane"></i></button>';
    
    // Form submission handler
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (!validateContactForm()) {
            return;
        }
        
        const formData = new FormData(contactForm);
        const submitButton = contactForm.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.innerHTML;
        
        // Show loading state
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        submitButton.disabled = true;
        
        try {
            // Send form data
            const response = await sendFormData(formData);
            
            if (response.success) {
                showSuccessMessage();
                contactForm.reset();
                resetFormValidation();
                trackContactFormSubmission();
            } else {
                throw new Error(response.error || 'Failed to send message');
            }
        } catch (error) {
            showErrorMessage(error.message);
            console.error('Contact form error:', error);
        } finally {
            // Reset button state
            submitButton.innerHTML = originalButtonText;
            submitButton.disabled = false;
        }
    });
}

// ===== CREATE FORM FIELD =====
function createFormField(field) {
    const fieldId = `contact-${field.name}`;
    
    if (field.type === 'textarea') {
        return `
            <div class="form-group">
                <label for="${fieldId}" class="form-label">${field.placeholder}</label>
                <textarea 
                    id="${fieldId}"
                    name="${field.name}" 
                    placeholder="${field.placeholder}"
                    ${field.required ? 'required' : ''}
                    rows="5"
                    class="form-control"
                ></textarea>
                <span class="error-message"></span>
            </div>
        `;
    } else {
        return `
            <div class="form-group">
                <label for="${fieldId}" class="form-label">${field.placeholder}</label>
                <input 
                    id="${fieldId}"
                    type="${field.type}" 
                    name="${field.name}" 
                    placeholder="${field.placeholder}"
                    ${field.required ? 'required' : ''}
                    class="form-control"
                >
                <span class="error-message"></span>
            </div>
        `;
    }
}

// ===== FORM VALIDATION =====
function initializeFormValidation() {
    const form = document.getElementById('contactForm');
    if (!form) return;
    
    const inputs = form.querySelectorAll('input, textarea');
    
    inputs.forEach(input => {
        // Real-time validation
        input.addEventListener('blur', function() {
            validateField(this);
        });
        
        input.addEventListener('input', function() {
            if (this.classList.contains('error')) {
                validateField(this);
            }
            
            // Auto-resize textarea
            if (this.tagName === 'TEXTAREA') {
                autoResizeTextarea(this);
            }
        });
        
        // Input animation
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            if (!this.value.trim()) {
                this.parentElement.classList.remove('focused');
            }
        });
    });
}

// ===== VALIDATE CONTACT FORM =====
function validateContactForm() {
    const form = document.getElementById('contactForm');
    const inputs = form.querySelectorAll('input[required], textarea[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!validateField(input)) {
            isValid = false;
        }
    });
    
    return isValid;
}

// ===== VALIDATE INDIVIDUAL FIELD =====
function validateField(field) {
    const value = field.value.trim();
    const fieldName = field.name;
    
    // Remove previous error
    removeFieldError(field);
    
    // Check if field is required and empty
    if (field.hasAttribute('required') && !value) {
        showFieldError(field, contactConfig.validationMessages[fieldName] || 'This field is required');
        return false;
    }
    
    // Field-specific validation
    switch (fieldName) {
        case 'name':
            if (value.length < 2) {
                showFieldError(field, 'Name must be at least 2 characters long');
                return false;
            }
            if (!/^[a-zA-Z\s]+$/.test(value)) {
                showFieldError(field, 'Name can only contain letters and spaces');
                return false;
            }
            break;
            
        case 'email':
            if (!isValidEmail(value)) {
                showFieldError(field, contactConfig.validationMessages.email);
                return false;
            }
            break;
            
        case 'phone':
            if (value && !isValidPhone(value)) {
                showFieldError(field, 'Please enter a valid phone number');
                return false;
            }
            break;
            
        case 'subject':
            if (value.length < 5) {
                showFieldError(field, 'Subject must be at least 5 characters long');
                return false;
            }
            break;
            
        case 'message':
            if (value.length < 10) {
                showFieldError(field, 'Message must be at least 10 characters long');
                return false;
            }
            break;
    }
    
    // Add success state
    field.parentElement.classList.add('success');
    return true;
}

// ===== SHOW FIELD ERROR =====
function showFieldError(field, message) {
    field.classList.add('error');
    field.parentElement.classList.add('error');
    
    const errorSpan = field.parentElement.querySelector('.error-message');
    if (errorSpan) {
        errorSpan.textContent = message;
        errorSpan.style.display = 'block';
    }
    
    // Add shake animation
    field.parentElement.classList.add('shake');
    setTimeout(() => {
        field.parentElement.classList.remove('shake');
    }, 500);
}

// ===== REMOVE FIELD ERROR =====
function removeFieldError(field) {
    field.classList.remove('error');
    field.parentElement.classList.remove('error', 'success');
    
    const errorSpan = field.parentElement.querySelector('.error-message');
    if (errorSpan) {
        errorSpan.textContent = '';
        errorSpan.style.display = 'none';
    }
}

// ===== RESET FORM VALIDATION =====
function resetFormValidation() {
    const form = document.getElementById('contactForm');
    if (!form) return;
    
    const inputs = form.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.parentElement.classList.remove('focused', 'success');
        removeFieldError(input);
    });
}

// ===== VALIDATION HELPERS =====
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
    return /^[\d\s\-\+\(\)]+$/.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

// ===== AUTO RESIZE TEXTAREA =====
function autoResizeTextarea(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
}

// ===== SEND FORM DATA =====
async function sendFormData(formData) {
if (contactConfig.useEmailJS) {
return await sendWithEmailJS(formData);
} else {
return await sendWithFormspree(formData);
}
}
// ===== SEND WITH FORMSPREE =====
async function sendWithFormspree(formData) {
try {
const response = await fetch(contactConfig.formspreeEndpoint, {
method: 'POST',
body: formData,
headers: {
'Accept': 'application/json'
}
});
    if (response.ok) {
        return { success: true };
    } else {
        const errorData = await response.json();
        return { success: false, error: errorData.error || 'Failed to send message' };
    }
} catch (error) {
    return { success: false, error: error.message };
}
}
// ===== SEND WITH EMAILJS =====
async function sendWithEmailJS(formData) {
try {
// Load EmailJS library if not already loaded
if (typeof emailjs === 'undefined') {
await loadEmailJS();
}
    emailjs.init(contactConfig.emailjsPublicKey);

    const templateParams = {
        from_name: formData.get('name'),
        from_email: formData.get('email'),
        phone: formData.get('phone') || 'Not provided',
        subject: formData.get('subject'),
        message: formData.get('message'),
        to_name: 'Muhammad Taha',
        reply_to: formData.get('email')
    };

    const response = await emailjs.send(
        contactConfig.emailjsServiceID,
        contactConfig.emailjsTemplateID,
        templateParams
    );

    if (response.status === 200) {
        return { success: true };
    } else {
        return { success: false, error: 'Failed to send email' };
    }
} catch (error) {
    return { success: false, error: error.message };
}
}
// ===== LOAD EMAILJS LIBRARY =====
function loadEmailJS() {
return new Promise((resolve, reject) => {
const script = document.createElement('script');
script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js';
script.onload = resolve;
script.onerror = reject;
document.head.appendChild(script);
});
}
// ===== SHOW SUCCESS MESSAGE =====
function showSuccessMessage() {
const successNotification = document.createElement('div');
successNotification.className = 'notification notification-success';
    successNotification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-check-circle"></i>
            <div>
                <h4>Success!</h4>
                <p>${contactConfig.successMessage}</p>
            </div>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    document.body.appendChild(successNotification);

// Auto-remove after 5 seconds
setTimeout(() => {
    if (successNotification.parentElement) {
        successNotification.remove();
    }
}, 5000);

// Add animation
setTimeout(() => {
    successNotification.classList.add('show');
}, 100);
}
// ===== SHOW ERROR MESSAGE =====
function showErrorMessage(message) {
const errorNotification = document.createElement('div');
errorNotification.className = 'notification notification-error';
    errorNotification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-exclamation-circle"></i>
            <div>
                <h4>Error!</h4>
                <p>${message || contactConfig.errorMessage}</p>
            </div>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    document.body.appendChild(errorNotification);

// Auto-remove after 5 seconds
setTimeout(() => {
    if (errorNotification.parentElement) {
        errorNotification.remove();
    }
}, 5000);

// Add animation
setTimeout(() => {
    errorNotification.classList.add('show');
}, 100);
}
// ===== INITIALIZE CONTACT METHODS =====
function initializeContactMethods() {
const contactMethods = document.querySelectorAll('.contact-method');
contactMethods.forEach(method => {
    method.addEventListener('click', function() {
        const type = this.getAttribute('data-type');
        const value = this.getAttribute('data-value');
        
        if (type && value) {
            handleContactMethodClick(type, value);
        }
    });
});
}
// ===== HANDLE CONTACT METHOD CLICK =====
function handleContactMethodClick(type, value) {
switch (type) {
case 'email':
copyToClipboard(value);
showNotification('Email copied to clipboard!', 'success');
break;
    case 'phone':
        copyToClipboard(value);
        showNotification('Phone number copied to clipboard!', 'success');
        break;
        
    case 'location':
        openInGoogleMaps(value);
        break;
}
}
// ===== COPY TO CLIPBOARD =====
function copyToClipboard(text) {
if (navigator.clipboard) {
navigator.clipboard.writeText(text).then(() => {
showNotification('Copied to clipboard!', 'success');
}).catch(() => {
fallbackCopyToClipboard(text);
});
} else {
fallbackCopyToClipboard(text);
}
}
// ===== FALLBACK COPY TO CLIPBOARD =====
function fallbackCopyToClipboard(text) {
const textArea = document.createElement('textarea');
textArea.value = text;
textArea.style.position = 'fixed';
textArea.style.left = '-999999px';
document.body.appendChild(textArea);
textArea.focus();
textArea.select();
try {
    document.execCommand('copy');
    showNotification('Copied to clipboard!', 'success');
} catch (err) {
    showNotification('Failed to copy text', 'error');
}

document.body.removeChild(textArea);
}
// ===== OPEN IN GOOGLE MAPS =====
function openInGoogleMaps(location) {
const encodedLocation = encodeURIComponent(location);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedLocation}`, '_blank');
}
// ===== SHOW NOTIFICATION =====
function showNotification(message, type = 'info') {
const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <p>${message}</p>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    document.body.appendChild(notification);

// Auto-remove after 3 seconds
setTimeout(() => {
    if (notification.parentElement) {
        notification.remove();
    }
}, 3000);

// Add animation
setTimeout(() => {
    notification.classList.add('show');
}, 100);
}
// ===== INITIALIZE SOCIAL LINKS =====
function initializeSocialLinks() {
const socialLinks = document.querySelectorAll('.social-links a');
socialLinks.forEach(link => {
    link.addEventListener('click', function(e) {
        // Only prevent default for external links
        if (this.href.includes('http')) {
            e.preventDefault();
            const platform = this.getAttribute('data-platform') || this.querySelector('i').classList[1].split('-')[1];
            const url = this.href;
            
            openSocialPlatform(platform, url);
        }
    });
});
}
// ===== OPEN SOCIAL PLATFORM =====
function openSocialPlatform(platform, url) {
// Track social media click
trackSocialClick(platform);
// Open in new tab
window.open(url, '_blank', 'noopener,noreferrer');
}
// ===== INITIALIZE CONTACT MAP =====
function initializeContactMap() {
const mapContainer = document.getElementById('contactMap');
if (!mapContainer) return;
// Create a simple interactive map
mapContainer.innerHTML = `
    <div class="map-placeholder">
        <i class="fas fa-map-marker-alt"></i>
        <p>Click to view location</p>
    </div>
`;

mapContainer.addEventListener('click', function() {
    const location = this.getAttribute('data-location') || 'Karachi, Pakistan';
    openInGoogleMaps(location);
});
}
// ===== INITIALIZE CONTACT STATS =====
function initializeContactStats() {
const statsContainer = document.querySelector('.contact-stats');
if (!statsContainer) return;
// Animate stats on scroll
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateContactStats();
            observer.unobserve(entry.target);
        }
    });
});

observer.observe(statsContainer);
}
// ===== ANIMATE CONTACT STATS =====
function animateContactStats() {
const stats = document.querySelectorAll('.contact-stat-number');
stats.forEach(stat => {
    const target = parseInt(stat.getAttribute('data-target'));
    const increment = target / 100;
    let current = 0;
    
    const updateStat = () => {        current += increment;
        if (current < target) {
            stat.textContent = Math.ceil(current);
            requestAnimationFrame(updateStat);
        } else {
            stat.textContent = target;
        }
    };
    
    updateStat();
});
}
// ===== TRACK CONTACT FORM SUBMISSION =====
function trackContactFormSubmission() {
// Google Analytics tracking
if (typeof gtag !== 'undefined') {
gtag('event', 'contact_form_submit', {
'event_category': 'Contact',
'event_label': 'Form Submission',
'value': 1
});
}
// Facebook Pixel tracking
if (typeof fbq !== 'undefined') {
    fbq('track', 'Contact');
}
}
// ===== TRACK SOCIAL CLICK =====
function trackSocialClick(platform) {
// Google Analytics tracking
if (typeof gtag !== 'undefined') {
gtag('event', 'social_click', {
'event_category': 'Social Media',
'event_label': platform,
'value': 1
});
}
}
// ===== ADD NOTIFICATION STYLES =====
function addNotificationStyles() {
const styles = `
<style>
.notification.show {
    transform: translateX(0);
}

.notification-success {
    border-left: 4px solid #10b981;
}

.notification-error {
    border-left: 4px solid #ef4444;
}

.notification-info {
    border-left: 4px solid #3b82f6;
}

.notification-content {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
}

.notification i {
    font-size: 20px;
}

.notification-success i {
    color: #10b981;
}

.notification-error i {
    color: #ef4444;
}

.notification-info i {
    color: #3b82f6;
}

.notification-close {
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
    color: #6b7280;
    transition: color 0.2s;
}

.notification-close:hover {
    color: #374151;
}

.form-group {
    position: relative;
    margin-bottom: 1.5rem;
}

.form-label {
    position: absolute;
    top: 0.75rem;
    left: 1rem;
    background: white;
    padding: 0 0.25rem;
    color: #6b7280;
    font-size: 0.875rem;
    transition: all 0.2s ease;
    pointer-events: none;
}

.form-control {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    font-family: inherit;
    font-size: 1rem;
    transition: all 0.2s ease;
    background: white;
}

.form-control:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-group.focused .form-label {
    top: -0.5rem;
    left: 0.75rem;
    font-size: 0.75rem;
    color: #3b82f6;
}

.form-group.error .form-control {
    border-color: #ef4444;
}

.form-group.success .form-control {
    border-color: #10b981;
}

.error-message {
    display: none;
    color: #ef4444;
    font-size: 0.875rem;
    margin-top: 0.25rem;
}

.shake {
    animation: shake 0.5s ease-in-out;
}

@keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
}

[data-theme="dark"] .notification {
    background: #1f2937;
    color: white;
}

[data-theme="dark"] .form-control {
    background: #374151;
    border-color: #4b5563;
    color: white;
}

[data-theme="dark"] .form-label {
    background: #374151;
    color: #d1d5db;
}

[data-theme="dark"] .form-group.focused .form-label {
    color: #60a5fa;
}

[data-theme="dark"] .notification-close:hover {
    color: #d1d5db;
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', styles);
}
// ===== UTILITY FUNCTIONS =====
function debounce(func, wait) {
let timeout;
return function executedFunction(...args) {
const later = () => {
clearTimeout(timeout);
func(...args);
};
clearTimeout(timeout);
timeout = setTimeout(later, wait);
};
}
// ===== EXPORT FUNCTIONS =====
window.contactModule = {
showNotification,
copyToClipboard,
openInGoogleMaps,
validateContactForm,
sendFormData
};