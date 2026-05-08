<?php

/**
 * @file
 * Preprocess functions for generic form elements in the Puzz theme.
 */

/**
 * Implements hook_preprocess_HOOK() for form-element.html.twig.
 *
 * For text-like inputs rendered via the puzz:input SDC component, we empty
 * the label so that form-element-label.html.twig does not output a <label>.
 * The visible (and accessible) label comes from the component.
 */
function puzz_preprocess_form_element(array &$variables): void {
  if (empty($variables['element'])) {
    return;
  }

  $element = $variables['element'];

  $text_types = [
    'textfield',
    'email',
    'password',
    'search',
    'tel',
    'url',
    'number',
    'select',
    'textarea',
    'checkboxes',
    'radios',
    'checkbox',
    'managed_file',
  ];

  if (empty($element['#type']) || !in_array($element['#type'], $text_types, TRUE)) {
    return;
  }

  // Empty the label render array so the label template outputs nothing.
  // The component puzz:input renders the visible label.
  if (isset($variables['label']) && is_array($variables['label'])) {
    $variables['label']['#title'] = '';
    $variables['label']['#required'] = FALSE;
  }
}


