let slides = [];
let currentSlide = 0;
let isAutoPlay = false;
let autoPlayInterval = null;

const slidesWrapper = document.getElementById('slides-wrapper');

const fetchSlides = async () => {
    const response = await fetch('slides.json').then(r => r.json());
    slides = response.slides;
    for (const slide of slides) {
        slide.demos = slide.demos.map(demo => response.demos.find(d => d.demo === demo));
        console.log(slide.title, slide.demos);
    }
    renderSlides();
    initializeParticles();
    setupKeyboardNavigation();
};

const renderSlides = () => {
    const slidesHTML = slides.map((slide, index) => {
        const demoButtons = slide.demos ? slide.demos.map(demo => `
            <button class="demo-button" onclick="window.open('${demo.link}', '_blank')">
                ${demo.demo}
                <div class="demo-tooltip">${demo.description}</div>
            </button>
        `).join('') : '';

        return `
            <div class="slide">
                <div class="page-number">${index + 1} / ${slides.length}</div>
                <h1 class="slide-title">${slide.title}</h1>
                <div class="slide-content ${index % 2 === 1 ? 'reverse' : ''}">
                    <div class="content-text">
                        ${slide.description}
                    </div>
                    <div class="content-image">
                        <img src="${slide.image}" alt="${slide.image_description}" loading="lazy">
                    </div>
                </div>
                ${demoButtons ? `<div class="demo-buttons">${demoButtons}</div>` : ''}
            </div>
        `;
    }).join('');

    slidesWrapper.innerHTML = slidesHTML;
};

const goToSlide = (index) => {
    if (index < 0 || index >= slides.length) return;

    currentSlide = index;
    const translateX = -currentSlide * 100;
    slidesWrapper.style.transform = `translateX(${translateX}vw)`;

    // Update URL hash without affecting history
    history.replaceState(null, null, `#slide-${currentSlide + 1}`);
};

const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
        goToSlide(currentSlide + 1);
    }
};

const prevSlide = () => {
    if (currentSlide > 0) {
        goToSlide(currentSlide - 1);
    }
};

const toggleAutoPlay = () => {
    isAutoPlay = !isAutoPlay;
    const indicator = document.getElementById('autoplay-indicator');

    if (isAutoPlay) {
        autoPlayInterval = setInterval(() => {
            if (currentSlide >= slides.length - 1) {
                goToSlide(0);
            } else {
                nextSlide();
            }
        }, 6000);
        indicator.textContent = '▶️';
        indicator.className = 'autoplay-indicator playing';
    } else {
        clearInterval(autoPlayInterval);
        autoPlayInterval = null;
        indicator.textContent = '⏸️';
        indicator.className = 'autoplay-indicator paused';
    }
};

const setupKeyboardNavigation = () => {
    document.addEventListener('keydown', (event) => {
        switch (event.key) {
            case 'ArrowRight':
                event.preventDefault();
                nextSlide();
                break;
            case 'ArrowLeft':
                event.preventDefault();
                prevSlide();
                break;
            case ' ':
                event.preventDefault();
                nextSlide();
                break;
            case 'p':
            case 'P':
                event.preventDefault();
                toggleAutoPlay();
                break;
        }
    });
};

const initializeParticles = () => {
    particlesJS('particles-js', {
        particles: {
            number: {
                value: 120,
                density: {
                    enable: true,
                    value_area: 800
                }
            },
            color: {
                value: '#ffffff'
            },
            shape: {
                type: 'circle',
                stroke: {
                    width: 0,
                    color: '#000000'
                }
            },
            opacity: {
                value: 0.4,
                random: true,
                anim: {
                    enable: true,
                    speed: 1.5,
                    opacity_min: 0.2,
                    sync: false
                }
            },
            size: {
                value: 4,
                random: true,
                anim: {
                    enable: true,
                    speed: 2,
                    size_min: 2,
                    sync: false
                }
            },
            line_linked: {
                enable: true,
                distance: 180,
                color: '#ffffff',
                opacity: 0.2,
                width: 1.5
            },
            move: {
                enable: true,
                speed: 2,
                direction: 'none',
                random: true,
                straight: false,
                out_mode: 'out',
                bounce: false,
                attract: {
                    enable: false
                }
            }
        },
        interactivity: {
            detect_on: 'canvas',
            events: {
                onhover: {
                    enable: false
                },
                onclick: {
                    enable: false
                },
                resize: true
            }
        },
        retina_detect: true
    });
};

const loadSlideFromHash = () => {
    const hash = window.location.hash;
    if (hash.startsWith('#slide-')) {
        const slideNumber = parseInt(hash.replace('#slide-', ''));
        if (slideNumber >= 1 && slideNumber <= slides.length) {
            goToSlide(slideNumber - 1);
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    fetchSlides().then(() => {
        loadSlideFromHash();
    });
});
