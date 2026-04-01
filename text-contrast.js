(function () {
  var MOBILE = 900;

  function getParams() {
    var vw = window.innerWidth, vh = window.innerHeight;
    var m = vw <= MOBILE;
    return {
      // diagonal from bottom-left to top-right of the brown triangle
      x1: m ? 0 : vw * 0.3,   y1: vh,
      x2: m ? vw : vw * 0.89, y2: 0,
      vw: vw, vh: vh
    };
  }

  /* x on diagonal at given y */
  function diagX(y, p) {
    var t = (p.y1 - y) / (p.y1 - p.y2);
    return p.x1 + (p.x2 - p.x1) * t;
  }

  /* y on diagonal at given x */
  function diagY(x, p) {
    if (p.x2 === p.x1) return p.y1;
    return p.y1 + (p.y2 - p.y1) * (x - p.x1) / (p.x2 - p.x1);
  }

  /* compute CSS custom properties for the viewport-fixed text gradient */
  function computeGradient() {
    var p = getParams();

    // normal to diagonal, pointing into brown area (screen-coords, y-down)
    var nx = p.y1 - p.y2;   // vh
    var ny = p.x2 - p.x1;   // delta-x of diagonal

    // CSS linear-gradient angle (clockwise from north)
    var ang = Math.atan2(nx, -ny) * 180 / Math.PI;

    // project viewport corners onto gradient-normal to find 0%/100% extents
    var cx = p.vw / 2, cy = p.vh / 2;
    var nl = Math.sqrt(nx * nx + ny * ny);
    var ux = nx / nl, uy = ny / nl;

    var corners = [[0, 0], [p.vw, 0], [0, p.vh], [p.vw, p.vh]];
    var projs = corners.map(function (c) {
      return (c[0] - cx) * ux + (c[1] - cy) * uy;
    });
    var mn = Math.min.apply(null, projs);
    var mx = Math.max.apply(null, projs);

    // project diagonal midpoint to get the transition position
    var dmx = (p.x1 + p.x2) / 2, dmy = (p.y1 + p.y2) / 2;
    var dp = (dmx - cx) * ux + (dmy - cy) * uy;
    var pct = (dp - mn) / (mx - mn) * 100;

    var root = document.documentElement;
    root.style.setProperty('--tc-a', ang + 'deg');
    root.style.setProperty('--tc-p', pct + '%');
  }

  /* set border colors (or border-image gradients when a border crosses the diagonal) */
  function updateBorders() {
    var p = getParams();
    var m = p.vw <= MOBILE;

    // .en li — horizontal border-top
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

    // .kr li — vertical border (left on desktop, right on mobile)
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

  function run() {
    computeGradient();
    updateBorders();
  }

  function init() {
    run();
    window.addEventListener('resize', run);
    window.addEventListener('scroll', run);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
