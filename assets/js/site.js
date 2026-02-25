(function () {
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  const isSubpage = window.location.pathname.includes("/pages/");
  const assetRoot = isSubpage ? "../assets" : "assets";
  const timeNodes = document.querySelectorAll("[data-local-time]");
  const headerNode = document.querySelector(".site-header");

  function assetPath(relativePath) {
    return `${assetRoot}/${relativePath}`;
  }

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

  function updateAnchorOffset() {
    if (!headerNode) {
      return;
    }
    const offset = Math.ceil(headerNode.getBoundingClientRect().height) + 10;
    document.documentElement.style.setProperty("--anchor-offset", `${offset}px`);
  }

  updateAnchorOffset();
  window.addEventListener("load", updateAnchorOffset);
  window.addEventListener("resize", updateAnchorOffset);

  const pageKey = currentPage.replace(/\.html$/, "");
  const sectionNavConfig = {
    index: [
      { href: "#body-archive-resources", label: "Body Archive" },
      { href: "#expo-studio-kan-2024", label: "Studio Kan 2024" },
      { href: "#expo-geoje-seomkot-2025", label: "Geoje 2025" },
      { href: "#expo-gyeongnam-2025", label: "Gyeongnam 2025" },
      { href: "#expo-aachen-2025", label: "Aachen 2025" },
      { href: "#expo-graphic-design", label: "Poster & Ticket" },
    ],
    "body-archive": [
      { href: "#body-archive-gallery", label: "Archiv" },
      { href: "#body-archive-motion", label: "Motion" },
      { href: "#body-archive-storyboards", label: "Storyboards" },
      { href: "#body-archive-stills", label: "Low Road Stills" },
    ],
    exhibition: [
      { href: "#expo-overview", label: "Portfolio" },
      { href: "#expo-studio-kan-2024", label: "Studio Kan 2024" },
      { href: "#expo-geoje-seomkot-2025", label: "Geoje 2025" },
      { href: "#expo-gyeongnam-2025", label: "Gyeongnam 2025" },
      { href: "#expo-aachen-2025", label: "Aachen 2025" },
      { href: "#expo-graphic-design", label: "Poster & Ticket" },
    ],
    impressum: [{ href: "#impressum-details", label: "Details" }],
    datenschutz: [
      { href: "#verantwortliche-stelle", label: "§ Verantwortliche Stelle" },
      { href: "#hosting-github-pages", label: "§ Hosting" },
      { href: "#cookies-tracking-analytics", label: "§ Cookies / Tracking" },
      { href: "#kontaktaufnahme-e-mail", label: "§ Kontaktaufnahme" },
      { href: "#deine-rechte", label: "§ Rechte" },
      { href: "#aktualitaet", label: "§ Aktualität" },
    ],
  };
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

  function pad2(value) {
    return String(value).padStart(2, "0");
  }

  function range(start, end) {
    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  }

  function portfolioPrefix(index) {
    if (index <= 2) {
      return "portfolio_cover";
    }
    if (index <= 21) {
      return "studio_kan_kyoto_2024";
    }
    if (index <= 45) {
      return "geoje_seomkot_art_show_2025";
    }
    if (index <= 53) {
      return "gyeongnam_art_fair_2025";
    }
    if (index <= 64) {
      return "raststaette_kulturraum_aachen_2025";
    }
    return "deviations_graphic_design";
  }

  function portfolioImagePath(index) {
    const prefix = portfolioPrefix(index);
    return assetPath(`images/expo/deviations_portfolio_2024_2025/${prefix}_${pad2(index)}.jpg`);
  }

  function imageItem(src, caption, alt, note, layout) {
    return {
      type: "image",
      src,
      caption,
      alt: alt || caption,
      note: note || "",
      layout: layout || "",
    };
  }

  function videoItem(src, caption, alt, note, layout, poster) {
    return {
      type: "video",
      src,
      caption,
      alt: alt || caption,
      note: note || "",
      layout: layout || "",
      poster: poster || "",
    };
  }

  function createPortfolioItem(index, caption, alt, note, layout) {
    return imageItem(portfolioImagePath(index), caption, alt, note, layout);
  }

  function portfolioIndexFromItem(item) {
    const match = item.src.match(/_(\d{2})\.(?:png|jpg)$/);
    return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER;
  }

  function sortPortfolioItems(items) {
    return [...items].sort((a, b) => portfolioIndexFromItem(a) - portfolioIndexFromItem(b));
  }

  const deferredMediaObserver =
    "IntersectionObserver" in window
      ? new IntersectionObserver(
          (entries, observer) => {
            entries.forEach((entry) => {
              if (!entry.isIntersecting) {
                return;
              }
              const media = entry.target;
              const source = media.dataset.src;
              if (!source) {
                observer.unobserve(media);
                return;
              }
              media.src = source;
              media.removeAttribute("data-src");
              if (media.tagName === "VIDEO") {
                media.load();
              }
              observer.unobserve(media);
            });
          },
          { rootMargin: "420px 0px" }
        )
      : null;

  function deferMediaSource(media, src) {
    if (!src) {
      return;
    }
    if (!deferredMediaObserver) {
      media.src = src;
      if (media.tagName === "VIDEO") {
        media.load();
      }
      return;
    }
    media.dataset.src = src;
    deferredMediaObserver.observe(media);
  }

  function createGalleryArticle(item, extraClass = "") {
    const article = document.createElement("article");
    const classes = ["gallery-item"];
    if (extraClass) {
      classes.push(extraClass);
    }
    if (item.layout === "wide") {
      classes.push("gallery-item--wide");
    }
    article.className = classes.join(" ");

    const figure = document.createElement("figure");
    let media;
    if (item.type === "video") {
      media = document.createElement("video");
      media.className = "gallery-media video-frame";
      media.controls = true;
      media.preload = "none";
      media.playsInline = true;
      media.setAttribute("aria-label", item.alt);
      if (item.poster) {
        media.poster = item.poster;
      }
      deferMediaSource(media, item.src);
    } else {
      media = document.createElement("img");
      media.className = "gallery-media";
      media.loading = "lazy";
      media.decoding = "async";
      media.fetchPriority = "low";
      media.alt = item.alt;
      deferMediaSource(media, item.src);
    }
    figure.appendChild(media);

    const caption = document.createElement("figcaption");
    caption.textContent = item.caption;
    figure.appendChild(caption);

    if (item.note) {
      const note = document.createElement("p");
      note.className = "gallery-note";
      note.textContent = item.note;
      figure.appendChild(note);
    }

    article.appendChild(figure);
    return article;
  }

  function renderStoryboardGallery(container, items) {
    const [, ...frames] = items;
    if (!frames.length) {
      return;
    }

    container.classList.add("storyboard-frames");
    const previousSibling = container.previousElementSibling;
    if (previousSibling && previousSibling.classList.contains("storyboard-feature")) {
      previousSibling.remove();
    }

    const fragment = document.createDocumentFragment();
    frames.forEach((item) => {
      fragment.appendChild(createGalleryArticle(item, "storyboard-frame"));
    });
    container.replaceChildren(fragment);
  }

  function renderGallery(name, items) {
    const container = document.querySelector(`[data-gallery="${name}"]`);
    if (!container || !items.length) {
      return;
    }

    if (name === "body-archive-storyboards") {
      renderStoryboardGallery(container, items);
      return;
    }

    const fragment = document.createDocumentFragment();
    items.forEach((item) => {
      fragment.appendChild(createGalleryArticle(item));
    });

    container.replaceChildren(fragment);
    container.dataset.galleryRendered = "true";
  }

  const galleryRenderObserver =
    "IntersectionObserver" in window
      ? new IntersectionObserver(
          (entries, observer) => {
            entries.forEach((entry) => {
              if (!entry.isIntersecting) {
                return;
              }
              const container = entry.target;
              const name = container.dataset.gallery;
              const items = galleryRenderQueue.get(name);
              if (items) {
                renderGallery(name, items);
                galleryRenderQueue.delete(name);
              }
              observer.unobserve(container);
            });
          },
          { rootMargin: "700px 0px" }
        )
      : null;

  const galleryRenderQueue = new Map();

  function scheduleGalleryRender(name, items) {
    const container = document.querySelector(`[data-gallery="${name}"]`);
    if (!container || !items.length) {
      return;
    }
    if (!galleryRenderObserver) {
      renderGallery(name, items);
      return;
    }
    if (container.dataset.galleryRendered === "true") {
      return;
    }
    galleryRenderQueue.set(name, items);
    galleryRenderObserver.observe(container);
  }

  function renderIndexResources() {
    if (!document.querySelector("[data-index-resource-root], [data-resource-root]")) {
      return;
    }

    const bodyArchiveVideos = [
      videoItem(
        assetPath("videos/body_archive/amygdala_type_in_motion_high_road.mov"),
        "Amygdala Type in Motion (High Road)",
        "",
        "",
        "",
        assetPath("images/body_archive/amygdala_storyboards/amygdala_storyboard_02.jpg")
      ),
      videoItem(
        assetPath("videos/body_archive/body_archive_film_low_road.mov"),
        "Body as Archive Film (Low Road)",
        "",
        "",
        "",
        assetPath("images/body_archive/amygdala_low_road_stills/amygdala_low_road_still_01.jpg")
      ),
      videoItem(
        assetPath("videos/body_archive/werkschau_body_archive_film_main.mov"),
        "Werkschau Body as Archive Film (Main)",
        "",
        "",
        "",
        assetPath("images/body_archive/gallery/body_archive_still_02.jpg")
      ),
      videoItem(
        assetPath("videos/body_archive/werkschau_body_archive_film_01.mov"),
        "Werkschau Body as Archive Film 01",
        "",
        "",
        "",
        assetPath("images/body_archive/gallery/body_archive_still_01.jpg")
      ),
      videoItem(
        assetPath("videos/body_archive/werkschau_body_archive_film_02.mov"),
        "Werkschau Body as Archive Film 02",
        "",
        "",
        "",
        assetPath("images/body_archive/gallery/body_archive_still_03.jpg")
      ),
      videoItem(
        assetPath("videos/body_archive/werkschau_type_in_motion_amygdala_01.mov"),
        "Werkschau Type in Motion Amygdala 01",
        "",
        "",
        "",
        assetPath("images/body_archive/amygdala_storyboards/amygdala_storyboard_10.jpg")
      ),
      videoItem(
        assetPath("videos/body_archive/werkschau_type_in_motion_amygdala_02.mov"),
        "Werkschau Type in Motion Amygdala 02",
        "",
        "",
        "",
        assetPath("images/body_archive/amygdala_storyboards/amygdala_storyboard_12.jpg")
      ),
    ];

    const expoVideoAddendum = [
      videoItem(
        assetPath("videos/expo/archive_anomaly.mov"),
        "Archive Anomaly",
        "",
        "",
        "",
        assetPath("images/body_archive/amygdala_low_road_stills/amygdala_low_road_still_11.jpg")
      ),
      videoItem(
        assetPath("videos/expo/end_credits_shapes_2.mov"),
        "End Credits Shapes 2",
        "",
        "",
        "",
        assetPath("images/body_archive/amygdala_storyboards/amygdala_storyboard_05.jpg")
      ),
    ];
    bodyArchiveVideos.push(...expoVideoAddendum);

    const bodyArchiveStoryboards = range(1, 25).map((index) => {
      const ext = index === 1 ? "png" : "jpg";
      const label = pad2(index);
      return imageItem(
        assetPath(`images/body_archive/amygdala_storyboards/amygdala_storyboard_${label}.${ext}`),
        `Amygdala Storyboard ${label}`
      );
    });

    const bodyArchiveStills = range(1, 20).map((index) => {
      const label = pad2(index);
      return imageItem(
        assetPath(`images/body_archive/amygdala_low_road_stills/amygdala_low_road_still_${label}.jpg`),
        `Amygdala Low Road Still ${label}`
      );
    });

    const expoCovers = range(0, 2).map((index) => {
      return createPortfolioItem(index, `Deviation Portfolio Cover ${pad2(index + 1)}`);
    });

    const studioGroup1 = [
      createPortfolioItem(
        3,
        "Amisa (links) / Amygdala (rechts) · A0 x 2 · Shodo Brush / Adobe Illustrator · 2024"
      ),
    ];

    const studioGroup2 = [
      createPortfolioItem(13, "Baile · 11.69 x 16.4 inch · Shodo Brush · 2024"),
      createPortfolioItem(11, "Veränderung · 11.69 x 16.4 inch · Shodo Brush · 2024"),
      createPortfolioItem(12, "Sorrow · 11.69 x 16.4 inch · Shodo Brush · 2024"),
      createPortfolioItem(10, "Recuerdos · 11.69 x 16.4 inch · Shodo Brush · 2024"),
    ];

    const studioGroup3 = [
      createPortfolioItem(16, "In Motion · 11.69 x 16.4 inch · Shodo Brush · 2024"),
      createPortfolioItem(14, "Kindheit · 11.69 x 16.4 inch · Shodo Brush · 2024"),
      createPortfolioItem(15, "Archive · 11.69 x 16.4 inch · Shodo Brush · 2024"),
    ];

    const studioGroup4 = [
      createPortfolioItem(18, "Chumchuda · 11.69 x 16.4 inch · Shodo Brush · 2024"),
      createPortfolioItem(17, "Traces · 11.69 x 16.4 inch · Shodo Brush · 2024"),
    ];

    const studioGroup5 = [
      createPortfolioItem(20, "Her · 11.69 x 16.4 inch · Shodo Brush · 2024"),
      createPortfolioItem(19, "Doble Cara · 11.69 x 16.4 inch · Shodo Brush · 2024"),
    ];

    const studioAdditional = [4, 5, 6, 7, 8, 9, 21].map((index) => {
      return createPortfolioItem(index, `Studio Kan Kyoto Documentation ${pad2(index)}`);
    });

    const geojeCover = [
      createPortfolioItem(
        22,
        "Geoje International Seomkot Art Show · Artists and Gallery CEO",
        undefined,
        undefined,
        "wide"
      ),
    ];

    const geojeLivePainting = [30, 31].map((index) => {
      return createPortfolioItem(index, "Geoje International Seomkot Art Show · Live Painting");
    });

    const geojeAmisaVisitors = [
      createPortfolioItem(
        32,
        "Geoje International Seomkot Art Show · Amisa and Visitors",
        undefined,
        undefined,
        "wide"
      ),
    ];

    const geojeLivePaintingDay2 = [
      createPortfolioItem(
        33,
        "Geoje International Seomkot Art Show · Live Painting 02.11.2025",
        undefined,
        "The Major of Geoje held a speech about Mey Amisa´s work",
        "wide"
      ),
    ];

    const geojeAmisaKids = [
      createPortfolioItem(34, "Geoje International Seomkot Art Show · Amisa and Kids"),
    ];

    const geojeVisitors = range(35, 42).map((index) => {
      return createPortfolioItem(
        index,
        "Geoje International Seomkot Art Show · Visitors, Mayor, Sponsors"
      );
    });

    const geojeAdditional = [23, 24, 25, 26, 27, 28, 29, 43, 44, 45].map((index) => {
      return createPortfolioItem(
        index,
        `Geoje Seomkot Additional Documentation ${pad2(index)}`,
        undefined,
        undefined,
        index === 23 ? "wide" : undefined
      );
    });

    const gyeongnamMain = [48, 50, 52, 53].map((index) => {
      return createPortfolioItem(
        index,
        `Gyeongnam International Art Fair Documentation ${pad2(index)}`,
        undefined,
        undefined,
        "wide"
      );
    });

    const aachenCover = [
      createPortfolioItem(
        55,
        "Raststätte Kulturraum Aachen Cover · Photo by Christian Scholz · © Christian Scholz"
      ),
    ];

    const aachenMain = [54, 56, 57, 58, 59, 60, 61, 62, 64].map((index) => {
      const needsCopyright = [56, 57, 58, 59, 60, 61, 62].includes(index);
      const caption = needsCopyright
        ? `Raststätte Kulturraum Aachen Documentation ${pad2(index)} · Photo by Christian Scholz · © Christian Scholz`
        : `Raststätte Kulturraum Aachen Documentation ${pad2(index)}`;
      return createPortfolioItem(
        index,
        caption,
        undefined,
        undefined,
        index === 64 ? "wide" : undefined
      );
    });

    const aachenNewspaper = [
      createPortfolioItem(
        63,
        "Raststätte Kulturraum Aachen Newspaper Article",
        undefined,
        undefined,
        "wide"
      ),
    ];

    const graphicDesignTicket = [65, 66].map((index) => {
      return createPortfolioItem(
        index,
        "Poster and Entrance Card Design · Solo Exhibition Studio Kan Kyoto"
      );
    });

    const graphicDesignPosters = [
      createPortfolioItem(67, "Poster Design · Geoje Island Flower Festival"),
      createPortfolioItem(68, "Poster Design · Raststätte Kulturraum Aachen"),
    ];

    const expoStudioAll = sortPortfolioItems([
      ...studioGroup1,
      ...studioGroup2,
      ...studioGroup3,
      ...studioGroup4,
      ...studioGroup5,
      ...studioAdditional,
    ]);

    const expoGeojeAll = sortPortfolioItems([
      ...geojeCover,
      ...geojeLivePainting,
      ...geojeAmisaVisitors,
      ...geojeLivePaintingDay2,
      ...geojeAmisaKids,
      ...geojeVisitors,
      ...geojeAdditional,
    ]);

    const expoGyeongnamAll = sortPortfolioItems([...gyeongnamMain]);

    const expoAachenAll = sortPortfolioItems([...aachenCover, ...aachenMain, ...aachenNewspaper]);

    const expoGraphicDesignAll = [...graphicDesignTicket, ...graphicDesignPosters];

    const galleries = {
      "body-archive-videos": bodyArchiveVideos,
      "body-archive-storyboards": bodyArchiveStoryboards,
      "body-archive-stills": bodyArchiveStills,
      "expo-covers": expoCovers,
      "expo-studio-group-1": studioGroup1,
      "expo-studio-group-2": studioGroup2,
      "expo-studio-group-3": studioGroup3,
      "expo-studio-group-4": studioGroup4,
      "expo-studio-group-5": studioGroup5,
      "expo-studio-additional": studioAdditional,
      "expo-geoje-cover": geojeCover,
      "expo-geoje-live-painting": geojeLivePainting,
      "expo-geoje-amisa-visitors": geojeAmisaVisitors,
      "expo-geoje-live-painting-day2": geojeLivePaintingDay2,
      "expo-geoje-amisa-kids": geojeAmisaKids,
      "expo-geoje-visitors": geojeVisitors,
      "expo-geoje-additional": geojeAdditional,
      "expo-gyeongnam-main": gyeongnamMain,
      "expo-aachen-cover": aachenCover,
      "expo-aachen-main": aachenMain,
      "expo-aachen-newspaper": aachenNewspaper,
      "expo-graphic-design-ticket": graphicDesignTicket,
      "expo-graphic-design-posters": graphicDesignPosters,
      "expo-studio-all": expoStudioAll,
      "expo-geoje-all": expoGeojeAll,
      "expo-gyeongnam-all": expoGyeongnamAll,
      "expo-aachen-all": expoAachenAll,
      "expo-graphic-design-all": expoGraphicDesignAll,
    };

    Object.entries(galleries).forEach(([name, items]) => {
      scheduleGalleryRender(name, items);
    });
  }

  renderIndexResources();

  const sectionNav = document.querySelector("[data-page-subnav]");
  if (sectionNav) {
    const primaryNav = document.querySelector("#site-nav");
    const pageKeyFromHref = (href) => {
      if (!href) {
        return "";
      }
      const fileName = href.split("#")[0].split("/").pop() || "";
      return fileName.replace(/\.html$/, "");
    };
    const fileNameFromHref = (href) => {
      if (!href) {
        return "";
      }
      return href.split("#")[0].split("/").pop() || "";
    };
    const isCurrentPageHref = (href) => fileNameFromHref(href) === currentPage;
    const createChevronIcon = () => {
      const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      icon.setAttribute("viewBox", "0 0 24 24");
      icon.setAttribute("aria-hidden", "true");
      icon.setAttribute("focusable", "false");
      icon.classList.add("mobile-nav-toggle-icon");
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", "M7 10l5 5 5-5z");
      icon.appendChild(path);
      return icon;
    };
    const clearMobileSectionGroups = () => {
      if (!primaryNav) {
        return;
      }
      primaryNav.querySelectorAll("[data-mobile-subnav-group]").forEach((group) => {
        group.remove();
      });
      primaryNav.querySelectorAll("a[data-page-link]").forEach((link) => {
        link.classList.remove("has-mobile-subsections");
        link.classList.remove("is-expanded");
        link.querySelector(".mobile-nav-toggle-icon")?.remove();
      });
    };

    const configuredLinks = sectionNavConfig[pageKey] || [];
    const links = configuredLinks.filter((item) => {
      if (!item.href || !item.href.startsWith("#")) {
        return false;
      }
      return Boolean(document.querySelector(item.href));
    });

    clearMobileSectionGroups();

    const mobileSectionLinksForCurrentPage = [];

    if (primaryNav) {
      const pageLinks = Array.from(primaryNav.querySelectorAll("a[data-page-link]"));
      const groupEntries = [];

      pageLinks.forEach((pageLink) => {
        const pageHref = pageLink.getAttribute("href");
        const targetPageKey = pageKeyFromHref(pageHref);
        const targetSections = sectionNavConfig[targetPageKey] || [];
        if (!targetSections.length) {
          return;
        }

        pageLink.classList.add("has-mobile-subsections");
        pageLink.appendChild(createChevronIcon());

        const pageBaseHref = pageHref ? pageHref.split("#")[0] : "";
        const mobileGroup = document.createElement("div");
        mobileGroup.className = "mobile-section-group";
        mobileGroup.setAttribute("data-mobile-subnav-group", "true");

        const mobileGroupLabel = document.createElement("p");
        mobileGroupLabel.className = "mobile-section-group-label";
        mobileGroupLabel.textContent = "Abschnitte dieser Seite";
        mobileGroup.appendChild(mobileGroupLabel);

        const currentGroupLinks = [];
        targetSections.forEach((item) => {
          if (!item.href || !item.href.startsWith("#")) {
            return;
          }
          const link = document.createElement("a");
          link.href = `${pageBaseHref}${item.href}`;
          link.textContent = item.label;
          link.className = "mobile-section-nav-link";
          link.setAttribute("data-mobile-subnav-link", "true");
          mobileGroup.appendChild(link);
          currentGroupLinks.push(link);
        });

        if (!currentGroupLinks.length) {
          pageLink.classList.remove("has-mobile-subsections");
          pageLink.querySelector(".mobile-nav-toggle-icon")?.remove();
          return;
        }

        pageLink.insertAdjacentElement("afterend", mobileGroup);
        groupEntries.push({ pageLink, group: mobileGroup, links: currentGroupLinks, pageBaseHref });

        if (isCurrentPageHref(pageHref)) {
          mobileSectionLinksForCurrentPage.push(...currentGroupLinks);
        }
      });

      const collapseAllGroups = () => {
        groupEntries.forEach((entry) => {
          entry.pageLink.classList.remove("is-expanded");
          entry.group.classList.remove("is-open");
        });
      };

      groupEntries.forEach((entry) => {
        entry.pageLink.addEventListener("click", (event) => {
          if (!window.matchMedia("(max-width: 760px)").matches) {
            return;
          }
          const isExpanded = entry.pageLink.classList.contains("is-expanded");
          if (!isExpanded) {
            event.preventDefault();
            collapseAllGroups();
            entry.pageLink.classList.add("is-expanded");
            entry.group.classList.add("is-open");
          }
        });
      });
    }

    if (links.length) {
      const fragment = document.createDocumentFragment();
      links.forEach((item) => {
        const link = document.createElement("a");
        link.href = item.href;
        link.textContent = item.label;
        fragment.appendChild(link);
      });
      sectionNav.replaceChildren(fragment);
      sectionNav.classList.add("has-links");

      const sectionLinks = Array.from(sectionNav.querySelectorAll("a"));
      const sectionTargets = sectionLinks
        .map((link) => {
          const href = link.getAttribute("href");
          if (!href || !href.startsWith("#")) {
            return null;
          }
          const target = document.querySelector(href);
          if (!target) {
            return null;
          }
          return { link, href, target };
        })
        .filter(Boolean);

      const setActiveSectionLink = (href) => {
        sectionLinks.forEach((link) => {
          link.classList.toggle("is-active", link.getAttribute("href") === href);
        });
        mobileSectionLinksForCurrentPage.forEach((link) => {
          const sectionHash = link.getAttribute("href")?.split("#")[1];
          link.classList.toggle("is-active", sectionHash ? `#${sectionHash}` === href : false);
        });
      };

      sectionLinks.forEach((link) => {
        link.addEventListener("click", () => {
          const href = link.getAttribute("href");
          if (href) {
            setActiveSectionLink(href);
          }
        });
      });
      mobileSectionLinksForCurrentPage.forEach((link) => {
        link.addEventListener("click", () => {
          const sectionHash = link.getAttribute("href")?.split("#")[1];
          if (sectionHash) {
            setActiveSectionLink(`#${sectionHash}`);
          }
        });
      });

      const sectionHash = window.location.hash;
      const hasHashTarget = sectionTargets.some((entry) => entry.href === sectionHash);
      if (hasHashTarget) {
        setActiveSectionLink(sectionHash);
      } else if (sectionLinks.length) {
        setActiveSectionLink(sectionLinks[0].getAttribute("href"));
      }
    }
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
      updateAnchorOffset();
    };

    navToggle.addEventListener("click", () => {
      const isOpen = siteHeader.classList.toggle("nav-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
      updateAnchorOffset();
    });

    siteNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", (event) => {
        if (event.defaultPrevented) {
          return;
        }
        if (window.matchMedia("(max-width: 760px)").matches) {
          closeNav();
        }
      });
    });

    window.addEventListener("resize", () => {
      if (!window.matchMedia("(max-width: 760px)").matches) {
        closeNav();
      }
      updateAnchorOffset();
    });
  }

  const scrollTopButton = document.createElement("button");
  scrollTopButton.type = "button";
  scrollTopButton.className = "scroll-top-mobile";
  scrollTopButton.setAttribute("aria-label", "Nach oben scrollen");
  scrollTopButton.textContent = "↑";
  document.body.appendChild(scrollTopButton);

  const mobileScrollQuery = window.matchMedia("(max-width: 760px)");
  const updateScrollTopButtonVisibility = () => {
    const shouldShow = mobileScrollQuery.matches && window.scrollY > 260;
    scrollTopButton.classList.toggle("is-visible", shouldShow);
  };

  scrollTopButton.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  window.addEventListener("scroll", updateScrollTopButtonVisibility, { passive: true });
  window.addEventListener("resize", updateScrollTopButtonVisibility);
  updateScrollTopButtonVisibility();
})();
