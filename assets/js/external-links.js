(() => {
  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll('a[target="_blank"]').forEach(a => {
      const rel = (a.getAttribute("rel") || "").toLowerCase().split(/\s+/).filter(Boolean);
      ["noopener", "noreferrer"].forEach(v => { if(!rel.includes(v)) rel.push(v); });
      a.setAttribute("rel", rel.join(" "));
    });
  });
})();
