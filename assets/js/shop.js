(() => {
  const clubs = Array.isArray(window.CLUBS) ? window.CLUBS : [];
  const DEFAULT_TAGS = [];

  // 숨김 카드 공개 키워드
  const REVEAL_KEY_RAW = "박은태";
  const REVEAL_KEY = (REVEAL_KEY_RAW || "").toString();

  const norm = (s) => (s || "")
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^\p{L}\p{N}]/gu, "");

  const safeText = (s) => (s ?? "").toString();

  // 기본 화면(전체/초기)에서는 hidden 제외
  const visibleClubs = clubs.filter(c => !(c && c.hidden));

  function renderTags(container, tagList){
    container.innerHTML = "";
    const list = (Array.isArray(tagList) && tagList.length) ? tagList : DEFAULT_TAGS;

    if(!list || list.length === 0){
      container.style.display = "none";
      return;
    }
    container.style.display = "flex";

    list.forEach(t => {
      const chip = document.createElement("span");
      chip.className = "tag" + (t.tone === "accent" ? " accent" : "");
      chip.textContent = safeText(t.text);
      container.appendChild(chip);
    });
  }

  function createCard(item){
    const card = document.createElement("div");
    card.className = "card";
    card.tabIndex = 0;

    const media = document.createElement("div");
    media.className = "media";

    if(item.image){
      const img = document.createElement("img");
      img.loading = "lazy";
      img.alt = safeText(item.name) + " 이미지";
      img.src = item.image;
      img.onerror = () => {
        media.innerHTML = "";
        const fb = document.createElement("div");
        fb.className = "fallback";
        fb.textContent = "IMAGE";
        media.appendChild(fb);
      };
      media.appendChild(img);
    } else {
      const fb = document.createElement("div");
      fb.className = "fallback";
      fb.textContent = "IMAGE";
      media.appendChild(fb);
    }

    const body = document.createElement("div");
    body.className = "body";

    const badge = document.createElement("div");
    badge.className = "logoBadge";

    if(item.logo){
      const logo = document.createElement("img");
      logo.alt = safeText(item.name) + " 로고";
      logo.src = item.logo;
      logo.onerror = () => {
        badge.innerHTML = "";
        const fb = document.createElement("div");
        fb.className = "logoFallback";
        fb.textContent = safeText(item.name).trim().slice(0,1) || "?";
        badge.appendChild(fb);
      };
      badge.appendChild(logo);
    } else {
      const fb = document.createElement("div");
      fb.className = "logoFallback";
      fb.textContent = safeText(item.name).trim().slice(0,1) || "?";
      badge.appendChild(fb);
    }

    const h = document.createElement("h3");
    h.className = "club";
    h.textContent = safeText(item.name);

    const p = document.createElement("p");
    p.className = "desc";
    p.textContent = safeText(item.store || "팬스토어");

    const tags = document.createElement("div");
    tags.className = "tagRow";
    renderTags(tags, item.tags);

    body.appendChild(badge);
    body.appendChild(h);
    body.appendChild(p);
    body.appendChild(tags);

    card.appendChild(media);
    card.appendChild(body);

    function open(){
      if(item.url && item.url !== "#"){
        location.href = item.url;
      }
    }

    card.addEventListener("click", open);
    card.addEventListener("keydown", (e) => {
      if(e.key === "Enter" || e.key === " "){
        e.preventDefault();
        open();
      }
    });

    return card;
  }

  function render(list){
    const grid = document.getElementById("grid");
    const empty = document.getElementById("empty");
    if(!grid || !empty) return;

    grid.innerHTML = "";
    empty.style.display = "none";

    if(!list || list.length === 0){
      empty.style.display = "block";
      empty.textContent = "해당 구단을 찾지 못했습니다. 정확한 구단명으로 입력하거나 ‘전체’를 눌러 확인하세요.";
      return;
    }

    const frag = document.createDocumentFragment();
    list.forEach(item => frag.appendChild(createCard(item)));
    grid.appendChild(frag);
  }

  function searchClubs(q){
    const nq = norm(q);
    if(!nq) return visibleClubs;

    const revealNorm = norm(REVEAL_KEY);
    const wantsHidden = revealNorm && nq.includes(revealNorm);
    const term = wantsHidden ? nq.split(revealNorm).join("") : nq;

    // 1) 정확히 일치(구단명) 우선
    if(term){
      const exact = visibleClubs.filter(c => norm(c.name) === term);
      if(exact.length) return exact;
    }

    // 2) 일반(visible) 필터
    const normalMatches = term ? visibleClubs.filter(c =>
      norm(c.name).includes(term) ||
      norm(c.store).includes(term) ||
      (Array.isArray(c.tags) && c.tags.some(t => norm(t.text).includes(term)))
    ) : [];

    // 3) 숨김(hidden) 항목: '박은태'가 포함될 때만 노출
    const hiddenMatches = wantsHidden ? clubs.filter(c => {
      if(!(c && c.hidden)) return false;
      const key = norm(c.revealKey || "");
      return !!key && nq.includes(key);
    }) : [];

    // '박은태'만 쳤을 때: normalMatches는 비어 있고 hidden만 리턴됨
    return [...hiddenMatches, ...normalMatches];
  }

  // 초기 화면은 hidden 제외
  render(visibleClubs);

  const input = document.getElementById("q");
  const btnSearch = document.getElementById("btnSearch");
  const btnAll = document.getElementById("btnAll");

  const applySearch = () => render(searchClubs(input.value));

  btnSearch && btnSearch.addEventListener("click", applySearch);
  btnAll && btnAll.addEventListener("click", () => { input.value = ""; render(visibleClubs); });

  input && input.addEventListener("keydown", (e) => {
    if(e.key === "Enter") applySearch();
  });
})();
