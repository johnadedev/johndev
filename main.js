// Main JavaScript file for John Dev Portfolio Website
// Handles theme detection, animations, form validation, interactions, and SEO-friendly functionality

class PortfolioApp {
    constructor() {
        this.isLoading = false;
        this.currentTheme = this.detectTheme();
        this.init();
    }

    init() {
        this.setupThemeDetection();
        this.setupNavigation();
        this.setupContactForm();
        this.setupProjectFilters();
        this.setupAnimations();
        this.setupParticleSystem();
        this.setupCarousels();
        this.setupScrollEffects();
        this.setupWhatsAppButton();
        this.setupAccessibility();
        this.setupPerformanceOptimizations();
    }

    // Theme Detection and Management
    detectTheme() {
        try {
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                return 'dark';
            }
            return 'light';
        } catch (error) {
            console.warn('Theme detection failed:', error);
            return 'light';
        }
    }

    setupThemeDetection() {
        // Apply initial theme
        this.applyTheme(this.currentTheme);

        // Listen for system theme changes
        if (window.matchMedia) {
            try {
                window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                    const newTheme = e.matches ? 'dark' : 'light';
                    this.applyTheme(newTheme);
                    this.currentTheme = newTheme;
                });
            } catch (error) {
                console.warn('Theme change detection failed:', error);
            }
        }
    }

    applyTheme(theme) {
        try {
            document.documentElement.setAttribute('data-theme', theme);
            
            // Update CSS custom properties
            const root = document.documentElement;
            if (theme === 'dark') {
                root.style.setProperty('--bg-primary', '#1a1a1a');
                root.style.setProperty('--bg-secondary', '#2d2d2d');
                root.style.setProperty('--text-primary', '#ffffff');
                root.style.setProperty('--text-secondary', '#a1a1aa');
            } else {
                root.style.setProperty('--bg-primary', '#ffffff');
                root.style.setProperty('--bg-secondary', '#f8fafc');
                root.style.setProperty('--text-primary', '#1a1a1a');
                root.style.setProperty('--text-secondary', '#6b7280');
            }
        } catch (error) {
            console.warn('Theme application failed:', error);
        }
    }

    // Navigation Management
    setupNavigation() {
        const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        const mobileMenu = document.querySelector('.mobile-menu');
        const navLinks = document.querySelectorAll('.nav-link');

        // Mobile menu toggle
        if (mobileMenuBtn && mobileMenu) {
            mobileMenuBtn.addEventListener('click', () => {
                const isActive = mobileMenu.classList.contains('active');
                mobileMenu.classList.toggle('active');
                mobileMenuBtn.setAttribute('aria-expanded', !isActive);
            });

            // Close mobile menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!mobileMenuBtn.contains(e.target) && !mobileMenu.contains(e.target)) {
                    mobileMenu.classList.remove('active');
                    mobileMenuBtn.setAttribute('aria-expanded', 'false');
                }
            });
        }

        // Smooth scrolling for anchor links
        navLinks.forEach(link => {
            if (link.getAttribute('href').startsWith('#')) {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const targetId = link.getAttribute('href').substring(1);
                    const targetElement = document.getElementById(targetId);
                    
                    if (targetElement) {
                        targetElement.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                        
                        // Update URL without jumping
                        history.pushState(null, null, `#${targetId}`);
                        
                        // Close mobile menu if open
                        if (mobileMenu) {
                            mobileMenu.classList.remove('active');
                            mobileMenuBtn.setAttribute('aria-expanded', 'false');
                        }
                    }
                });
            }
        });

        // Keyboard navigation for mobile menu
        if (mobileMenuBtn) {
            mobileMenuBtn.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
                    mobileMenu.classList.remove('active');
                    mobileMenuBtn.setAttribute('aria-expanded', 'false');
                    mobileMenuBtn.focus();
                }
            });
        }
    }

    // Contact Form Management
    setupContactForm() {
        const contactForm = document.getElementById('contact-form');
        if (!contactForm) return;

        const formInputs = contactForm.querySelectorAll('input, select, textarea');
        const submitBtn = document.getElementById('submit-btn');
        const submitText = submitBtn.querySelector('.submit-text');
        const loadingSpinner = submitBtn.querySelector('.loading-spinner');
        const successMessage = document.getElementById('success-message');
        const errorMessage = document.getElementById('error-message');
        const charCount = document.getElementById('char-count');
        const messageTextarea = document.getElementById('message');

        // Real-time validation
        formInputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldError(input));
        });

        // Character count for message
        if (messageTextarea && charCount) {
            messageTextarea.addEventListener('input', () => {
                const count = messageTextarea.value.length;
                charCount.textContent = count;
                
                if (count > 1000) {
                    messageTextarea.value = messageTextarea.value.substring(0, 1000);
                    charCount.textContent = '1000';
                }
            });
        }

        // Form submission
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (this.validateForm(contactForm)) {
                await this.submitForm(contactForm, submitBtn, submitText, loadingSpinner, successMessage, errorMessage);
            }
        });
    }

    validateField(field) {
        const value = field.value.trim();
        const fieldName = field.name;
        let isValid = true;
        let errorMessage = '';

        // Required field validation
        if (field.hasAttribute('required') && !value) {
            isValid = false;
            errorMessage = 'This field is required';
        }

        // Email validation
        if (fieldName === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid email address';
            }
        }

        // Message length validation
        if (fieldName === 'message' && value.length > 1000) {
            isValid = false;
            errorMessage = 'Message must be 1000 characters or less';
        }

        // Phone validation (if provided)
        if (fieldName === 'phone' && value) {
            const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
            if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
                isValid = false;
                errorMessage = 'Please enter a valid phone number';
            }
        }

        this.showFieldError(field, isValid, errorMessage);
        return isValid;
    }

    validateForm(form) {
        const requiredFields = form.querySelectorAll('[required]');
        let isFormValid = true;

        requiredFields.forEach(field => {
            if (!this.validateField(field)) {
                isFormValid = false;
            }
        });

        return isFormValid;
    }

    showFieldError(field, isValid, message) {
        const errorElement = field.parentNode.querySelector('.error-text');
        
        if (isValid) {
            field.classList.remove('error');
            if (errorElement) {
                errorElement.classList.add('hidden');
                errorElement.textContent = '';
            }
        } else {
            field.classList.add('error');
            if (errorElement) {
                errorElement.textContent = message;
                errorElement.classList.remove('hidden');
            }
        }
    }

    clearFieldError(field) {
        field.classList.remove('error');
        const errorElement = field.parentNode.querySelector('.error-text');
        if (errorElement) {
            errorElement.classList.add('hidden');
            errorElement.textContent = '';
        }
    }

    async submitForm(form, submitBtn, submitText, loadingSpinner, successMessage, errorMessage) {
        if (this.isLoading) return;

        this.isLoading = true;
        submitBtn.disabled = true;
        submitText.textContent = 'Sending...';
        loadingSpinner.classList.remove('hidden');

        if (successMessage) successMessage.classList.remove('show');
        if (errorMessage) errorMessage.classList.remove('show');

        const formData = new FormData(form);

        try {
            const response = await fetch('https://formspree.io/f/xzddbjro', {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (response.ok) {
                if (successMessage) {
                    successMessage.classList.add('show');
                    form.reset();
                    const charCount = document.getElementById('char-count');
                    if (charCount) charCount.textContent = '0';
                    
                    // Track successful submission for analytics
                    this.trackEvent('form_submission', 'success', 'contact_form');
                }
            } else {
                throw new Error('Formspree error');
            }
        } catch (error) {
            if (errorMessage) errorMessage.classList.add('show');
            console.error('Submission error:', error);
            
            // Track failed submission for analytics
            this.trackEvent('form_submission', 'error', 'contact_form');
        } finally {
            this.isLoading = false;
            submitBtn.disabled = false;
            submitText.textContent = 'Send Message';
            loadingSpinner.classList.add('hidden');

            setTimeout(() => {
                if (successMessage) successMessage.classList.remove('show');
                if (errorMessage) errorMessage.classList.remove('show');
            }, 10000);
        }
    }

    // Project Filters
    setupProjectFilters() {
        const filterButtons = document.querySelectorAll('.project-filter');
        const projectItems = document.querySelectorAll('.project-item');

        if (filterButtons.length === 0 || projectItems.length === 0) return;

        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                const filter = button.getAttribute('data-filter');
                
                // Update active button
                filterButtons.forEach(btn => {
                    btn.classList.remove('active');
                    btn.setAttribute('aria-pressed', 'false');
                });
                button.classList.add('active');
                button.setAttribute('aria-pressed', 'true');
                
                // Filter projects
                this.filterProjects(filter, projectItems);
                
                // Track filter usage for analytics
                this.trackEvent('project_filter', 'click', filter);
            });
        });
    }

    filterProjects(filter, projects) {
        projects.forEach(project => {
            const categories = project.getAttribute('data-category');
            
            if (filter === 'all' || (categories && categories.includes(filter))) {
                project.classList.remove('hidden');
            } else {
                project.classList.add('hidden');
            }
        });
    }

    // Animations with reduced motion support
    setupAnimations() {
        // Check for reduced motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        if (prefersReducedMotion) return;

        // Animate elements on scroll
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);

        // Observe elements for animation
        const animateElements = document.querySelectorAll('.card-hover, .timeline-item, .contact-info-card');
        animateElements.forEach(el => observer.observe(el));

        // Skill bars animation
        this.animateSkillBars();
    }

    animateSkillBars() {
        const skillBars = document.querySelectorAll('.skill-progress');
        if (skillBars.length === 0) return;
        
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) return;
        
        const skillObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const bar = entry.target;
                    const width = bar.style.width;
                    bar.style.width = '0%';
                    
                    setTimeout(() => {
                        bar.style.width = width;
                    }, 200);
                }
            });
        }, { threshold: 0.5 });

        skillBars.forEach(bar => skillObserver.observe(bar));
    }

    // Particle System for Hero Section
    setupParticleSystem() {
        const canvas = document.getElementById('particles-canvas');
        if (!canvas || typeof p5 === 'undefined') return;

        // Check for reduced motion
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) return;

        try {
            new p5((p) => {
                let particles = [];
                const numParticles = 50;

                p.setup = () => {
                    const canvas = p.createCanvas(window.innerWidth, window.innerHeight);
                    canvas.parent('particles-canvas');
                    
                    // Create particles
                    for (let i = 0; i < numParticles; i++) {
                        particles.push(new Particle(p));
                    }
                };

                p.draw = () => {
                    p.clear();
                    
                    // Update and display particles
                    particles.forEach(particle => {
                        particle.update();
                        particle.display();
                    });
                    
                    // Connect nearby particles
                    this.connectParticles(p, particles);
                };

                p.windowResized = () => {
                    p.resizeCanvas(window.innerWidth, window.innerHeight);
                };

                class Particle {
                    constructor(p) {
                        this.p = p;
                        this.x = p.random(p.width);
                        this.y = p.random(p.height);
                        this.vx = p.random(-0.5, 0.5);
                        this.vy = p.random(-0.5, 0.5);
                        this.size = p.random(2, 4);
                        this.opacity = p.random(0.3, 0.8);
                    }

                    update() {
                        this.x += this.vx;
                        this.y += this.vy;

                        // Wrap around edges
                        if (this.x < 0) this.x = this.p.width;
                        if (this.x > this.p.width) this.x = 0;
                        if (this.y < 0) this.y = this.p.height;
                        if (this.y > this.p.height) this.y = 0;
                    }

                    display() {
                        this.p.fill(245, 158, 11, this.opacity * 255);
                        this.p.noStroke();
                        this.p.ellipse(this.x, this.y, this.size);
                    }
                }
            });
        } catch (error) {
            console.warn('Particle system initialization failed:', error);
        }
    }

    connectParticles(p, particles) {
        const maxDistance = 100;
        
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const distance = p.dist(
                    particles[i].x, particles[i].y,
                    particles[j].x, particles[j].y
                );
                
                if (distance < maxDistance) {
                    const opacity = p.map(distance, 0, maxDistance, 0.3, 0);
                    p.stroke(245, 158, 11, opacity * 255);
                    p.strokeWeight(1);
                    p.line(
                        particles[i].x, particles[i].y,
                        particles[j].x, particles[j].y
                    );
                }
            }
        }
    }

    // Carousels
    setupCarousels() {
        // Project carousel
        const projectCarousel = document.getElementById('project-carousel');
        if (projectCarousel && typeof Splide !== 'undefined') {
            try {
                new Splide(projectCarousel, {
                    type: 'loop',
                    autoplay: true,
                    interval: 4000,
                    pauseOnHover: true,
                    arrows: true,
                    pagination: true,
                    gap: '1rem',
                    keyboard: true,
                    a11y: {
                        enabled: true,
                        prev: 'Previous slide',
                        next: 'Next slide',
                        slideLabel: 'Slide %d of %d'
                    }
                }).mount();
            } catch (error) {
                console.warn('Carousel initialization failed:', error);
            }
        }
    }

    // Scroll Effects
    setupScrollEffects() {
        // Smooth scroll for anchor links
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

        // Navbar background on scroll
        const navbar = document.querySelector('nav');
        if (navbar) {
            let ticking = false;
            
            const updateNavbar = () => {
                if (window.scrollY > 50) {
                    navbar.classList.add('scrolled');
                } else {
                    navbar.classList.remove('scrolled');
                }
                ticking = false;
            };
            
            window.addEventListener('scroll', () => {
                if (!ticking) {
                    requestAnimationFrame(updateNavbar);
                    ticking = true;
                }
            });
        }
    }

    // WhatsApp Button
    setupWhatsAppButton() {
        const whatsappBtn = document.querySelector('.whatsapp-float');
        if (whatsappBtn) {
            whatsappBtn.addEventListener('click', () => {
                // Track WhatsApp click for analytics
                this.trackEvent('whatsapp_click', 'contact', 'whatsapp_button');
            });
        }
    }

    // Accessibility Enhancements
    setupAccessibility() {
        // Add keyboard navigation for buttons
        document.querySelectorAll('button').forEach(button => {
            if (!button.hasAttribute('aria-label')) {
                const buttonText = button.textContent.trim();
                if (buttonText) {
                    button.setAttribute('aria-label', buttonText);
                }
            }
        });

        // Add skip link for keyboard users
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.textContent = 'Skip to main content';
        skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 bg-primary text-white p-2 z-50';
        document.body.insertBefore(skipLink, document.body.firstChild);

        // Announce page load for screen readers
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = 'John Dev Portfolio website loaded';
        document.body.appendChild(announcement);
        
        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }

    // Performance Optimizations
    setupPerformanceOptimizations() {
        // Lazy load images
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.classList.remove('lazy');
                            imageObserver.unobserve(img);
                        }
                    }
                });
            });

            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }

        // Preload critical resources
        const criticalResources = [
            './resources/hero-bg.jpg',
            './resources/profile.jpg'
        ];

        criticalResources.forEach(resource => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = resource;
            document.head.appendChild(link);
        });
    }

    // Utility Methods
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
            type === 'success' ? 'bg-green-500' : 
            type === 'error' ? 'bg-red-500' : 'bg-blue-500'
        } text-white`;
        notification.textContent = message;
        notification.setAttribute('role', 'alert');

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
            notification.style.opacity = '1';
        }, 100);

        // Remove after 5 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            notification.style.opacity = '0';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }

    trackEvent(category, action, label = '') {
        // Simple analytics tracking
        if (typeof gtag !== 'undefined') {
            gtag('event', action, {
                event_category: category,
                event_label: label
            });
        }
        
        // Fallback console logging for development
        if (window.location.hostname === 'localhost') {
            console.log('Analytics Event:', { category, action, label });
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PortfolioApp();
});

// Global functions for demo purposes
function showProjectDetails(projectId) {
    // Track project detail view for analytics
    if (typeof gtag !== 'undefined') {
        gtag('event', 'view_project_details', {
            event_category: 'engagement',
            event_label: projectId
        });
    }
    
    // Show coming soon message for demo
    alert(`Case study for ${projectId} would open here in a real implementation. This would showcase detailed project information, challenges, solutions, and results.`);
}

// Handle coming soon buttons
document.addEventListener('click', (e) => {
    if (e.target.textContent === 'Code' || e.target.textContent === 'View Project') {
        e.preventDefault();
        
        // Track button click for analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', 'click_demo_button', {
                event_category: 'engagement',
                event_label: e.target.textContent
            });
        }
        
        alert('Coming soon! This would link to the actual project in a real implementation.');
    }
});

// Add CSS animations and styles
const style = document.createElement('style');
style.textContent = `
    .animate-in {
        animation: fadeInUp 0.6s ease-out forwards;
    }
    
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    nav.scrolled {
        background: rgba(255, 255, 255, 0.95) !important;
        backdrop-filter: blur(10px);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }
    
    @media (prefers-color-scheme: dark) {
        nav.scrolled {
            background: rgba(26, 26, 26, 0.95) !important;
        }
    }
    
    .notification {
        transform: translateX(100%);
        opacity: 0;
        transition: all 0.3s ease;
    }
    
    .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
    }
    
    .sr-only.focus\\:not-sr-only:focus {
        position: static;
        width: auto;
        height: auto;
        padding: inherit;
        margin: inherit;
        overflow: visible;
        clip: auto;
        white-space: normal;
    }
`;
document.head.appendChild(style);