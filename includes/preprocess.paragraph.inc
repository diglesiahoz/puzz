<?php

/**
 * @file
 * Preprocess for paragraph templates in the Puzz theme.
 *
 * Maps paragraph types in view mode "component" to SDC components (puzz:section, etc.)
 * by setting $variables['component'] and $variables['props'], igual que preprocess.input.inc.
 *
 * @see templates/paragraph/paragraph--section--component.html.twig
 */

use Drupal\paragraphs\ParagraphInterface;

/**
 * Implements hook_preprocess_HOOK() for paragraph.
 *
 * En view mode "component" prepara component + props (y label del display) para
 * section y background_image; la plantilla correspondiente renderiza el SDC.
 */
function puzz_preprocess_paragraph(array &$variables): void {
  $elements = $variables['elements'] ?? [];
  $paragraph = $variables['paragraph'] ?? $elements['#paragraph'] ?? NULL;
  $view_mode = $variables['view_mode'] ?? $elements['#view_mode'] ?? '';

  if (!$paragraph || $view_mode !== 'component') {
    return;
  }

  if ($paragraph->bundle() === 'section') {
    _puzz_paragraph_section_component($variables, $paragraph);
    return;
  }

  if ($paragraph->bundle() === 'background_image') {
    _puzz_paragraph_background_image_component($variables, $paragraph);
  }
}

/**
 * Prepara component + props para el paragraph type "section" en view mode "component".
 * Respeta la posición del label de field_component según el display.
 */
function _puzz_paragraph_section_component(array &$variables, ParagraphInterface $paragraph): void {
  $content_html = '';

  if ($paragraph->hasField('field_component') && !$paragraph->get('field_component')->isEmpty()) {
    $children = $paragraph->get('field_component')->referencedEntities();
    if ($children !== []) {
      $view_builder = \Drupal::entityTypeManager()->getViewBuilder('paragraph');
      $children_build = $view_builder->viewMultiple($children, 'component');
      $content_html = (string) \Drupal::service('renderer')->renderRoot($children_build);
    }
  }

  // Respetar label del display (above/below/hidden) para field_component.
  $label_display = 'hidden';
  $label_text = '';
  $display = \Drupal::entityTypeManager()
    ->getStorage('entity_view_display')
    ->load('paragraph.section.component');
  if ($display && $paragraph->hasField('field_component')) {
    $component = $display->getComponent('field_component');
    if (!empty($component['label']) && $component['label'] !== 'hidden') {
      $label_display = $component['label'];
      $label_text = (string) $paragraph->get('field_component')->getFieldDefinition()->getLabel();
    }
  }

  $variables['component'] = 'puzz:section';
  $variables['props'] = [
    'content' => $content_html,
    'label_display' => $label_display,
    'label_text' => $label_text,
  ];
}

/**
 * Prepara component + props para el paragraph type "background_image" en view mode "component".
 * Respeta la posición del label del display (above/below/hidden) para el campo de media.
 */
function _puzz_paragraph_background_image_component(array &$variables, ParagraphInterface $paragraph): void {
  $media_field_name = $paragraph->hasField('field_media') && !$paragraph->get('field_media')->isEmpty()
    ? 'field_media'
    : ($paragraph->hasField('field_background_media') && !$paragraph->get('field_background_media')->isEmpty() ? 'field_background_media' : NULL);
  if ($media_field_name === NULL) {
    return;
  }

  $media = $paragraph->get($media_field_name)->entity;
  if (!$media || !$media->hasField('field_media_image') || $media->get('field_media_image')->isEmpty()) {
    return;
  }

  $image_item = $media->get('field_media_image')->first();
  if (!$image_item || !$image_item->entity) {
    return;
  }

  $file_url_generator = \Drupal::service('file_url_generator');
  $image_url = (string) $file_url_generator->generateAbsoluteString($image_item->entity->getFileUri());
  $image_alt = (string) ($image_item->alt ?? '');

  $variables['component'] = 'puzz:background_image';
  $variables['props'] = [
    'image_url' => $image_url,
    'image_alt' => $image_alt,
    'overlay' => 'dark',
    'label_display' => 'hidden',
    'label_text' => '',
  ];

  // Respetar label del display (above/below/hidden) para el campo de media.
  $display = \Drupal::entityTypeManager()
    ->getStorage('entity_view_display')
    ->load('paragraph.background_image.component');
  if ($display) {
    $component_config = $display->getComponent($media_field_name);
    $label_display = $component_config ? ($component_config['label'] ?? 'hidden') : 'hidden';
    $variables['props']['label_display'] = $label_display;
    $variables['props']['label_text'] = (string) $paragraph->get($media_field_name)->getFieldDefinition()->getLabel();
  }
}
