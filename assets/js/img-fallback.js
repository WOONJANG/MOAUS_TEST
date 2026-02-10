document.addEventListener("error", (e) => {
  const img = e.target;
  if (!img || img.tagName !== "IMG") return;

  const alt = (img.getAttribute("alt") || "").trim() || "IMAGE";
  const box = document.createElement("div");
  box.textContent = alt;

  box.style.display = "grid";
  box.style.placeItems = "center";
  box.style.width = img.width ? img.width + "px" : "100%";
  box.style.height = img.height ? img.height + "px" : "100%";
  box.style.minHeight = "64px";
  box.style.padding = "10px";
  box.style.border = "1px dashed rgba(255,255,255,.25)";
  box.style.borderRadius = "12px";
  box.style.color = "rgba(255,255,255,.75)";
  box.style.background = "rgba(255,255,255,.03)";
  box.style.fontSize = "12px";
  box.style.lineHeight = "1.4";
  box.style.textAlign = "center";
  box.style.boxSizing = "border-box";

  img.replaceWith(box);
}, true);
