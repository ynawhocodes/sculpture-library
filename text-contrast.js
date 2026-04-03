(function () {
  var MOBILE = 900;
  var TEXT_SELS =
    '.en .author,.en .title,.en .year,' +
    '.kr .year,.kr .title,.kr .title .ur,' +
    '.titleen,.titlekr,footer p,footer a';

  var _scrollEl = null;
  var _enCache = [];
  var _krCache = [];

  function getParams() {
    var arcEl = document.querySelector('.arc');
    var r = arcEl.getBoundingClientRect();
    var cs = getComputedStyle(arcEl);
    var bl = parseFloat(cs.borderLeftWidth) || 0;
    var bb = parseFloat(cs.borderBottomWidth) || 0;
    return { x1: r.left, y1: r.bottom, x2: r.left + bl, y2: r.bottom - bb };
  }

  function precompute() {
    var p = getParams();
    var nx = p.y1 - p.y2, ny = p.x2 - p.x1;
    var nl = Math.sqrt(nx * nx + ny * ny);
    if (nl === 0) return;
    var ux = nx / nl, uy = ny / nl;
    var ang = Math.atan2(nx, -ny) * 180 / Math.PI;
    var diagProj = p.x1 * ux + p.y1 * uy;

    _scrollEl = document.querySelector('.scroll-wrap') || null;
    var st = _scrollEl ? _scrollEl.scrollTop : 0;
    var m = window.innerWidth <= MOBILE;
    var root = document.documentElement;

    /* 루트에 각도·스크롤 설정 */
    root.style.setProperty('--tc-ang', ang + 'deg');
    root.style.setProperty('--scroll', st);

    /* 텍스트 요소: CSS 변수만 세팅, 스크롤 시 JS 개입 없음 */
    var els = document.querySelectorAll(TEXT_SELS);
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      var rect = el.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) continue;

      var dT = rect.top + st, dB = rect.bottom + st;
      var dL = rect.left, dR = rect.right;
      var projs = [
        dL * ux + dT * uy, dR * ux + dT * uy,
        dL * ux + dB * uy, dR * ux + dB * uy
      ];
      var mn = Math.min.apply(null, projs);
      var range = Math.max.apply(null, projs) - mn;

      var a = range === 0 ? 50 : (diagProj - mn) / range * 100;
      var b = range === 0 ? 0 : uy / range * 100;

      el.classList.add('tc-text');
      el.style.setProperty('--tc-a', a);
      el.style.setProperty('--tc-b', b);
    }

    /* 보더 프리컴퓨트 */
    var dxSlope = (p.x2 - p.x1) / (p.y1 - p.y2);
    var ens = document.querySelectorAll('.en li');
    _enCache = [];
    for (var j = 0; j < ens.length; j++) {
      var r = ens[j].getBoundingClientRect();
      _enCache.push({
        el: ens[j],
        intercept: p.x1 + (p.x2 - p.x1) * (p.y1 - r.top - st) / (p.y1 - p.y2),
        slope: dxSlope,
        left: r.left,
        width: r.width
      });
    }

    var krs = document.querySelectorAll('.kr li');
    _krCache = [];
    for (var k = 0; k < krs.length; k++) {
      var r2 = krs[k].getBoundingClientRect();
      var edgeX = m ? r2.right : r2.left;
      var by = p.y1 + (p.y2 - p.y1) * (edgeX - p.x1) / (p.x2 - p.x1);
      _krCache.push({
        el: krs[k],
        by: by,
        docTop: r2.top + st,
        docBottom: r2.bottom + st,
        height: r2.height,
        mobile: m
      });
    }
  }

  /* 스크롤: --scroll 1개만 업데이트 + 보더 산술 */
  function onScroll() {
    var st = _scrollEl ? _scrollEl.scrollTop : 0;
    document.documentElement.style.setProperty('--scroll', st);

    for (var j = 0; j < _enCache.length; j++) {
      var e = _enCache[j];
      var bx = e.intercept + e.slope * st;
      if (bx <= e.left) {
        e.el.style.borderImage = '';
        e.el.style.borderTopColor = 'white';
      } else if (bx >= e.left + e.width) {
        e.el.style.borderImage = '';
        e.el.style.borderTopColor = 'black';
      } else {
        var pc = (bx - e.left) / e.width * 100;
        e.el.style.borderImage =
          'linear-gradient(to right,black ' + pc + '%,white ' + pc + '%) 1';
      }
    }

    for (var k = 0; k < _krCache.length; k++) {
      var kr = _krCache[k];
      var rTop = kr.docTop - st;
      var rBot = kr.docBottom - st;
      if (kr.by <= rTop) {
        kr.el.style.borderImage = '';
        if (kr.mobile) kr.el.style.borderRightColor = 'white';
        else kr.el.style.borderLeftColor = 'white';
      } else if (kr.by >= rBot) {
        kr.el.style.borderImage = '';
        if (kr.mobile) kr.el.style.borderRightColor = 'black';
        else kr.el.style.borderLeftColor = 'black';
      } else {
        var pc2 = (kr.by - rTop) / kr.height * 100;
        kr.el.style.borderImage =
          'linear-gradient(to bottom,black ' + pc2 + '%,white ' + pc2 + '%) 1';
      }
    }
  }

  function init() {
    precompute();
    onScroll();
    window.addEventListener('resize', function () {
      precompute();
      onScroll();
    });
    (_scrollEl || window).addEventListener('scroll', onScroll);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
