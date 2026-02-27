/**
 * @file
 * Main JavaScript file for Puzz theme.
 * Support for navbar-collapse with navbar icon-menu and mobile menu collapse.
 */

((Drupal, once) => {
  'use strict';

  // Get breakpoints from drupalSettings (generated from puzz.breakpoints.yml)
  const breakpoints = (Drupal.settings && Drupal.settings.puzz && Drupal.settings.puzz.breakpoints) 
    ? Drupal.settings.puzz.breakpoints 
    : { xs: 0, sm: 576, md: 768, lg: 992, xl: 1200, xxl: 1400 }; // Fallback defaults

  // Breakpoint threshold (md = 768px by default)
  const BREAKPOINT_MD = breakpoints.md || 768;

  /**
   * Check if current viewport is desktop (md and above)
   */
  const isDesktop = () => {
    return window.innerWidth >= BREAKPOINT_MD;
  };

  /**
   * Clean up mobile menu states when switching to desktop
   */
  const cleanupMobileMenuStates = () => {
    // Remove inline styles that might interfere with CSS
    document.querySelectorAll('#menu .block-menu ul > li > ul').forEach(ul => {
      ul.style.display = '';
    });

    // Remove open classes from submenus (CSS will handle desktop hover)
    if (isDesktop()) {
      document.querySelectorAll('#menu .block-menu ul > li > ul.open').forEach(ul => {
        ul.classList.remove('open');
      });
      document.querySelectorAll('#menu .block-menu ul > li > span.open').forEach(span => {
        span.classList.remove('open');
      });
    }
  };

  // Navbar collapse behavior
  Drupal.behaviors.navbarCollapse = {
    attach(context) {
      once('navbarCollapse', '.icon-menu', context).forEach(iconMenu => {
        iconMenu.addEventListener('click', () => {
          document.body.classList.toggle('menu-open');
        });
      });
    }
  };

  // Mobile menu collapse behavior
  Drupal.behaviors.mobileMenuCollapse = {
    attach: function (context) {
      const menuContainer = context.querySelector('#menu .block-menu');
      if (!menuContainer) {
        return;
      }

      // Add <span> to <li> elements that contain a nested <ul>
      once('mobileMenuSpans', '#menu .block-menu ul > li', context).forEach(li => {
        if (li.querySelector('ul') && !li.querySelector('span')) {
          const span = document.createElement('span');
          li.appendChild(span);
        }
      });

      // Mark active trail items as open (only on mobile)
      if (!isDesktop()) {
        once('mobileMenuActiveTrail', '#menu .block-menu li.active-trail > span', context).forEach(span => {
          const ul = span.previousElementSibling;
          if (ul && ul.tagName === 'UL') {
            ul.classList.add('open');
            span.classList.add('open');
          }
        });
      }

      // Toggle submenu visibility when clicking the <span> (only on mobile)
      once('mobileMenuToggle', '#menu .block-menu ul > li > span', context).forEach(span => {
        span.addEventListener('click', (e) => {
          // Only handle clicks on mobile
          if (isDesktop()) {
            return;
          }

          e.preventDefault();
          e.stopPropagation();

          const ul = span.previousElementSibling;
          if (!ul || ul.tagName !== 'UL') {
            return;
          }

          // Toggle using classes only (CSS handles display)
          if (ul.classList.contains('open')) {
            ul.classList.remove('open');
            span.classList.remove('open');
          } else {
            ul.classList.add('open');
            span.classList.add('open');
          }
        });
      });
    }
  };

  // Handle resize events to clean up mobile menu states
  Drupal.behaviors.mobileMenuResize = {
    attach: function (context) {
      let resizeTimeout;
      let lastIsDesktop = isDesktop();

      const handleResize = () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          const currentIsDesktop = isDesktop();

          // If we switched from mobile to desktop or vice versa
          if (lastIsDesktop !== currentIsDesktop) {
            cleanupMobileMenuStates();

            // If switching to desktop, close mobile menu
            if (currentIsDesktop) {
              document.body.classList.remove('menu-open');
            }
          }

          lastIsDesktop = currentIsDesktop;
        }, 100);
      };

      // Listen for resize events
      window.addEventListener('resize', handleResize);

      // Initial cleanup check
      cleanupMobileMenuStates();
    }
  };

  // Development mode: Update viewport dimensions in breakpoint indicator
  Drupal.behaviors.devBreakpointIndicator = {
    attach: function (context) {
      const canvas = context.querySelector('.dialog-off-canvas-main-canvas');
      if (!canvas) {
        return;
      }

      const updateViewport = () => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        canvas.setAttribute('data-viewport', `(${width}×${height})`);
      };

      // Update on load
      updateViewport();

      // Update on resize (with debounce for performance)
      let resizeTimeout;
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(updateViewport, 100);
      });
    }
  };
  
})(Drupal, once);
