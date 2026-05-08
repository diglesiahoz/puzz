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

  // --- Case 2: file inputs → File input component --------------------------
  if ($html_type === 'file') {
    $component = $element['#component'] ?? 'puzz:file-input';
    $props = [
      'name'        => $attributes['name'] ?? null,
      'id'          => $attributes['id'] ?? null,
      'label'       => !empty($element['#title']) ? $element['#title'] : null,
      'required'    => !empty($element['#required']),
      'disabled'    => !empty($element['#disabled']),
      'multiple'    => isset($attributes['multiple']) || !empty($element['#multiple']),
      'accept'      => $attributes['accept'] ?? null,
      'help'        => !empty($element['#description']) ? $element['#description'] : null,
      'error'       => !empty($element['#errors'])
        ? (is_array($element['#errors']) ? implode(', ', $element['#errors']) : $element['#errors'])
        : null,
    ];

    if (!empty($element['#component_props']) && is_array($element['#component_props'])) {
      $props = array_merge($props, $element['#component_props']);
    }

    $variables['component'] = $component;
    $variables['props'] = $props;
    return;
  }

  // --- Case 3: single checkboxes → Checkbox component ----------------------
  if ($html_type === 'checkbox') {
    $component = $element['#component'] ?? 'puzz:checkbox';
    $is_checked = !empty($element['#checked']) || isset($attributes['checked']);
    $props = [
      'name'        => $attributes['name'] ?? null,
      'id'          => $attributes['id'] ?? null,
      'label'       => !empty($element['#title']) ? $element['#title'] : null,
      'value'       => $attributes['value'] ?? '1',
      'checked'     => $is_checked,
      'required'    => !empty($element['#required']),
      'disabled'    => !empty($element['#disabled']),
      'help'        => !empty($element['#description']) ? $element['#description'] : null,
      'error'       => !empty($element['#errors'])
        ? (is_array($element['#errors']) ? implode(', ', $element['#errors']) : $element['#errors'])
        : null,
    ];

    if (!empty($element['#component_props']) && is_array($element['#component_props'])) {
      $props = array_merge($props, $element['#component_props']);
    }

    $variables['component'] = $component;
    $variables['props'] = $props;
    return;
  }

  // --- Case 4: range input --------------------------------------------------
  if ($html_type === 'range') {
    $component = $element['#component'] ?? 'puzz:input-range';
    $props = [
      'name'        => $attributes['name'] ?? null,
      'id'          => $attributes['id'] ?? null,
      'label'       => !empty($element['#title']) ? $element['#title'] : null,
      'value'       => $attributes['value'] ?? null,
      'min'         => $attributes['min'] ?? null,
      'max'         => $attributes['max'] ?? null,
      'step'        => $attributes['step'] ?? null,
      'required'    => !empty($element['#required']),
      'disabled'    => !empty($element['#disabled']),
      'help'        => !empty($element['#description']) ? $element['#description'] : null,
      'error'       => !empty($element['#errors'])
        ? (is_array($element['#errors']) ? implode(', ', $element['#errors']) : $element['#errors'])
        : null,
    ];

    if (!empty($element['#component_props']) && is_array($element['#component_props'])) {
      $props = array_merge($props, $element['#component_props']);
    }

    $variables['component'] = $component;
    $variables['props'] = $props;
    return;
  }

  // --- Case 5: color input --------------------------------------------------
  if ($html_type === 'color') {
    $component = $element['#component'] ?? 'puzz:input-color';
    $props = [
      'name'        => $attributes['name'] ?? null,
      'id'          => $attributes['id'] ?? null,
      'label'       => !empty($element['#title']) ? $element['#title'] : null,
      'value'       => $attributes['value'] ?? null,
      'required'    => !empty($element['#required']),
      'disabled'    => !empty($element['#disabled']),
      'help'        => !empty($element['#description']) ? $element['#description'] : null,
      'error'       => !empty($element['#errors'])
        ? (is_array($element['#errors']) ? implode(', ', $element['#errors']) : $element['#errors'])
        : null,
    ];

    if (!empty($element['#component_props']) && is_array($element['#component_props'])) {
      $props = array_merge($props, $element['#component_props']);
    }

    $variables['component'] = $component;
    $variables['props'] = $props;
    return;
  }

  // --- Case 6: text-like inputs → Input component --------------------------
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
    'min'         => $attributes['min'] ?? null,
    'max'         => $attributes['max'] ?? null,
    'step'        => $attributes['step'] ?? null,
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

