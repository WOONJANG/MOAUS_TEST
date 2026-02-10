(() => {
  const seen = new Set();

  function shouldPrefetch(href){
    if(!href) return false;
    if(href.startsWith("#")) return false;
    if(/^https?:\/\//i.test(href)) return false;
    if(/^mailto:/i.test(href) || /^tel:/i.test(href)) return false;
    return true;
  }

  function prefetch(href){
    try{
      const u = new URL(href, location.href);
      const key = u.pathname + u.search;
      if(seen.has(key)) return;
      seen.add(key);

      const link = document.createElement("link");
      link.rel = "prefetch";
      link.href = u.href;
      link.as = "document";
      document.head.appendChild(link);
    }catch(_){}
  }

  document.addEventListener("mouseover", (e) => {
    const a = e.target.closest?.("a[href]");
    if(!a) return;
    const href = a.getAttribute("href") || "";
    if(!shouldPrefetch(href)) return;
    prefetch(href);
  });
})();
