<?php

/**
 * @file
 * Preprocess functions for textarea elements in the Puzz theme.
 */

/**
 * Implements hook_preprocess_HOOK() for textarea.html.twig.
 */
function puzz_preprocess_textarea(array &$variables): void {
  $component = 'puzz:textarea';
  $element = $variables['element'] ?? [];
  $attributes = $variables['attributes'] ?? NULL;

  $props = [
    'name' => ($attributes && isset($attributes['name'])) ? (string) $attributes['name'] : NULL,
    'id' => ($attributes && isset($attributes['id'])) ? (string) $attributes['id'] : NULL,
    'label' => !empty($element['#title']) ? (string) $element['#title'] : '',
    'value' => isset($variables['value']) ? (string) $variables['value'] : '',
    'rows' => ($attributes && isset($attributes['rows'])) ? (int) $attributes['rows'] : 5,
    'placeholder' => ($attributes && isset($attributes['placeholder'])) ? (string) $attributes['placeholder'] : '',
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

