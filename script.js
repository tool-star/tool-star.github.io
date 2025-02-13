document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const mobileMenuButton = document.getElementById('mobile-menu');
    const nav = document.querySelector('nav');
    const body = document.body;

    // Mobile Menu Handlers
    function toggleMobileMenu(event) {
        event.stopPropagation();
        mobileMenuButton.classList.toggle('active');
        nav.classList.toggle('active');
        body.classList.toggle('menu-open');
    }

    function closeMobileMenu() {
        mobileMenuButton.classList.remove('active');
        nav.classList.remove('active');
        body.classList.remove('menu-open');
    }

    // Event Listeners for Mobile Menu
    mobileMenuButton.addEventListener('click', toggleMobileMenu);

    // Close menu when clicking outside
    document.addEventListener('click', (event) => {
        const isClickInsideNav = nav.contains(event.target);
        const isClickOnMenuButton = mobileMenuButton.contains(event.target);
        
        if (!isClickInsideNav && !isClickOnMenuButton && nav.classList.contains('active')) {
            closeMobileMenu();
        }
    });

    // Close menu when scrolling
    let lastScrollTop = 0;
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        if (Math.abs(scrollTop - lastScrollTop) > 10) {
            closeMobileMenu();
        }
        lastScrollTop = scrollTop;
    }, { passive: true });

    // Mobile Menu Functionality
    const mobileMenu = document.getElementById('mobile-menu');
    const mainNav = document.getElementById('main-nav');
    const menuOverlay = document.getElementById('menu-overlay');

    function toggleMenu(show) {
        const isExpanded = show === undefined ? mobileMenu.getAttribute('aria-expanded') === 'false' : show;
        
        mobileMenu.setAttribute('aria-expanded', isExpanded);
        mobileMenu.classList.toggle('active', isExpanded);
        mainNav.classList.toggle('active', isExpanded);
        menuOverlay.classList.toggle('active', isExpanded);
        
        // Prevent body scroll when menu is open
        document.body.style.overflow = isExpanded ? 'hidden' : '';
    }

    // Toggle menu on button click
    mobileMenu.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMenu();
    });

    // Close menu when clicking overlay
    menuOverlay.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMenu(false);
    });

    // Handle menu link clicks
    mainNav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', (e) => {
            // Get the href attribute
            const href = link.getAttribute('href');
            
            // Close the menu
            toggleMenu(false);
            
            // If it's a hash link (internal navigation)
            if (href.startsWith('#')) {
                e.preventDefault();
                const targetElement = document.querySelector(href);
                
                // Wait for menu close animation
                setTimeout(() => {
                    if (targetElement) {
                        // Scroll to element with offset for fixed header
                        const headerHeight = document.querySelector('header').offsetHeight;
                        const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                        
                        window.scrollTo({
                            top: targetPosition,
                            behavior: 'smooth'
                        });
                    }
                }, 300); // Match the menu transition time
            }
        });
    });

    // Close menu on screen resize
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (window.innerWidth >= 768 && mainNav.classList.contains('active')) {
                toggleMenu(false);
            }
        }, 250);
    });

    // Close menu when pressing Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mainNav.classList.contains('active')) {
            toggleMenu(false);
        }
    });

    
    // Update copyright year
    document.getElementById('year').textContent = new Date().getFullYear();

    // Add smooth scrolling for all anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                // Close mobile menu if open
                closeMobileMenu();
            }
        });
    });

    // Add scroll reveal animation
    function revealOnScroll() {
        const sections = document.querySelectorAll('section');
        sections.forEach(section => {
            const sectionTop = section.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            if (sectionTop < windowHeight * 0.75) {
                section.style.opacity = '1';
                section.style.transform = 'translateY(0)';
            }
        });
    }

    // Initial check for elements in view
    revealOnScroll();

    // Add scroll event listener
    window.addEventListener('scroll', revealOnScroll);
});
