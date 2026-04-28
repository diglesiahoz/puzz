/**
 * @file
 * JavaScript to handle reset of default values in theme settings.
 */

(function (Drupal, once) {
  'use strict';

  Drupal.behaviors.puzzThemeSettingsReset = {
    attach(context) {
      // Icons selector UI (search + selected count).
      const iconsSearch = context.querySelector('.js-puzz-icons-search');
      const iconsGrid = context.querySelector('.js-puzz-icons-grid');
      const iconsIncludeAll = context.querySelector('.js-puzz-icons-include-all');
      const iconsCount = context.querySelector('.js-puzz-icons-count');
      const selectedList = context.querySelector('.js-puzz-icons-selected-list');
      const MAX_VISIBLE_ICONS = 300;
      const PAGE_SIZE = 100;
      let isBulkUpdating = false;
      let updateScheduled = false;
      let filterTimer = null;
      let currentPage = 1;
      let showSelectedOnly = false;
      let paginationInfo = null;
      let prevBtn = null;
      let nextBtn = null;
      let lastResult = { total: 0, shown: 0, page: 1, pages: 1 };

      function getIconItems() {
        if (!iconsGrid) return [];
        return Array.from(iconsGrid.querySelectorAll('.form-item.js-form-type-checkbox, .form-type-checkbox'))
          .filter((item) => item.querySelector('input[type="checkbox"]'));
      }

      let iconItemsMeta = null;

      function getIconItemsMeta() {
        if (iconItemsMeta) {
          return iconItemsMeta;
        }
        iconItemsMeta = getIconItems().map((wrapper) => {
          const input = wrapper.querySelector('input[type="checkbox"]');
          const label = wrapper.querySelector('label');
          const labelText = (label?.textContent || '').trim();
          return {
            wrapper,
            input,
            label,
            text: labelText,
            textLower: labelText.toLowerCase(),
            rawName: labelText.replace(/^icon-/, ''),
            id: input ? input.getAttribute('id') : '',
          };
        }).filter((item) => item.input && item.label);
        return iconItemsMeta;
      }

      function escapeHtml(value) {
        return String(value)
          .replaceAll('&', '&amp;')
          .replaceAll('<', '&lt;')
          .replaceAll('>', '&gt;')
          .replaceAll('"', '&quot;')
          .replaceAll("'", '&#039;');
      }

      function updateIconsCount() {
        if (!iconsGrid || !iconsCount) return;
        if (isBulkUpdating) return;
        const checkedItems = getIconItemsMeta().filter((item) => item.input.checked);
        const checkedInputs = checkedItems.map((item) => item.input);
        const checked = checkedInputs.length;
        iconsCount.textContent = Drupal.t('@count selected', { '@count': checked });

        if (!selectedList) return;
        selectedList.innerHTML = '';
        if (!checked) {
          selectedList.innerHTML = `<span class="puzz-icons-empty">${Drupal.t('No icons selected')}</span>`;
          return;
        }

        const fragment = document.createDocumentFragment();
        checkedItems.forEach((item) => {
          const text = item.text;
          const rawName = item.rawName;

          const chip = document.createElement('span');
          chip.className = 'puzz-icon-chip';
          chip.dataset.iconName = text;
          chip.title = Drupal.t('Click to copy @name', { '@name': text });
          chip.innerHTML = `
            <span class="puzz-icon-chip__preview" aria-hidden="true"></span>
            <span class="puzz-icon-chip__name">${text}</span>
          `;

          const preview = chip.querySelector('.puzz-icon-chip__preview');
          if (preview) {
            preview.innerHTML = renderIconPreview(rawName);
          }
          fragment.appendChild(chip);
        });
        selectedList.appendChild(fragment);
      }

      function scheduleIconsUpdate() {
        if (updateScheduled) return;
        updateScheduled = true;
        window.requestAnimationFrame(() => {
          updateScheduled = false;
          updateIconsCount();
        });
      }

      function filterIcons() {
        if (!iconsGrid || !iconsSearch) return;
        const term = (iconsSearch.value || '').trim().toLowerCase();
        const items = getIconItemsMeta();
        const matches = [];

        items.forEach((item) => {
          const isSelected = !!item.input.checked;
          const isMatch = (!term || item.textLower.includes(term));
          if (isMatch && (!showSelectedOnly || isSelected)) {
            matches.push(item);
          }
          item.wrapper.style.display = 'none';
          item.wrapper.dataset.puzzVisible = '0';
        });

        const totalMatches = matches.length;
        const totalPages = Math.max(1, Math.ceil(totalMatches / PAGE_SIZE));
        if (currentPage > totalPages) {
          currentPage = totalPages;
        }
        if (currentPage < 1) {
          currentPage = 1;
        }

        const start = (currentPage - 1) * PAGE_SIZE;
        const end = Math.min(start + PAGE_SIZE, totalMatches);
        const visibleSlice = matches.slice(start, end);
        const limitedSlice = visibleSlice.slice(0, MAX_VISIBLE_ICONS);
        limitedSlice.forEach((item) => {
          item.wrapper.style.display = '';
          item.wrapper.dataset.puzzVisible = '1';
          ensureIconPreview(item);
        });

        // If we hit the visual safety cap, hide the rest on this page.
        if (visibleSlice.length > MAX_VISIBLE_ICONS) {
          visibleSlice.slice(MAX_VISIBLE_ICONS).forEach((item) => {
            item.wrapper.style.display = 'none';
            item.wrapper.dataset.puzzVisible = '0';
          });
        }

        lastResult = {
          total: totalMatches,
          shown: limitedSlice.length,
          page: currentPage,
          pages: totalPages,
        };

        renderFilterInfo(totalMatches, limitedSlice.length);
        updatePaginationUI();
        scheduleIconsUpdate();
      }

      function ensurePaginationUI() {
        if (!iconsGrid) return;
        const parent = iconsGrid.parentNode;
        if (!parent) return;
        let bar = parent.querySelector('.js-puzz-icons-pagination');
        if (!bar) {
          bar = document.createElement('div');
          bar.className = 'puzz-icons-pagination js-puzz-icons-pagination';
          bar.innerHTML = `
            <button type="button" class="button button--small js-puzz-icons-first">First</button>
            <button type="button" class="button button--small js-puzz-icons-prev">Prev</button>
            <span class="js-puzz-icons-page-info"></span>
            <button type="button" class="button button--small js-puzz-icons-next">Next</button>
            <button type="button" class="button button--small js-puzz-icons-last">Last</button>
          `;
          parent.insertBefore(bar, iconsGrid.nextSibling);
        }
        paginationInfo = bar.querySelector('.js-puzz-icons-page-info');
        prevBtn = bar.querySelector('.js-puzz-icons-prev');
        nextBtn = bar.querySelector('.js-puzz-icons-next');
        const firstBtn = bar.querySelector('.js-puzz-icons-first');
        const lastBtn = bar.querySelector('.js-puzz-icons-last');

        once('puzz-icons-pagination-first', '.js-puzz-icons-first', bar).forEach((button) => button.addEventListener('click', (event) => {
          event.preventDefault();
          if (currentPage <= 1) return;
          currentPage = 1;
          filterIcons();
        }));
        once('puzz-icons-pagination-prev', '.js-puzz-icons-prev', bar).forEach((button) => button.addEventListener('click', (event) => {
          event.preventDefault();
          if (currentPage <= 1) return;
          currentPage--;
          filterIcons();
        }));
        once('puzz-icons-pagination-next', '.js-puzz-icons-next', bar).forEach((button) => button.addEventListener('click', (event) => {
          event.preventDefault();
          if (currentPage >= lastResult.pages) return;
          currentPage++;
          filterIcons();
        }));
        once('puzz-icons-pagination-last', '.js-puzz-icons-last', bar).forEach((button) => button.addEventListener('click', (event) => {
          event.preventDefault();
          if (currentPage >= lastResult.pages) return;
          currentPage = lastResult.pages;
          filterIcons();
        }));
      }

      function ensureIconPreview(item) {
        const label = item.label;
        if (!label) {
          return;
        }
        const rawName = item.rawName;
        if (!rawName) {
          return;
        }
        const markup = renderIconPreview(rawName);
        let preview = label.querySelector('.puzz-icon-option-preview');
        if (!preview) {
          preview = document.createElement('span');
          preview.className = 'puzz-icon-option-preview';
          preview.setAttribute('aria-hidden', 'true');
          label.prepend(preview);
          label.classList.add('puzz-icon-option-label');
        }
        preview.dataset.iconName = item.text;
        preview.title = Drupal.t('Click to copy @name', { '@name': item.text });
        if (preview.dataset.puzzMarkup !== markup) {
          preview.innerHTML = markup;
          preview.dataset.puzzMarkup = markup;
        }
      }

      async function copyIconName(iconName) {
        const value = (iconName || '').trim();
        if (!value) return false;
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(value);
          } else {
            const input = document.createElement('input');
            input.value = value;
            input.style.position = 'fixed';
            input.style.opacity = '0';
            document.body.appendChild(input);
            input.focus();
            input.select();
            document.execCommand('copy');
            document.body.removeChild(input);
          }
          return true;
        } catch (e) {
          return false;
        }
      }

      function showCopiedFeedback(anchorEl) {
        if (!anchorEl) return;
        const existing = anchorEl.parentNode && anchorEl.parentNode.querySelector('.puzz-copy-feedback');
        if (existing) {
          existing.remove();
        }
        const feedback = document.createElement('span');
        feedback.className = 'puzz-copy-feedback';
        feedback.textContent = Drupal.t('Copied!');
        anchorEl.insertAdjacentElement('afterend', feedback);
        window.setTimeout(() => {
          feedback.remove();
        }, 900);
      }

      function renderFilterInfo(matchCount, shownCount) {
        if (!iconsGrid) return;
        let info = context.querySelector('.js-puzz-icons-filter-info');
        if (!info) {
          info = document.createElement('div');
          info.className = 'js-puzz-icons-filter-info puzz-icons-filter-info';
          iconsGrid.parentNode.insertBefore(info, iconsGrid);
        }
        if (matchCount > shownCount) {
          info.textContent = Drupal.t('Showing @shown of @total matched icons. Refine search to narrow results.', {
            '@shown': shownCount,
            '@total': matchCount,
          });
        } else {
          info.textContent = Drupal.t('Showing @total icons.', { '@total': shownCount });
        }
      }

      function updatePaginationUI() {
        if (!paginationInfo || !prevBtn || !nextBtn) return;
        const bar = paginationInfo.closest('.js-puzz-icons-pagination');
        const firstBtn = bar ? bar.querySelector('.js-puzz-icons-first') : null;
        const lastBtn = bar ? bar.querySelector('.js-puzz-icons-last') : null;
        paginationInfo.textContent = Drupal.t('Page @page of @pages', {
          '@page': lastResult.page,
          '@pages': lastResult.pages,
        });
        prevBtn.disabled = lastResult.page <= 1;
        nextBtn.disabled = lastResult.page >= lastResult.pages;
        if (firstBtn) firstBtn.disabled = lastResult.page <= 1;
        if (lastBtn) lastBtn.disabled = lastResult.page >= lastResult.pages;
      }

      function renderIconPreview(rawName) {
        const adminPreviewSpritePath = (window.drupalSettings && window.drupalSettings.puzz && window.drupalSettings.puzz.icons && window.drupalSettings.puzz.icons.adminPreviewSpritePath)
          ? window.drupalSettings.puzz.icons.adminPreviewSpritePath
          : '';
        if (adminPreviewSpritePath) {
          return `<svg class="icon icon--sm"><use href="${adminPreviewSpritePath}#icon-${escapeHtml(rawName)}"></use></svg>`;
        }
        return '';
      }

      once('puzz-icons-filter', '.js-puzz-icons-search', context).forEach((field) => {
        const debouncedFilter = () => {
          window.clearTimeout(filterTimer);
          filterTimer = window.setTimeout(() => {
            currentPage = 1;
            filterIcons();
          }, 180);
        };
        field.addEventListener('input', debouncedFilter);
      });

      if (iconsGrid) {
        once('puzz-icons-change', '.js-puzz-icons-grid input[type="checkbox"]', context).forEach((checkbox) => {
          checkbox.addEventListener('change', () => {
            if (showSelectedOnly) {
              filterIcons();
              return;
            }
            scheduleIconsUpdate();
          });
        });
      }

      once('puzz-icons-include-all', '.js-puzz-icons-include-all', context).forEach((checkbox) => {
        checkbox.addEventListener('change', scheduleIconsUpdate);
      });

      once('puzz-icons-show-selected', '.js-puzz-icons-show-selected', context).forEach((button) => {
        button.addEventListener('click', (event) => {
          event.preventDefault();
          event.stopPropagation();
          showSelectedOnly = !showSelectedOnly;
          button.textContent = showSelectedOnly ? Drupal.t('Show all') : Drupal.t('Show selected');
          currentPage = 1;
          filterIcons();
        });
      });

      once('puzz-icons-clear-selection', '.js-puzz-icons-clear-selection', context).forEach((button) => {
        button.addEventListener('click', (event) => {
          event.preventDefault();
          event.stopPropagation();
          if (!iconsGrid) return;
          isBulkUpdating = true;
          const inputs = iconsGrid.querySelectorAll('input[type="checkbox"]:checked');
          inputs.forEach((input) => {
            input.checked = false;
          });
          currentPage = 1;
          isBulkUpdating = false;
          filterIcons();
        });
      });

      once('puzz-icons-copy-grid', '.js-puzz-icons-grid', context).forEach((grid) => {
        grid.addEventListener('click', async (event) => {
          const preview = event.target.closest('.puzz-icon-option-preview');
          const label = event.target.closest('.puzz-icon-option-label');
          if (!preview && !label) return;
          event.preventDefault();
          event.stopPropagation();
          const name = preview
            ? (preview.dataset.iconName || '')
            : ((label ? (label.textContent || '').trim() : ''));
          const ok = await copyIconName(name);
          if (ok) {
            showCopiedFeedback(preview || label);
          }
        });
      });

      once('puzz-icons-copy-selected', '.js-puzz-icons-selected-list', context).forEach((list) => {
        list.addEventListener('click', async (event) => {
          const chip = event.target.closest('.puzz-icon-chip');
          if (!chip) return;
          event.preventDefault();
          event.stopPropagation();
          const ok = await copyIconName(chip.dataset.iconName || '');
          if (ok) {
            showCopiedFeedback(chip);
          }
        });
      });

      ensurePaginationUI();
      updateIconsCount();
      filterIcons();

      // Normalize value for comparison (colors lowercase, breakpoints without spaces)
      function normalizeValue(value, isColor) {
        if (value == null || value === undefined || value === '') return '';
        const v = String(value).trim();
        if (!v) return '';
        // For colors, normalize to lowercase
        if (isColor) {
          return v.toLowerCase();
        }
        // For breakpoints, just trim
        return v;
      }

      // Check if a field is modified (value different from default)
      function isFieldModified(field, defaultValue) {
        if (!field || !defaultValue) {
          return false;
        }
        const isColor = field.classList.contains('js-puzz-color-field');
        const currentValue = field.value || '';
        const currentNormalized = normalizeValue(currentValue, isColor);
        const defaultNormalized = normalizeValue(defaultValue, isColor);
        return currentNormalized && defaultNormalized && currentNormalized !== defaultNormalized;
      }

      // Update state of individual reset checkbox
      function updateResetCheckboxState(resetCheckbox) {
        const targetKey = resetCheckbox.getAttribute('data-reset-target');
        const defaultValue = resetCheckbox.getAttribute('data-reset-default');
        
        if (!targetKey || !defaultValue) {
          resetCheckbox.setAttribute('disabled', 'disabled');
          resetCheckbox.disabled = true;
          return;
        }

        // Find related field
        const colorField = context.querySelector(`.js-puzz-color-field[data-puzz-field-key="${targetKey}"]`);
        const breakpointField = context.querySelector(`.js-puzz-breakpoint-field[data-puzz-field-key="${targetKey}"]`);
        const field = colorField || breakpointField;
        
        if (!field) {
          resetCheckbox.setAttribute('disabled', 'disabled');
          resetCheckbox.disabled = true;
          return;
        }

        // Enable/disable checkbox based on whether field is modified
        const isModified = isFieldModified(field, defaultValue);
        
        if (isModified) {
          // Enable checkbox - remove disabled attribute and property
          resetCheckbox.removeAttribute('disabled');
          resetCheckbox.disabled = false;
          // Ensure checkbox is visible and clickable
          resetCheckbox.style.pointerEvents = 'auto';
          resetCheckbox.style.opacity = '1';
        } else {
          // Disable checkbox - set disabled attribute and property
          resetCheckbox.setAttribute('disabled', 'disabled');
          resetCheckbox.disabled = true;
          // Uncheck if disabled
          resetCheckbox.checked = false;
          // Visual feedback for disabled state
          resetCheckbox.style.pointerEvents = 'none';
          resetCheckbox.style.opacity = '0.6';
        }
      }

      // Update state of "Reset all" checkbox
      function updateResetAllCheckboxState() {
        const resetAllCheckbox = context.querySelector('.js-puzz-reset-all');
        if (!resetAllCheckbox) {
          return;
        }

        // Check if any color or breakpoint field is modified
        const allFields = context.querySelectorAll('.js-puzz-color-field, .js-puzz-breakpoint-field');
        let hasModifiedFields = false;

        allFields.forEach((field) => {
          const key = field.getAttribute('data-puzz-field-key');
          if (!key) {
            return;
          }

          // Find corresponding reset checkbox to get default value
          const resetCheckbox = context.querySelector(`.js-puzz-reset-toggle[data-reset-target="${key}"]`);
          if (!resetCheckbox) {
            return;
          }

          const defaultValue = resetCheckbox.getAttribute('data-reset-default');
          if (!defaultValue) {
            return;
          }

          if (isFieldModified(field, defaultValue)) {
            hasModifiedFields = true;
          }
        });

        // Enable/disable "Reset all" checkbox
        if (hasModifiedFields) {
          // Enable checkbox - remove disabled attribute and property
          resetAllCheckbox.removeAttribute('disabled');
          resetAllCheckbox.disabled = false;
          // Ensure checkbox is visible and clickable
          resetAllCheckbox.style.pointerEvents = 'auto';
          resetAllCheckbox.style.opacity = '1';
        } else {
          // Disable checkbox - set disabled attribute and property
          resetAllCheckbox.setAttribute('disabled', 'disabled');
          resetAllCheckbox.disabled = true;
          // Uncheck if disabled
          resetAllCheckbox.checked = false;
          // Visual feedback for disabled state
          resetAllCheckbox.style.pointerEvents = 'none';
          resetAllCheckbox.style.opacity = '0.6';
        }
      }

      // Update all checkbox states
      function updateAllCheckboxStates() {
        const resetCheckboxes = context.querySelectorAll('.js-puzz-reset-toggle');
        resetCheckboxes.forEach((resetCheckbox) => {
          updateResetCheckboxState(resetCheckbox);
        });
        updateResetAllCheckboxState();
      }

      // Get all fields once
      const allFields = context.querySelectorAll('.js-puzz-color-field, .js-puzz-breakpoint-field');
      
      // Store previous values to detect changes
      const previousValues = new Map();
      allFields.forEach((field) => {
        const key = field.getAttribute('data-puzz-field-key');
        if (key) {
          previousValues.set(key, field.value || '');
        }
      });

      // Polling function to check for value changes (fallback for color pickers)
      function checkForValueChanges() {
        let hasChanges = false;
        allFields.forEach((field) => {
          const key = field.getAttribute('data-puzz-field-key');
          if (!key) {
            return;
          }
          const currentValue = field.value || '';
          const previousValue = previousValues.get(key) || '';
          if (currentValue !== previousValue) {
            previousValues.set(key, currentValue);
            hasChanges = true;
          }
        });
        if (hasChanges) {
          updateAllCheckboxStates();
        }
      }

      // Poll every 500ms to catch changes that might not trigger events
      const pollInterval = setInterval(checkForValueChanges, 500);

      // Add listeners to fields to update checkbox states when values change
      // Use once() to ensure listeners are only added once per field
      once('puzz-field-listener', '.js-puzz-color-field, .js-puzz-breakpoint-field', context).forEach((field) => {
        const key = field.getAttribute('data-puzz-field-key');
        if (!key) {
          return;
        }

        // Function to handle value changes
        const handleValueChange = function() {
          // Update previous value
          previousValues.set(key, field.value || '');
          // Small delay to ensure value is updated
          setTimeout(function() {
            updateAllCheckboxStates();
          }, 10);
        };

        // Update checkbox states on change
        field.addEventListener('change', handleValueChange);

        // For color fields, also listen to input event for real-time updates
        if (field.classList.contains('js-puzz-color-field')) {
          field.addEventListener('input', handleValueChange);
          // Also listen to blur event as fallback
          field.addEventListener('blur', handleValueChange);
        }

        // For breakpoint fields, also listen to keyup for real-time updates
        if (field.classList.contains('js-puzz-breakpoint-field')) {
          field.addEventListener('keyup', handleValueChange);
          field.addEventListener('blur', handleValueChange);
        }
      });

      // Initialize checkbox states on page load (after listeners are set up)
      // Use setTimeout to ensure DOM is fully ready
      setTimeout(function() {
        updateAllCheckboxStates();
      }, 100);

      // Individual reset - updates value immediately on click
      once('puzz-reset-toggle', '.js-puzz-reset-toggle', context).forEach((checkbox) => {
        // Prevent click on disabled checkboxes
        checkbox.addEventListener('click', function(e) {
          if (this.disabled) {
            e.preventDefault();
            e.stopPropagation();
            return false;
          }
        });

        checkbox.addEventListener('change', function(e) {
          // Prevent action if checkbox is disabled
          if (this.disabled || !this.checked) {
            this.checked = false;
            return;
          }

          const targetKey = this.getAttribute('data-reset-target');
          const label = this.getAttribute('data-reset-label') || targetKey;
          const defaultValue = this.getAttribute('data-reset-default');
          
          if (!targetKey || !defaultValue) {
            return;
          }

          // Confirmation message
          const message = Drupal.t('Reset "@label" to its default value (@default)?', {
            '@label': label,
            '@default': defaultValue
          });

          if (!window.confirm(message)) {
            // If cancelled, uncheck the checkbox
            this.checked = false;
            return;
          }

          // Find related field (color or breakpoint)
          const colorField = context.querySelector(`.js-puzz-color-field[data-puzz-field-key="${targetKey}"]`);
          const breakpointField = context.querySelector(`.js-puzz-breakpoint-field[data-puzz-field-key="${targetKey}"]`);
          
          const field = colorField || breakpointField;
          
          if (field) {
            // Update field value immediately
            field.value = defaultValue;
            
            // Dispatch change event so Drupal detects the change
            const changeEvent = new Event('change', { bubbles: true });
            field.dispatchEvent(changeEvent);
            
            // For color fields, also dispatch input event
            if (colorField) {
              const inputEvent = new Event('input', { bubbles: true });
              field.dispatchEvent(inputEvent);
            }

            // Update checkbox states after reset
            updateAllCheckboxStates();
          }
        });
      });

      // Global reset - resets only modified fields
      once('puzz-reset-all', '.js-puzz-reset-all', context).forEach((checkbox) => {
        // Prevent click on disabled checkboxes
        checkbox.addEventListener('click', function(e) {
          if (this.disabled) {
            e.preventDefault();
            e.stopPropagation();
            return false;
          }
        });

        checkbox.addEventListener('change', function(e) {
          // Prevent action if checkbox is disabled
          if (this.disabled || !this.checked) {
            this.checked = false;
            return;
          }

          // Find all fields and reset checkboxes
          const resetCheckboxes = context.querySelectorAll('.js-puzz-reset-toggle');
          
          // Detect which fields are modified (value different from default)
          const modifiedFields = [];

          resetCheckboxes.forEach((resetCheckbox) => {
            const targetKey = resetCheckbox.getAttribute('data-reset-target');
            const defaultValue = resetCheckbox.getAttribute('data-reset-default');
            
            if (!targetKey || !defaultValue) {
              return;
            }
            
            // Find related field
            const colorField = context.querySelector(`.js-puzz-color-field[data-puzz-field-key="${targetKey}"]`);
            const breakpointField = context.querySelector(`.js-puzz-breakpoint-field[data-puzz-field-key="${targetKey}"]`);
            const field = colorField || breakpointField;
            
            if (!field) {
              return;
            }
            
            if (isFieldModified(field, defaultValue)) {
              const label = resetCheckbox.getAttribute('data-reset-label') || targetKey;
              modifiedFields.push({
                checkbox: resetCheckbox,
                field: field,
                label: label,
                defaultValue: defaultValue
              });
            }
          });
          
          // If no modified fields, do nothing
          if (modifiedFields.length === 0) {
            this.checked = false;
            alert(Drupal.t('No modified values to reset.'));
            return;
          }
          
          // Show confirmation only if there are modified fields
          const message = Drupal.t('Reset @count modified value(s) to their default values?', {
            '@count': modifiedFields.length
          });

          if (!window.confirm(message)) {
            // If cancelled, uncheck the checkbox
            this.checked = false;
            return;
          }

          // Reset only modified fields
          modifiedFields.forEach((item) => {
            // Update field value
            item.field.value = item.defaultValue;
            
            // Dispatch events so Drupal detects the change
            const changeEvent = new Event('change', { bubbles: true });
            item.field.dispatchEvent(changeEvent);
            
            if (item.field.classList.contains('js-puzz-color-field')) {
              const inputEvent = new Event('input', { bubbles: true });
              item.field.dispatchEvent(inputEvent);
            }
          });

          // Update checkbox states after reset
          updateAllCheckboxStates();
        });
      });
    }
  };

})(Drupal, once);
