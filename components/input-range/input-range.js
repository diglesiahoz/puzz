/**
 * @file
 * Input range component interactions.
 */

(function () {
  const onInput = (event) => {
    const input = event.target;
    if (!input || !input.classList.contains('puzz-input-range__field')) return;
    const wrapper = input.closest('.puzz-input-range');
    if (!wrapper) return;
    const output = wrapper.querySelector('.puzz-input-range__value');
    if (output) {
      output.textContent = input.value;
    }
  };

  document.addEventListener('input', onInput);
})();

