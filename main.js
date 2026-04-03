import gsap from 'gsap';
import { Draggable } from 'gsap/Draggable';
import Lenis from 'lenis';
import 'grained';

gsap.registerPlugin(Draggable);


let portfolioNavDraggable = null;
let currentPortfolioActiveNav = null;

const updateBigCircles = () => {
    const hOuter = document.querySelector('.hero__outer-circle');
    const pOuter = document.querySelector('.portfolio__outer-circle');
    const eOuter = document.querySelector('.expertise__outer-circle');
    const cOuter = document.querySelector('.contact__outer-circle');
    const orbit3 = document.querySelector('.about__orbit--3');
    const orbit2 = document.querySelector('.about__orbit--2');
    const orbit1 = document.querySelector('.about__orbit--1');
    const expertOrbit2 = document.querySelector('.expertise__orbit--2');
    const expertOrbit1 = document.querySelector('.expertise__orbit--1');
    const contactOrbit1 = document.querySelector('.contact__orbit--1');
    const w = window.innerWidth;
    const h = window.innerHeight;
    const isMobile = w <= 768;
    const isSmallMobile = w <= 480;
    let vwOffset = isMobile ? 0.15 : 0.10;
    let vhOffset = isMobile ? 0.12 : 0.10;
    if (isSmallMobile) {
        vwOffset = 0.15;
        vhOffset = 0.10;
    }
    const dx = (0.5 - vwOffset) * w;
    const dy = (0.5 - vhOffset) * h;
    const radius = Math.sqrt(dx * dx + dy * dy);
    const diameter = radius * 2;
    if (hOuter) gsap.set(hOuter, { width: diameter, height: diameter });
    if (pOuter) gsap.set(pOuter, { width: diameter, height: diameter });
    if (eOuter) gsap.set(eOuter, { width: diameter, height: diameter });
    if (cOuter) gsap.set(cOuter, { width: diameter, height: diameter });
    if (orbit3) gsap.set(orbit3, { width: diameter, height: diameter });
    if (orbit2) gsap.set([orbit2, expertOrbit2], { width: diameter * 0.75, height: diameter * 0.75 });
    if (orbit1) gsap.set([orbit1, expertOrbit1, contactOrbit1], { width: diameter * 0.45, height: diameter * 0.45 });
};

const initResizeListener = () => {
    let resizeTimer;
    
    // 1. Immediate response for breakpoint crossing (Mobile <-> Desktop)
    const mql = window.matchMedia('(max-width: 768px)');
    mql.addEventListener('change', () => {
        updateBigCircles();
        if (window.syncPortfolioIndicator) window.syncPortfolioIndicator();
        if (window.syncAboutIndicator) window.syncAboutIndicator();
        if (window.syncExpertiseIndicator) window.syncExpertiseIndicator();
        if (window.syncContactIndicator) window.syncContactIndicator();
        if (window.refreshExpertiseTags) window.refreshExpertiseTags();
    });

    // 2. Debounced response for general resizing (keeping performance)
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            updateBigCircles();
            if (window.syncPortfolioIndicator) window.syncPortfolioIndicator();
            if (window.syncAboutIndicator) window.syncAboutIndicator();
            if (window.syncExpertiseIndicator) window.syncExpertiseIndicator();
            if (window.syncContactIndicator) window.syncContactIndicator();
            if (window.refreshExpertiseTags) window.refreshExpertiseTags();
        }, 50); // Reduced from 150ms to 50ms for snappier feel
    });
};


const initPortfolioNavIndicator = () => {
    const indicator = document.querySelector('.portfolio__nav-indicator');
    const navLinks = document.querySelectorAll('.portfolio__nav');
    if (!indicator || navLinks.length === 0) return;
    const updateIndicatorPos = (target, immediate = false) => {
        const rect = target.getBoundingClientRect();
        const portfolioRect = document.getElementById('portfolioSection').getBoundingClientRect();
        const indicatorSize = indicator.offsetWidth;
        const targetX = (rect.left + rect.width / 2) - portfolioRect.left - indicatorSize / 2;
        const targetY = (rect.top + rect.height / 2) - portfolioRect.top - indicatorSize / 2;

        gsap.to(indicator, {
            left: targetX,
            top: targetY,
            x: 0,
            y: 0,
            opacity: 1,
            duration: immediate ? 0 : 0.6,
            ease: 'power3.out',
            overwrite: true
        });
        navLinks.forEach(link => {
            if (link === target) {
                link.classList.add('portfolio__nav-active-text');
            } else {
                link.classList.remove('portfolio__nav-active-text');
            }
        });
    };

    const syncToActive = () => {
        const activeLink = document.querySelector('.portfolio__nav--active');
        if (activeLink) {
            currentPortfolioActiveNav = activeLink;
            updateIndicatorPos(activeLink, true);
        }
    };

    navLinks.forEach(link => {
        link.addEventListener('mouseenter', () => updateIndicatorPos(link));
        link.addEventListener('mouseleave', () => {
            if (currentPortfolioActiveNav) updateIndicatorPos(currentPortfolioActiveNav);
        });
    });

    portfolioNavDraggable = Draggable.create(indicator, {
        type: 'x,y',
        edgeResistance: 0.65,
        onDragEnd: function() {
            gsap.to(this.target, {
                x: 0,
                y: 0,
                duration: 1.2,
                ease: 'elastic.out(1, 0.4)'
            });
        }
    })[0];

    window.addEventListener('resize', () => {
        if (currentPortfolioActiveNav) updateIndicatorPos(currentPortfolioActiveNav, true);
    });

    window.syncPortfolioIndicator = syncToActive;
};

const initGreenCircle = () => {
    const circle = document.getElementById('greenCircle');
    const navLinks = document.querySelectorAll('.hero__nav');
    const photoWrapper = document.querySelector('.hero__photo-wrapper');

    if (!circle || !photoWrapper) return;

    // Set base percentage transform so GSAP doesn't wipe out the centering
    gsap.set(circle, { xPercent: -50, yPercent: -50, transformOrigin: 'center center' });

    window.setGreenIdlePos = () => {
        gsap.to(circle, {
            x: '15%', // GSAP will add this to the -50% xPercent
            y: '-15%',
            width: 'var(--green-size)',
            height: 'var(--green-size)',
            zIndex: 1, // Explicitly keep it below the photo-wrapper (z-index: 5)
            duration: 0.8,
            ease: 'power3.out'
        });
    };

    window.setGreenIdlePos();

    navLinks.forEach(link => {
        link.addEventListener('mouseenter', () => {
            const rect = link.getBoundingClientRect();
            const heroRect = document.getElementById('heroSection').getBoundingClientRect();
            const targetX = (rect.left + rect.width / 2) - (heroRect.left + heroRect.width / 2);
            const targetY = (rect.top + rect.height / 2) - (heroRect.top + heroRect.height / 2);

            gsap.to(circle, {
                x: targetX,
                y: targetY,
                width: 100,
                height: 100,
                zIndex: 10,
                duration: 0.6,
                ease: 'power3.out'
            });

            gsap.to(link, { color: '#ffffff', duration: 0.3 });
        });

        link.addEventListener('mouseleave', () => {
            if (window.setGreenIdlePos) window.setGreenIdlePos();
            gsap.to(link, { color: '#1a3a3a', duration: 0.3 });
        });
    });
};

const initPageTransitions = () => {
    const heroSection = document.getElementById('heroSection');
    const portfolioSection = document.getElementById('portfolioSection');
    const aboutSection = document.getElementById('aboutSection');
    const expertiseSection = document.getElementById('expertiseSection');
    const contactSection = document.getElementById('contactSection');

    gsap.set([portfolioSection, aboutSection, expertiseSection, contactSection], { opacity: 0, visibility: 'hidden' });
    
    heroSection.classList.remove('is-hidden');
    const heroNavLinks = heroSection.querySelectorAll('.hero__nav');
    heroNavLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.getAttribute('data-page');
            if (page === 'portfolio') openPortfolio();
            if (page === 'about') openAbout();
            if (page === 'expertise') openExpertise();
            if (page === 'contact') openContact();
        });
    });

    const mobileMenu = document.getElementById('mobileMenu');
    const mobileNavTrigger = document.querySelector('.hero__mobile-nav');
    const aboutMobileNavTrigger = document.getElementById('aboutMobileNavTrigger');
    const portfolioMobileNavTrigger = document.getElementById('portfolioMobileNavTrigger');
    const mobileMenuCloseBtn = document.getElementById('mobileMenuClose');
    const mobileMenuLinks = document.querySelectorAll('.mobile-menu__link');

    const openMobileMenu = () => {
        if (mobileMenu) mobileMenu.classList.add('is-active');
    };

    if (mobileNavTrigger) {
        mobileNavTrigger.addEventListener('click', openMobileMenu);
    }
    
    if (aboutMobileNavTrigger) {
        aboutMobileNavTrigger.addEventListener('click', openMobileMenu);
    }

    if (portfolioMobileNavTrigger) {
        portfolioMobileNavTrigger.addEventListener('click', openMobileMenu);
    }

    if (mobileMenuCloseBtn) {
        mobileMenuCloseBtn.addEventListener('click', () => {
            if (mobileMenu) mobileMenu.classList.remove('is-active');
        });
    }

    mobileMenuLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            if (mobileMenu) mobileMenu.classList.remove('is-active');
            
            const page = link.getAttribute('data-page');
            setTimeout(() => {
                if (page === 'portfolio') openPortfolio();
                if (page === 'about') openAbout();
                if (page === 'expertise') openExpertise();
                if (page === 'contact') openContact();
            }, 400); // give menu time to fade out before animating hero
        });
    });


    const subNavLinks = document.querySelectorAll(
        '.about__nav[data-page], .portfolio__nav[data-page], .expertise__nav[data-page], .contact__nav[data-page]'
    );
    subNavLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.getAttribute('data-page');
            
            let closedSomething = false;
            
            if(aboutSection.classList.contains('is-active')) { closeAbout(); closedSomething = true; }
            if(portfolioSection.classList.contains('is-active')) { closePortfolio(); closedSomething = true; }
            if(expertiseSection.classList.contains('is-active')) { closeExpertise(); closedSomething = true; }
            if(contactSection.classList.contains('is-active')) { closeContact(); closedSomething = true; }
            
            const delay = closedSomething ? 600 : 0;
            
            setTimeout(() => {
                if (page === 'portfolio') openPortfolio();
                if (page === 'about') openAbout();
                if (page === 'expertise') openExpertise();
                if (page === 'contact') openContact();
            }, delay);
        });
    });

    const backToHomeHandler = (e, closeFn) => {
        e.preventDefault();
        closeFn();
        setTimeout(openHero, 600);
    };

    const backToHome = document.getElementById('backToHome');
    const backToHomeFromPortfolioMobile = document.getElementById('backToHomeFromPortfolioMobile');
    if (backToHome) backToHome.addEventListener('click', (e) => backToHomeHandler(e, closePortfolio));
    if (backToHomeFromPortfolioMobile) backToHomeFromPortfolioMobile.addEventListener('click', (e) => backToHomeHandler(e, closePortfolio));

    const backToHomeFromAbout = document.getElementById('backToHomeFromAbout');
    const backToHomeFromAboutMobile = document.getElementById('backToHomeFromAboutMobile');
    if (backToHomeFromAbout) backToHomeFromAbout.addEventListener('click', (e) => backToHomeHandler(e, closeAbout));
    if (backToHomeFromAboutMobile) backToHomeFromAboutMobile.addEventListener('click', (e) => backToHomeHandler(e, closeAbout));

    const backToHomeFromExpertise = document.getElementById('backToHomeFromExpertise');
    if (backToHomeFromExpertise) backToHomeFromExpertise.addEventListener('click', (e) => backToHomeHandler(e, closeExpertise));

    const backToHomeFromExpertiseMobile = document.getElementById('backToHomeFromExpertiseMobile');
    if (backToHomeFromExpertiseMobile) backToHomeFromExpertiseMobile.addEventListener('click', (e) => backToHomeHandler(e, closeExpertise));

    const expertiseMobileNavTrigger = document.getElementById('expertiseMobileNavTrigger');
    if (expertiseMobileNavTrigger) expertiseMobileNavTrigger.addEventListener('click', openMobileMenu);

    const backToHomeFromContact = document.getElementById('backToHomeFromContact');
    if (backToHomeFromContact) backToHomeFromContact.addEventListener('click', (e) => backToHomeHandler(e, closeContact));

    const openHero = () => {
        heroSection.classList.remove('is-hidden');
        if (window.setGreenIdlePos) window.setGreenIdlePos();
        gsap.to(heroSection, { opacity: 1, duration: 0.5 });
        gsap.to([
            '.hero__heading',
            '.hero__photo-wrapper',
            '.hero__green-circle',
            '.hero__circle-outline',
            '.hero__text-left',
            '.hero__text-right',
            '.hero__tagline',
            '.hero__nav',
            '.hero__mobile-nav'
        ], {
            opacity: 1,
            duration: 0.5,
            stagger: 0.03,
            ease: 'power2.out'
        });
    };

    const openPortfolio = () => {
        const tl = gsap.timeline();
        tl.to([
            '.hero__heading',
            '.hero__photo-wrapper',
            '.hero__green-circle',
            '.hero__circle-outline',
            '.hero__text-left',
            '.hero__text-right',
            '.hero__tagline',
            '.hero__nav',
            '.hero__mobile-nav'
        ], {
            opacity: 0,
            duration: 0.5,
            stagger: 0.03,
            ease: 'power2.in'
        });

        tl.to(heroSection, {
            opacity: 0, 
            duration: 0.3,
            onComplete: () => {
                heroSection.classList.add('is-hidden');
                portfolioSection.classList.add('is-active');
                gsap.set(portfolioSection, { visibility: 'visible' });
                if (window.syncPortfolioIndicator) window.syncPortfolioIndicator();
            }
        });

        tl.to(portfolioSection, {
            opacity: 1,
            duration: 0.6,
            ease: 'power2.out',
            onComplete: () => {
                // Ensure everything inside is visible
                gsap.set(['.portfolio__nav', '.portfolio__back', '.portfolio__subtitle', '.portfolio__tagline'], { opacity: 1 });
                if (window.syncPortfolioIndicator) window.syncPortfolioIndicator();
            }
        }, '-=0.2');

        tl.fromTo(['.portfolio__nav', '.portfolio__back', '.portfolio__subtitle', '.portfolio__tagline'],
            { opacity: 0, y: -10 },
            { opacity: 1, duration: 0.8, stagger: 0.05, ease: 'power2.out' },
            '-=0.4'
        );

        tl.fromTo('.portfolio__card', 
            { opacity: 0, y: 60 },
            { 
                opacity: 1, 
                y: 0, 
                duration: 0.8, 
                stagger: 0.15, 
                ease: 'power3.out' 
            }, 
            '-=0.3'
        );
    };

    const closePortfolio = () => {
        const tl = gsap.timeline();
        tl.to([
            '.portfolio__back',
            '.portfolio__subtitle',
            '.portfolio__card',
            '.portfolio__nav',
            '.portfolio__tagline',
            '.portfolio__nav-indicator'
        ], {
            opacity: 0,
            duration: 0.4,
            stagger: 0.03,
            ease: 'power2.in'
        });

        tl.to(portfolioSection, {
            opacity: 0,
            duration: 0.5,
            ease: 'power2.out',
            onComplete: () => {
                portfolioSection.classList.remove('is-active');
                gsap.set(portfolioSection, { visibility: 'hidden' });
            }
        }, '-=0.2');
    };

    const openAbout = () => {
        const tl = gsap.timeline();
        tl.to(heroSection, {
            opacity: 0,
            duration: 0.5,
            onComplete: () => {
                heroSection.classList.add('is-hidden');
                aboutSection.classList.add('is-active');
                gsap.set(aboutSection, { visibility: 'visible' });
                if (window.syncAboutIndicator) window.syncAboutIndicator();
            }
        });

        tl.to(aboutSection, {
            opacity: 1,
            duration: 0.8,
            ease: 'power2.out'
        });

        tl.fromTo('.about__orbit', 
            { scale: 0.8, opacity: 0 },
            { scale: 1, opacity: 1, duration: 1.8, stagger: 0.1, ease: 'expo.out' },
            '-=0.5'
        );

        tl.fromTo('.about__memory',
            { scale: 0, opacity: 0 },
            { scale: 1, opacity: 1, duration: 1.2, stagger: 0.15, ease: 'back.out(1.7)' },
            '-=1.2'
        );

        tl.fromTo(['.about__photo-wrapper', '.about__bio > *'],
            { y: 50, opacity: 0 },
            { y: 0, opacity: 1, duration: 1.2, stagger: 0.15, ease: 'power3.out' },
            '-=1.0'
        );
    };

    const closeAbout = () => {
        const tl = gsap.timeline();
        tl.to(aboutSection, {
            opacity: 0,
            duration: 0.5,
            ease: 'power2.in',
            onComplete: () => {
                aboutSection.classList.remove('is-active');
                gsap.set(aboutSection, { visibility: 'hidden' });
            }
        });
    };

    const openExpertise = () => {
        const tl = gsap.timeline();
        tl.to([heroSection, portfolioSection, aboutSection], {
            opacity: 0,
            duration: 0.5,
            onComplete: () => {
                heroSection.classList.add('is-hidden');
                portfolioSection.classList.remove('is-active');
                aboutSection.classList.remove('is-active');
                expertiseSection.classList.add('is-active');
                expertiseSection.scrollTop = 0; // Reset scroll to top so tabs are visible on mobile
                gsap.set(expertiseSection, { visibility: 'visible' });
                if (window.syncExpertiseIndicator) window.syncExpertiseIndicator();
                if (window.playExpertiseEntrance) window.playExpertiseEntrance();
            }
        });

        tl.to(expertiseSection, {
            opacity: 1,
            duration: 0.8,
            ease: 'power2.out'
        });
    };

    const closeExpertise = () => {
        const tl = gsap.timeline();
        tl.to(expertiseSection, {
            opacity: 0,
            duration: 0.5,
            ease: 'power2.in',
            onComplete: () => {
                expertiseSection.classList.remove('is-active');
                gsap.set(expertiseSection, { visibility: 'hidden' });
            }
        });
    };

    const openContact = () => {
        const tl = gsap.timeline();
        if (!heroSection.classList.contains('is-hidden')) {
            tl.to([
                '.hero__heading', '.hero__photo-wrapper',
                '.hero__green-circle', '.hero__circle-outline',
                '.hero__text-left', '.hero__text-right',
                '.hero__tagline', '.hero__nav', '.hero__mobile-nav'
            ], {
                opacity: 0, duration: 0.5, stagger: 0.03, ease: 'power2.in'
            });

            tl.to(heroSection, {
                opacity: 0, 
                duration: 0.3,
                onComplete: () => {
                    contactSection.classList.add('is-active');
                    gsap.set(contactSection, { visibility: 'visible' });
                    gsap.set('.contact__content', { display: 'flex', opacity: 1, y: 0 });
                    gsap.set('.contact__form-wrapper', { display: 'none', opacity: 0 });
                    if (window.syncContactIndicator) window.syncContactIndicator();
                }
            });
        } else {
            tl.to({}, { 
                duration: 0.1, 
                onComplete: () => {
                    contactSection.classList.add('is-active');
                    gsap.set(contactSection, { visibility: 'visible' });
                    gsap.set('.contact__content', { display: 'flex', opacity: 1, y: 0 });
                    gsap.set('.contact__form-wrapper', { display: 'none', opacity: 0 });
                    if (window.syncContactIndicator) window.syncContactIndicator();
                }
            });
        }

        tl.to(contactSection, {
            opacity: 1,
            duration: 0.8,
            ease: 'power2.out'
        });
        
        tl.from('.contact__title, .contact__actions, .contact__divider, .contact__socials, .contact__email, .contact__nav', {
            opacity: 0,
            y: 30,
            duration: 0.8,
            stagger: 0.1,
            ease: "power3.out"
        }, "-=0.4");
    };

    const closeContact = () => {
        const tl = gsap.timeline();
        tl.to(contactSection, {
            opacity: 0,
            duration: 0.5,
            ease: 'power2.in',
            onComplete: () => {
                contactSection.classList.remove('is-active');
                gsap.set(contactSection, { visibility: 'hidden' });
            }
        });
    };
};

const initEntranceAnimations = () => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.from('.hero__greeting', { opacity: 0, y: 30, duration: 1 }, 0.2);
    tl.from('.hero__name', { opacity: 0, y: 40, duration: 1.2 }, 0.4);
    tl.from('.hero__photo-wrapper', { opacity: 0, scale: 0.9, duration: 1.2 }, 0.5);
    tl.from('.hero__green-circle', { opacity: 0, scale: 0.5, duration: 1.4 }, 0.6);
    tl.from('.hero__circle-outline', { opacity: 0, scale: 0.8, duration: 1.5 }, 0.4);
    tl.from('.hero__nav, .hero__mobile-nav', { opacity: 0, duration: 0.8, stagger: 0.15 }, 0.8);
    tl.from('.hero__text-left', { opacity: 0, x: -30, duration: 1 }, 1);
    tl.from('.hero__text-right', { opacity: 0, x: 30, duration: 1 }, 1);
    tl.from('.hero__tagline', { opacity: 0, y: 20, duration: 0.8 }, 1.2);
};

const initDragScroll = () => {
    const grid = document.querySelector('.portfolio__grid');
    if (!grid || window.innerWidth <= 768) return;
    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;
    let velX = 0;
    let momentumID = null;

    grid.addEventListener('mousedown', (e) => {
        isDown = true;
        grid.classList.add('is-dragging');
        startX = e.pageX - grid.offsetLeft;
        scrollLeft = grid.scrollLeft;
        cancelMomentum();
    });

    grid.addEventListener('mouseleave', () => {
        if (isDown) applyMomentum();
        isDown = false;
        grid.classList.remove('is-dragging');
    });

    grid.addEventListener('mouseup', () => {
        if (isDown) applyMomentum();
        isDown = false;
        grid.classList.remove('is-dragging');
    });

    grid.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - grid.offsetLeft;
        const walk = (x - startX) * 1.5;
        velX = grid.scrollLeft - (scrollLeft - walk);
        grid.scrollLeft = scrollLeft - walk;
    });

    grid.addEventListener('wheel', (e) => {
        e.preventDefault();
        grid.scrollLeft += e.deltaY * 2;
    }, { passive: false });

    const applyMomentum = () => {
        cancelMomentum();
        const decay = () => {
            velX *= 0.92;
            grid.scrollLeft += velX;
            if (Math.abs(velX) > 0.5) {
                momentumID = requestAnimationFrame(decay);
            }
        };
        momentumID = requestAnimationFrame(decay);
    };

    const cancelMomentum = () => {
        if (momentumID) {
            cancelAnimationFrame(momentumID);
            momentumID = null;
        }
    };
};

const projects = [
    {
        title: "SIAKAD",
        resp: "web development",
        team: ["/Foto1.png", "/Foto1.png"],
        desc: "SIAKAD is an Academic Information System designed to streamline student data management, course enrollments, and academic administration using functional and scalable data solutions.",
        img: "/portofolio/siakad.png",
        link: "https://lynk.id/willianstev/mp3v3gp8z62z"
    },
    {
        title: "TMS Elite",
        resp: "web development",
        team: ["/Foto1.png"],
        desc: "TMS Elite is a robust delivery tracking application built to track operational logic, optimize logistics routes, and manage delivery fleets efficiently.",
        img: "/portofolio/TMS-elite.png",
        link: "https://github.com/Andy12zulhair/tms-elite-project"
    },
    {
        title: "SPB Desa",
        resp: "data engineering · development",
        team: ["/Foto1.png", "/Foto1.png"],
        desc: "SPB Desa is a large-scale data collection and management platform developed for BPS (Badan Pusat Statistik). It involved modeling complex village-level metrics and ensuring high-availability data processing.",
        img: "/portofolio/SPB-Desa.png",
        link: "https://lynk.id/willianstev/l807xl7rymp4"
    },
    {
        title: "KMP Analytics",
        resp: "data analytics · development",
        team: ["/Foto1.png"],
        desc: "KMP Analytics is a data-driven monitoring platform providing deep insights into operational metrics. I focused on structuring data flows and building interactive visualization dashboards.",
        img: "/portofolio/Kmp.png",
        link: "https://lynk.id/willianstev/z095zo99kjr5"
    },
    {
        title: "Digital Storefront",
        resp: "frontend development",
        team: ["/Foto1.png", "/Foto1.png"],
        desc: "A responsive e-commerce platform incorporating modern digital storefront methodologies. The project included cart management, user authorization, and dynamic product catalogs.",
        img: "/portofolio/Ecommerce-Web.png",
        link: "https://github.com/Andy12zulhair/ecommerce-project"
    },
    {
        title: "Face Editor",
        resp: "software development",
        team: ["/Foto1.png"],
        desc: "An interactive image manipulation tool built to demonstrate complex software development techniques, featuring dynamic face editing capabilities.",
        img: "/portofolio/face-editor.png",
        link: "https://github.com/Andy12zulhair/vae-face-editor"
    }
];

let currentProjectIndex = 0;

const initProjectDetail = () => {
    const detailOverlay = document.getElementById('projectDetail');
    const learnMoreBtns = document.querySelectorAll('.portfolio__card-label--more');
    const cards = document.querySelectorAll('.portfolio__card');
    const closeBtn = document.getElementById('closeDetail');
    const prevBtn = document.getElementById('prevProject');
    const nextBtn = document.getElementById('nextProject');

    if (!detailOverlay) return;

    const updateContent = (index) => {
        const p = projects[index];
        currentProjectIndex = index;
        document.getElementById('detailTitle').innerText = p.title;
        document.getElementById('detailResp').innerText = p.resp;
        document.getElementById('detailDesc').innerText = p.desc;
        document.getElementById('detailImage').src = p.img;
        document.getElementById('detailLink').href = p.link;

        const teamWrap = document.getElementById('detailTeam');
        teamWrap.innerHTML = '';
        p.team.forEach(url => {
            const img = document.createElement('img');
            img.src = url;
            img.className = 'project-detail__avatar';
            teamWrap.appendChild(img);
        });
    };

    const openDetail = (index) => {
        updateContent(index);
        detailOverlay.classList.add('is-active');
        gsap.fromTo(detailOverlay, 
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }
        );
        gsap.from('.project-detail__info > *', {
            opacity: 0,
            x: -20,
            duration: 0.6,
            stagger: 0.1,
            delay: 0.2,
            ease: 'power2.out'
        });
        gsap.from('.project-detail__media', {
            opacity: 0,
            scale: 1.05,
            duration: 1,
            delay: 0.1,
            ease: 'power2.out'
        });
    };

    const closeDetail = () => {
        gsap.to(detailOverlay, {
            opacity: 0,
            y: 20,
            duration: 0.4,
            ease: 'power2.in',
            onComplete: () => {
                detailOverlay.classList.remove('is-active');
            }
        });
    };

    learnMoreBtns.forEach((btn, i) => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            openDetail(i);
        });
    });
    
    cards.forEach((card, i) => {
        card.addEventListener('click', () => openDetail(i));
    });
    
    // Add specific cursor style to indicate cards are clickable
    cards.forEach(card => card.style.cursor = 'pointer');

    closeBtn.addEventListener('click', closeDetail);

    let isAnimatingDetail = false;

    nextBtn.addEventListener('click', () => {
        if (isAnimatingDetail) return;
        isAnimatingDetail = true;
        const next = (currentProjectIndex + 1) % projects.length;
        gsap.to('.project-detail__container', {
            opacity: 0,
            x: -20,
            duration: 0.3,
            onComplete: () => {
                updateContent(next);
                gsap.fromTo('.project-detail__container', 
                    { opacity: 0, x: 20 },
                    { opacity: 1, x: 0, duration: 0.4, ease: 'power2.out', onComplete: () => isAnimatingDetail = false }
                );
            }
        });
    });

    prevBtn.addEventListener('click', () => {
        if (isAnimatingDetail) return;
        isAnimatingDetail = true;
        const prev = (currentProjectIndex - 1 + projects.length) % projects.length;
        gsap.to('.project-detail__container', {
            opacity: 0,
            x: 20,
            duration: 0.3,
            onComplete: () => {
                updateContent(prev);
                gsap.fromTo('.project-detail__container', 
                    { opacity: 0, x: -20 },
                    { opacity: 1, x: 0, duration: 0.4, ease: 'power2.out', onComplete: () => isAnimatingDetail = false }
                );
            }
        });
    });
};

const initAboutNavIndicator = () => {
    const indicator = document.querySelector('.about__nav-indicator');
    const navLinks = document.querySelectorAll('.about__nav');
    if (!indicator || navLinks.length === 0) return;
    let currentAboutActiveNav = document.querySelector('.about__nav--active');

    const updateIndicatorPos = (target, immediate = false) => {
        const rect = target.getBoundingClientRect();
        const indicatorSize = indicator.offsetWidth || 130;
        const targetX = rect.left + rect.width / 2 - indicatorSize / 2;
        const targetY = rect.top + rect.height / 2 - indicatorSize / 2;

        gsap.to(indicator, {
            left: targetX,
            top: targetY,
            x: 0,
            y: 0,
            opacity: 1,
            duration: immediate ? 0 : 0.6,
            ease: 'power3.out',
            overwrite: true
        });

        navLinks.forEach(link => {
            if (link === target) {
                link.classList.add('about__nav-active-text');
            } else {
                link.classList.remove('about__nav-active-text');
            }
        });
    };

    const syncToActive = () => {
        const activeLink = document.querySelector('.about__nav--active');
        if (activeLink) {
            currentAboutActiveNav = activeLink;
            updateIndicatorPos(activeLink, true);
        }
    };

    navLinks.forEach(link => {
        link.addEventListener('mouseenter', () => updateIndicatorPos(link));
        link.addEventListener('mouseleave', () => {
            if (currentAboutActiveNav) updateIndicatorPos(currentAboutActiveNav);
        });
    });

    window.addEventListener('resize', () => {
        if (currentAboutActiveNav) updateIndicatorPos(currentAboutActiveNav, true);
    });

    window.syncAboutIndicator = syncToActive;
    setTimeout(syncToActive, 100);
};

const initExpertiseNavIndicator = () => {
    const indicator = document.querySelector('.expertise__nav-indicator');
    const navLinks = document.querySelectorAll('.expertise__nav');
    if (!indicator || navLinks.length === 0) return;
    let currentActiveNav = document.querySelector('.expertise__nav--active');

    const updateIndicatorPos = (target, immediate = false) => {
        const rect = target.getBoundingClientRect();
        const indicatorSize = indicator.offsetWidth || 130;
        const targetX = rect.left + rect.width / 2 - indicatorSize / 2;
        const targetY = rect.top + rect.height / 2 - indicatorSize / 2;
        gsap.to(indicator, {
            left: targetX, top: targetY, opacity: 1, duration: immediate ? 0 : 0.6, ease: 'power3.out', overwrite: true
        });
        navLinks.forEach(link => {
            if (link === target) link.classList.add('expertise__nav-active-text');
            else link.classList.remove('expertise__nav-active-text');
        });
    };

    const syncToActive = () => {
        const activeLink = document.querySelector('.expertise__nav--active');
        if (activeLink) { currentActiveNav = activeLink; updateIndicatorPos(activeLink, true); }
    };

    navLinks.forEach(link => {
        link.addEventListener('mouseenter', () => updateIndicatorPos(link));
        link.addEventListener('mouseleave', () => { if (currentActiveNav) updateIndicatorPos(currentActiveNav); });
    });
    window.addEventListener('resize', () => { if (currentActiveNav) updateIndicatorPos(currentActiveNav, true); });
    window.syncExpertiseIndicator = syncToActive;
    setTimeout(syncToActive, 100);
};

const initExpertiseInteractions = () => {
    const expertiseSection = document.getElementById('expertiseSection');
    if (!expertiseSection) return;

    const data = {
        dev: {
            desc: "Builds robust architectures and scalable solutions to ensure high performance across varied platforms.",
            tags: ["AI Agent Dev", "Testing & Debugging", "Analytics", "Web Monitoring", "Webflow Dev", "Writing Clean Code"],
            images: [
                './public/expertise/Dev/AI-Agent.jpeg',
                './public/expertise/Dev/Testing-debugging.jpeg',
                './public/expertise/Dev/analytics.png',
                './public/expertise/Dev/monitoring web.png',
                './public/expertise/Dev/webflow.png',
                './public/expertise/Dev/writing-code.png'
            ]
        },
        badges: {
            desc: "Professional certifications and skill badges acquired through continuous learning.",
            tags: ["Sertifikat 1", "Sertifikat 2", "Sertifikat 3", "Sertifikat 4", "Sertifikat 5", "Sertifikat 6"],
            images: [
                './public/expertise/Skill Badge/Sertifikat1.png',
                './public/expertise/Skill Badge/Sertifikat2.png',
                './public/expertise/Skill Badge/Sertifikat3.png',
                './public/expertise/Skill Badge/Sertifikat4.png',
                './public/expertise/Skill Badge/Sertifikat5.png',
                './public/expertise/Skill Badge/Sertifikat6.png'
            ]
        }
    };

    const tabs = document.querySelectorAll('.expertise__tab');
    const descEl = document.getElementById('expertiseDesc');
    const tagsContainer = document.getElementById('expertiseTags');
    const orbits = document.querySelectorAll('.expertise__orbit');
    let currentTab = 'badges';

    // Infinite rotation for rings
    orbits.forEach((orbit, index) => {
        const direction = index === 0 ? 1 : -1;
        gsap.to(orbit, { rotation: 360 * direction, duration: 80 + index * 30, repeat: -1, ease: 'none' });
    });

    const renderTags = (tabKey, animate = true) => {
        tagsContainer.innerHTML = '';
        const tags = data[tabKey].tags;
        const images = data[tabKey].images;
        
        const w = window.innerWidth;
        const h = window.innerHeight;
        const isMobile = w <= 768;
        
        // positions: left-top, left-mid, left-bot, right-top, right-mid, right-bot
        const positions = [
            { x: -0.25 * w, y: -0.22 * h, r: 8, img: images[0] },
            { x: -0.30 * w, y: 0, r: 0, img: images[1] },
            { x: -0.25 * w, y: 0.22 * h, r: -8, img: images[2] },
            { x: 0.25 * w, y: -0.22 * h, r: -8, img: images[3] },
            { x: 0.30 * w, y: 0, r: 0, img: images[4] },
            { x: 0.25 * w, y: 0.22 * h, r: 8, img: images[5] }
        ];

        const hoverMedia = document.querySelector('.expertise__hover-media');
        const hoverImg = document.getElementById('expertiseHoverImg');
        
        if (!isMobile) {
            gsap.set(hoverMedia, { xPercent: -50, yPercent: -50, scale: 0.95 });
        }

        tags.forEach((text, i) => {
            const el = document.createElement('div');
            el.className = 'expertise__tag';
            
            const imgEl = document.createElement('img');
            imgEl.src = images[i] || images[0];
            imgEl.className = 'expertise__tag-img';
            
            const textEl = document.createElement('span');
            textEl.className = 'expertise__tag-text';
            textEl.innerHTML = text;
            
            el.appendChild(imgEl);
            el.appendChild(textEl);
            
            if (isMobile) {
                // On mobile: NO GSAP positioning at all — let CSS grid handle layout
                el.style.opacity = '1';
                el.style.display = 'flex';
                imgEl.style.display = 'block';
            } else {
                // Desktop: absolute orbit positioning via GSAP
                const pxX = positions[i].x;
                const pxY = positions[i].y;
                
                gsap.set(el, { 
                    top: "50%",
                    left: "50%",
                    xPercent: -50,
                    yPercent: -50,
                    x: pxX, 
                    y: pxY + (animate ? 30 : 0), 
                    rotation: positions[i].r,
                    opacity: 0, // Start invisible even on resize for a smooth fade
                    transformOrigin: "center center"
                });
                
                // If it's a resize (not animate), we do a quick smooth fade-in
                if (!animate) {
                    gsap.to(el, {
                        opacity: 1,
                        duration: 0.5,
                        ease: "power2.out",
                        delay: i * 0.03 // Very subtle stagger to make it feel "liquid"
                    });
                }
                
                // Hover Events (desktop only)
                el.addEventListener('mouseenter', () => {
                    hoverImg.src = positions[i].img;
                    const tilt = i % 2 === 0 ? -4 : 4;
                    
                    gsap.to(hoverMedia, {
                        opacity: 1,
                        scale: 1,
                        rotation: tilt,
                        duration: 0.4,
                        ease: "power2.out",
                        overwrite: true
                    });
                    
                    gsap.to(descEl, {
                        opacity: 0,
                        duration: 0.3,
                        overwrite: true
                    });
                });

                el.addEventListener('mouseleave', () => {
                    gsap.to(hoverMedia, {
                        opacity: 0,
                        scale: 0.95,
                        duration: 0.3,
                        ease: "power2.in",
                        overwrite: true
                    });
                    
                    gsap.to(descEl, {
                        opacity: 1,
                        duration: 0.4,
                        delay: 0.1,
                        overwrite: true
                    });
                });
            }

            tagsContainer.appendChild(el);
        });

        // Entrance stagger (desktop only — only on swap or initial entry)
        if (!isMobile && animate) {
            gsap.to('.expertise__tag', {
                y: "-=30",
                opacity: 1,
                duration: 0.8,
                stagger: 0.1,
                ease: "power3.out"
            });
        }
    };

    const swapContent = (tabKey) => {
        if (tabKey === currentTab) return;
        currentTab = tabKey;

        // Update active class
        tabs.forEach(t => t.classList.remove('expertise__tab--active'));
        document.querySelector(`[data-tab="${tabKey}"]`).classList.add('expertise__tab--active');

        const isMobile = window.innerWidth <= 768;

        if (isMobile) {
            // On mobile: just swap content instantly, no GSAP animations
            descEl.innerHTML = data[tabKey].desc;
            renderTags(tabKey);
        } else {
            // Desktop: animate out then in
            const tl = gsap.timeline();
            tl.to(descEl, { opacity: 0, duration: 0.3, y: 10 })
              .to('.expertise__tag', { opacity: 0, y: "+=20", duration: 0.3, stagger: 0.05 }, "<")
              .call(() => {
                  descEl.innerHTML = data[tabKey].desc;
                  renderTags(tabKey);
              })
              .to(descEl, { opacity: 1, duration: 0.5, y: 0, ease: 'power2.out' });
        }
    };

    // Attach events
    tabs.forEach(tab => {
        tab.addEventListener('click', () => swapContent(tab.getAttribute('data-tab')));
    });

    window.refreshExpertiseTags = () => {
        const expertiseSection = document.getElementById('expertiseSection');
        if (expertiseSection && expertiseSection.classList.contains('is-active')) {
            renderTags(currentTab, false);
        }
    };

    // Expose initial render for transitions
    window.playExpertiseEntrance = () => {
        descEl.innerHTML = data[currentTab].desc;
        renderTags(currentTab);
        if (window.innerWidth > 768) {
            gsap.fromTo(descEl, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, delay: 0.2, ease: "power2.out" });
        }
    };
};

const initAboutInteractions = () => {
    const aboutSection = document.getElementById('aboutSection');
    const orbits = document.querySelectorAll('.about__orbit');
    const memories = document.querySelectorAll('.about__memory');
    const photoWrapper = document.querySelector('.about__photo-wrapper');
    const navLinks = document.querySelectorAll('.about__nav');

    if (!aboutSection) return;

    updateBigCircles();

    orbits.forEach((orbit, index) => {
        const direction = index % 2 === 0 ? 1 : -1;
        const duration = 60 + index * 40;
        gsap.to(orbit, {
            rotation: 360 * direction,
            duration: duration,
            repeat: -1,
            ease: "none"
        });
    });

    memories.forEach((memory) => {
        const delay = Math.random() * 2;
        const driftDuration = 3 + Math.random() * 2;
        
        gsap.to(memory, {
            y: "+=15",
            rotation: () => -5 + Math.random() * 10,
            duration: driftDuration,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            delay: delay
        });
    });

    const xToParams = {duration: 0.8, ease: "power3", overwrite: "auto"};
    const yToParams = {duration: 0.8, ease: "power3", overwrite: "auto"};
    
    let xTo = gsap.quickTo(photoWrapper, "x", xToParams);
    let yTo = gsap.quickTo(photoWrapper, "y", yToParams);
    
    const memXTo = [], memYTo = [];
    memories.forEach(mem => {
        memXTo.push(gsap.quickTo(mem, "x", {duration: 1.2, ease: "power3"}));
        memYTo.push(gsap.quickTo(mem, "y", {duration: 1.2, ease: "power3"}));
    });

    window.addEventListener("mousemove", (e) => {
        if (!aboutSection.classList.contains('is-active')) return;

        const width = window.innerWidth;
        const height = window.innerHeight;
        const normX = (e.clientX / width) - 0.5;
        const normY = (e.clientY / height) - 0.5;

        xTo(normX * -35); 
        yTo(normY * -35);

        memories.forEach((mem, i) => {
            const depth = 20 + (i * 15);
            const dir = i % 2 === 0 ? 1 : -1;
            memXTo[i](normX * depth * dir);
            memYTo[i](normY * depth * dir);
        });
    });

    navLinks.forEach(link => {
        const xSetter = gsap.quickTo(link, "x", {duration: 0.8, ease: "elastic.out(1, 0.3)"});
        const ySetter = gsap.quickTo(link, "y", {duration: 0.8, ease: "elastic.out(1, 0.3)"});

        link.addEventListener("mousemove", (e) => {
            const rect = link.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const magnetX = (e.clientX - centerX) * 0.4;
            const magnetY = (e.clientY - centerY) * 0.4;

            xSetter(magnetX);
            ySetter(magnetY);
        });

        link.addEventListener("mouseleave", () => {
             xSetter(0);
             ySetter(0);
        });
    });
};

const initMemoryLightbox = () => {
    const memories = document.querySelectorAll('.about__memory');
    const lightbox = document.getElementById('memoryLightbox');
    const lightboxImg = document.getElementById('memoryLightboxImage');
    const btnClose = document.getElementById('memoryClose');
    const btnNext = document.getElementById('memoryNext');
    const btnPrev = document.getElementById('memoryPrev');

    if (!lightbox || memories.length === 0) return;

    let currentIdx = 0;
    const sources = Array.from(memories).map(m => m.querySelector('img').src);

    const updateImage = (index, direction = 1) => {
        currentIdx = index;
        const newSrc = sources[currentIdx];
        
        gsap.to(lightboxImg, {
            opacity: 0,
            x: -20 * direction,
            duration: 0.3,
            onComplete: () => {
                lightboxImg.src = newSrc;
                gsap.fromTo(lightboxImg, 
                    { opacity: 0, x: 20 * direction },
                    { opacity: 1, x: 0, duration: 0.4, ease: 'power2.out' }
                );
            }
        });
    };

    const openLightbox = (index) => {
        currentIdx = index;
        lightboxImg.src = sources[currentIdx];
        lightbox.classList.add('is-active');

        gsap.fromTo(lightbox, 
            { opacity: 0 },
            { opacity: 1, duration: 0.5, ease: 'power2.out' }
        );
        
        gsap.fromTo(lightboxImg, 
            { scale: 0.8, opacity: 0, y: 30 },
            { scale: 1, opacity: 1, y: 0, duration: 0.6, delay: 0.2, ease: 'power3.out' }
        );

        gsap.from('.memory-lightbox__btn', {
            opacity: 0,
            y: 20,
            duration: 0.4,
            stagger: 0.1,
            delay: 0.4,
            ease: 'power2.out'
        });
    };

    const closeLightbox = () => {
        gsap.to(lightbox, {
            opacity: 0,
            duration: 0.4,
            ease: 'power2.in',
            onComplete: () => {
                lightbox.classList.remove('is-active');
            }
        });
    };

    memories.forEach((mem, index) => {
        mem.style.cursor = 'pointer';
        mem.addEventListener('click', () => openLightbox(index));
    });

    btnClose.addEventListener('click', closeLightbox);
    btnNext.addEventListener('click', () => {
        const nextIdx = (currentIdx + 1) % sources.length;
        updateImage(nextIdx, 1);
    });
    btnPrev.addEventListener('click', () => {
        const prevIdx = (currentIdx - 1 + sources.length) % sources.length;
        updateImage(prevIdx, -1);
    });
};

const initContactNavIndicator = () => {
    const indicator = document.querySelector('.contact__nav-indicator');
    const navLinks = document.querySelectorAll('.contact__nav');
    if (!indicator || navLinks.length === 0) return;
    let currentActiveNav = document.querySelector('.contact__nav[data-page="contact"]');

    const updateIndicatorPos = (target, immediate = false) => {
        const rect = target.getBoundingClientRect();
        const startLeft = rect.left;
        const startTop = rect.top;
        if (startLeft === 0 && startTop === 0) return;
        gsap.to(indicator, {
            x: startLeft + rect.width / 2 - 65,
            y: startTop + rect.height / 2 - 65,
            opacity: 1,
            scale: 1,
            display: 'block',
            duration: immediate ? 0 : 0.6,
            ease: 'power3.out',
            overwrite: true
        });
        navLinks.forEach(n => n.classList.remove('contact__nav-active-text'));
        target.classList.add('contact__nav-active-text');
    };

    window.syncContactIndicator = () => {
        const activeNav = document.querySelector('.contact__nav[data-page="contact"]');
        if (activeNav) {
            currentActiveNav = activeNav;
            setTimeout(() => updateIndicatorPos(activeNav, true), 50);
        }
    };

    navLinks.forEach(link => {
        link.addEventListener('mouseenter', () => updateIndicatorPos(link));
        link.addEventListener('mouseleave', () => {
            if (currentActiveNav) updateIndicatorPos(currentActiveNav);
        });
    });

    window.addEventListener('resize', () => {
        if (currentActiveNav) updateIndicatorPos(currentActiveNav, true);
    });
};

const initMagneticLinks = () => {
    const links = document.querySelectorAll('.hero__nav, .portfolio__nav, .about__nav, .expertise__nav, .contact__nav, .portfolio__back, .about__back, .expertise__back, .contact__back');
    
    links.forEach(link => {
        link.addEventListener('mousemove', (e) => {
            if (window.innerWidth <= 768) return;
            const rect = link.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            gsap.to(link, {
                x: x * 0.3,
                y: y * 0.3,
                duration: 0.6,
                ease: 'power3.out'
            });
        });
        
        link.addEventListener('mouseleave', () => {
            gsap.to(link, {
                x: 0,
                y: 0,
                duration: 1,
                ease: 'elastic.out(1, 0.5)'
            });
        });
    });
};

const initSmoothScroll = () => {
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
        infinite: false,
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Integrate with GSAP
    lenis.on('scroll', () => {
        // Any site-wide scroll effects link here
    });
};

const initGrainedEffect = () => {
    // In a production environment with proper module support, we'd import 'grained'
    // Since 'grained' is often a script-tag based library, we check if it's available
    if (window.grained) {
        const options = {
            animate: true,
            patternWidth: 100,
            patternHeight: 100,
            grainOpacity: 0.05,
            grainDensity: 1,
            grainWidth: 1,
            grainHeight: 1
        };
        window.grained('#grained-container', options);
    }
};

const initPreloader = () => {
    const preloader = document.getElementById('preloader');
    const progressBar = document.querySelector('.preloader__progress');
    const heroSection = document.getElementById('heroSection');
    
    if (!preloader) return;

    const tl = gsap.timeline();

    tl.to(progressBar, {
        width: '100%',
        duration: 1.8,
        ease: 'power4.inOut'
    });

    tl.to(preloader, {
        yPercent: -100,
        duration: 1.2,
        ease: 'expo.inOut'
    });

    tl.fromTo(heroSection, 
        { opacity: 0, scale: 1.1 },
        { opacity: 1, scale: 1, duration: 1.5, ease: 'power3.out' },
        '-=0.8'
    );
};

const initContactInteractions = () => {
    const copyWrapper = document.getElementById('copyEmailWrapper');
    const openFormBtn = document.getElementById('openFormBtn');
    const closeFormBtn = document.getElementById('closeFormBtn');
    const contactContent = document.querySelector('.contact__content');
    const formWrapper = document.querySelector('.contact__form-wrapper');

    if (copyWrapper) {
        copyWrapper.addEventListener('click', async () => {
            const email = copyWrapper.querySelector('span').textContent;
            try {
                await navigator.clipboard.writeText(email);
                const span = copyWrapper.querySelector('span');
                const originalText = span.textContent;
                span.textContent = 'Copied to Clipboard';
                gsap.fromTo(copyWrapper, 
                    { scale: 0.95 },
                    { scale: 1, duration: 0.6, ease: 'elastic.out(1, 0.3)' }
                );
                setTimeout(() => {
                    span.textContent = originalText;
                }, 2000);
            } catch (err) {
                console.error('Failed to copy email: ', err);
            }
        });
    }

    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const submitBtn = contactForm.querySelector('.contact__submit-btn');
            const originalText = submitBtn.textContent;
            
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;

            setTimeout(() => {
                submitBtn.textContent = 'Message Sent Successfully!';
                submitBtn.style.backgroundColor = '#2c5e5e';
                contactForm.reset();
                
                setTimeout(() => {
                    submitBtn.textContent = originalText;
                    submitBtn.style.backgroundColor = '';
                    submitBtn.disabled = false;
                    closeFormBtn.click(); // Close form automatically
                }, 2500);
            }, 1500);
        });
    }

    if (openFormBtn && contactContent && formWrapper) {
        openFormBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const tl = gsap.timeline();
            tl.to(contactContent, {
                opacity: 0,
                y: -20,
                duration: 0.4,
                ease: 'power2.in',
                onComplete: () => {
                    gsap.set(contactContent, { display: 'none' });
                    gsap.set(formWrapper, { display: 'flex' });
                }
            });
            tl.to(formWrapper, {
                opacity: 1,
                y: 0,
                duration: 0.5,
                ease: 'power2.out'
            });
            tl.from('.contact__form-group, .contact__submit-btn, .contact__close-form', {
                opacity: 0,
                y: 20,
                duration: 0.5,
                stagger: 0.05,
                ease: 'power3.out'
            }, '-=0.3');
        });
    }

    if (closeFormBtn && contactContent && formWrapper) {
        closeFormBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const tl = gsap.timeline();
            tl.to(formWrapper, {
                opacity: 0,
                y: 20,
                duration: 0.4,
                ease: 'power2.in',
                onComplete: () => {
                    gsap.set(formWrapper, { display: 'none' });
                    gsap.set(contactContent, { display: 'flex' });
                }
            });
            tl.to(contactContent, {
                opacity: 1,
                y: 0,
                duration: 0.5,
                ease: 'power2.out'
            });
        });
    }
};

window.addEventListener('DOMContentLoaded', () => {
    updateBigCircles();
    initResizeListener();
    initSmoothScroll();
    initGrainedEffect();
    initPreloader();
    initGreenCircle();
    initEntranceAnimations();
    initPageTransitions();
    initDragScroll();
    initPortfolioNavIndicator();
    initProjectDetail();
    initAboutNavIndicator();
    initAboutInteractions();
    initMemoryLightbox();
    initExpertiseNavIndicator();
    initExpertiseInteractions();
    initContactNavIndicator();
    initContactInteractions();
    initMagneticLinks();
});
