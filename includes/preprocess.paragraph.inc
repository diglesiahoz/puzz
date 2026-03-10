<?php

/**
 * @file
 * Preprocess for paragraph templates in the Puzz theme.
 *
 * Maps normalized paragraph bundles and view modes to SDC components.
 *
 * @see templates/paragraph/paragraph--puzz-c-section--puzz-c-section.html.twig
 */

use Drupal\Core\Entity\Display\EntityViewDisplayInterface;
use Drupal\Core\Field\EntityReferenceFieldItemListInterface;
use Drupal\Core\Url;
use Drupal\link\Plugin\Field\FieldType\LinkItem;
use Drupal\paragraphs\ParagraphInterface;

/**
 * Implements hook_preprocess_HOOK() for paragraph.
 *
 * En los view modes específicos de cada paragraph prepara component + props;
 * la plantilla correspondiente renderiza el SDC.
 */
function puzz_preprocess_paragraph(array &$variables): void {
  $elements = $variables['elements'] ?? [];
  $paragraph = $variables['paragraph'] ?? $elements['#paragraph'] ?? NULL;
  $view_mode = $variables['view_mode'] ?? $elements['#view_mode'] ?? '';

  if (!$paragraph) {
    return;
  }

  if ($paragraph->bundle() === 'puzz_section' && $view_mode === 'puzz_section') {
    _puzz_paragraph_section_component($variables, $paragraph);
    return;
  }

  if ($paragraph->bundle() === 'puzz_header' && $view_mode === 'puzz_header') {
    _puzz_paragraph_header_component($variables, $paragraph);
    return;
  }

}

/**
 * Prepara component + props para el paragraph type de section.
 */
function _puzz_paragraph_section_component(array &$variables, ParagraphInterface $paragraph): void {
  $content_build = [];
  $field_name = $paragraph->hasField('field_puzz_section_component')
    ? 'field_puzz_section_component'
    : ($paragraph->hasField('field_component') ? 'field_component' : NULL);

  if ($field_name !== NULL && !$paragraph->get($field_name)->isEmpty()) {
    /** @var \Drupal\Core\Field\EntityReferenceFieldItemListInterface $field_items */
    $field_items = $paragraph->get($field_name);
    $children = $field_items->referencedEntities();
    if ($children !== []) {
      $view_builder = \Drupal::entityTypeManager()->getViewBuilder('paragraph');
      foreach ($children as $delta => $child) {
        $child_view_mode = str_starts_with($child->bundle(), 'puzz_')
          ? $child->bundle()
          : 'default';
        $content_build[$delta] = $view_builder->view($child, $child_view_mode);
      }
    }
  }

  $label_display = 'hidden';
  $label_text = '';
  /** @var \Drupal\Core\Entity\Display\EntityViewDisplayInterface|null $display */
  $display = \Drupal::entityTypeManager()
    ->getStorage('entity_view_display')
    ->load('paragraph.' . $paragraph->bundle() . '.' . ($variables['view_mode'] ?? 'puzz_section'));
  if ($display && $field_name !== NULL && $paragraph->hasField($field_name)) {
    $component = $display->getComponent($field_name);
    if (!empty($component['label']) && $component['label'] !== 'hidden') {
      $label_display = $component['label'];
      $label_text = (string) $paragraph->get($field_name)->getFieldDefinition()->getLabel();
    }
  }

  $variables['component'] = 'puzz:section';
  $variables['props'] = [
    'content' => $content_build,
    'label_display' => $label_display,
    'label_text' => $label_text,
  ];
}

/**
 * Prepara component + props para el paragraph type "puzz_header".
 */
function _puzz_paragraph_header_component(array &$variables, ParagraphInterface $paragraph): void {
  $caption = $paragraph->hasField('field_puzz_header_caption') && !$paragraph->get('field_puzz_header_caption')->isEmpty()
    ? (string) $paragraph->get('field_puzz_header_caption')->value
    : '';
  $heading = $caption !== '' ? $caption : _puzz_get_current_page_title();

  $image_url = '';
  $image_alt = '';
  if ($paragraph->hasField('field_puzz_header_image') && !$paragraph->get('field_puzz_header_image')->isEmpty()) {
    $media = $paragraph->get('field_puzz_header_image')->entity;
    if ($media && $media->hasField('field_media_image') && !$media->get('field_media_image')->isEmpty()) {
      $image_item = $media->get('field_media_image')->first();
      if ($image_item && $image_item->entity) {
        $file_url_generator = \Drupal::service('file_url_generator');
        $image_url = (string) $file_url_generator->generateAbsoluteString($image_item->entity->getFileUri());
        $image_alt = (string) ($image_item->alt ?? '');
      }
    }
  }

  $link_url = '';
  $link_title = '';
  if ($paragraph->hasField('field_puzz_header_link') && !$paragraph->get('field_puzz_header_link')->isEmpty()) {
    /** @var \Drupal\link\Plugin\Field\FieldType\LinkItem|null $link_item */
    $link_item = $paragraph->get('field_puzz_header_link')->first();
    if ($link_item) {
      $link_url = Url::fromUri($link_item->uri)->toString();
      $link_title = (string) ($link_item->title ?? '');
    }
  }

  $variables['component'] = 'puzz:header';
  $variables['props'] = [
    'caption' => $caption,
    'heading' => $heading,
    'image_url' => $image_url,
    'image_alt' => $image_alt,
    'link_url' => $link_url,
    'link_title' => $link_title,
    'label_display' => 'hidden',
    'label_text' => '',
  ];
}

/**
 * Obtiene el título actual de página para usarlo como H1 de fallback.
 */
function _puzz_get_current_page_title(): string {
  $route_match = \Drupal::routeMatch();
  $node = $route_match->getParameter('node');

  if ($node instanceof \Drupal\node\NodeInterface) {
    return (string) $node->label();
  }

  $request = \Drupal::requestStack()->getCurrentRequest();
  $route = $route_match->getRouteObject();
  if ($request && $route) {
    $title = \Drupal::service('title_resolver')->getTitle($request, $route);
    if (is_string($title) || $title instanceof \Stringable) {
      return (string) $title;
    }
  }

  return '';
}

