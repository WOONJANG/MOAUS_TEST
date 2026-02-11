(() => {
  const clubs = Array.isArray(window.CLUBS) ? window.CLUBS : [];
  const DEFAULT_TAGS = [];

  const norm = (s) => (s || "")
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^\p{L}\p{N}]/gu, "");

  const safeText = (s) => (s ?? "").toString();

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

  /* =========================================================
     Hidden 카드 검색 노출 로직
     목표:
     - "박은태" -> 박은태(히든)만 노출
     - "박은태용인" / "박은태 용인" -> 박은태(히든) 노출 안 함, "용인"으로 일반검색
     - (재희 등 추가) clubs.js에 hidden:true + revealKey:"재희" 추가만 하면 자동 반영
     ========================================================= */

  const visibleClubs = clubs.filter(c => !(c && c.hidden));
  const hiddenClubs  = clubs.filter(c => (c && c.hidden && c.revealKey));

  const hiddenMap = hiddenClubs.reduce((acc, c) => {
    const k = norm(c.revealKey);
    if(!k) return acc;
    (acc[k] ||= []).push(c);
    return acc;
  }, {});

  const hiddenKeys = Object.keys(hiddenMap);

  function stripHiddenKeys(nq){
    let term = nq;
    for(const k of hiddenKeys){
      if(!k) continue;
      if(term.includes(k)){
        term = term.split(k).join("");
      }
    }
    return term;
  }

  function searchClubs(q){
    const nq = norm(q);

    // 검색어 없으면: visible만
    if(!nq) return visibleClubs;

    // 1) 히든은 "정확히 일치"할 때만 노출
    if(hiddenMap[nq]) return hiddenMap[nq];

    // 2) 히든 키가 섞여 있으면 제거하고 남은 term으로만 일반 검색
    const term = stripHiddenKeys(nq);
    if(!term) return []; // 히든 정확일치도 아니고 term도 없으면 결과 없음

    // (visible) 구단명 정확일치 우선
    const exact = visibleClubs.filter(c => norm(c.name) === term);
    if(exact.length) return exact;

    // (visible) 부분일치
    return visibleClubs.filter(c =>
      norm(c.name).includes(term) ||
      norm(c.store).includes(term) ||
      (Array.isArray(c.tags) && c.tags.some(t => norm(t.text).includes(term)))
    );
  }

  // 초기 화면: hidden 제외
  render(visibleClubs);

  const input = document.getElementById("q");
  const btnSearch = document.getElementById("btnSearch");
  const btnAll = document.getElementById("btnAll");

  const applySearch = () => render(searchClubs(input?.value || ""));

  btnSearch && btnSearch.addEventListener("click", applySearch);

  btnAll && btnAll.addEventListener("click", () => {
    if(input) input.value = "";
    render(visibleClubs);
  });

  input && input.addEventListener("keydown", (e) => {
    if(e.key === "Enter") applySearch();
  });
})();
