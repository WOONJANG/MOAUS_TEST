    // - 유저/조직 페이지(또는 커스텀 도메인): "/"
    // - 프로젝트 페이지(https://username.github.io/repo-name/): "/repo-name/"
    const BASE_PATH = "/"; // ← 프로젝트 페이지면 "/repo-name/"로 변경

    const fullPath = (location.pathname || "/") + (location.search || "") + (location.hash || "");
    document.getElementById("reqPath").textContent = fullPath;

    const target = new URL(BASE_PATH.replace(/\/?$/, "/") + "index.html", location.origin).toString();

    // 링크들도 안전하게 보정
    document.getElementById("homeLink").href = target;
    document.getElementById("contactLink").href = new URL(BASE_PATH.replace(/\/?$/, "/") + "contact.html", location.origin).toString();

    // 카운트다운 + 리다이렉트
    let sec = 3;
    const cd = document.getElementById("countdown");
    cd.textContent = String(sec);

    const timer = setInterval(() => {
      sec -= 1;
      cd.textContent = String(Math.max(sec, 0));
      if (sec <= 0) clearInterval(timer);
    }, 1000);

    setTimeout(() => {
      // replace: 뒤로가기 눌러도 404로 다시 돌아오는 루프 방지
      location.replace(target);
    }, 3000);
