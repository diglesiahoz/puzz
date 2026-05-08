/**
 * @file
 * Input color component interactions.
 */

(function () {
  const onInput = (event) => {
    const input = event.target;
    if (!input || !input.classList.contains('puzz-input-color__field')) return;
    const wrapper = input.closest('.puzz-input-color');
    if (!wrapper) return;
    const code = wrapper.querySelector('.puzz-input-color__value');
    if (code) {
      code.textContent = input.value;
    }
  };

  document.addEventListener('input', onInput);
})();

