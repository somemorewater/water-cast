window.WatercastUI = (() => {
  const setButtonLoading = (button, isLoading, label = "Processing...") => {
    if (!button) return;

    if (isLoading) {
      if (!button.dataset.originalHtml) {
        button.dataset.originalHtml = button.innerHTML;
      }
      button.disabled = true;
      button.classList.add("is-loading");
      button.innerHTML = `<span class="btn-spinner" aria-hidden="true"></span>${label}`;
      return;
    }

    if (button.dataset.originalHtml) {
      button.innerHTML = button.dataset.originalHtml;
      delete button.dataset.originalHtml;
    }
    button.disabled = false;
    button.classList.remove("is-loading");
  };

  return { setButtonLoading };
})();
