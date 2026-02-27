/**
 * @file
 * JavaScript to handle reset of default values in theme settings.
 */

(function (Drupal, once) {
  'use strict';

  Drupal.behaviors.puzzThemeSettingsReset = {
    attach(context) {
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
