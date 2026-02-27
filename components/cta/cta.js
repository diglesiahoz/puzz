/**
 * @file
 * CTA button component JavaScript.
 */

(function (Drupal) {
  'use strict';

  Drupal.behaviors.cta = {
    attach: function (context, settings) {
      const ctaButtons = context.querySelectorAll('.cta');
      
      ctaButtons.forEach(function (button) {
        // Add any interactive behavior here if needed
      });
    }
  };

})(Drupal);
