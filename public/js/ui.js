window.WatercastUI = (() => {
  const ensureModal = () => {
    let backdrop = document.getElementById("watercastModalBackdrop");
    if (backdrop) return backdrop;

    backdrop = document.createElement("div");
    backdrop.id = "watercastModalBackdrop";
    backdrop.className = "wc-modal-backdrop hidden";

    backdrop.innerHTML = `
      <div class="wc-modal" role="dialog" aria-modal="true" aria-labelledby="wcModalTitle">
        <div class="wc-modal-header">
          <h3 class="wc-modal-title" id="wcModalTitle">Notice</h3>
        </div>
        <div class="wc-modal-body" id="wcModalBody"></div>
        <div class="wc-modal-actions">
          <button type="button" class="wc-modal-cancel" id="wcModalCancel">Cancel</button>
          <button type="button" class="wc-modal-confirm" id="wcModalConfirm">OK</button>
        </div>
      </div>
    `;

    document.body.appendChild(backdrop);
    return backdrop;
  };

  const showModal = ({ title, message, confirmText = "OK", cancelText = "Cancel", showCancel = false }) =>
    new Promise((resolve) => {
      const backdrop = ensureModal();
      const titleEl = backdrop.querySelector("#wcModalTitle");
      const bodyEl = backdrop.querySelector("#wcModalBody");
      const confirmBtn = backdrop.querySelector("#wcModalConfirm");
      const cancelBtn = backdrop.querySelector("#wcModalCancel");

      titleEl.textContent = title || "Notice";
      bodyEl.textContent = message || "";
      confirmBtn.textContent = confirmText;
      cancelBtn.textContent = cancelText;
      cancelBtn.classList.toggle("hidden", !showCancel);

      const cleanup = () => {
        confirmBtn.removeEventListener("click", onConfirm);
        cancelBtn.removeEventListener("click", onCancel);
        backdrop.classList.add("hidden");
      };

      const onConfirm = () => {
        cleanup();
        resolve(true);
      };

      const onCancel = () => {
        cleanup();
        resolve(false);
      };

      confirmBtn.addEventListener("click", onConfirm);
      cancelBtn.addEventListener("click", onCancel);

      backdrop.classList.remove("hidden");
      confirmBtn.focus();
    });

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

  const alert = (message, title = "Notice") =>
    showModal({ title, message, confirmText: "OK", showCancel: false });

  const confirm = (message, title = "Confirm") =>
    showModal({ title, message, confirmText: "Yes", cancelText: "No", showCancel: true });

  return { setButtonLoading, alert, confirm };
})();
