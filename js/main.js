// Mobile Menu Toggle
const mobileMenu = document.querySelector('.mobile-menu');
const navLinks = document.querySelector('.nav-links');

mobileMenu.addEventListener('click', () => {
    navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
});

// Smooth Scrolling for Navigation Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Form Toggle
const toggleBtns = document.querySelectorAll('.toggle-btn');
const forms = document.querySelectorAll('.auth-form');

toggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const formType = btn.dataset.form;
        
        // Toggle active state of buttons
        toggleBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Toggle form display
        forms.forEach(form => {
            form.classList.remove('active');
            if (form.id === `${formType}-form`) {
                form.classList.add('active');
            }
        });
    });
});

// Sign Up Form Handler
const signupForm = document.getElementById('signup-form');
signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(signupForm);
    const formProps = Object.fromEntries(formData);
    
    // Basic validation
    if (formProps.password !== formProps.confirmPassword) {
        alert('Passwords do not match');
        return;
    }
    
    if (formProps.password.length < 8) {
        alert('Password must be at least 8 characters long');
        return;
    }
    
    // Here you would typically send the form data to your backend
    console.log('Sign up form submitted:', formProps);
    
    // Show success message
    alert('Welcome to VelocityCoach! Your 2-week free trial has started.');
    signupForm.reset();
});

// Sign In Form Handler
const signinForm = document.getElementById('signin-form');
signinForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(signinForm);
    const formProps = Object.fromEntries(formData);
    
    // Here you would typically send the form data to your backend
    console.log('Sign in form submitted:', formProps);
    
    // Show success message (in real app, this would happen after successful authentication)
    alert('Successfully signed in!');
    signinForm.reset();
});

// Forgot Password Handler
const forgotLink = document.querySelector('.forgot-link');
forgotLink.addEventListener('click', (e) => {
    e.preventDefault();
    const email = prompt('Enter your email address to reset your password:');
    if (email) {
        // Here you would typically send the reset password request to your backend
        alert('If an account exists with this email, you will receive password reset instructions.');
    }
});

// Contact Form Submission Handler
const contactForm = document.getElementById('contact-form');

contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(contactForm);
    const formProps = Object.fromEntries(formData);

    // Validate Canadian phone number format
    const phoneRegex = /^(\+?1-?)?(\([0-9]{3}\)|[0-9]{3})[-.]?[0-9]{3}[-.]?[0-9]{4}$/;
    if (formProps.phone && !phoneRegex.test(formProps.phone)) {
        alert('Please enter a valid Canadian phone number');
        return;
    }

    // Here you would typically send the form data to your backend
    console.log('Form submitted:', formProps);
    
    alert('Thank you for reaching out! We will contact you within 1 business day to schedule your strategy call.');
    contactForm.reset();
});

// Testimonial Rotation
const testimonials = [
    {
        text: "Working with VelocityCoach transformed my financial future. I eliminated $45,000 in debt and built my first investment portfolio!",
        author: "Jennifer from Toronto"
    },
    {
        text: "The financial strategies I learned helped me save for my first home in Vancouver. Couldn't have done it without VelocityCoach!",
        author: "David from Vancouver"
    },
    {
        text: "As a small business owner, VelocityCoach helped me optimize my finances and grow my business sustainably.",
        author: "Marie from Montreal"
    },
    {
        text: "I went from living paycheck to paycheck to having a solid emergency fund and investment strategy.",
        author: "John from Calgary"
    }
];

const testimonialContainer = document.querySelector('.testimonial');
let currentTestimonialIndex = 0;

function updateTestimonial() {
    const { text, author } = testimonials[currentTestimonialIndex];
    testimonialContainer.innerHTML = `
        <p>${text}</p>
        <cite>- ${author}</cite>
    `;
    
    currentTestimonialIndex = (currentTestimonialIndex + 1) % testimonials.length;
}

// Rotate testimonials every 5 seconds
setInterval(updateTestimonial, 5000);

// Initialize first testimonial
updateTestimonial();

// Navbar Scroll Effect
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = 'none';
    }
});
