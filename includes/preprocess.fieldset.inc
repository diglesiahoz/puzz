<?php

/**
 * @file
 * Preprocess functions for fieldset elements in the Puzz theme.
 */

/**
 * Implements hook_preprocess_HOOK() for fieldset.html.twig.
 */
function puzz_preprocess_fieldset(array &$variables): void {
  $component = 'puzz:form-fieldset';

  $legend = '';
  if (!empty($variables['legend']['title'])) {
    $legend = (string) $variables['legend']['title'];
  }

  $description = '';
  if (!empty($variables['description']['content'])) {
    $description = (string) $variables['description']['content'];
  }

  $props = [
    'legend' => $legend,
    'description' => $description,
    'description_display' => (string) ($variables['description_display'] ?? 'after'),
    'required' => !empty($variables['required']),
    'errors' => !empty($variables['errors']) ? (string) $variables['errors'] : '',
    'prefix' => !empty($variables['prefix']) ? (string) $variables['prefix'] : '',
    'suffix' => !empty($variables['suffix']) ? (string) $variables['suffix'] : '',
    'children' => $variables['children'] ?? '',
  ];

  $variables['component'] = $component;
  $variables['props'] = $props;
}

