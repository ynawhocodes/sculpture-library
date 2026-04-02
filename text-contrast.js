(function () {
  var MOBILE = 900;
  var TEXT_SELS =
    '.en .author,.en .title,.en .year,' +
    '.kr .year,.kr .title,.kr .title .ur,' +
    '.titleen,.titlekr,footer p,footer a';

  /* .arc 요소의 실제 렌더링 위치에서 대각선 좌표를 측정 */
  function getParams() {
    var arcEl = document.querySelector('.arc');
    var r = arcEl.getBoundingClientRect();
    var bl = parseFloat(getComputedStyle(arcEl).borderLeftWidth) || 0;
    return {
      x1: r.left,          y1: r.bottom,       // 대각선 시작 (아래)
      x2: r.left + bl,     y2: r.top            // 대각선 끝 (위)
    };
  }

  function diagX(y, p) {
    if (p.y1 === p.y2) return p.x1;
    return p.x1 + (p.x2 - p.x1) * (p.y1 - y) / (p.y1 - p.y2);
  }

  function diagY(x, p) {
    if (p.x2 === p.x1) return p.y1;
    return p.y1 + (p.y2 - p.y1) * (x - p.x1) / (p.x2 - p.x1);
  }

  function run() {
    var p = getParams();

    // 대각선 법선 (갈색 방향)
    var nx = p.y1 - p.y2;
    var ny = p.x2 - p.x1;
    var nl = Math.sqrt(nx * nx + ny * ny);
    if (nl === 0) return;
    var ux = nx / nl, uy = ny / nl;

    // CSS gradient 각도
    var ang = Math.atan2(nx, -ny) * 180 / Math.PI;

    // 대각선 위 임의 점의 법선 투영값 (모든 점에서 동일)
    var diagProj = p.x1 * ux + p.y1 * uy;

    // 각 텍스트 요소에 개별 그라디언트 적용
    var els = document.querySelectorAll(TEXT_SELS);
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      var rect = el.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) continue;

      // 요소 꼭짓점들을 법선 방향으로 투영
      var projs = [
        rect.left  * ux + rect.top    * uy,
        rect.right * ux + rect.top    * uy,
        rect.left  * ux + rect.bottom * uy,
        rect.right * ux + rect.bottom * uy
      ];
      var mn = Math.min.apply(null, projs);
      var mx = Math.max.apply(null, projs);
      var range = mx - mn;

      var pct = range === 0
        ? (mn >= diagProj ? 0 : 100)
        : Math.max(0, Math.min(100, (diagProj - mn) / range * 100));

      el.style.background =
        'linear-gradient(' + ang + 'deg,black ' + pct + '%,white ' + pct + '%)';
      el.style.webkitBackgroundClip = 'text';
      el.style.backgroundClip = 'text';
      el.style.webkitTextFillColor = 'transparent';
    }

    updateBorders(p);
  }

  function updateBorders(p) {
    var m = window.innerWidth <= MOBILE;

    var ens = document.querySelectorAll('.en li');
    for (var i = 0; i < ens.length; i++) {
      var r = ens[i].getBoundingClientRect();
      var bx = diagX(r.top, p);
      if (bx <= r.left) {
        ens[i].style.borderImage = '';
        ens[i].style.borderTopColor = 'white';
      } else if (bx >= r.right) {
        ens[i].style.borderImage = '';
        ens[i].style.borderTopColor = 'black';
      } else {
        var pc = (bx - r.left) / r.width * 100;
        ens[i].style.borderImage =
          'linear-gradient(to right,black ' + pc + '%,white ' + pc + '%) 1';
      }
    }

    var krs = document.querySelectorAll('.kr li');
    for (var j = 0; j < krs.length; j++) {
      var r2 = krs[j].getBoundingClientRect();
      var edgeX = m ? r2.right : r2.left;
      var by = diagY(edgeX, p);
      if (by <= r2.top) {
        krs[j].style.borderImage = '';
        if (m) krs[j].style.borderRightColor = 'white';
        else   krs[j].style.borderLeftColor  = 'white';
      } else if (by >= r2.bottom) {
        krs[j].style.borderImage = '';
        if (m) krs[j].style.borderRightColor = 'black';
        else   krs[j].style.borderLeftColor  = 'black';
      } else {
        var pc2 = (by - r2.top) / r2.height * 100;
        krs[j].style.borderImage =
          'linear-gradient(to bottom,black ' + pc2 + '%,white ' + pc2 + '%) 1';
      }
    }
  }

  var _raf = null;
  function scheduleRun() {
    if (!_raf) {
      _raf = requestAnimationFrame(function () {
        _raf = null;
        run();
      });
    }
  }

  function init() {
    run();
    window.addEventListener('resize', scheduleRun);
    var scrollEl = document.querySelector('.scroll-wrap') || window;
    scrollEl.addEventListener('scroll', scheduleRun);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
