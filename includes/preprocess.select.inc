<?php

/**
 * @file
 * Preprocess functions for select elements in the Puzz theme.
 */

/**
 * Implements hook_preprocess_HOOK() for select.html.twig.
 */
function puzz_preprocess_select(array &$variables): void {
  $component = 'puzz:select';
  $element = $variables['element'] ?? [];
  $attributes = $variables['attributes'] ?? NULL;
  $options = $variables['options'] ?? [];

  $mapped_options = [];
  foreach ($options as $option) {
    if (!is_array($option) || empty($option['type'])) {
      continue;
    }

    if ($option['type'] === 'option') {
      $mapped_options[] = [
        'type' => 'option',
        'value' => $option['value'] ?? '',
        'label' => $option['label'] ?? '',
        'selected' => !empty($option['selected']),
      ];
      continue;
    }

    if ($option['type'] === 'optgroup') {
      $group_options = [];
      if (!empty($option['options']) && is_array($option['options'])) {
        foreach ($option['options'] as $sub_option) {
          $group_options[] = [
            'type' => 'option',
            'value' => $sub_option['value'] ?? '',
            'label' => $sub_option['label'] ?? '',
            'selected' => !empty($sub_option['selected']),
          ];
        }
      }
      $mapped_options[] = [
        'type' => 'optgroup',
        'label' => $option['label'] ?? '',
        'options' => $group_options,
      ];
    }
  }

  $props = [
    'name' => ($attributes && isset($attributes['name'])) ? (string) $attributes['name'] : NULL,
    'id' => ($attributes && isset($attributes['id'])) ? (string) $attributes['id'] : NULL,
    'label' => !empty($element['#title']) ? (string) $element['#title'] : '',
    'required' => !empty($element['#required']),
    'disabled' => !empty($element['#disabled']),
    'multiple' => ($attributes && isset($attributes['multiple'])),
    'options' => $mapped_options,
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

