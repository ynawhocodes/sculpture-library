(function () {
  const CLASS_NAME = "auto-contrast";

  function getLuminance(r, g, b) {
    const [rs, gs, bs] = [r, g, b].map(function (c) {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }

  function parseColor(color) {
    if (color === "transparent" || color === "rgba(0, 0, 0, 0)") return null;
    var m = color.match(
      /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/
    );
    if (m) return [+m[1], +m[2], +m[3]];
    return null;
  }

  function getEffectiveBgColor(el) {
    var current = el;
    while (current) {
      var bg = getComputedStyle(current).backgroundColor;
      var rgb = parseColor(bg);
      if (rgb) return rgb;
      current = current.parentElement;
    }
    return [255, 255, 255];
  }

  function applyContrast(el) {
    var rgb = getEffectiveBgColor(el);
    var lum = getLuminance(rgb[0], rgb[1], rgb[2]);
    el.style.color = lum > 0.179 ? "#000000" : "#ffffff";
  }

  function run() {
    var els = document.querySelectorAll("." + CLASS_NAME);
    for (var i = 0; i < els.length; i++) {
      applyContrast(els[i]);
    }
  }

  // 초기 실행
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }

  // DOM 변경 감지 (동적으로 추가되는 요소 대응)
  var observer = new MutationObserver(run);
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["class", "style"],
  });
})();
