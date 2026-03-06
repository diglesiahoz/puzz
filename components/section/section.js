/**
 * @file
 * Section component JavaScript.
 */

(function (Drupal) {
  'use strict';

  Drupal.behaviors.section = {
    attach: function (context) {
      context.querySelectorAll('.section').forEach(function () {});
    }
  };

})(Drupal);
