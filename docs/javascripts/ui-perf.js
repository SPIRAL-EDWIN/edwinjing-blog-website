/* Reserved for lightweight UI hooks. */
(function () {
  "use strict";

  function updateHomepageClass() {
    var pathname = (window.location.pathname || "").replace(/\/+$/, "");
    var isByPath = pathname === "" || pathname === "/" || pathname.endsWith("/index.html");

    var logo = document.querySelector(".md-header__button.md-logo");
    var logoHref = logo ? (logo.getAttribute("href") || "").trim() : "";
    var isByLogo = logoHref === "." || logoHref === "./";

    var isHomepage = isByPath || isByLogo;
    document.body.classList.toggle("is-homepage", isHomepage);
  }

  document.addEventListener("DOMContentLoaded", updateHomepageClass);

  // MkDocs Material instant navigation support.
  if (window.document$ && typeof window.document$.subscribe === "function") {
    window.document$.subscribe(updateHomepageClass);
  }
})();
