(function () {
  var MOBILE = 900;
  var TEXT_SELS =
    '.en .author,.en .title,.en .year,' +
    '.kr .year,.kr .title,.kr .title .ur,' +
    '.titleen,.titlekr,footer p,footer a';

  var _scrollEl = null;
  var _arcFixed = false;

  function getParams() {
    var arcEl = document.querySelector('.arc');
    var r = arcEl.getBoundingClientRect();
    var cs = getComputedStyle(arcEl);
    var bl = parseFloat(cs.borderLeftWidth) || 0;
    var bb = parseFloat(cs.borderBottomWidth) || 0;
    _arcFixed = cs.position === 'fixed';
    return { x1: r.left, y1: r.bottom, x2: r.left + bl, y2: r.bottom - bb };
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
    var nx = p.y1 - p.y2, ny = p.x2 - p.x1;
    var nl = Math.sqrt(nx * nx + ny * ny);
    if (nl === 0) return;
    var ux = nx / nl, uy = ny / nl;
    var ang = Math.atan2(nx, -ny) * 180 / Math.PI;
    var diagProj = p.x1 * ux + p.y1 * uy;
    var m = window.innerWidth <= MOBILE;

    var els = document.querySelectorAll(TEXT_SELS);
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      var rect = el.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) continue;
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

      el.style.backgroundImage =
        'linear-gradient(' + ang + 'deg,black ' + pct + '%,white ' + pct + '%)';
      el.style.webkitBackgroundClip = 'text';
      el.style.backgroundClip = 'text';
      el.style.webkitTextFillColor = 'transparent';
    }

    var ens = document.querySelectorAll('.en li');
    for (var j = 0; j < ens.length; j++) {
      var r = ens[j].getBoundingClientRect();
      var bx = diagX(r.top, p);
      if (bx <= r.left) {
        ens[j].style.borderImage = '';
        ens[j].style.borderTopColor = 'white';
      } else if (bx >= r.right) {
        ens[j].style.borderImage = '';
        ens[j].style.borderTopColor = 'black';
      } else {
        var pc = (bx - r.left) / r.width * 100;
        ens[j].style.borderImage =
          'linear-gradient(to right,black ' + pc + '%,white ' + pc + '%) 1';
      }
    }

    var krs = document.querySelectorAll('.kr li');
    for (var k = 0; k < krs.length; k++) {
      var r2 = krs[k].getBoundingClientRect();
      var edgeX = m ? r2.right : r2.left;
      var by = diagY(edgeX, p);
      if (by <= r2.top) {
        krs[k].style.borderImage = '';
        if (m) krs[k].style.borderRightColor = 'white';
        else krs[k].style.borderLeftColor = 'white';
      } else if (by >= r2.bottom) {
        krs[k].style.borderImage = '';
        if (m) krs[k].style.borderRightColor = 'black';
        else krs[k].style.borderLeftColor = 'black';
      } else {
        var pc2 = (by - r2.top) / r2.height * 100;
        krs[k].style.borderImage =
          'linear-gradient(to bottom,black ' + pc2 + '%,white ' + pc2 + '%) 1';
      }
    }
  }

  var _lastY = -1;
  function loop() {
    var y = _scrollEl ? _scrollEl.scrollTop : 0;
    if (y !== _lastY) {
      _lastY = y;
      run();
    }
    requestAnimationFrame(loop);
  }

  function init() {
    _scrollEl = document.querySelector('.scroll-wrap');
    run();
    window.addEventListener('resize', run);
    requestAnimationFrame(loop);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
