(function () {
  const dialog = document.querySelector("#download-dialog");
  if (!dialog) return;

  let pendingDownload = "";
  const github = dialog.querySelector("#download-dialog-github");
  const continueButton = dialog.querySelector("#download-dialog-continue");

  document.querySelectorAll(".download-link").forEach((link) => {
    link.addEventListener("click", (event) => {
      if (typeof dialog.showModal !== "function") return;
      event.preventDefault();
      pendingDownload = link.href;
      dialog.showModal();
    });
  });

  github?.addEventListener("click", () => dialog.close("github"));
  dialog.querySelectorAll("[data-download-dialog-close]").forEach((button) => {
    button.addEventListener("click", () => dialog.close("cancel"));
  });
  continueButton?.addEventListener("click", () => {
    const destination = pendingDownload;
    dialog.close("download");
    if (destination) window.location.assign(destination);
  });
  dialog.addEventListener("close", () => {
    if (dialog.returnValue !== "download") pendingDownload = "";
  });
})();
