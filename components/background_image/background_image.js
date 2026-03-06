/**
 * @file
 * Background image component JavaScript.
 */

(function (Drupal) {
  'use strict';

  Drupal.behaviors.backgroundImage = {
    attach: function (context, settings) {
      const blocks = context.querySelectorAll('.background-image');
      blocks.forEach(function () {
        // Comportamiento opcional (ej. lazy-load de imagen si se añade en el futuro).
      });
    }
  };

})(Drupal);
