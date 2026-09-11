/* night-shade.cc — renders projects from projects.js and grows the hero specimen */
(() => {
  "use strict";
  const data = window.NS_DATA;
  if (!data) return;
  const { projects, fields, statuses } = data;
  const ORDER = ["running", "building", "planned", "idea"];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const SVGNS = "http://www.w3.org/2000/svg";
  const $ = (s, r = document) => r.querySelector(s);

  function el(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function glyph(status) {
    const s = document.createElementNS(SVGNS, "svg");
    s.setAttribute("viewBox", "0 0 16 16");
    s.setAttribute("class", "glyph");
    s.setAttribute("aria-hidden", "true");
    const add = (tag, attrs) => {
      const e = document.createElementNS(SVGNS, tag);
      for (const k in attrs) e.setAttribute(k, attrs[k]);
      s.appendChild(e);
    };
    if (status === "running") {
      add("circle", { cx: 8, cy: 8.5, r: 5.6, class: "g-ripe" });
      add("circle", { cx: 6.2, cy: 6.6, r: 1.4, class: "g-shine" });
    } else if (status === "building") {
      add("circle", { cx: 8, cy: 8.5, r: 5.6, class: "g-green" });
    } else if (status === "planned") {
      add("path", { d: "M4.6 3.2 Q8 1.8 11.4 3.2 L12.8 11.6 Q11 10.6 10.2 12.8 Q8.9 11.2 8 13 Q7.1 11.2 5.8 12.8 Q5 10.6 3.2 11.6 Z", class: "g-bell" });
    } else {
      add("path", { d: "M8 2.4 C11 5.6 11 10.4 8 13.6 C5 10.4 5 5.6 8 2.4 Z", class: "g-bud" });
    }
    return s;
  }

  document.querySelectorAll("[data-updated]").forEach(n => { n.textContent = data.updated; });

  /* ---------- herbarium label key ---------- */
  const key = $("#fruit-key");
  if (key) ORDER.forEach(st => {
    const sp = el("span");
    sp.append(glyph(st), document.createTextNode(statuses[st].label.toLowerCase()));
    key.append(sp);
  });

  /* ---------- project cards ---------- */
  const grid = $("#project-grid");
  const cards = new Map();
  let hoverFromCard = null;

  projects.forEach(p => {
    const card = el("article", "card");
    card.id = "p-" + p.id;
    card.dataset.field = p.field;

    const top = el("div", "card-top");
    top.append(el("span", "card-field", fields[p.field] || p.field), el("span", "card-host", p.host ? "runs on " + p.host : "not started"));

    const h = el("h3");
    if (p.url) {
      const a = el("a", null, p.title);
      a.href = p.url;
      a.rel = "noopener";
      h.append(a);
    } else {
      h.textContent = p.title;
    }
    card.append(top, h, el("p", "card-sum", p.summary));

    if (p.stack && p.stack.length) {
      const ul = el("ul", "stack");
      ul.setAttribute("aria-label", "Stack");
      p.stack.forEach(s => ul.append(el("li", null, s)));
      card.append(ul);
    }
    if (p.notes && p.notes.length) {
      const d = el("details", "notes");
      d.append(el("summary", null, "Field notes"));
      const ul = el("ul");
      p.notes.forEach(n => ul.append(el("li", null, n)));
      d.append(ul);
      card.append(d);
    }

    const foot = el("div", "card-foot");
    const st = el("span", "status status-" + p.status);
    st.append(glyph(p.status), document.createTextNode(statuses[p.status].label));
    foot.append(st);
    if (p.next) {
      const nx = el("p", "next");
      nx.append(el("span", "next-label", "Next"), document.createTextNode(p.next));
      foot.append(nx);
    }
    card.append(foot);

    card.addEventListener("pointerenter", () => { hoverFromCard = p.id; requestDraw(); });
    card.addEventListener("pointerleave", () => { hoverFromCard = null; requestDraw(); });
    grid.append(card);
    cards.set(p.id, card);
  });

  const countBy = (list, key) => list.reduce((m, p) => (m[p[key]] = (m[p[key]] || 0) + 1, m), {});
  const statusCounts = countBy(projects, "status");
  const fieldCounts = countBy(projects, "field");

  const pc = $("#projects-count");
  if (pc) pc.textContent = `${projects.length} projects · ${statusCounts.running || 0} running · ${statusCounts.building || 0} in progress`;

  /* ---------- filters ---------- */
  const filters = $("#filters");
  const tally = $("#tally");
  let active = "all";

  function renderTally(list) {
    tally.replaceChildren();
    const c = countBy(list, "status");
    ORDER.forEach(st => {
      if (!c[st]) return;
      const sp = el("span");
      sp.append(glyph(st), document.createTextNode(`${c[st]} ${statuses[st].label.toLowerCase()}`));
      tally.append(sp);
    });
  }

  function setFilter(f) {
    active = f;
    filters.querySelectorAll("button").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.filter === f)));
    const visible = [];
    projects.forEach(p => {
      const show = f === "all" || p.field === f;
      cards.get(p.id).hidden = !show;
      if (show) visible.push(p);
    });
    renderTally(visible);
  }

  [["all", "All", projects.length], ...Object.keys(fields).filter(k => fieldCounts[k]).map(k => [k, fields[k], fieldCounts[k]])]
    .forEach(([id, label, n]) => {
      const b = el("button");
      b.type = "button";
      b.id = "filter-" + id;
      b.dataset.filter = id;
      b.append(document.createTextNode(label), el("span", "count", String(n)));
      b.addEventListener("click", () => setFilter(id));
      filters.append(b);
    });
  setFilter("all");

  function goToProject(id) {
    const card = cards.get(id);
    if (!card) return;
    if (card.hidden) setFilter("all");
    const d = card.querySelector("details");
    if (d) d.open = true;
    card.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
    card.classList.add("is-flash");
    setTimeout(() => card.classList.remove("is-flash"), 1800);
  }

  document.querySelectorAll('a[href^="#p-"]').forEach(a => {
    a.addEventListener("click", e => {
      e.preventDefault();
      goToProject(a.getAttribute("href").slice(3));
      history.replaceState(null, "", a.getAttribute("href"));
    });
  });
  if (location.hash.startsWith("#p-")) requestAnimationFrame(() => goToProject(location.hash.slice(3)));

  /* ---------- the specimen: Atropa belladonna, one fruit per project ---------- */
  const canvas = $("#sprig");
  const tip = $("#sprig-tip");
  let requestDraw = () => {};
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext("2d");
  const css = getComputedStyle(document.documentElement);
  const tok = n => css.getPropertyValue(n).trim();
  const C = {
    leaf: tok("--leaf"), calyx: tok("--calyx"), ripe: tok("--ripe"), bloom: tok("--bloom"),
    petal: tok("--petal"), ink: tok("--ink"), ink3: tok("--ink-3"), corolla: tok("--corolla")
  };

  // Design space: 400 × 500, fitted into the canvas.
  const bez = (a, b, c, d) => ({ a, b, c, d });
  const at = (B, t) => {
    const u = 1 - t;
    return [
      u * u * u * B.a[0] + 3 * u * u * t * B.b[0] + 3 * u * t * t * B.c[0] + t * t * t * B.d[0],
      u * u * u * B.a[1] + 3 * u * u * t * B.b[1] + 3 * u * t * t * B.c[1] + t * t * t * B.d[1]
    ];
  };
  const tan = (B, t) => {
    const u = 1 - t;
    const x = 3 * u * u * (B.b[0] - B.a[0]) + 6 * u * t * (B.c[0] - B.b[0]) + 3 * t * t * (B.d[0] - B.c[0]);
    const y = 3 * u * u * (B.b[1] - B.a[1]) + 6 * u * t * (B.c[1] - B.b[1]) + 3 * t * t * (B.d[1] - B.c[1]);
    const l = Math.hypot(x, y) || 1;
    return [x / l, y / l];
  };

  const stem = bez([96, 505], [118, 370], [236, 270], [292, 36]);
  const s = t => at(stem, t);
  const branches = [
    stem,
    bez(s(0.36), [s(0.36)[0] + 70, s(0.36)[1] - 8], [336, 300], [384, 238]),
    bez(s(0.54), [s(0.54)[0] - 60, s(0.54)[1] - 2], [104, 232], [42, 178]),
    bez(s(0.74), [s(0.74)[0] + 44, s(0.74)[1] + 6], [336, 128], [374, 86]),
    bez(s(0.2), [s(0.2)[0] - 40, s(0.2)[1] - 4], [60, 380], [26, 350])
  ];

  let seed = 11;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

  // leaves: [branchIndex, t, side, length]
  const leaves = [];
  const leafPlan = [
    [0, 0.08, 1, 70], [0, 0.28, -1, 84], [0, 0.46, 1, 78], [0, 0.66, -1, 70], [0, 0.84, 1, 58], [0, 0.97, -1, 40],
    [1, 0.3, -1, 62], [1, 0.62, 1, 70], [1, 0.9, -1, 50],
    [2, 0.28, 1, 58], [2, 0.6, -1, 66], [2, 0.92, 1, 44],
    [3, 0.35, -1, 54], [3, 0.72, 1, 50],
    [4, 0.45, 1, 50], [4, 0.9, -1, 42]
  ];
  leafPlan.forEach(([bi, t, side, len]) => {
    leaves.push({ bi, t, side, len, twist: (rnd() - 0.5) * 0.5, w: 0.42 + rnd() * 0.1 });
  });

  // fruit slots: [branchIndex, t, side]
  const slots = [
    [1, 0.98, 1], [0, 0.56, -1], [3, 0.99, 1], [2, 0.99, -1], [1, 0.48, 1], [0, 0.36, 1],
    [3, 0.52, -1], [0, 0.9, 1], [2, 0.5, 1], [4, 0.98, -1], [0, 0.18, 1], [0, 0.76, -1]
  ];
  const fruits = projects.slice(0, slots.length).map((p, i) => {
    const [bi, t, side] = slots[i];
    return { id: p.id, status: p.status, title: p.title, bi, t, side, drop: 26 + rnd() * 14, phase: rnd() * 6 };
  });

  let W = 0, H = 0, k = 1, ox = 0, oy = 0, dpr = 1;
  function resize() {
    const r = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = r.width; H = r.height;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    k = Math.min(W / 420, H / 510);
    ox = (W - 400 * k) / 2;
    oy = (H - 500 * k) / 2 + 4 * k;
    draw();
  }

  let time = 0;
  // gentle sway: displacement grows with height above the root
  const sway = (x, y) => {
    const h = Math.max(0, (505 - y) / 505);
    const dx = Math.sin(time * 0.55 + y * 0.012) * 5 * h * h + Math.sin(time * 0.23) * 3 * h;
    return [x + dx, y];
  };
  const P = (pt) => { const q = sway(pt[0], pt[1]); return [ox + q[0] * k, oy + q[1] * k]; };

  function strokeCurve(B, width) {
    ctx.beginPath();
    const steps = 28;
    for (let i = 0; i <= steps; i++) {
      const q = P(at(B, i / steps));
      i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]);
    }
    ctx.lineWidth = width * k;
    ctx.stroke();
  }

  function drawLeaf(L) {
    const B = branches[L.bi];
    const base = at(B, L.t);
    const tg = tan(B, L.t);
    const ang = Math.atan2(tg[1], tg[0]) + L.side * (0.95 + L.twist);
    const dir = [Math.cos(ang), Math.sin(ang)];
    const nrm = [-dir[1], dir[0]];
    const len = L.len, w = len * L.w;
    const pt = (a, b) => P([base[0] + dir[0] * a + nrm[0] * b, base[1] + dir[1] * a + nrm[1] * b]);
    const b0 = pt(0, 0), tip = pt(len, 0);
    const c1 = pt(len * 0.12, w * 0.55), c2 = pt(len * 0.55, w * 0.62);
    const c3 = pt(len * 0.55, -w * 0.62), c4 = pt(len * 0.12, -w * 0.55);
    ctx.beginPath();
    ctx.moveTo(b0[0], b0[1]);
    ctx.bezierCurveTo(c1[0], c1[1], c2[0], c2[1], tip[0], tip[1]);
    ctx.bezierCurveTo(c3[0], c3[1], c4[0], c4[1], b0[0], b0[1]);
    const g = ctx.createLinearGradient(b0[0], b0[1], tip[0], tip[1]);
    g.addColorStop(0, C.leaf);
    g.addColorStop(1, "rgba(86,111,78,0.55)");
    ctx.fillStyle = g;
    ctx.globalAlpha = 0.9;
    ctx.fill();
    ctx.globalAlpha = 0.45;
    ctx.strokeStyle = C.calyx;
    ctx.lineWidth = 0.8 * k;
    ctx.stroke();
    // midrib + a few veins
    ctx.globalAlpha = 0.35;
    ctx.beginPath();
    const m = pt(len * 0.92, 0);
    ctx.moveTo(b0[0], b0[1]); ctx.lineTo(m[0], m[1]);
    for (let i = 1; i <= 3; i++) {
      const a = len * (0.18 + i * 0.18);
      const v0 = pt(a, 0);
      [1, -1].forEach(sd => {
        const v1 = pt(a + len * 0.14, sd * w * 0.38);
        ctx.moveTo(v0[0], v0[1]); ctx.lineTo(v1[0], v1[1]);
      });
    }
    ctx.lineWidth = 0.7 * k;
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  function calyxStar(x, y, r, rot) {
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const a = rot + (i * Math.PI) / 5;
      const rr = i % 2 === 0 ? r : r * 0.32;
      const px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr * 0.72;
      i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
    }
    ctx.closePath();
    ctx.fillStyle = C.leaf;
    ctx.fill();
    ctx.strokeStyle = C.calyx;
    ctx.globalAlpha = 0.7;
    ctx.lineWidth = 0.8 * k;
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  const hits = [];
  let hoverFruit = null;

  function drawFruit(f) {
    const B = branches[f.bi];
    const a0 = at(B, f.t);
    const end = [a0[0] + f.side * 18, a0[1] + f.drop];
    const ctrl = [a0[0] + f.side * 20, a0[1] + 4];
    const p0 = P(a0), pc = P(ctrl);
    const bob = reduceMotion ? 0 : Math.sin(time * 0.9 + f.phase) * 1.4;
    const pe = P([end[0] + bob, end[1]]);
    ctx.strokeStyle = C.leaf;
    ctx.lineWidth = 1.4 * k;
    ctx.beginPath();
    ctx.moveTo(p0[0], p0[1]);
    ctx.quadraticCurveTo(pc[0], pc[1], pe[0], pe[1]);
    ctx.stroke();

    const x = pe[0], y = pe[1];
    let r = 10 * k, cy = y + r * 0.9;
    const lit = hoverFruit === f.id || hoverFromCard === f.id;

    if (f.status === "running" || f.status === "building") {
      calyxStar(x, y + r * 0.25, r * 1.75, f.phase);
      if (f.status === "building") r = 8.5 * k;
      cy = y + r * 0.95;
      const g = ctx.createRadialGradient(x - r * 0.35, cy - r * 0.4, r * 0.1, x, cy, r);
      if (f.status === "running") {
        g.addColorStop(0, "#5a3a66"); g.addColorStop(0.45, C.ripe); g.addColorStop(1, "#060308");
      } else {
        g.addColorStop(0, "#b9d29f"); g.addColorStop(0.55, "#6f8c5f"); g.addColorStop(1, "#34452f");
      }
      ctx.beginPath(); ctx.arc(x, cy, r, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill();
      ctx.globalAlpha = f.status === "running" ? 0.9 : 0.55;
      ctx.beginPath(); ctx.ellipse(x - r * 0.36, cy - r * 0.42, r * 0.24, r * 0.16, -0.6, 0, Math.PI * 2);
      ctx.fillStyle = C.ink; ctx.fill();
      ctx.globalAlpha = 1;
    } else if (f.status === "planned") {
      // a nodding bell, mouth down
      const bw = 8 * k, bh = 24 * k, mouth = 11 * k;
      cy = y + bh * 0.55;
      ctx.beginPath();
      ctx.moveTo(x - bw * 0.55, y + 2 * k);
      ctx.bezierCurveTo(x - bw * 1.1, y + bh * 0.45, x - mouth * 0.9, y + bh * 0.8, x - mouth, y + bh);
      for (let i = 0; i < 5; i++) {
        const x0 = x - mouth + (i * 2 * mouth) / 5, x1 = x0 + (2 * mouth) / 5;
        ctx.quadraticCurveTo((x0 + x1) / 2, y + bh + 4.5 * k, x1, y + bh);
      }
      ctx.bezierCurveTo(x + mouth * 0.9, y + bh * 0.8, x + bw * 1.1, y + bh * 0.45, x + bw * 0.55, y + 2 * k);
      ctx.closePath();
      const g = ctx.createLinearGradient(x, y, x, y + bh);
      g.addColorStop(0, "#5c3b57"); g.addColorStop(1, C.petal);
      ctx.fillStyle = g; ctx.fill();
      ctx.strokeStyle = C.corolla; ctx.globalAlpha = 0.55; ctx.lineWidth = 0.9 * k; ctx.stroke(); ctx.globalAlpha = 1;
      calyxStar(x, y + 3 * k, 9 * k, f.phase);
      r = 13 * k;
    } else {
      // closed bud
      const bh = 15 * k, bw = 5 * k;
      cy = y + bh * 0.6;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.bezierCurveTo(x + bw * 1.6, y + bh * 0.3, x + bw, y + bh, x, y + bh * 1.15);
      ctx.bezierCurveTo(x - bw, y + bh, x - bw * 1.6, y + bh * 0.3, x, y);
      ctx.fillStyle = "rgba(142,94,136,0.45)"; ctx.fill();
      ctx.strokeStyle = C.ink3; ctx.lineWidth = 0.9 * k; ctx.stroke();
      calyxStar(x, y + 2 * k, 6.5 * k, f.phase);
      r = 9 * k;
    }

    if (lit) {
      ctx.beginPath();
      ctx.arc(x, cy, r + 7 * k, 0, Math.PI * 2);
      ctx.strokeStyle = C.bloom; ctx.lineWidth = 1.3; ctx.stroke();
    }
    hits.push({ f, x, y: cy, r: Math.max(r, 10) + 8 });
  }

  function draw() {
    if (!W) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    hits.length = 0;

    // stems
    ctx.strokeStyle = C.leaf;
    strokeCurve(branches[0], 4.2);
    branches.slice(1).forEach(B => strokeCurve(B, 2.4));
    // leaves behind fruit
    leaves.forEach(drawLeaf);
    fruits.forEach(drawFruit);
  }

  let queued = false;
  requestDraw = () => {
    if (!running && !queued) { queued = true; requestAnimationFrame(() => { queued = false; draw(); }); }
  };

  let running = false, last = 0, visible = true;
  function loop(ts) {
    if (!running) return;
    if (ts - last > 33) { time = ts / 1000; last = ts; draw(); }
    requestAnimationFrame(loop);
  }
  function start() { if (!reduceMotion && visible && !running) { running = true; requestAnimationFrame(loop); } }
  function stop() { running = false; }

  new ResizeObserver(resize).observe(canvas);
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(es => { visible = es[0].isIntersecting; visible ? start() : stop(); }).observe(canvas);
  }
  document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));
  resize();
  start();

  function pick(e) {
    const r = canvas.getBoundingClientRect();
    const mx = e.clientX - r.left, my = e.clientY - r.top;
    let best = null, bd = Infinity;
    hits.forEach(h => {
      const d = Math.hypot(h.x - mx, h.y - my);
      if (d < h.r && d < bd) { bd = d; best = h; }
    });
    return best;
  }
  canvas.addEventListener("pointermove", e => {
    const h = pick(e);
    const id = h ? h.f.id : null;
    canvas.style.cursor = h ? "pointer" : "default";
    if (id !== hoverFruit) {
      hoverFruit = id;
      requestDraw();
    }
    if (h) {
      tip.replaceChildren(document.createTextNode(h.f.title), el("small", null, `${statuses[h.f.status].fruit} · ${statuses[h.f.status].label.toLowerCase()}`));
      tip.style.left = h.x + "px";
      tip.style.top = (h.y - h.r + 6) + "px";
      tip.hidden = false;
    } else {
      tip.hidden = true;
    }
  });
  canvas.addEventListener("pointerleave", () => { hoverFruit = null; tip.hidden = true; requestDraw(); });
  canvas.addEventListener("click", e => { const h = pick(e); if (h) goToProject(h.f.id); });
})();
