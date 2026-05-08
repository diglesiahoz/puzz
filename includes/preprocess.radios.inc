<?php

/**
 * @file
 * Preprocess functions for radios groups in the Puzz theme.
 */

/**
 * Implements hook_preprocess_HOOK() for radios.html.twig.
 */
function puzz_preprocess_radios(array &$variables): void {
  $component = 'puzz:radio-group';
  $element = $variables['element'] ?? [];

  $props = [
    'legend' => !empty($element['#title']) ? (string) $element['#title'] : '',
    'children' => $variables['children'] ?? '',
    'required' => !empty($element['#required']),
    'disabled' => !empty($element['#disabled']),
    'help' => !empty($element['#description']) ? (string) $element['#description'] : '',
    'error' => !empty($element['#errors'])
      ? (is_array($element['#errors']) ? implode(', ', $element['#errors']) : (string) $element['#errors'])
      : '',
  ];

  if (!empty($element['#component']) && is_string($element['#component'])) {
    $component = $element['#component'];
  }
  if (!empty($element['#component_props']) && is_array($element['#component_props'])) {
    $props = array_merge($props, $element['#component_props']);
  }

  $variables['component'] = $component;
  $variables['props'] = $props;
}

