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
     규칙:
     1) 검색어가 revealKey와 "정확히 일치"할 때만 히든 노출
     2) 검색어에 revealKey가 섞여 있으면(박은태용인/박은태 용인),
        히든은 노출하지 않고 revealKey를 제거한 나머지로 일반 검색
     ========================================================= */

  const visibleClubs = clubs.filter(c => !(c && c.hidden));
  const hiddenClubs  = clubs.filter(c => (c && c.hidden && c.revealKey));

  // revealKey(정규화) -> hidden 카드들 매핑 (같은 키에 여러 카드 가능)
  const hiddenMap = hiddenClubs.reduce((acc, c) => {
    const k = norm(c.revealKey);
    if(!k) return acc;
    (acc[k] ||= []).push(c);
    return acc;
  }, {});

  const hiddenKeys = Object.keys(hiddenMap);

  // 검색어에서 히든 키워드(들)를 제거해서 일반 검색용 term 만들기
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
    if(!nq) return visibleClubs;

    // ✅ 1) 히든은 "정확히 일치"할 때만 노출
    //    "박은태" -> 히든 뜸
    //    "박은태용인" / "박은태 용인"(정규화: 박은태용인) -> 여기 걸리지 않음
    if(hiddenMap[nq]) return hiddenMap[nq];

    // ✅ 2) 히든 키워드가 섞여 있으면 제거하고 남은 걸로 일반 검색
    const term = stripHiddenKeys(nq);

    // 남는 게 없는데 히든 정확일치도 아니면(예: 히든키 2개를 붙여쓴 경우)
    // 일단 결과 없음 처리
    if(!term) return [];

    // 일반 검색은 visible만 대상으로 수행
    const exact = visibleClubs.filter(c => norm(c.name) === term);
    if(exact.length) return exact;

    return visibleClubs.filter(c =>
      norm(c.name).includes(term) ||
      norm(c.store).includes(term) ||
      (Array.isArray(c.tags) && c.tags.some(t => norm(t.text).includes(term)))
    );
  }


