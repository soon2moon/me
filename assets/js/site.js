(function () {
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  const timeNodes = document.querySelectorAll("[data-local-time]");

  function updateTime() {
    if (!timeNodes.length) {
      return;
    }

    const formatter = new Intl.DateTimeFormat("en-AU", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Australia/Melbourne",
    });

    const value = formatter.format(new Date());
    timeNodes.forEach((node) => {
      node.textContent = value;
    });
  }

  updateTime();
  setInterval(updateTime, 30000);

  const pageKey = currentPage.replace(/\.html$/, "");
  const seriesCodes = {
    "body-archive": "BAR",
    "body-alphabet": "BAL",
    exhibition: "EXP",
    performance: "PRF",
    "type-studies": "XTP",
  };

  if (seriesCodes[pageKey]) {
    const seriesCode = seriesCodes[pageKey];
    document.querySelectorAll(".gallery-item figure").forEach((figure, index) => {
      const media = figure.querySelector("img, video");
      const caption = figure.querySelector("figcaption");
      if (!media || !caption) {
        return;
      }

      const mediaType = media.tagName.toLowerCase() === "video" ? "VID" : "IMG";
      const accession = String(index + 1).padStart(3, "0");
      caption.textContent = `ACC. MA-${seriesCode}-${mediaType}-${accession}`;
    });
  }

  const reveals = document.querySelectorAll(".reveal");
  if (reveals.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.16,
        rootMargin: "0px 0px -7% 0px",
      }
    );

    reveals.forEach((item, index) => {
      item.style.transitionDelay = `${Math.min(index * 45, 260)}ms`;
      observer.observe(item);
    });
  }

  document.querySelectorAll("[data-page-link]").forEach((link) => {
    const href = link.getAttribute("href");
    if (href === currentPage || (currentPage === "" && href === "index.html")) {
      link.classList.add("is-active");
    }
  });

  const navToggle = document.querySelector("[data-nav-toggle]");
  const siteHeader = document.querySelector(".site-header");
  const siteNav = document.querySelector("#site-nav");
  if (navToggle && siteHeader && siteNav) {
    const closeNav = () => {
      siteHeader.classList.remove("nav-open");
      navToggle.setAttribute("aria-expanded", "false");
    };

    navToggle.addEventListener("click", () => {
      const isOpen = siteHeader.classList.toggle("nav-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });

    siteNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        if (window.matchMedia("(max-width: 760px)").matches) {
          closeNav();
        }
      });
    });

    window.addEventListener("resize", () => {
      if (!window.matchMedia("(max-width: 760px)").matches) {
        closeNav();
      }
    });
  }

  const backLink = document.querySelector("[data-back-link]");
  if (backLink) {
    backLink.addEventListener("click", (event) => {
      if (window.history.length > 1) {
        event.preventDefault();
        window.history.back();
      }
    });
  }
})();
