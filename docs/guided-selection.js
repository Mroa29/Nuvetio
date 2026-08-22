(function () {
  const panel = document.querySelector("#seleccion-guiada");
  if (!panel) return;

  const buttons = [...panel.querySelectorAll("[data-agent-selection]")];
  const preview = panel.querySelector("#selection-preview");
  const continueButton = panel.querySelector("#selection-continue");
  const labels = {
    producto: "Producto",
    marketing: "Ventas y Marketing",
    experiencia: "Experiencia y mockups",
    finanzas: "Finanzas",
    legal: "Legal",
  };

  function selectedKeys() {
    return buttons
      .filter((button) => button.getAttribute("aria-pressed") === "true")
      .map((button) => button.dataset.agentSelection)
      .filter((key) => key !== "recommended");
  }

  function setPressed(key, pressed) {
    const button = buttons.find((candidate) => candidate.dataset.agentSelection === key);
    if (button) button.setAttribute("aria-pressed", pressed ? "true" : "false");
  }

  function updatePreview() {
    const selected = selectedKeys();
    const names = selected.map((key) => labels[key]).join(" + ");
    const copy = selected.length === 0
      ? "Elige uno o más apoyos. Nuvetio confirmará lo que entendió antes de profundizar."
      : "Selección actual: " + names + ". Nuvetio validará esta elección con un ejemplo breve antes de gastar más tokens.";

    preview.innerHTML = "<strong>Ejemplo de validación</strong><p>" + copy + "</p>";
  }

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const key = button.dataset.agentSelection;
      if (key === "recommended") {
        buttons.forEach((candidate) => candidate.setAttribute("aria-pressed", "false"));
        setPressed("recommended", true);
        setPressed("producto", true);
        setPressed("marketing", true);
      } else {
        setPressed("recommended", false);
        button.setAttribute(
          "aria-pressed",
          button.getAttribute("aria-pressed") === "true" ? "false" : "true",
        );
      }
      updatePreview();
    });
  });

  continueButton?.addEventListener("click", () => {
    const selected = selectedKeys();
    const names = selected.map((key) => labels[key]).join(" + ") || "los recomendados";
    preview.innerHTML =
      "<strong>Listo para usar</strong><p>En tu conversación puedes escribir: \"Nuvetio, usa " +
      names +
      " para resolver mi solicitud y valida primero si elegí bien\".</p>";
  });
})();
