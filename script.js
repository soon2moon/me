(function () {
  const timeNode = document.getElementById("live-time");

  function setTime() {
    if (!timeNode) {
      return;
    }

    const fmt = new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    timeNode.textContent = fmt.format(new Date());
  }

  setTime();
  setInterval(setTime, 30000);

  const targets = document.querySelectorAll(".reveal");

  if (!targets.length) {
    return;
  }

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
      threshold: 0.2,
      rootMargin: "0px 0px -6% 0px",
    }
  );

  targets.forEach((target, idx) => {
    target.style.transitionDelay = `${Math.min(idx * 55, 280)}ms`;
    observer.observe(target);
  });
})();
