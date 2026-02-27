<?php

/**
 * @file
 * Preprocess functions for input elements in the Puzz theme.
 */

use Drupal\Core\Template\Attribute;

/**
 * Implements hook_preprocess_HOOK() for input.html.twig.
 *
 * Maps Drupal Form API input element data to SDC component props so that all
 * text-like inputs are rendered through puzz:input and submit buttons through
 * puzz:cta.
 */
function puzz_preprocess_input(array &$variables): void {
  if (empty($variables['element']) || !isset($variables['attributes'])) {
    return;
  }

  /** @var array $element */
  $element = $variables['element'];

  /** @var Attribute $attributes */
  $attributes = $variables['attributes'];

  // Determine the HTML input type from attributes (fallback to "text").
  $html_type = isset($attributes['type']) ? (string) $attributes['type'] : 'text';

  // --- Case 1: submit buttons → CTA component ------------------------------
  if ($html_type === 'submit') {
    $text = isset($element['#value']) ? (string) $element['#value'] : t('Submit');

    $extra = !empty($element['#component_props']) && is_array($element['#component_props'])
      ? $element['#component_props']
      : [];

    $props = [
      'text'    => $extra['text'] ?? $text,
      'url'     => '',
      'variant' => $extra['variant'] ?? 'primary',
      'size'    => $extra['size'] ?? 'medium',
      'button_type' => 'submit',
    ];

    $variables['component'] = $element['#component'] ?? 'puzz:cta';
    $variables['props'] = $props;
    return;
  }

  // --- Case 2: text-like inputs → Input component --------------------------
  $html_text_types = ['text', 'email', 'password', 'search', 'tel', 'url', 'number'];
  if (!in_array($html_type, $html_text_types, TRUE)) {
    // Hidden, checkbox, etc. fall back to default <input> markup.
    return;
  }

  // Allow overriding the component if needed from the form definition.
  $component = $element['#component'] ?? 'puzz:input';

  // Map common HTML attributes to component props.
  $props = [
    'name'        => $attributes['name'] ?? null,
    'id'          => $attributes['id'] ?? null,
    'type'        => $html_type,
    'value'       => $attributes['value'] ?? null,
    'placeholder' => $attributes['placeholder'] ?? null,
    'required'    => !empty($element['#required']),
    'disabled'    => !empty($element['#disabled']),
  ];

  // Map common Form API metadata to higher-level props.
  if (!empty($element['#title'])) {
    $props['label'] = $element['#title'];
  }

  if (!empty($element['#errors'])) {
    $props['error'] = is_array($element['#errors'])
      ? implode(', ', $element['#errors'])
      : $element['#errors'];
  }

  if (!empty($element['#description'])) {
    $props['help'] = $element['#description'];
  }

  // Allow additional props from the form definition.
  if (!empty($element['#component_props']) && is_array($element['#component_props'])) {
    $props = array_merge($props, $element['#component_props']);
  }

  // Expose values to Twig so templates can render via SDC.
  $variables['component'] = $component;
  $variables['props'] = $props;
}

