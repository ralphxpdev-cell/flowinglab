/**
 * Navigation Module
 * Handles horizontal section scrolling and navigation
 */

(function() {
    'use strict';

    const container = document.getElementById('container');
    const sections = document.querySelectorAll('.section');
    const progressCurrent = document.getElementById('progressCurrent');
    const progressFill = document.getElementById('progressFill');
    const navLinks = document.querySelectorAll('.nav-link');

    let currentIndex = 0;
    let isScrolling = false;
    const totalSections = sections.length;

    /**
     * Navigate to specific section
     * @param {number} index - Section index to navigate to
     */
    function goToSection(index) {
        if (index < 0 || index >= totalSections || isScrolling) return;

        isScrolling = true;
        currentIndex = index;

        // Translate container
        const translateX = -index * 100;
        container.style.transform = `translateX(${translateX}vw)`;

        // Update progress indicator
        progressCurrent.textContent = String(index + 1).padStart(2, '0');
        progressFill.style.width = ((index + 1) / totalSections * 100) + '%';

        // Trigger section-specific animations
        if (window.triggerSectionAnimation) {
            window.triggerSectionAnimation(index);
        }

        // Reset scrolling lock
        setTimeout(() => {
            isScrolling = false;
        }, 1000);
    }

    /**
     * Mouse wheel navigation
     */
    document.addEventListener('wheel', (e) => {
        e.preventDefault();
        if (isScrolling) return;

        if (e.deltaY > 0 || e.deltaX > 0) {
            goToSection(currentIndex + 1);
        } else {
            goToSection(currentIndex - 1);
        }
    }, { passive: false });

    /**
     * Touch navigation
     */
    let touchStartX = 0;
    document.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
    });

    document.addEventListener('touchend', (e) => {
        if (isScrolling) return;
        const diff = touchStartX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) {
            goToSection(diff > 0 ? currentIndex + 1 : currentIndex - 1);
        }
    });

    /**
     * Keyboard navigation
     */
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            goToSection(currentIndex + 1);
        }
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            goToSection(currentIndex - 1);
        }
    });

    /**
     * Navigation link clicks
     */
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionIndex = parseInt(link.getAttribute('data-section'));
            if (!isNaN(sectionIndex)) {
                goToSection(sectionIndex);
            }
        });
    });

    // Export goToSection for external use
    window.goToSection = goToSection;
})();
