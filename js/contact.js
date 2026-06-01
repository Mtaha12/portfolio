/* ==========================================================================
   MUHAMMAD TAHA PORTFOLIO - CONTACT FORM & ANALYTICS MANAGER
   ========================================================================== */

const contactConfig = {
    // IMPORTANT: Setup your EmailJS details below to send emails via SMTP.
    // Register for free at https://www.emailjs.com/
    emailjsServiceID: 'service_your_id',     // Replace with your Service ID
    emailjsTemplateID: 'template_your_id',   // Replace with your Template ID
    emailjsPublicKey: 'your_public_key',     // Replace with your Public Key
    fallbackEmail: 'mtaha2004.22.2@gmail.com'
};

document.addEventListener('DOMContentLoaded', () => {
    initContactForm();
    initCopyDetails();
});

// ===== CONTACT FORM CONTROLLER =====
function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    // Real-time input line styling and validation reset on typing
    const inputs = form.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            const group = input.closest('.form-group-custom');
            if (group) group.classList.remove('error-state');
        });
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // 1. Validation check
        const isValid = validateForm(form);
        if (!isValid) {
            showToast('Validation Error', 'Please check your inputs and try again.', 'error');
            return;
        }

        const submitBtn = form.querySelector('.form-submit-btn');
        const submitBtnSpan = submitBtn.querySelector('span');
        const originalText = submitBtnSpan.textContent;
        
        // Show loading state
        submitBtnSpan.textContent = 'Sending Message...';
        submitBtn.disabled = true;

        const formData = {
            name: document.getElementById('contactName').value.trim(),
            email: document.getElementById('contactEmailInput').value.trim(),
            subject: document.getElementById('contactSubject').value.trim(),
            message: document.getElementById('contactMessage').value.trim()
        };

        // 2. EmailJS Service Check & Transmit
        const isCredentialsPlaceholder = 
            contactConfig.emailjsServiceID === 'service_your_id' || 
            contactConfig.emailjsPublicKey === 'your_public_key';

        if (isCredentialsPlaceholder) {
            // Edge-case Fallback: If credentials aren't set, trigger client-side mailto to guarantee delivery
            console.warn('EmailJS public credentials are not configured yet. Falling back to local mail client.');
            triggerMailtoFallback(formData);
            
            showToast('Redirecting...', 'Opening your default mail app to send the message.', 'success');
            form.reset();
            resetFormActiveStates();
            submitBtnSpan.textContent = originalText;
            submitBtn.disabled = false;
            
            // Track fallback GA Event
            trackGAEvent('contact_form_fallback', 'Contact', 'Mailto Trigger');
            return;
        }

        try {
            // Load and init EmailJS dynamically
            if (typeof emailjs === 'undefined') {
                await loadScript('https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js');
            }
            
            emailjs.init(contactConfig.emailjsPublicKey);

            const response = await emailjs.send(
                contactConfig.emailjsServiceID,
                contactConfig.emailjsTemplateID,
                {
                    from_name: formData.name,
                    from_email: formData.email,
                    subject: formData.subject,
                    message: formData.message,
                    to_name: 'Muhammad Taha',
                    reply_to: formData.email
                }
            );

            if (response.status === 200) {
                showToast('Success!', 'Your message has been sent successfully.', 'success');
                form.reset();
                resetFormActiveStates();
                
                // Track GA Event
                trackGAEvent('contact_form_success', 'Contact', 'EmailJS Send');
            } else {
                throw new Error('Server returned error code: ' + response.status);
            }

        } catch (err) {
            console.error('Email transmission error:', err);
            showToast('Send Failed', 'SMTP server failed. Redirecting to mail app...', 'error');
            
            // If server fails, fallback to mailto so the recruiter is never blocked
            setTimeout(() => {
                triggerMailtoFallback(formData);
            }, 1500);

            trackGAEvent('contact_form_failed', 'Contact', err.message || 'Error');
        } finally {
            submitBtnSpan.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
}

// Validation Logic
function validateForm(form) {
    let isValid = true;

    const name = document.getElementById('contactName');
    const email = document.getElementById('contactEmailInput');
    const subject = document.getElementById('contactSubject');
    const message = document.getElementById('contactMessage');

    // Name Validation
    if (name.value.trim().length < 2) {
        setFieldError(name);
        isValid = false;
    }

    // Email Validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email.value.trim())) {
        setFieldError(email);
        isValid = false;
    }

    // Subject Validation
    if (subject.value.trim().length < 3) {
        setFieldError(subject);
        isValid = false;
    }

    // Message Validation
    if (message.value.trim().length < 10) {
        setFieldError(message);
        isValid = false;
    }

    return isValid;
}

function setFieldError(element) {
    const group = element.closest('.form-group-custom');
    if (group) {
        group.classList.add('error-state');
        // Add shake visual animation
        group.classList.add('shake');
        setTimeout(() => group.classList.remove('shake'), 500);
    }
}

function resetFormActiveStates() {
    const groups = document.querySelectorAll('.form-group-custom');
    groups.forEach(g => g.classList.remove('error-state'));
}

// Mailto Fallback Generator
function triggerMailtoFallback(data) {
    const subject = encodeURIComponent(`[Portfolio Contact] ${data.subject}`);
    const body = encodeURIComponent(`Hi Taha,\n\nMy name is ${data.name} (${data.email}).\n\n${data.message}`);
    window.location.href = `mailto:${contactConfig.fallbackEmail}?subject=${subject}&body=${body}`;
}

// ===== DYNAMIC COPY DETECT CONTROLLER =====
function initCopyDetails() {
    const emailCard = document.getElementById('contactEmail');
    const phoneCard = document.getElementById('contactPhone');

    if (emailCard) {
        emailCard.addEventListener('click', (e) => {
            const email = 'mtaha2004.22.2@gmail.com';
            copyTextToClipboard(email, 'Email copied to clipboard!');
        });
    }

    if (phoneCard) {
        phoneCard.addEventListener('click', (e) => {
            const phone = '+923258651536';
            copyTextToClipboard(phone, 'Phone number copied to clipboard!');
        });
    }
}

function copyTextToClipboard(text, successMsg) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            showToast('Copied!', successMsg, 'success');
        }).catch(err => {
            fallbackCopy(text, successMsg);
        });
    } else {
        fallbackCopy(text, successMsg);
    }
}

function fallbackCopy(text, successMsg) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed'; // Avoid scrolling
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
        document.execCommand('copy');
        showToast('Copied!', successMsg, 'success');
    } catch (err) {
        console.error('Fallback copy fail:', err);
    }
    document.body.removeChild(textArea);
}

// ===== AWWWARDS CUSTOM FLOATING TOASTS =====
function showToast(title, message, type = 'success') {
    // Remove existing toast if any to prevent overlapping
    const existing = document.querySelector('.notification-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `notification-toast glass-panel ${type}`;
    
    let iconClass = 'fa-circle-check';
    if (type === 'error') iconClass = 'fa-circle-exclamation';
    if (type === 'info') iconClass = 'fa-circle-info';

    toast.innerHTML = `
        <i class="fa-solid ${iconClass}"></i>
        <div class="notification-toast-content">
            <h4>${title}</h4>
            <p>${message}</p>
        </div>
    `;

    document.body.appendChild(toast);

    // GSAP show
    gsap.to(toast, {
        x: 0,
        opacity: 1,
        duration: 0.5,
        ease: "power3.out",
        onStart: () => {
            toast.classList.add('show');
        }
    });

    // Auto dismiss
    setTimeout(() => {
        gsap.to(toast, {
            x: -100,
            opacity: 0,
            duration: 0.5,
            ease: "power3.in",
            onComplete: () => toast.remove()
        });
    }, 4000);
}

// ===== UTILITIES =====
function loadScript(src) {
    return new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = src;
        s.onload = resolve;
        s.onerror = reject;
        document.head.appendChild(s);
    });
}

function trackGAEvent(eventName, category, label) {
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, {
            'event_category': category,
            'event_label': label
        });
    }
}