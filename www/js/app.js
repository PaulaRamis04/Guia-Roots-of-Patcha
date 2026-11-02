/* Guía Pacha — lógica de la aplicación (sin dependencias) */
(function () {
  'use strict';

  /* ————— Estado persistente ————— */
  const STORE_KEY = 'pacha-guia-v1';
  const defaults = {
    season: 0, day: 1, year: 1, names: 'es', theme: 'auto', images: true,
    favs: [], prophecies: {}, fish: {}, gifts: {}, cooked: {}, ideas: {}, onboarded: false,
    filters: {}, courting: {}, flowers: {}, firstDay: {}, recent: []
  };
  let S = load();
  function load() {
    const fresh = () => JSON.parse(JSON.stringify(defaults));
    try { return Object.assign(fresh(), JSON.parse(localStorage.getItem(STORE_KEY) || '{}')); }
    catch (e) { return fresh(); }
  }
  function save() { try { localStorage.setItem(STORE_KEY, JSON.stringify(S)); } catch (e) { /* almacenamiento no disponible */ } }

  /* ————— Utilidades ————— */
  const $ = (sel, el = document) => el.querySelector(sel);
  const $$ = (sel, el = document) => Array.from(el.querySelectorAll(sel));
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const place = p => p.split(' / ').map(x => PLACES[x] || x).join(' / ');
  const seasonById = id => SEASONS.find(s => s.id === id);
  const seasonIdx = id => SEASONS.findIndex(s => s.id === id);
  const weekday = d => WEEKDAYS[(d - 1) % 7];
  const cur = () => SEASONS[S.season];
  const isFav = id => S.favs.includes(id);
  const ini = n => esc(String(n || '?').trim()[0] || '?');
  const sw = id => `<i class="sw s-${id}" aria-hidden="true"></i>`;
  const swatches = ids => ids.length === 4 ? '<span class="yr">Todo el año</span>' : ids.map(sw).join('');
  const starIco = '<svg class="star" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.6c.7 0 1 .6 1.4 1.4l1.6 3.4 3.7.5c.9.1 1.5.4 1.6 1 .2.6-.3 1.1-.9 1.7l-2.7 2.6.7 3.7c.2.9 0 1.5-.5 1.8-.5.4-1.1.1-1.9-.3L12 17.6l-3.3 1.8c-.8.4-1.4.7-1.9.3-.5-.3-.7-.9-.5-1.8l.7-3.7L4.3 11.6c-.6-.6-1.1-1.1-.9-1.7.1-.6.7-.9 1.6-1l3.7-.5L10.6 5c.4-.8.7-1.4 1.4-1.4z"/></svg>';
  const heartIco = '<svg class="heart" viewBox="0 0 24 24" role="img" aria-label="Se puede cortejar"><path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z"/></svg>';
  const heartPlain = '<svg class="heart" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z"/></svg>';
  /* Flor de relación: pétalos con contorno debajo y relleno encima (sin líneas interiores) */
  const petals = [0, 72, 144, 216, 288].map(a => `<ellipse cx="12" cy="6.6" rx="3.5" ry="4.5" transform="rotate(${a} 12 12)"/>`).join('');
  const flowerIco = `<svg class="flower" viewBox="0 0 24 24" aria-hidden="true"><g class="fo">${petals}</g><g class="fp">${petals}</g><circle class="fc" cx="12" cy="12" r="2.6"/></svg>`;
  const FLOWER_MAX = 10;
  const flowersOf = id => S.flowers[id] || 0;
  /* Amarillas: amistad · rosas: se puede cortejar · rojas: salís juntos (wiki: Relationships) */
  const flowerKind = v => !v.romance ? 'friend' : (S.courting[v.id] ? 'dating' : 'romance');
  const flowerWord = n => `${n} ${n === 1 ? 'flor' : 'flores'}`;
  const chev = '<svg class="chev" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>';
  const searchIco = '<svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-search"/></svg>';
  const closeIco = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/></svg>';
  const fuzzy = (q, ...texts) => Fuzzy.match(q, ...texts);

  /* ——— Escenas pequeñas y tiernas para estados vacíos (estilo pintura rupestre) ——— */
  const SCENES = {
    fire: `<svg class="scene" viewBox="0 0 140 96" aria-hidden="true"><ellipse class="soft" cx="70" cy="86" rx="52" ry="7"/>
      <g fill="none" stroke-linecap="round" stroke-width="7" class="ink"><path d="M38 84l64-12"/><path d="M102 84L38 72"/></g>
      <path class="fire-a flicker" d="M70 14c8 11 18 18 18 33a18 18 0 0 1-36 0c0-7 3.5-12.5 7-16 .4 6 3.6 10 7 11-3.5-8-2-18 4-28z"/>
      <path class="fire-b flicker b" d="M70 38c3.6 4.6 8 8 8 14.5a8 8 0 0 1-16 0c0-3.6 1.8-5.4 3.6-7.2 0 2.7 1.8 4.5 3.6 4.5-.9-3.6 0-8 .8-11.8z"/>
      <g class="fillink"><circle cx="22" cy="22" r="2.4"/><circle cx="118" cy="16" r="2"/><circle cx="108" cy="34" r="1.6"/></g></svg>`,
    sleep: `<svg class="scene" viewBox="0 0 140 96" aria-hidden="true"><ellipse class="soft" cx="72" cy="84" rx="54" ry="7"/>
      <path class="fillink" d="M30 74c0-18 18-30 40-30 18 0 32 8 36 20 6 0 12 4 12 10 0 4-3 6-8 6H38c-5 0-8-2-8-6z" opacity=".85"/>
      <path class="fillink" d="M96 52c3-8 9-12 14-11 4 1 5 6 3 11z" opacity=".85"/>
      <path fill="none" class="ink" stroke-width="3" stroke-linecap="round" d="M101 66c2 1.5 4 1.5 6 0" style="stroke:var(--bg)"/>
      <g fill="none" class="ink" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M112 20h9l-9 10h9"/><path d="M124 6h6l-6 7h6"/></g></svg>`,
    basket: `<svg class="scene" viewBox="0 0 140 96" aria-hidden="true"><ellipse class="soft" cx="70" cy="86" rx="48" ry="7"/>
      <g fill="none" class="ink" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><path d="M34 44h72l-9 38H43z"/><path d="M50 44c0-14 9-24 20-24s20 10 20 24"/><path d="M38 58h64M41 70h58"/></g>
      <g class="moss"><circle cx="58" cy="38" r="6"/><circle cx="72" cy="35" r="7"/><circle cx="85" cy="39" r="5.5"/></g></svg>`,
    hand: `<svg class="scene" viewBox="0 0 140 96" aria-hidden="true"><use href="#i-hand" x="40" y="10" width="60" height="60" style="color:var(--accent-soft)"/>
      <g class="fillink"><circle cx="26" cy="30" r="2.4"/><circle cx="114" cy="24" r="2.4"/><circle cx="104" cy="70" r="2"/><circle cx="34" cy="72" r="2"/></g></svg>`
  };
  function emptyState(scene, title, text, action) {
    return `<div class="empty-state">${SCENES[scene] || SCENES.fire}<h3>${title}</h3>${text ? `<p>${text}</p>` : ''}${action || ''}</div>`;
  }
  const noResults = (what) => emptyState('fire', 'Aquí no hay nada todavía', `Ningún ${what} coincide. Siéntate junto al fuego y prueba otra búsqueda o quita algún filtro.`);

  /* ——— Filtros recordados: la URL manda; si no, el último filtro usado; si no, el de serie ——— */
  function recall(screen, params, def) {
    const saved = S.filters[screen] || {};
    const st = {};
    for (const k in def) st[k] = params.has(k) ? params.get(k) : (saved[k] != null ? saved[k] : def[k]);
    return st;
  }
  function remember(screen, st, def) {
    S.filters[screen] = Object.fromEntries(Object.keys(def).map(k => [k, st[k]])); save();
  }
  function filterNote(st, def, onReset, view) {
    const box = $('#filterNote', view);
    if (!box) return;
    const active = Object.keys(def).some(k => String(st[k]) !== String(def[k]));
    box.innerHTML = active ? `<span>Filtros de la última vez.</span><button class="linkish" type="button" data-reset-filters>Quitar filtros</button>` : '';
    const b = $('[data-reset-filters]', box);
    if (b) b.onclick = onReset;
  }

  /* Imagen de la wiki con icono alternativo si no hay conexión */
  function pic(file, fallback, alt) {
    if (!S.images || !file) return `<span class="pic"><span class="fb">${fallback || ''}</span></span>`;
    return `<span class="pic"><span class="fb">${fallback || ''}</span><img src="${wikiUrl(file)}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer" onload="this.parentNode.classList.add('ok')" onerror="picErr(this)"${alt ? ` data-alt="${esc(wikiUrl(alt))}"` : ''}></span>`;
  }
  window.picErr = function (img) {
    if (img.dataset.alt) { const a = img.dataset.alt; img.removeAttribute('data-alt'); img.src = a; }
    else { const g = img.closest('.gi'); if (g && !g.querySelector('.fb').textContent) g.classList.add('gone'); img.remove(); }
  };
  function avatar(v, lg) {
    const file = lg ? villagerPortraitFile(v) : villagerIconFile(v);
    return `<div class="avatar ${lg ? 'lg ' : ''}clan-${v.clan.toLowerCase()}">${pic(file, v.name[0], lg ? villagerIconFile(v) : null)}${v.romance ? heartIco : ''}</div>`;
  }
  const cropPic = c => pic(c.en + '.png', ini(c.name));
  const fishPic = f => pic(f.name + '.png', ini(f.name));
  const vChip = (v, cls) => `<a class="gift ${cls}" href="#/aldeano/${v.id}"><span class="gi round">${pic(villagerIconFile(v), '')}</span>${esc(v.name)}</a>`;

  function itemLabel(en) {
    if (S.names === 'en') return en;
    return translateItem(en) || en;
  }
  function seasonTags(ids) {
    if (ids.length === 4) return '<span class="tag moss">Todo el año</span>';
    return ids.map(id => `<span class="tag ${id}">${seasonById(id).name}</span>`).join('');
  }
  function toast(msg) {
    const t = $('#toast'); t.textContent = msg; t.classList.add('show');
    clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('show'), 1800);
  }
  function daysUntil(seasonI, day) {
    const now = S.season * SEASON_DAYS + S.day;
    let then = seasonI * SEASON_DAYS + day;
    if (then < now) then += SEASON_DAYS * 4;
    return then - now;
  }
  function safeReplace(url) { try { history.replaceState(null, '', url); } catch (e) { /* marco restringido */ } }
  function untilText(n) { return n === 0 ? '¡Hoy!' : n === 1 ? 'Mañana' : `En ${n} días`; }

  /* Índices para referencias cruzadas */
  const cropByEn = Object.fromEntries(CROPS.map(c => [c.en, c]));
  const fishByName = Object.fromEntries(FISH.map(f => [f.name, f]));
  const recipeByEn = Object.fromEntries(RECIPES.map(r => [r.en, r]));
  const prophecyFile = p => p.name.replace(/\b\w/g, m => m.toUpperCase()).replace(' Of ', ' of ') + '.png';
  function villagersFor(en, kind) {
    return VILLAGERS.filter(v => v[kind].some(i => i === en || i === en + ' (W)' || i === en + ' (D)'));
  }
  const baseName = en => String(en).replace(/ \((W|D)\)$/, '');

  /* ——— Índice de objetos: todo lo que aparece en la guía, por su nombre original ——— */
  const ITEMS = new Map();
  function addItem(en, kind, data) {
    const b = baseName(en);
    if (!ITEMS.has(b)) ITEMS.set(b, { en: b, kinds: {} });
    const it = ITEMS.get(b);
    if (!it.kinds[kind]) it.kinds[kind] = data || true;
  }
  CROPS.forEach(c => addItem(c.en, 'crop', c));
  RECIPES.forEach(r => addItem(r.en, 'recipe', r));
  FISH.forEach(f => addItem(f.name, 'fish', f));
  TREES.forEach(t => addItem(t.en, 'gather', t));
  GATHER.forEach(g => addItem(g.en, 'gather', g));
  MINERALS.forEach(m => addItem(m.en, 'mineral', m));
  TOOLS.forEach(g => g.items.forEach(t => addItem(t.en, 'tool', Object.assign({ group: g.group }, t))));
  CRAFTING.forEach(g => g.items.forEach(t => addItem(t.en, 'craft', Object.assign({ group: g.group }, t))));
  PROCESSORS.forEach(p => addItem(p.en, 'proc', p));
  FERTILIZERS.forEach(f => addItem(f.en, 'fert', f));
  BUGS.forEach(b => addItem(b.en, 'bug', b));
  UTENSILS.forEach(u => addItem(u.en, 'utensil', u));
  VILLAGERS.forEach(v => [...v.loves, ...v.likes, ...v.hates].forEach(i => addItem(i, 'gift')));
  [RECIPES.flatMap(r => r.ing), IDEAS.flatMap(i => i.mat || []), TOOLS.flatMap(g => g.items.flatMap(t => t.mat || [])),
    CRAFTING.flatMap(g => g.items.flatMap(t => t.mat || [])), PROCESSORS.flatMap(p => p.mat || [])]
    .forEach(list => list.forEach(([en]) => addItem(en, 'material')));

  const KIND_ES = { crop: 'Cultivo', recipe: 'Receta', fish: 'Pesca', gather: 'Recolección', mineral: 'Mineral', tool: 'Herramienta', craft: 'Artesanía',
    proc: 'Procesador', fert: 'Fertilizante', bug: 'Bicho', utensil: 'Utensilio', gift: 'Objeto', material: 'Material' };
  function itemKind(it) {
    for (const k of ['crop', 'recipe', 'fish', 'gather', 'mineral', 'tool', 'utensil', 'proc', 'craft', 'fert', 'bug']) if (it.kinds[k]) return k;
    return it.en.startsWith('Any ') ? 'category' : (it.kinds.gift ? 'gift' : 'material');
  }
  /* Adónde lleva tocar un objeto: su ficha propia si la tiene, si no la ficha general de objeto */
  function itemHref(en) {
    const b = baseName(en);
    if (cropByEn[b]) return '#/cultivo/' + cropByEn[b].id;
    if (recipeByEn[b]) return '#/receta/' + recipeByEn[b].id;
    return '#/objeto/' + encodeURIComponent(b);
  }
  /* En qué se usa un objeto: recetas, ideas, herramientas, artesanía y procesadores */
  function usesOf(en) {
    const b = baseName(en), has = list => (list || []).some(([i]) => baseName(i) === b);
    return [
      ...RECIPES.filter(r => has(r.ing)).map(r => ({ en: r.en, href: '#/receta/' + r.id, kind: 'Receta' })),
      ...IDEAS.filter(i => has(i.mat)).map(i => ({ en: i.en, label: S.names === 'en' ? i.en : i.es, img: i.img, href: '#/ideas?i=' + encodeURIComponent(i.en), kind: 'Idea' })),
      ...TOOLS.flatMap(g => g.items).filter(t => has(t.mat)).map(t => ({ en: t.en, href: itemHref(t.en), kind: 'Herramienta' })),
      ...CRAFTING.flatMap(g => g.items).filter(t => has(t.mat)).map(t => ({ en: t.en, href: itemHref(t.en), kind: 'Artesanía' })),
      ...PROCESSORS.filter(t => has(t.mat)).map(t => ({ en: t.en, href: itemHref(t.en), kind: 'Procesador' }))
    ];
  }
  function usesBlock(en) {
    const uses = usesOf(en);
    if (!uses.length) return '';
    const groups = {};
    uses.forEach(u => (groups[u.kind] = groups[u.kind] || []).push(u));
    const plural = { Receta: 'Recetas', Idea: 'Ideas', Herramienta: 'Herramientas', Artesanía: 'Artesanía', Procesador: 'Procesadores' };
    return `<div class="section-head"><h2>Se usa en</h2><span class="small muted">${uses.length} ${uses.length === 1 ? 'sitio' : 'sitios'}</span></div><div class="card">${Object.entries(groups).map(([k, list]) =>
      `<div class="gift-group"><h3>${plural[k]}</h3>${list.map(u => `<a class="gift" href="${u.href}"><span class="gi">${pic(u.img || itemIconFile(u.en), '')}</span>${esc(u.label || itemLabel(u.en))}</a>`).join('')}</div>`).join('')}</div>`;
  }
  function giftBlock(en, emptyMsg) {
    const loves = villagersFor(en, 'loves'), likes = villagersFor(en, 'likes'), hates = villagersFor(en, 'hates');
    let html = `<div class="section-head"><h2>¿A quién regalarlo?</h2></div><div class="card">`;
    if (!loves.length && !likes.length && !hates.length) html += `<p class="muted small" style="margin:0">${emptyMsg || 'Nadie tiene una opinión especial sobre esto: cuenta como regalo normal.'}</p>`;
    if (loves.length) html += `<div class="gift-group"><h3><span class="dot" style="background:var(--love)"></span>Le encanta a</h3>${loves.map(v => vChip(v, 'love')).join('')}</div>`;
    if (likes.length) html += `<div class="gift-group"><h3><span class="dot" style="background:var(--like)"></span>Le gusta a</h3>${likes.map(v => vChip(v, 'like')).join('')}</div>`;
    if (hates.length) html += `<div class="gift-group"><h3><span class="dot" style="background:var(--hate)"></span>Lo odia</h3>${hates.map(v => vChip(v, 'hate')).join('')}</div>`;
    return html + '</div>';
  }
  function giftChip(en, cls) {
    const label = itemLabel(en);
    const showEn = S.names === 'es' && label !== en;
    const inner = `<span class="gi">${pic(itemIconFile(en), '')}</span>${esc(label)}${showEn ? `<span class="en">${esc(en)}</span>` : ''}`;
    return `<a class="gift ${cls}" href="${itemHref(en)}">${inner}</a>`;
  }
  function birthdaysOn(seasonId, day) { return VILLAGERS.filter(v => v.season === seasonId && v.day === day); }
  function festivalsOn(seasonId, day) {
    return FESTIVALS.filter(f => (f.season === seasonId && f.day === day) || (f.season === 'all' && f.days.includes(day)));
  }
  function weekKey(v) { return `${S.year}-${S.season}-${Math.floor((S.day - 1) / 7)}-${v.id}`; }

  /* ————— Tema ————— */
  const mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  function applyTheme() {
    const dark = S.theme === 'dark' || (S.theme === 'auto' && mq && mq.matches);
    document.documentElement.classList.toggle('dark', dark);
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    $$('meta[name="theme-color"]').forEach(m => { m.setAttribute('content', dark ? '#2E241D' : '#F3E6D0'); });
  }
  if (mq && mq.addEventListener) mq.addEventListener('change', applyTheme);

  /* ————— Cabecera ————— */
  function setHeader(title, eyebrow, opts = {}) {
    $('#pageTitle').textContent = title;
    $('#eyebrow').textContent = eyebrow || '';
    $('#backBtn').hidden = !opts.back;
    document.title = title + ' · Guía Pacha';
  }
  function renderDatePill() {
    const s = cur();
    $('#datePill').innerHTML = `${sw(s.id)}<span>${S.day} ${s.name.slice(0, 3).toLowerCase()}.</span><span class="y">año ${S.year}</span>`;
    document.documentElement.dataset.season = s.id;
    document.documentElement.style.setProperty('--season', `var(--${s.id})`);
    document.documentElement.style.setProperty('--season-soft', `var(--${s.id}-soft)`);
  }

  /* ————— Router ————— */
  const routes = [];
  function route(pattern, tab, fn) { routes.push({ re: new RegExp('^' + pattern + '$'), tab, fn }); }
  function parseHash() {
    const raw = location.hash.replace(/^#/, '') || '/hoy';
    const [path, qs] = raw.split('?');
    const params = new URLSearchParams(qs || '');
    return { path, params };
  }
  function render(opts) {
    const keep = !!(opts && opts.keep), y = window.scrollY;
    const { path, params } = parseHash();
    closeSheet(true);
    for (const r of routes) {
      const m = path.match(r.re);
      if (m) {
        $$('.tabbar a').forEach(a => {
          a.classList.toggle('active', a.dataset.tab === r.tab);
          if (a.dataset.tab === r.tab) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
        });
        const view = $('#view');
        view.innerHTML = '';
        if (!keep) { view.classList.remove('view-enter'); void view.offsetWidth; view.classList.add('view-enter'); } else view.classList.remove('view-enter');
        try {
          r.fn(view, m.slice(1).map(x => (x == null ? x : decodeURIComponent(x))), params);
        } catch (err) {
          console.error(err);
          setHeader('Ups', '', { back: true });
          view.innerHTML = `<div class="card error-card" role="alert"><h3>Esta pantalla no ha podido abrirse</h3>
            <p class="small">Algo se ha torcido al preparar esta página. Tus datos guardados siguen a salvo.</p>
            <a class="btn primary" href="#/hoy">Volver a Hoy</a><pre>${esc(err && err.message)}</pre></div>`;
        }
        window.scrollTo(0, keep ? y : 0);
        return;
      }
    }
    location.hash = '#/hoy';
  }
  function notFound(view, what, back, backLabel) {
    setHeader('Ups', '', { back: true });
    view.innerHTML = emptyState('sleep', `No encontramos ${what}`, 'Puede que el enlace sea antiguo o que haya cambiado de nombre.', `<a class="btn primary" href="${back}">${backLabel}</a>`);
  }
  window.addEventListener('hashchange', render);

  /* ================= VISTAS ================= */

  /* ——— Hoy ——— */
  route('/hoy', 'hoy', view => {
    const s = cur();
    setHeader('Hoy', '');
    const daysLeft = SEASON_DAYS - S.day;
    const fests = festivalsOn(s.id, S.day);
    const bdays = birthdaysOn(s.id, S.day);

    let html = `
      <section class="hero s-${s.id}">
        <div class="hero-line"><span>${s.name}, año ${S.year}</span><span>${weekday(S.day)}</span></div>
        <div class="hero-body">
          <div class="big" aria-label="Día ${S.day}">${S.day}</div>
          ${bdays.length ? `<a class="hero-portrait" href="#/aldeano/${bdays[0].id}">${pic(villagerPortraitFile(bdays[0]), ini(bdays[0].name), villagerIconFile(bdays[0]))}<span>Cumple ${esc(bdays[0].name)}</span></a>` : ''}
        </div>
        <div class="sub">${daysLeft === 0 ? 'Último día de la estación' : `Quedan ${daysLeft} días de ${s.name.toLowerCase()}`}</div>
        <div class="progress" aria-hidden="true"><span style="width:${(S.day / SEASON_DAYS) * 100}%"></span></div>
        <div class="day-nav">
          <button class="btn ghost" data-act="prev">Día anterior</button>
          <button class="btn primary" data-act="next">Día siguiente</button>
        </div>
      </section>`;

    if (!S.onboarded) {
      html += `<div class="callout moss">Pon aquí el día en el que vas en tu partida (toca la fecha de arriba) y la app te dirá qué plantar, cumpleaños y festivales.</div>`;
    }

    html += `<div class="section-head"><h2>Hoy en el poblado</h2></div>`;
    if (!fests.length && !bdays.length) {
      html += `<div class="card muted">Hoy no hay festivales ni cumpleaños. Buen día para cuidar la granja.</div>`;
    }
    fests.forEach(f => {
      html += `<a class="row" href="#/festivales"><div class="emoji-badge date s-${s.id}">${S.day}</div><div class="main"><div class="title">${esc(f.name)}</div><div class="meta">${esc(place(f.place))}</div></div>${chev}</a>`;
    });
    bdays.forEach(v => { html += birthdayRow(v, 'Cumple hoy'); });

    // Próximos 7 días
    const upcoming = [];
    for (let i = 1; i <= 7; i++) {
      let si = S.season, d = S.day + i;
      if (d > SEASON_DAYS) { d -= SEASON_DAYS; si = (si + 1) % 4; }
      const sid = SEASONS[si].id;
      festivalsOn(sid, d).forEach(f => upcoming.push({ i, si, d, type: 'f', f }));
      birthdaysOn(sid, d).forEach(v => upcoming.push({ i, si, d, type: 'b', v }));
    }
    html += `<div class="section-head"><h2>Próximos 7 días</h2><a class="link" href="#/calendario">Calendario</a></div>`;
    if (!upcoming.length) html += `<div class="card muted">Semana tranquila en el poblado: ni fiestas ni cumpleaños.</div>`;
    html += '<div class="list">';
    upcoming.forEach(u => {
      const when = `${untilText(u.i)} · ${weekday(u.d)} ${u.d} de ${SEASONS[u.si].name.toLowerCase()}`;
      if (u.type === 'f') html += `<a class="row" href="#/festivales"><div class="emoji-badge date s-${SEASONS[u.si].id}">${u.d}</div><div class="main"><div class="title">${esc(u.f.name)}</div><div class="meta">${when}</div></div>${chev}</a>`;
      else html += birthdayRow(u.v, when);
    });
    html += '</div>';

    // Plantar a tiempo
    const plantable = CROPS.filter(c => c.seasons.includes(s.id)).map(c => {
      const nextS = SEASONS[(S.season + 1) % 4].id;
      const limit = c.seasons.includes(nextS) ? SEASON_DAYS * 2 : SEASON_DAYS;
      const first = S.day + c.grow;
      if (first > limit) return null;
      const harvests = c.regrow ? 1 + Math.floor((limit - first) / c.regrow) : 1;
      return { c, first, harvests, total: harvests * (c.contrib[1] || 0) };
    }).filter(Boolean).sort((a, b) => b.total - a.total);
    html += `<div class="section-head"><h2>Si plantas hoy</h2><a class="link" href="#/cultivos?s=${s.id}">Ver todos</a></div>`;
    if (!plantable.length) html += `<div class="card muted">Ya no da tiempo a cosechar nada de esta estación. Prepara semillas para ${SEASONS[(S.season + 1) % 4].name.toLowerCase()}.</div>`;
    else {
      html += `<p class="small muted" style="margin:0 2px 8px">Cultivos que aún llegan a tiempo, ordenados por contribución total (calidad base).</p><div class="list cols">`;
      plantable.slice(0, 8).forEach(p => {
        const day = p.first > SEASON_DAYS ? `${SEASONS[(S.season + 1) % 4].name} ${p.first - SEASON_DAYS}` : `día ${p.first}`;
        html += `<a class="row" href="#/cultivo/${p.c.id}"><div class="emoji-badge">${cropPic(p.c)}</div><div class="main"><div class="title">${esc(p.c.name)}</div><div class="meta">1.ª cosecha ${day}${p.harvests > 1 ? ` · ${p.harvests} cosechas` : ''}</div></div><div class="side"><div class="num">${p.total}</div><div class="unit">contrib.</div></div></a>`;
      });
      html += '</div>';
    }

    // Peces de la estación
    const fishNow = FISH.filter(f => f.seasons.includes(s.id) && f.seasons.length < 4).sort((a, b) => (b.contrib || 0) - (a.contrib || 0));
    html += `<div class="section-head"><h2>Peces solo de temporada</h2><a class="link" href="#/pesca?s=${s.id}">Pesca</a></div><div class="tags">`;
    fishNow.forEach(f => { html += `<a class="tag ${s.id}" href="${itemHref(f.name)}"><span class="gi">${pic(f.name + '.png', '')}</span>${esc(f.name)}${f.rain ? '<small>con lluvia</small>' : ''}</a>`; });
    html += '</div>';

    // Aldeanos que sigues: cortejo y favoritos, con su cumpleaños y los regalos de esta semana
    const favV = VILLAGERS.filter(v => isFav(v.id) || S.courting[v.id]);
    if (favV.length) {
      html += `<div class="section-head"><h2>Tu gente</h2><a class="link" href="#/favoritos">Ver todo</a></div><div class="list">`;
      favV.sort((a, b) => (S.courting[b.id] ? 1 : 0) - (S.courting[a.id] ? 1 : 0) || daysUntil(seasonIdx(a.season), a.day) - daysUntil(seasonIdx(b.season), b.day))
        .forEach(v => {
          const g = S.gifts[weekKey(v)] || 0;
          html += birthdayRow(v, `${S.courting[v.id] ? 'Cortejando · ' : ''}${flowersOf(v.id) ? flowerWord(flowersOf(v.id)) + ' · ' : ''}Cumple: ${untilText(daysUntil(seasonIdx(v.season), v.day)).toLowerCase()} · regalos esta semana ${g}/2`);
        });
      html += '</div>';
    }
    html += footer();
    view.innerHTML = html;
    view.querySelector('[data-act=prev]').onclick = () => shiftDay(-1);
    view.querySelector('[data-act=next]').onclick = () => shiftDay(1);
  });

  function birthdayRow(v, meta) {
    const loves = v.loves.filter(i => i !== 'Mango' && i !== 'Poached Egg').slice(0, 3).map(itemLabel).join(', ');
    return `<a class="row" href="#/aldeano/${v.id}">${avatar(v)}<div class="main"><div class="title">${esc(v.name)}${S.courting[v.id] ? `<span class="sr-only">(cortejando)</span>` : ''}</div><div class="meta">${esc(meta)}</div><div class="meta loves">Le encanta: ${esc(loves)}</div></div>${chev}</a>`;
  }

  function shiftDay(n) {
    S.day += n;
    if (S.day > SEASON_DAYS) { S.day = 1; S.season = (S.season + 1) % 4; if (S.season === 0) S.year++; }
    if (S.day < 1) { S.day = SEASON_DAYS; S.season = (S.season + 3) % 4; if (S.season === 3 && S.year > 1) S.year--; }
    S.onboarded = true; save(); renderDatePill(); render();
  }

  /* ——— Selector de fecha ——— */
  function openDatePicker() {
    let sel = { season: S.season, day: S.day, year: S.year };
    const draw = () => {
      $('#sheetContent').innerHTML = `
        <h2>¿En qué día vas?</h2>
        <div class="stepper">${SEASONS.map((s, i) => `<button class="chip" aria-pressed="${i === sel.season}" data-s="${i}">${sw(s.id)}${s.name}</button>`).join('')}</div>
        <div class="days">${Array.from({ length: 28 }, (_, i) => `<button class="${i + 1 === sel.day ? 'sel' : ''}" data-d="${i + 1}">${i + 1}</button>`).join('')}</div>
        <div class="year-row"><span class="muted">Año de la partida</span><div class="ctrl"><button data-y="-1" aria-label="Año anterior">−</button><span>Año ${sel.year}</span><button data-y="1" aria-label="Año siguiente">+</button></div></div>
        <button class="btn primary" style="width:100%;margin-top:14px" data-ok>Guardar</button>`;
      $$('#sheetContent [data-s]').forEach(b => b.onclick = () => { sel.season = +b.dataset.s; draw(); });
      $$('#sheetContent [data-d]').forEach(b => b.onclick = () => { sel.day = +b.dataset.d; draw(); });
      $$('#sheetContent [data-y]').forEach(b => b.onclick = () => { sel.year = Math.max(1, sel.year + +b.dataset.y); draw(); });
      $('#sheetContent [data-ok]').onclick = () => {
        Object.assign(S, sel, { onboarded: true }); save(); renderDatePill(); closeSheet(); render(); toast('Día actualizado');
      };
      $('.sheet .stepper').style.gridTemplateColumns = 'repeat(2, 1fr)';
    };
    draw(); openSheet();
  }

  /* ——— Calendario ——— */
  route('/calendario(?:/(\\w+))?', 'calendario', (view, [sid]) => {
    const si = sid ? Math.max(0, seasonIdx(sid)) : S.season;
    const s = SEASONS[si];
    setHeader('Calendario', `${s.name} · 28 días`);
    let html = `<div class="chips">${SEASONS.map((x, i) => `<a class="chip" aria-pressed="${i === si}" href="#/calendario/${x.id}">${sw(x.id)}${x.name}</a>`).join('')}</div>`;
    html += `<div class="cal s-${s.id}">${WEEKDAYS.map(w => `<div class="wd">${w}</div>`).join('')}`;
    for (let d = 1; d <= SEASON_DAYS; d++) {
      const f = festivalsOn(s.id, d), b = birthdaysOn(s.id, d);
      const today = si === S.season && d === S.day;
      const marks = f.map(x => `<i class="m ${x.season === 'all' ? 'race' : 'fest'}"></i>`).join('') + b.map(() => '<i class="m bday"></i>').join('');
      const label = [`${weekday(d)} ${d}`, today ? 'hoy' : '', ...f.map(x => x.name), ...b.map(v => 'cumpleaños de ' + v.name)].filter(Boolean).join(', ');
      html += `<button class="d ${today ? 'today' : ''} ${f.some(x => x.season !== 'all') ? 'has-fest' : ''}" data-d="${d}" aria-label="${esc(label)}"${today ? ' aria-current="date"' : ''}><span class="n">${d}</span><span class="marks" aria-hidden="true">${marks}</span></button>`;
    }
    html += `</div><div class="legend"><span><i class="m bday"></i>Cumpleaños</span><span><i class="m fest"></i>Festival</span><span><i class="m race"></i>Carreras</span></div>`;

    html += `<div class="section-head"><h2>Este mes</h2></div><div class="list">`;
    for (let d = 1; d <= SEASON_DAYS; d++) {
      festivalsOn(s.id, d).filter(f => f.season !== 'all').forEach(f => {
        html += `<a class="row" href="#/festivales"><div class="emoji-badge date s-${s.id}">${d}</div><div class="main"><div class="title">${esc(f.name)}</div><div class="meta">Día ${d} · ${weekday(d)} · ${esc(place(f.place))}</div></div>${chev}</a>`;
      });
      birthdaysOn(s.id, d).forEach(v => { html += birthdayRow(v, `Día ${d} · ${weekday(d)}`); });
    }
    html += '</div>' + footer();
    view.innerHTML = html;
    $$('.cal .d', view).forEach(btn => btn.onclick = () => openDaySheet(si, +btn.dataset.d));
  });

  function openDaySheet(si, d) {
    const s = SEASONS[si];
    const f = festivalsOn(s.id, d), b = birthdaysOn(s.id, d);
    let html = `<h2>${weekday(d)} ${d} de ${s.name.toLowerCase()}</h2>`;
    if (!f.length && !b.length) html += '<p class="muted">Día tranquilo: ni fiestas ni cumpleaños.</p>';
    f.forEach(x => { html += `<div class="card"><h3>${esc(x.name)}</h3><p class="small muted">${esc(place(x.place))}</p><p class="small">${esc(x.desc)}</p></div>`; });
    b.forEach(v => {
      html += `<div class="card"><div class="bday-head">${avatar(v)}<h3>Cumpleaños de ${esc(v.name)}</h3></div><div style="margin-top:6px">${v.loves.slice(0, 8).map(i => giftChip(i, 'love')).join('')}</div><a class="btn ghost" style="margin-top:6px" href="#/aldeano/${v.id}">Ver ficha</a></div>`;
    });
    html += `<button class="btn primary" style="width:100%;margin-top:14px" data-set>Poner como día actual</button>`;
    $('#sheetContent').innerHTML = html;
    $('#sheetContent [data-set]').onclick = () => { S.season = si; S.day = d; S.onboarded = true; save(); renderDatePill(); closeSheet(); render(); toast('Día actualizado'); };
    openSheet();
  }

  /* ——— Piezas comunes de las listas ——— */
  function searchBox(placeholder, value, label) {
    return `<div class="search">${searchIco}<input type="search" placeholder="${esc(placeholder)}" value="${esc(value)}" aria-label="${esc(label)}" enterkeyhint="search" autocomplete="off" spellcheck="false"><button class="clear" type="button" aria-label="Borrar búsqueda"${value ? '' : ' hidden'}>${closeIco}</button></div>`;
  }
  function bindSearch(view, fn) {
    const inp = $('.search input', view), clr = $('.search .clear', view);
    inp.oninput = () => { clr.hidden = !inp.value; fn(inp.value); };
    inp.onkeydown = e => { if (e.key === 'Enter') inp.blur(); };
    clr.onclick = () => { inp.value = ''; clr.hidden = true; fn(''); inp.focus(); };
  }
  function chipGroup(group, label, opts, cur) {
    return `<div class="chips" data-g="${group}" role="group" aria-label="${esc(label)}">${opts.map(([v, l]) => `<button class="chip" type="button" data-v="${esc(v)}" aria-pressed="${String(cur) === String(v)}">${l}</button>`).join('')}</div>`;
  }
  function villagerOptions(cur, allLabel) {
    return `<option value="">${allLabel}</option>` + [...VILLAGERS].sort((a, b) => a.name.localeCompare(b.name, 'es'))
      .map(v => `<option value="${v.id}" ${cur === v.id ? 'selected' : ''}>${esc(v.name)}</option>`).join('');
  }
  function setPressed(view, group, val) { $$(`[data-g=${group}] .chip`, view).forEach(x => x.setAttribute('aria-pressed', String(x.dataset.v === String(val)))); }
  /* ¿Qué opina este aldeano de este objeto? */
  function opinion(v, en) {
    const is = i => baseName(i) === baseName(en);
    if (!v) return null;
    if (v.loves.some(is)) return 'love';
    if (v.likes.some(is)) return 'like';
    return null;
  }
  const opinionTag = o => (o === 'love' ? '<span class="tag love">Le encanta</span>' : o === 'like' ? '<span class="tag moss">Le gusta</span>' : '');

  /* ——— Cultivos ——— */
  const CROP_DEF = { s: 'all', t: 'all', o: 'name', v: '' };
  route('/cultivos', 'cultivos', (view, _, params) => {
    setHeader('Cultivos', `${CROPS.length} cultivos`);
    const st = recall('cultivos', params, CROP_DEF);
    st.q = params.get('q') || '';
    view.innerHTML = `
      ${searchBox('Buscar cultivo…', st.q, 'Buscar cultivo')}
      ${chipGroup('s', 'Estación', [['all', 'Todas'], ...SEASONS.map(x => [x.id, sw(x.id) + x.name])], st.s)}
      <div class="toolbar"><div class="group">
        <select data-g="t" aria-label="Tipo de cultivo"><option value="all">Todos los tipos</option>${Object.entries(TYPES).map(([k, v]) => `<option value="${k}" ${st.t === k ? 'selected' : ''}>${v}</option>`).join('')}</select>
        <select data-g="v" aria-label="Regalo para un aldeano">${villagerOptions(st.v, 'Regalo para…')}</select>
        <select data-g="o" aria-label="Ordenar"><option value="name">A–Z</option><option value="grow" ${st.o === 'grow' ? 'selected' : ''}>Más rápidos</option><option value="contrib" ${st.o === 'contrib' ? 'selected' : ''}>Más contribución</option></select>
      </div></div>
      <div class="filter-note" id="filterNote"></div>
      <p class="sr-only" aria-live="polite" id="cropCount"></p>
      <div class="list cols" id="cropList"></div>
      <div class="section-head"><h2>Notas</h2></div>
      <ul class="notes">${CROP_NOTES.map(n => `<li>${esc(n)}</li>`).join('')}</ul>${footer()}`;
    const draw = () => {
      const vv = st.v ? VILLAGERS.find(x => x.id === st.v) : null;
      let list = CROPS.filter(c => (st.s === 'all' || c.seasons.includes(st.s)) && (st.t === 'all' || c.type === st.t) &&
        (!vv || opinion(vv, c.en)) && (!st.q || fuzzy(st.q, c.name, c.en)));
      if (st.o === 'grow') list.sort((a, b) => a.grow - b.grow);
      else if (st.o === 'contrib') list.sort((a, b) => (b.contrib[1] || 0) - (a.contrib[1] || 0));
      else list.sort((a, b) => a.name.localeCompare(b.name, 'es'));
      if (vv) list.sort((a, b) => (opinion(vv, b.en) === 'love') - (opinion(vv, a.en) === 'love'));
      $('#cropList', view).innerHTML = list.length ? list.map(c => cropRow(c, vv ? opinionTag(opinion(vv, c.en)) : '')).join('')
        : (vv && !st.q && st.s === 'all' && st.t === 'all' ? emptyState('basket', `A ${esc(vv.name)} no le encanta ningún cultivo`, 'Mira su ficha: sus regalos favoritos son otras cosas.', `<a class="btn ghost" href="#/aldeano/${vv.id}">Ver a ${esc(vv.name)}</a>`) : noResults('cultivo'));
      $('#cropCount', view).textContent = `${list.length} cultivos`;
      remember('cultivos', st, CROP_DEF);
      filterNote(st, CROP_DEF, reset, view);
      safeReplace(`#/cultivos?s=${st.s}&t=${st.t}&o=${st.o}&v=${st.v}${st.q ? '&q=' + encodeURIComponent(st.q) : ''}`);
    };
    const reset = () => { Object.assign(st, CROP_DEF); setPressed(view, 's', st.s); $('[data-g=t]', view).value = 'all'; $('[data-g=v]', view).value = ''; $('[data-g=o]', view).value = 'name'; draw(); };
    bindSearch(view, q => { st.q = q; draw(); });
    bindChips(view, 's', v => { st.s = v; draw(); });
    $('[data-g=t]', view).onchange = e => { st.t = e.target.value; draw(); };
    $('[data-g=v]', view).onchange = e => { st.v = e.target.value; draw(); };
    $('[data-g=o]', view).onchange = e => { st.o = e.target.value; draw(); };
    draw();
  });

  function cropRow(c, note) {
    const regrow = c.regrow ? ` · rebrota cada ${c.regrow}` : '';
    const ss = swatches(c.seasons);
    return `<a class="row" href="#/cultivo/${c.id}"><div class="emoji-badge">${cropPic(c)}</div><div class="main"><div class="title">${esc(c.name)}${isFav(c.id) ? starIco : ''}${note || ''}</div><div class="meta">${ss}${c.grow} días${regrow} · ${esc(place(c.place))}</div></div><div class="side"><div class="num">${c.contrib[1] ?? '—'}</div><div class="unit">contrib.</div></div></a>`;
  }
  const seasonsText = ids => (ids.length === 4 ? 'Todo el año' : ids.map(id => seasonById(id).name).join(', ').replace(/, ([^,]*)$/, ' y $1'));
  const favBtn = (id, name) => `<button class="fav-btn" type="button" data-fav="${esc(id)}" aria-label="Guardar ${esc(name)} en favoritos" aria-pressed="${isFav(id)}">${starIco}</button>`;

  route('/cultivo/([\\w-]+)', 'cultivos', (view, [id]) => {
    const c = CROPS.find(x => x.id === id);
    if (!c) return notFound(view, 'ese cultivo', '#/cultivos', 'Ver todos los cultivos');
    setHeader(c.name, TYPES[c.type], { back: true });
    const q = ['Silvestre', 'Base', 'Buena', 'Mejor', 'Óptima'];
    const en = S.names === 'es' ? `<div class="muted small">${esc(c.en)}</div>` : '';
    let html = `
      <div class="detail-head"><div class="emoji-badge xl">${cropPic(c)}</div>
        <div><h2>${esc(c.name)}</h2>${en}<div class="tags" style="margin-top:8px">${seasonTags(c.seasons)}</div></div>
        ${favBtn(c.id, c.name)}</div>
      <div class="kv essentials">
        <div><div class="k">Estación</div><div class="v">${seasonsText(c.seasons)}</div></div>
        <div><div class="k">Crece en</div><div class="v"><span class="big">${c.grow}</span> días</div></div>
        <div><div class="k">Rebrota</div><div class="v">${c.regrow ? `cada <span class="big">${c.regrow}</span> días` : 'No (1 cosecha)'}</div></div>
        <div><div class="k">Contribución (calidad base)</div><div class="v"><span class="big">${c.contrib[1] ?? '—'}</span></div></div>
        <div class="wide"><div class="k">Semilla silvestre</div><div class="v">${esc(place(c.place))}</div></div>
      </div>
      <p class="small muted" style="margin:8px 2px 0">En Roots of Pacha no se vende: lo que se obtiene es contribución para el clan.</p>`;
    html += giftBlock(c.en, 'Nadie tiene una opinión especial sobre este cultivo.');
    html += usesBlock(c.en);
    html += `<div class="section-head"><h2>Calculadora de siembra</h2></div><div class="card" id="calc"></div>`;
    html += `<div class="section-head"><h2>Contribución por calidad</h2></div>
      <div class="card"><div class="harvest">${c.contrib.map((v, i) => `<div><div class="k">${q[i]}</div><div class="v">${v ?? '—'}</div></div>`).join('')}</div>
      <p class="small muted" style="margin:10px 0 0">Energía al comerlo: +8 / +10 / +11 / +12 / +14.</p></div>`;
    view.innerHTML = html + footer();
    bindFav(view);

    const calc = $('#calc', view);
    const inSeason = c.seasons.map(seasonIdx);
    let cs = inSeason.includes(S.season) ? S.season : inSeason[0];
    let cd = inSeason.includes(S.season) ? S.day : 1;
    const drawCalc = () => {
      const sid = SEASONS[cs].id;
      const nextOk = c.seasons.includes(SEASONS[(cs + 1) % 4].id);
      const limit = nextOk ? SEASON_DAYS * 2 : SEASON_DAYS;
      const dates = [];
      let d = cd + c.grow;
      while (d <= limit) { dates.push(d); if (!c.regrow) break; d += c.regrow; }
      const fmt = x => x > SEASON_DAYS ? `${SEASONS[(cs + 1) % 4].name.slice(0, 3)}. ${x - SEASON_DAYS}` : `Día ${x}`;
      calc.innerHTML = `
        <div class="toolbar" style="margin:0 0 10px">
          <label class="small muted" for="calcSeason">Plantar el día</label>
          <div style="display:flex;gap:8px">
            <select id="calcSeason" data-cs aria-label="Estación de siembra">${inSeason.map(i => `<option value="${i}" ${i === cs ? 'selected' : ''}>${SEASONS[i].name}</option>`).join('')}</select>
            <select data-cd aria-label="Día de siembra">${Array.from({ length: 28 }, (_, i) => `<option ${i + 1 === cd ? 'selected' : ''}>${i + 1}</option>`).join('')}</select>
          </div>
        </div>
        ${dates.length ? `<p style="margin:0 0 8px"><strong>${dates.length} ${dates.length === 1 ? 'cosecha' : 'cosechas'}</strong> antes de que acabe la temporada${nextOk ? ' (sigue en la siguiente estación)' : ''}:</p>
          <div class="tags">${dates.map(x => `<span class="tag ${x > SEASON_DAYS ? SEASONS[(cs + 1) % 4].id : sid}">${fmt(x)}</span>`).join('')}</div>
          <p class="small muted" style="margin:10px 0 0">Total en calidad base: <strong>${dates.length * (c.contrib[1] || 0)}</strong> de contribución por planta.</p>`
          : `<div class="callout">No llega a tiempo: necesita ${c.grow} días y solo quedan ${limit - cd}.</div>`}`;
      $('[data-cs]', calc).onchange = e => { cs = +e.target.value; drawCalc(); };
      $('[data-cd]', calc).onchange = e => { cd = +e.target.value; drawCalc(); };
    };
    drawCalc();
  });

  /* ——— Aldeanos ——— */
  const VIL_DEF = { f: 'all', o: 'name' };
  route('/aldeanos', 'aldeanos', (view, _, params) => {
    setHeader('Aldeanos', `${VILLAGERS.length} personajes`);
    const st = recall('aldeanos', params, VIL_DEF);
    st.q = params.get('q') || '';
    view.innerHTML = `
      ${searchBox('Nombre o regalo (p. ej. «calabaza»)…', st.q, 'Buscar aldeano o regalo')}
      ${chipGroup('f', 'Filtrar aldeanos', [['all', 'Todos'], ['Pachan', 'Pachan'], ['Mograni', 'Mograni'], ['Yakuan', 'Yakuan'], ['romance', 'Romance'], ['court', 'Cortejando'], ['fav', 'Favoritos']], st.f)}
      <div class="toolbar"><span class="small muted" id="vCount" aria-live="polite"></span>
        <select data-g="o" aria-label="Ordenar"><option value="name">A–Z</option><option value="bday" ${st.o === 'bday' ? 'selected' : ''}>Próximo cumpleaños</option></select></div>
      <div class="filter-note" id="filterNote"></div>
      <div id="giftHits"></div>
      <div class="people" id="people"></div>
      <div class="section-head"><h2>Cómo funcionan los regalos</h2></div>
      <ul class="notes">${GIFT_RULES.map(n => `<li>${esc(n)}</li>`).join('')}</ul>${footer()}`;
    const draw = () => {
      let list = VILLAGERS.filter(v =>
        (st.f === 'all' || v.clan === st.f || (st.f === 'romance' && v.romance) || (st.f === 'fav' && isFav(v.id)) || (st.f === 'court' && S.courting[v.id])));
      let hitsHtml = '';
      if (Fuzzy.norm(st.q).length >= 3) {
        const matchItem = i => fuzzy(st.q, baseName(i), itemLabel(i));
        const byLove = list.filter(v => v.loves.some(matchItem));
        const byLike = list.filter(v => v.likes.some(matchItem) && !byLove.includes(v));
        if (byLove.length || byLike.length) {
          hitsHtml = `<div class="card" style="margin-bottom:12px"><h3>Regalos que encajan con «${esc(st.q)}»</h3>
            ${byLove.length ? `<div class="gift-group"><h3><span class="dot" style="background:var(--love)"></span>Le encanta</h3>${byLove.map(v => `<a class="gift love" href="#/aldeano/${v.id}">${esc(v.name)}<span class="en">${esc(v.loves.filter(matchItem).map(itemLabel).join(', '))}</span></a>`).join('')}</div>` : ''}
            ${byLike.length ? `<div class="gift-group"><h3><span class="dot" style="background:var(--like)"></span>Le gusta</h3>${byLike.map(v => `<a class="gift like" href="#/aldeano/${v.id}">${esc(v.name)}<span class="en">${esc(v.likes.filter(matchItem).map(itemLabel).join(', '))}</span></a>`).join('')}</div>` : ''}
          </div>`;
        }
      }
      list = list.filter(v => !st.q || fuzzy(st.q, v.name, v.clan));
      if (st.o === 'bday') list.sort((a, b) => daysUntil(seasonIdx(a.season), a.day) - daysUntil(seasonIdx(b.season), b.day));
      else list.sort((a, b) => a.name.localeCompare(b.name, 'es'));
      $('#giftHits', view).innerHTML = hitsHtml;
      $('#vCount', view).textContent = `${list.length} ${list.length === 1 ? 'personaje' : 'personajes'}`;
      const emptyMsg = st.f === 'court' && !st.q ? emptyState('hand', 'Aún no cortejas a nadie', 'En la ficha de un aldeano con corazón, toca «Cortejando» para seguir sus regalos y su cumpleaños desde Hoy.')
        : st.f === 'fav' && !st.q ? emptyState('hand', 'Todavía no tienes favoritos', 'Toca la estrella en la ficha de un aldeano para tenerlo a mano.')
          : noResults('aldeano');
      $('#people', view).innerHTML = list.length ? list.map(v => {
        const s = seasonById(v.season);
        const until = daysUntil(seasonIdx(v.season), v.day);
        const marks = (S.courting[v.id] ? heartPlain : '') + (isFav(v.id) ? starIco : '');
        return `<a class="person clan-${v.clan.toLowerCase()}" href="#/aldeano/${v.id}">${marks ? `<span class="fav">${marks}</span>` : ''}${avatar(v)}<div class="name">${esc(v.name)}</div><div class="bday">${sw(s.id)}${v.day} ${s.name.toLowerCase()}${until <= 7 ? `<b>${until === 0 ? 'hoy' : `en ${until} d`}</b>` : ''}</div>${flowersOf(v.id) ? `<div class="flw fk-${flowerKind(v)}">${flowerIco}${flowerWord(flowersOf(v.id))}</div>` : ''}</a>`;
      }).join('') : (hitsHtml ? '' : emptyMsg);
      remember('aldeanos', st, VIL_DEF);
      filterNote(st, VIL_DEF, reset, view);
      safeReplace(`#/aldeanos?f=${st.f}&o=${st.o}${st.q ? '&q=' + encodeURIComponent(st.q) : ''}`);
    };
    const reset = () => { Object.assign(st, VIL_DEF); setPressed(view, 'f', st.f); $('[data-g=o]', view).value = 'name'; draw(); };
    bindSearch(view, q => { st.q = q; draw(); });
    bindChips(view, 'f', v => { st.f = v; draw(); });
    $('[data-g=o]', view).onchange = e => { st.o = e.target.value; draw(); };
    draw();
  });

  route('/aldeano/([\\w-]+)', 'aldeanos', (view, [id]) => {
    const v = VILLAGERS.find(x => x.id === id);
    if (!v) return notFound(view, 'a ese aldeano', '#/aldeanos', 'Ver todos los aldeanos');
    const s = seasonById(v.season);
    setHeader(v.name, `Clan ${v.clan}`, { back: true });
    const until = daysUntil(seasonIdx(v.season), v.day);
    const wk = weekKey(v);
    const given = S.gifts[wk] || 0;
    const hates = v.hates.filter(h => !UNIVERSAL_HATES.includes(h));
    const likes = v.likes.filter(l => !UNIVERSAL_LIKES.includes(l));
    const court = v.romance ? `<button class="fav-btn" type="button" data-court aria-label="Cortejando a ${esc(v.name)}" aria-pressed="${!!S.courting[v.id]}">${heartPlain}</button>` : '';
    let html = `
      <div class="detail-head">${avatar(v, true)}
        <div><h2>${esc(v.name)}</h2><div class="role">${esc(v.role)}</div></div>
        <div class="actions">${favBtn(v.id, v.name)}${court}</div></div>
      <div class="kv essentials">
        <div><div class="k">Cumpleaños</div><div class="v">${sw(s.id)}${v.day} de ${s.name.toLowerCase()}</div><div class="small muted">${untilText(until)}</div></div>
        <div><div class="k">Clan</div><div class="v">${v.clan}</div><div class="small muted">${v.romance ? (S.courting[v.id] ? 'Cortejo en marcha' : 'Se puede cortejar') : 'Solo amistad'}</div></div>
      </div>
      ${flowerSection(v)}
      <div class="section-head"><h2>Le encanta</h2><span class="small muted">${v.loves.length} regalos</span></div>
      <div class="card"><div class="gift-group">${v.loves.map(i => giftChip(i, 'love')).join('')}</div></div>
      <div class="section-head"><h2>Regalos esta semana</h2><span class="small muted">Semana ${Math.floor((S.day - 1) / 7) + 1} · ${cur().name}</span></div>
      <div class="card"><div class="week-gifts">
        <button type="button" data-g="1" class="${given >= 1 ? 'on' : ''}" aria-pressed="${given >= 1}">Regalo 1</button>
        <button type="button" data-g="2" class="${given >= 2 ? 'on' : ''}" aria-pressed="${given >= 2}">Regalo 2</button>
        <span class="small muted">${given >= 2 ? 'Ya no admite más regalos esta semana.' : `Puedes darle ${2 - given} ${2 - given === 1 ? 'regalo' : 'regalos'} más (máx. 1 al día).`}</span>
      </div></div>
      <div class="section-head"><h2>Más gustos</h2></div>
      <div class="card">
        <div class="gift-group"><h3><span class="dot" style="background:var(--like)"></span>Le gusta</h3>${likes.length ? likes.map(i => giftChip(i, 'like')).join('') : '<span class="muted small">Solo los gustos generales.</span>'}</div>
        <div class="gift-group"><h3><span class="dot" style="background:var(--hate)"></span>Odia</h3>${hates.length ? hates.map(i => giftChip(i, 'hate')).join('') : '<span class="muted small">Solo lo que odia todo el mundo.</span>'}</div>
        <p class="small muted" style="margin:12px 0 0">Además, a casi todos les gusta el zumo de mango silvestre, el zumo de granada y el chocolate caliente, y casi nadie quiere excremento, fibra vegetal, estiércol, heno ni bichos.</p>
      </div>${footer()}`;
    view.innerHTML = html;
    bindFav(view);
    bindFlowers(view, v);
    const cb = $('[data-court]', view);
    if (cb) cb.onclick = () => {
      if (S.courting[v.id]) delete S.courting[v.id]; else S.courting[v.id] = true;
      save(); cb.setAttribute('aria-pressed', String(!!S.courting[v.id]));
      paintFlowers(view, v);
      toast(S.courting[v.id] ? `Siguiendo tu cortejo a ${v.name}` : 'Ya no aparece como cortejo');
    };
    $$('.week-gifts button', view).forEach(b => b.onclick = () => {
      const n = +b.dataset.g;
      S.gifts[wk] = (S.gifts[wk] || 0) >= n ? n - 1 : n;
      save(); render({ keep: true });
    });
  });

  /* ——— Flores de amistad y romance (datos: wiki, página Relationships) ——— */
  const FLOWER_STEPS = [
    [2, () => 'Baila contigo, puede mandarte regalos y empiezan sus escenas'],
    [4, () => 'Nueva escena'],
    [6, v => v.romance ? 'Escena, su regalo único y te invita a una cita: podéis empezar a salir' : 'Escena, su regalo único y regalos más valiosos'],
    [8, v => v.romance ? 'Nueva escena; si salís juntos, ya podéis besaros' : 'Nueva escena'],
    [10, v => v.romance ? 'Si salís juntos, última cita: puedes proponerle la Unión (hace falta la cabaña mediana)' : 'Última escena: amistad al máximo']
  ];
  function flowerSection(v) {
    const kindNote = v.romance
      ? 'Las flores son rosas mientras os conocéis y se vuelven rojas cuando salís juntos (toca el corazón de arriba, «Cortejando»).'
      : 'Con quien no se puede cortejar, las flores son amarillas: solo amistad.';
    return `<div class="section-head"><h2>${v.romance ? 'Amistad y romance' : 'Amistad'}</h2><span class="small muted" data-fl-count></span></div>
      <div class="card flower-card">
        <div class="flowers" role="group" aria-label="Flores con ${esc(v.name)}">${Array.from({ length: FLOWER_MAX }, (_, i) =>
          `<button type="button" data-fl="${i + 1}" aria-label="${flowerWord(i + 1)}">${flowerIco}</button>`).join('')}</div>
        <p class="small muted" data-fl-hint></p>
        <ul class="flower-steps">${FLOWER_STEPS.map(([n, t]) => `<li data-step="${n}"><b>${n}</b><span>${esc(t(v))}</span></li>`).join('')}</ul>
        <p class="small muted" style="margin:10px 0 0">${kindNote} Si dejas de hablarle, la relación baja poco a poco, pero nunca más de 2 flores por debajo del máximo que alcanzaste.</p>
      </div>`;
  }
  function paintFlowers(view, v) {
    const card = $('.flower-card', view);
    if (!card) return;
    const n = flowersOf(v.id);
    card.className = `card flower-card fk-${flowerKind(v)}`;
    $$('[data-fl]', card).forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.fl <= n)));
    $$('[data-step]', card).forEach(li => li.classList.toggle('done', +li.dataset.step <= n));
    $('[data-fl-count]', view).textContent = `${n}/${FLOWER_MAX} flores`;
    $('[data-fl-hint]', card).textContent = n ? 'Toca la última flor encendida para quitar una.' : 'Toca una flor para marcar cuántas tienes con este personaje.';
  }
  function bindFlowers(view, v) {
    $$('[data-fl]', view).forEach(b => b.onclick = () => {
      const k = +b.dataset.fl, n = flowersOf(v.id) === k ? k - 1 : k;
      if (n > 0) S.flowers[v.id] = n; else delete S.flowers[v.id];
      save(); paintFlowers(view, v);
    });
    paintFlowers(view, v);
  }

  /* ——— Más ——— */
  route('/mas', 'mas', view => {
    setHeader('Más', 'Todo lo demás');
    const caught = Object.values(S.fish).filter(Boolean).length;
    const metas = PROPHECIES.reduce((a, p, i) => a + p.reqs.filter((_, j) => S.prophecies[i + '-' + j]).length, 0);
    const big = [
      ['#/pesca', `${caught}<small>/${FISH.length}</small>`, 'Pesca', 'Peces y animales acuáticos que llevas capturados', FISH.slice(0, 3).map(f => f.name + '.png'), 'water'],
      ['#/animales', FARM_ANIMALS.length, 'Animales', 'Granja, doma, mascotas y cobertizos', FARM_ANIMALS.slice(0, 3).map(a => a.img)],
      ['#/recoleccion', TREES.length + GATHER.length, 'Recolección', 'Árboles, plantas silvestres, setas y medicinales', GATHER.slice(0, 3).map(g => g.en + '.png')],
      ['#/recetas', `${RECIPES.filter(r => S.cooked[r.id]).length}<small>/${RECIPES.length}</small>`, 'Recetas', 'Platos, ingredientes y utensilios de cocina', ['Pizza.png', 'Sushi.png', 'Flan.png']],
      ['#/ideas', `${IDEAS.filter(i => S.ideas[i.en]).length}<small>/${IDEAS.length}</small>`, 'Ideas', 'Investigaciones: materiales, prosperidad y recompensas', ['Beekeeping.png', 'Well.png', 'Composting.png']],
      ['#/minerales', MINERALS.length, 'Minerales', 'Recursos, minerales y gemas de las cuevas', ['Copper.png', 'Gold.png', 'Amethyst.png']],
      ['#/herramientas', TOOLS.reduce((a, g) => a + g.items.length, 0), 'Herramientas', 'Mejoras, materiales y coste', ['Bronze Axe.png', 'Iron Hammer.png', 'Copper Watering Can.png']],
      ['#/artesania', CRAFTING.reduce((a, g) => a + g.items.length, 0) + PROCESSORS.length, 'Artesanía', 'Fabricación, procesadores y fertilizantes', ['Brewer.png', 'Smoker.png', 'Stone Fence.png']],
      ['#/profecias', `${metas}<small>/56</small>`, 'Profecías', 'Metas cumplidas de la pirámide de la Jungla', PROPHECIES.slice(0, 3).map(prophecyFile)],
      ['#/festivales', FESTIVALS.length, 'Festivales', 'Eventos del año y carreras', FESTIVALS.slice(0, 3).map(f => f.en + '.png')]
    ];
    const nCourt = Object.keys(S.courting).length;
    const small = [
      ['#/inicio', 'Primeros pasos', `Día 1 y señales de humo · ${Object.values(S.firstDay).filter(Boolean).length}/${FIRST_DAY.length} regalos recogidos`],
      ['#/favoritos', 'Favoritos y seguimiento', `${S.favs.length} guardados${nCourt ? ` · ${nCourt} ${nCourt === 1 ? 'cortejo' : 'cortejos'}` : ''}`],
      ['#/ajustes', 'Ajustes', 'Tema, nombres e imágenes'],
      ['#/acerca', 'Acerca de', 'Créditos y licencia']
    ];
    view.innerHTML = `<div class="tiles">${big.map(([h, n, t, d, imgs, cls]) => `<a class="tile ${cls || ''}" href="${h}"><span class="n">${n}</span><span class="t">${t}</span><span class="d">${d}</span>${imgs.length ? `<span class="strip" aria-hidden="true">${imgs.map(f => `<span class="gi lg">${pic(f, '')}</span>`).join('')}</span>` : ''}</a>`).join('')}</div>
      <div class="list">${small.map(([h, t, d]) => `<a class="row" href="${h}"><div class="main"><div class="title">${t}</div><div class="meta">${d}</div></div>${chev}</a>`).join('')}</div>${footer()}`;
  });

  /* ——— Pesca ——— */
  const FISH_DEF = { s: 'all', m: 'all', h: '0' };
  route('/pesca', 'mas', (view, _, params) => {
    setHeader('Pesca', `${FISH.length} animales acuáticos`, { back: true });
    const st = recall('pesca', params, FISH_DEF);
    st.q = params.get('q') || '';
    view.innerHTML = `
      ${searchBox('Buscar pez o lugar…', st.q, 'Buscar pez')}
      ${chipGroup('s', 'Estación', [['all', 'Todas'], ...SEASONS.map(x => [x.id, sw(x.id) + x.name])], st.s)}
      ${chipGroup('m', 'Método', [['all', 'Cualquier método'], ['ah', 'Hacha o arpón'], ['h', 'Solo arpón'], ['rod', 'Caña'], ['trap', 'Trampa']], st.m)}
      <div class="toolbar"><span class="count-badge" id="caught" aria-live="polite"></span><label class="check" style="padding:0"><input type="checkbox" id="hideCaught" ${st.h === '1' ? 'checked' : ''}><span>Ocultar capturados</span></label></div>
      <div class="filter-note" id="filterNote"></div>
      <div class="list cols" id="fishList"></div>
      <div class="section-head"><h2>Consejos</h2></div><ul class="notes">${FISH_NOTES.map(n => `<li>${esc(n)}</li>`).join('')}</ul>
      <p class="small muted">Para el hilo del tiempo n.º 1 de Martina hacen falta 50 animales acuáticos distintos.</p>${footer()}`;
    const count = () => { $('#caught', view).textContent = `${Object.values(S.fish).filter(Boolean).length}/${FISH.length} capturados`; };
    const draw = () => {
      const list = FISH.filter(f => (st.s === 'all' || f.seasons.includes(st.s)) && (st.m === 'all' || f.method === st.m) &&
        (!st.q || fuzzy(st.q, f.name, place(f.place), f.kind)) && !(st.h === '1' && S.fish[f.id]))
        .sort((a, b) => a.name.localeCompare(b.name));
      count();
      const allCaught = st.h === '1' && !st.q && FISH.filter(f => (st.s === 'all' || f.seasons.includes(st.s)) && (st.m === 'all' || f.method === st.m)).every(f => S.fish[f.id]);
      $('#fishList', view).innerHTML = list.map(f => `
        <div class="row" data-id="${f.id}">
          <a class="row-link" href="${itemHref(f.name)}">
            <div class="emoji-badge">${fishPic(f)}</div>
            <div class="main"><div class="title">${esc(f.name)}${f.rain ? '<small class="rain">con lluvia</small>' : ''}</div>
              <div class="meta">${swatches(f.seasons)}${esc(place(f.place))} · ${esc(f.time)}</div>
              <div class="meta">${esc(f.tool)}${f.contrib ? ` · ${f.contrib} contrib.` : ''}</div></div></a>
          <label class="check solo"><input type="checkbox" ${S.fish[f.id] ? 'checked' : ''} aria-label="${esc(f.name)} capturado"></label>
        </div>`).join('') || (allCaught ? emptyState('sleep', '¡Lo tienes todo!', 'Ya has pescado todo lo de este filtro. El río puede descansar.') : noResults('pez'));
      $$('#fishList input', view).forEach(cb => cb.onchange = () => {
        const id = cb.closest('[data-id]').dataset.id; S.fish[id] = cb.checked; save(); count();
        if (st.h === '1') draw();
      });
      remember('pesca', st, FISH_DEF);
      filterNote(st, FISH_DEF, reset, view);
    };
    const reset = () => { Object.assign(st, FISH_DEF); setPressed(view, 's', 'all'); setPressed(view, 'm', 'all'); $('#hideCaught', view).checked = false; draw(); };
    bindSearch(view, q => { st.q = q; draw(); });
    bindChips(view, 's', v => { st.s = v; draw(); });
    bindChips(view, 'm', v => { st.m = v; draw(); });
    $('#hideCaught', view).onchange = e => { st.h = e.target.checked ? '1' : '0'; draw(); };
    draw();
  });

  /* ——— Animales ——— */
  route('/animales', 'mas', view => {
    setHeader('Animales', 'Doma, granja y mascotas', { back: true });
    let html = `<div class="section-head"><h2>Animales de granja</h2></div><div class="list cols">`;
    FARM_ANIMALS.forEach(a => {
      html += `<div class="card"><div style="display:flex;gap:12px;align-items:center;margin-bottom:4px"><div class="emoji-badge big">${pic(a.img, ini(a.name))}</div><h3 style="margin:0">${esc(a.name)} <span class="muted small">${S.names === 'es' ? esc(a.en) : ''}</span></h3></div>
        <div class="tags" style="margin:6px 0 8px"><span class="tag">${esc(place(a.place))}</span>${a.ride ? `<span class="tag moss">Se monta con ${a.ride} corazones</span>` : ''}</div>
        <div class="small"><strong>Produce:</strong> ${esc(a.produce)}</div>
        ${a.tame !== '—' ? `<div class="small"><strong>Doma:</strong> ${esc(a.tame)} con la flauta</div>` : ''}
        ${a.note ? `<div class="small muted" style="margin-top:4px">${esc(a.note)}</div>` : ''}</div>`;
    });
    html += `</div><div class="section-head"><h2>Mascotas</h2></div><div class="card"><div class="table-wrap"><table>
      <tr><th scope="col">Animal</th><th scope="col">Dónde</th><th scope="col" class="num">Corazones para acariciar</th><th scope="col">Montar</th></tr>
      ${PETS.map(p => `<tr><td><span style="display:inline-flex;align-items:center;gap:8px"><span class="gi lg">${pic(p.img, ini(p.name))}</span><strong>${esc(p.name)}</strong></span></td><td>${esc(place(p.place))}</td><td class="num">${p.pet}</td><td>${esc(p.ride)}</td></tr>`).join('')}
      </table></div></div>
      <div class="section-head"><h2>Cobertizos</h2></div><div class="list">
      ${SHEDS.map((s, k) => `<div class="row static"><div class="emoji-badge">${pic(['Small', 'Medium', 'Large'][k] + ' Animal Shed.png', ini(s.name))}</div><div class="main"><div class="title">${esc(s.name)}</div><div class="meta wrap">${esc(s.cost)}${s.note ? ' · ' + esc(s.note) : ''}</div></div><div class="side"><div class="num">${s.cap}</div><div class="unit">animales</div></div></div>`).join('')}
      </div>
      <div class="section-head"><h2>Consejos</h2></div><ul class="notes">${ANIMAL_TIPS.map(t => `<li>${esc(t)}</li>`).join('')}</ul>${footer()}`;
    view.innerHTML = html;
  });

  /* ——— Recolección ——— */
  const GATHER_DEF = { s: 'all' };
  route('/recoleccion', 'mas', (view, _, params) => {
    setHeader('Recolección', 'Plantas silvestres y árboles', { back: true });
    const st = recall('recoleccion', params, GATHER_DEF);
    view.innerHTML = `${chipGroup('s', 'Estación', [['all', 'Todas'], ...SEASONS.map(x => [x.id, sw(x.id) + x.name])], st.s)}<div class="filter-note" id="filterNote"></div><div id="gList"></div>${footer()}`;
    const draw = () => {
      const ok = x => st.s === 'all' || x.seasons.includes(st.s);
      let html = `<div class="section-head"><h2>Frutos de árbol</h2></div>`;
      const trees = TREES.filter(ok);
      html += trees.length ? `<div class="list cols">${trees.map(gatherRow).join('')}</div>` : `<p class="small muted">Ningún árbol da fruto en esta estación.</p>`;
      ['Comida silvestre', 'Plantas', 'Medicinales', 'Otros'].forEach(g => {
        const items = GATHER.filter(x => x.group === g && ok(x));
        if (!items.length) return;
        html += `<div class="section-head"><h2>${g}</h2></div><div class="list cols">${items.map(x => gatherRow(x)).join('')}</div>`;
      });
      html += `<div class="section-head"><h2>Bichos</h2></div><p class="small muted">Se atrapan en los hábitats de bichos de las tierras Mograni y las Islas Yakuan, en cualquier estación.</p><div class="list cols">${BUGS.map(b => gatherRow({ en: b.en, name: itemLabel(b.en), place: b.place, seasons: SEASONS.map(x => x.id), contrib: b.co })).join('')}</div>`;
      $('#gList', view).innerHTML = html;
      remember('recoleccion', st, GATHER_DEF);
      filterNote(st, GATHER_DEF, () => { st.s = 'all'; setPressed(view, 's', 'all'); draw(); }, view);
    };
    bindChips(view, 's', v => { st.s = v; draw(); });
    draw();
  });
  function gatherRow(x) {
    const loves = villagersFor(x.en, 'loves').map(v => v.name);
    return `<a class="row top" href="${itemHref(x.en)}"><div class="emoji-badge">${pic(x.en + '.png', ini(x.name))}</div><div class="main"><div class="title">${esc(x.name)}</div>
      <div class="meta">${swatches(x.seasons)}${esc(place(x.place))}</div>
      ${x.note ? `<div class="meta wrap">${esc(x.note)}</div>` : ''}
      ${loves.length ? `<div class="meta loves">Le encanta a ${esc(loves.join(', '))}</div>` : ''}</div>
      <div class="side"><div class="num">${x.contrib}</div><div class="unit">contrib.</div></div></a>`;
  }

  /* ——— Materiales e ingredientes (chip con imagen y cantidad) ——— */
  function matChip(en, qty, cls) {
    const label = itemLabel(en);
    const inner = `<span class="gi">${pic(itemIconFile(en), '')}</span>${esc(label)}${qty > 1 ? `<span class="qty">×${qty}</span>` : ''}`;
    return `<a class="gift ${cls || ''}" href="${itemHref(en)}">${inner}</a>`;
  }
  const mats = (list, cls) => (list || []).map(([n, q]) => matChip(n, q, cls)).join('');
  const nameOf = en => itemLabel(en);
  const enSub = en => S.names === 'es' && itemLabel(en) !== en ? `<span class="en-sub">${esc(en)}</span>` : '';
  const fmtN = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  function segChips(group, opts, cur) { return chipGroup(group, '', opts, cur); }
  function bindChips(view, group, fn) {
    $$(`[data-g=${group}] .chip`, view).forEach(b => b.onclick = () => { setPressed(view, group, b.dataset.v); fn(b.dataset.v); });
  }

  /* ——— Recetas ——— */
  const REC_DEF = { u: 'all', h: '0', v: '' };
  route('/recetas', 'mas', (view, _, params) => {
    setHeader('Recetas', `${RECIPES.length} platos`, { back: true });
    const st = recall('recetas', params, REC_DEF);
    st.q = params.get('q') || '';
    const uts = [['all', 'Todas'], ['none', 'Sin utensilio'], ...UTENSILS.map(u => [u.en, nameOf(u.en)])];
    view.innerHTML = `
      ${searchBox('Plato o ingrediente…', st.q, 'Buscar receta o ingrediente')}
      ${chipGroup('u', 'Utensilio', uts, st.u)}
      <div class="toolbar"><span class="count-badge" id="cooked" aria-live="polite"></span>
        <select data-g="v" aria-label="Regalo para un aldeano">${villagerOptions(st.v, 'Regalo para…')}</select>
        <label class="check" style="padding:0"><input type="checkbox" id="hideCooked" ${st.h === '1' ? 'checked' : ''}><span>Ocultar cocinadas</span></label></div>
      <div class="filter-note" id="filterNote"></div>
      <div class="list cols" id="recList"></div>
      <div class="section-head"><h2>Utensilios de cocina</h2></div>
      <div class="list cols">${UTENSILS.map(u => `<a class="row" href="#/recetas?u=${encodeURIComponent(u.en)}"><div class="emoji-badge">${pic(u.en + '.png', ini(nameOf(u.en)))}</div><div class="main"><div class="title">${esc(nameOf(u.en))}</div><div class="meta loves">${esc(u.unlock)}${u.cost ? ` · ${fmtN(u.cost)} contrib.` : ''}</div></div><div class="side"><div class="num">${RECIPES.filter(r => r.ut.includes(u.en)).length}</div><div class="unit">recetas</div></div></a>`).join('')}</div>
      <div class="section-head"><h2>Consejos</h2></div><ul class="notes">${RECIPE_NOTES.map(n => `<li>${esc(n)}</li>`).join('')}</ul>${footer()}`;
    const count = () => { $('#cooked', view).textContent = `${RECIPES.filter(r => S.cooked[r.id]).length}/${RECIPES.length} cocinadas`; };
    const draw = () => {
      const vv = st.v ? VILLAGERS.find(x => x.id === st.v) : null;
      const list = RECIPES.filter(r => (st.u === 'all' || (st.u === 'none' ? !r.ut.length : r.ut.includes(st.u))) &&
        (!vv || opinion(vv, r.en)) &&
        (!st.q || fuzzy(st.q, r.en, nameOf(r.en), ...r.ing.flatMap(([i]) => [i, itemLabel(i)]))) &&
        !(st.h === '1' && S.cooked[r.id]))
        .sort((a, b) => (vv ? (opinion(vv, b.en) === 'love') - (opinion(vv, a.en) === 'love') : 0) || nameOf(a.en).localeCompare(nameOf(b.en), 'es'));
      count();
      $('#recList', view).innerHTML = list.map(r => `
        <a class="row top" href="#/receta/${r.id}">
          <div class="emoji-badge">${pic(r.en + '.png', ini(nameOf(r.en)))}</div>
          <div class="main"><div class="title">${esc(nameOf(r.en))}${S.cooked[r.id] ? '<span class="tick">✓ cocinada</span>' : ''}${isFav(r.id) ? starIco : ''}${vv ? opinionTag(opinion(vv, r.en)) : ''}</div>
            <div class="meta loves">${r.ing.map(([i, n]) => esc(itemLabel(i)) + (n > 1 ? ' ×' + n : '')).join(' · ')}</div>
            <div class="meta">${r.ut.length ? esc(r.ut.map(nameOf).join(' o ')) : 'Sin utensilio'}</div></div>
          <div class="side"><div class="num">${r.st}</div><div class="unit">energía</div></div></a>`).join('') ||
        (vv && st.u === 'all' && !st.q && st.h !== '1' ? emptyState('basket', `Ningún plato le encanta ni le gusta a ${esc(vv.name)}`, 'Sus regalos favoritos son otras cosas: míralos en su ficha.', `<a class="btn ghost" href="#/aldeano/${vv.id}">Ver a ${esc(vv.name)}</a>`) : noResults('plato'));
      remember('recetas', st, REC_DEF);
      filterNote(st, REC_DEF, reset, view);
    };
    const reset = () => { Object.assign(st, REC_DEF); setPressed(view, 'u', 'all'); $('[data-g=v]', view).value = ''; $('#hideCooked', view).checked = false; draw(); };
    bindSearch(view, q => { st.q = q; draw(); });
    bindChips(view, 'u', v => { st.u = v; draw(); });
    $('[data-g=v]', view).onchange = e => { st.v = e.target.value; draw(); };
    $('#hideCooked', view).onchange = e => { st.h = e.target.checked ? '1' : '0'; draw(); };
    draw();
  });

  route('/receta/([\\w-]+)', 'mas', (view, [id]) => {
    const r = RECIPES.find(x => x.id === id);
    if (!r) return notFound(view, 'esa receta', '#/recetas', 'Ver todas las recetas');
    setHeader(nameOf(r.en), 'Receta', { back: true });
    let html = `
      <div class="detail-head"><div class="emoji-badge xl">${pic(r.en + '.png', ini(nameOf(r.en)))}</div>
        <div><h2>${esc(nameOf(r.en))}</h2>${S.names === 'es' && nameOf(r.en) !== r.en ? `<div class="muted small">${esc(r.en)}</div>` : ''}</div>
        ${favBtn(r.id, nameOf(r.en))}</div>
      <div class="section-head" style="margin-top:8px"><h2>Ingredientes</h2></div>
      <div class="card"><div class="gift-group">${mats(r.ing)}</div></div>
      <div class="kv" style="margin-top:10px">
        <div><div class="k">Utensilio</div><div class="v">${r.ut.length ? r.ut.map(u => `<span class="inline-pic"><span class="gi">${pic(u + '.png', '')}</span>${esc(nameOf(u))}</span>`).join(' o ') : 'Ninguno'}</div></div>
        <div><div class="k">Energía</div><div class="v"><span class="big">+${r.st}</span></div></div>
        <div><div class="k">Contribución</div><div class="v"><span class="big">${r.co}</span></div></div>
        <div><div class="k">Cómo se consigue</div><div class="v">${esc(r.src)}</div></div>
        ${r.b ? `<div class="wide"><div class="k">Mejora temporal</div><div class="v">${esc(BONUS_ES[r.b[0]] || r.b[0])} +${r.b[1]}${r.b[2] > r.b[1] ? ` (hasta +${r.b[2]} con calidad óptima)` : ''}</div></div>` : ''}
      </div>
      <p class="small muted" style="margin:8px 2px 12px">Valores para calidad normal; suben con ingredientes de mejor calidad.</p>
      <label class="check card-check"><input type="checkbox" data-cooked ${S.cooked[r.id] ? 'checked' : ''}><span>Ya la he cocinado</span></label>`;
    html += giftBlock(r.en, 'Nadie tiene una opinión especial sobre este plato: cuenta como regalo normal.');
    html += usesBlock(r.en);
    view.innerHTML = html + footer();
    bindFav(view);
    $('[data-cooked]', view).onchange = e => { S.cooked[r.id] = e.target.checked; save(); toast(e.target.checked ? 'Marcada como cocinada' : 'Desmarcada'); };
  });

  /* ——— Ideas ——— */
  const IDEA_DEF = { f: 'todas' };
  route('/ideas', 'mas', (view, _, params) => {
    setHeader('Ideas', 'Investigaciones', { back: true });
    const target = params.get('i');
    const st = recall('ideas', params, IDEA_DEF);
    if (target) st.f = 'todas';
    const done = () => IDEAS.filter(i => S.ideas[i.en]).length;
    view.innerHTML = `
      <div class="card"><div style="display:flex;justify-content:space-between;align-items:center"><strong id="ideaCount"></strong><span class="count-badge" id="ideaPct"></span></div>
        <div class="progress" aria-hidden="true"><span id="ideaBar"></span></div>
        <p class="small muted" style="margin:0">Las ideas aparecen cuando cumples su requisito y alcanzas la prosperidad indicada. Entrega los materiales al aldeano para completarla.</p></div>
      ${chipGroup('f', 'Mostrar', [['todas', 'Todas'], ['pend', 'Pendientes'], ['hechas', 'Completadas']], st.f)}
      <div class="list" id="ideaList"></div>${footer()}`;
    const draw = () => {
      const n = done();
      $('#ideaCount', view).textContent = `${n} de ${IDEAS.length} ideas completadas`;
      $('#ideaPct', view).textContent = Math.round(n / IDEAS.length * 100) + '%';
      $('#ideaBar', view).style.width = (n / IDEAS.length * 100) + '%';
      const list = IDEAS.filter(i => st.f === 'todas' || (st.f === 'hechas') === !!S.ideas[i.en]);
      $('#ideaList', view).innerHTML = list.map(i => {
        const v = VILLAGERS.find(x => x.name === i.who);
        return `<div class="card idea${S.ideas[i.en] ? ' done' : ''}" data-en="${esc(i.en)}">
          <div class="idea-head"><div class="emoji-badge big">${pic(i.img, ini(i.es))}</div>
            <div class="main"><h3>${esc(S.names === 'en' ? i.en : i.es)}</h3>${S.names === 'es' ? `<div class="muted small">${esc(i.en)}</div>` : ''}
              <div class="tags" style="margin-top:6px">${v ? vChip(v, '') : `<span class="tag">${esc(i.who)}</span>`}<span class="tag">${fmtN(i.pros)} prosperidad</span></div></div></div>
          <div class="small" style="margin-top:8px"><strong>Aparece:</strong> ${esc(i.unlock)}</div>
          <div class="gift-group"><h3>Materiales${i.matNote ? ` <span class="muted">(${esc(i.matNote)})</span>` : ''}</h3>${mats(i.mat)}</div>
          <div class="small" style="margin-top:6px"><strong>Recompensa:</strong> ${esc(i.reward)}</div>
          <label class="check"><input type="checkbox" data-idea="${esc(i.en)}" ${S.ideas[i.en] ? 'checked' : ''}><span>Completada</span></label></div>`;
      }).join('') || (st.f === 'pend' ? emptyState('sleep', '¡No te queda ninguna!', 'Has completado todas las ideas. El clan te lo agradece.') : emptyState('hand', 'Aún no has completado ninguna idea', 'Marca «Completada» en cada idea cuando entregues sus materiales.'));
      $$('[data-idea]', view).forEach(cb => cb.onchange = () => { S.ideas[cb.dataset.idea] = cb.checked; save(); draw(); });
      remember('ideas', st, IDEA_DEF);
    };
    bindChips(view, 'f', v => { st.f = v; draw(); });
    draw();
    if (target) {
      const el = $$('.idea', view).find(x => x.dataset.en === target);
      if (el) setTimeout(() => { el.scrollIntoView({ block: 'center' }); el.classList.add('target'); }, 60);
    }
  });

  /* ——— Minerales ——— */
  route('/minerales', 'mas', view => {
    setHeader('Minerales', 'Recursos, minerales y gemas', { back: true });
    let html = '';
    ['Básicos', 'Minerales', 'Gemas'].forEach(g => {
      html += `<div class="section-head"><h2>${g}</h2></div><div class="list cols">${MINERALS.filter(m => m.group === g).map(m => `
        <a class="row top" href="${itemHref(m.en)}"><div class="emoji-badge">${pic(m.en + '.png', ini(nameOf(m.en)))}</div>
          <div class="main"><div class="title">${esc(nameOf(m.en))}</div>${enSub(m.en)}
            <div class="meta loves">${esc(m.place)}</div>
            <div class="meta"><span class="gi">${pic(m.tool + '.png', '')}</span>${esc(nameOf(m.tool))} o mejor</div></div>
          <div class="side"><div class="num">${m.co}</div><div class="unit">contrib.</div></div></a>`).join('')}</div>`;
    });
    html += `<div class="section-head"><h2>Consejos</h2></div><ul class="notes">${MINERAL_NOTES.map(n => `<li>${esc(n)}</li>`).join('')}</ul>${footer()}`;
    view.innerHTML = html;
  });

  /* ——— Herramientas ——— */
  route('/herramientas', 'mas', view => {
    setHeader('Herramientas', 'Mejoras y materiales', { back: true });
    let html = '<p class="small muted">Las mejoras se hacen en el taller de herramientas (Acre y, más adelante, Ata) a cambio de materiales y contribución.</p>';
    TOOLS.forEach(g => {
      html += `<div class="section-head"><h2>${g.group}</h2></div><div class="list">${g.items.map(t => `
        <a class="row top" href="${itemHref(t.en)}"><div class="emoji-badge">${pic(t.en + '.png', ini(nameOf(t.en)))}</div>
          <div class="main"><div class="title">${esc(nameOf(t.en))}</div>${enSub(t.en)}
            <div class="meta loves">${esc(t.unlock)}</div>
            ${t.mat ? `<div class="meta loves">${t.mat.map(([n, q]) => esc(itemLabel(n)) + (q > 1 ? ' ×' + q : '')).join(' · ')}</div>` : ''}</div>
          ${t.cost ? `<div class="side"><div class="num">${fmtN(t.cost)}</div><div class="unit">contrib.</div></div>` : ''}</a>`).join('')}</div>`;
    });
    view.innerHTML = html + footer();
  });

  /* ——— Artesanía ——— */
  const CRAFT_DEF = { t: 'fab' };
  route('/artesania', 'mas', (view, _, params) => {
    setHeader('Artesanía', 'Fabricación y procesadores', { back: true });
    const st = recall('artesania', params, CRAFT_DEF);
    view.innerHTML = `${chipGroup('t', 'Sección', [['fab', 'Fabricación'], ['proc', 'Procesadores'], ['fert', 'Fertilizantes']], st.t)}<div id="craftList"></div>${footer()}`;
    const row = (t, extra, side) => `<a class="row top" href="${itemHref(t.en)}"><div class="emoji-badge">${pic(t.en + '.png', ini(nameOf(t.en)))}</div>
      <div class="main"><div class="title">${esc(nameOf(t.en))}</div>${enSub(t.en)}${extra}</div>${side || ''}</a>`;
    const matLine = list => (list.length ? `<div class="meta loves">${list.map(([n, q]) => esc(itemLabel(n)) + (q > 1 ? ' ×' + q : '')).join(' · ')}</div>` : '');
    const draw = () => {
      let html = '';
      if (st.t === 'fab') {
        CRAFTING.forEach(g => {
          html += `<div class="section-head"><h2>${g.group}</h2></div><div class="list cols">${g.items.map(t => row(t,
            `${matLine(t.mat)}${t.note ? `<div class="meta loves">${esc(t.note)}</div>` : ''}${t.req ? `<div class="meta loves">Requiere: ${esc(t.req)}</div>` : ''}`)).join('')}</div>`;
        });
      } else if (st.t === 'proc') {
        html += `<div class="list cols" style="margin-top:12px">${PROCESSORS.map(t => row(t,
          `<div class="meta loves"><strong>Produce:</strong> ${esc(t.out)}${t.time ? ` · ${esc(t.time)}` : ''}${t.cap ? ` · capacidad ${t.cap}` : ''}</div>
           ${matLine(t.mat)}<div class="meta loves">${esc(t.req)}</div>`)).join('')}</div>`;
      } else {
        html += `<p class="small muted">Se fabrican en el compostador. Los fertilizantes de calidad tardan más pero dan mejores cosechas.</p><div class="list cols">${FERTILIZERS.map(t => row(t, '', `<div class="side"><div class="num">${esc(t.time)}</div><div class="unit">en el compostador</div></div>`)).join('')}</div>`;
      }
      $('#craftList', view).innerHTML = html;
      remember('artesania', st, CRAFT_DEF);
    };
    bindChips(view, 't', v => { st.t = v; draw(); });
    draw();
  });

  /* ——— Ficha de objeto: quién lo quiere, en qué se usa y sus datos ——— */
  route('/objeto/(.+)', 'mas', (view, [en]) => {
    const it = ITEMS.get(baseName(en));
    if (!it) return notFound(view, 'ese objeto', '#/mas', 'Ir a Más');
    if (it.kinds.crop) { location.replace('#/cultivo/' + it.kinds.crop.id); return; }
    if (it.kinds.recipe) { location.replace('#/receta/' + it.kinds.recipe.id); return; }
    const k = itemKind(it), d = it.kinds[k] || {};
    const label = itemLabel(it.en);
    const kindLabel = k === 'category' ? 'Categoría' : KIND_ES[k];
    setHeader(label, kindLabel, { back: true });
    const favId = k === 'fish' ? d.id : 'item:' + it.en;
    const facts = [];
    const fact = (kk, v, wide) => facts.push(`<div${wide ? ' class="wide"' : ''}><div class="k">${kk}</div><div class="v">${v}</div></div>`);
    if (k === 'fish') {
      fact('Estación', seasonsText(d.seasons)); fact('Contribución', `<span class="big">${d.contrib || '—'}</span>`);
      fact('Dónde', esc(place(d.place))); fact('Hora', esc(d.time) + (d.rain ? ' · con lluvia' : ''));
      fact('Cómo se pesca', esc(d.tool), true);
    } else if (k === 'gather') {
      fact('Estación', seasonsText(d.seasons)); fact('Contribución', `<span class="big">${d.contrib}</span>`);
      fact('Dónde', esc(place(d.place)), true);
      if (d.note) fact('Nota', esc(d.note), true);
    } else if (k === 'mineral') {
      fact('Dónde', esc(d.place)); fact('Contribución', `<span class="big">${d.co}</span>`);
      fact('Herramienta mínima', `<span class="inline-pic"><span class="gi">${pic(d.tool + '.png', '')}</span>${esc(nameOf(d.tool))}</span>`, true);
    } else if (k === 'tool') {
      fact('Tipo', esc(d.group)); fact('Coste', d.cost ? `<span class="big">${fmtN(d.cost)}</span> contrib.` : '—');
      fact('Cómo se consigue', esc(d.unlock), true);
    } else if (k === 'utensil') {
      fact('Cómo se consigue', esc(d.unlock)); fact('Coste', d.cost ? `<span class="big">${fmtN(d.cost)}</span> contrib.` : '—');
      fact('Recetas', `<a class="linkish" href="#/recetas?u=${encodeURIComponent(it.en)}">${RECIPES.filter(r => r.ut.includes(it.en)).length} recetas con este utensilio</a>`, true);
    } else if (k === 'proc') {
      fact('Produce', esc(d.out)); fact('Capacidad', d.cap ? `<span class="big">${d.cap}</span>` : '—');
      if (d.time) fact('Tiempo', esc(d.time));
      fact('Cómo se desbloquea', esc(d.req), true);
    } else if (k === 'craft') {
      fact('Grupo', esc(d.group));
      if (d.req) fact('Requiere', esc(d.req));
      if (d.note) fact('Nota', esc(d.note), true);
    } else if (k === 'fert') {
      fact('En el compostador', `<span class="big">${esc(d.time)}</span>`, true);
    } else if (k === 'bug') {
      fact('Dónde', esc(d.place)); fact('Contribución', `<span class="big">${d.co}</span>`);
    }
    const matsList = (k === 'tool' || k === 'craft' || k === 'proc') && d.mat && d.mat.length ? `<div class="section-head"><h2>Materiales</h2></div><div class="card"><div class="gift-group">${mats(d.mat)}</div></div>` : '';
    let html = `
      <div class="detail-head"><div class="emoji-badge xl">${pic(itemIconFile(it.en), ini(label))}</div>
        <div><h2>${esc(label)}</h2>${S.names === 'es' && label !== it.en ? `<div class="muted small">${esc(it.en)}</div>` : ''}
          <div class="tags" style="margin-top:8px"><span class="tag">${kindLabel}</span>${d.seasons ? seasonTags(d.seasons) : ''}</div></div>
        ${favBtn(favId, label)}</div>`;
    if (facts.length) html += `<div class="kv essentials">${facts.join('')}</div>`;
    else if (k === 'category') html += `<p class="small muted">Vale cualquier objeto de esta categoría.</p>`;
    else html += `<p class="small muted">Aún no tenemos más datos de este objeto en la guía (pendiente). Consulta la wiki si necesitas el detalle.</p>`;
    if (k === 'fish') html += `<label class="check card-check" style="margin-top:10px"><input type="checkbox" data-caught ${S.fish[d.id] ? 'checked' : ''}><span>Ya lo he capturado</span></label>`;
    html += matsList;
    html += giftBlock(it.en);
    html += usesBlock(it.en);
    view.innerHTML = html + footer();
    bindFav(view);
    const cc = $('[data-caught]', view);
    if (cc) cc.onchange = () => { S.fish[d.id] = cc.checked; save(); toast(cc.checked ? 'Marcado como capturado' : 'Desmarcado'); };
  });

  /* ——— Festivales ——— */
  route('/festivales', 'mas', view => {
    setHeader('Festivales', 'Eventos del año', { back: true });
    const sorted = FESTIVALS.filter(f => f.season !== 'all').sort((a, b) => daysUntil(seasonIdx(a.season), a.day) - daysUntil(seasonIdx(b.season), b.day));
    let html = '<div class="list">';
    sorted.forEach(f => {
      const s = seasonById(f.season);
      const n = daysUntil(seasonIdx(f.season), f.day);
      html += `<div class="card"><div class="tags" style="margin-bottom:6px"><span class="tag ${s.id}">${f.day} de ${s.name.toLowerCase()}</span><span class="tag">${untilText(n)}</span><span class="tag">${esc(place(f.place))}</span></div>
        <div class="idea-head"><div class="emoji-badge">${pic(f.en + '.png', ini(f.name))}</div><div class="main"><h3 style="margin:0">${esc(f.name)}</h3>${S.names === 'es' ? `<div class="muted small" style="margin-bottom:6px">${esc(f.en)}</div>` : ''}</div></div>
        <p class="small" style="margin:0">${esc(f.desc)}</p>${f.req ? `<p class="small" style="margin:6px 0 0"><strong>Requisito:</strong> ${esc(f.req)}</p>` : ''}</div>`;
    });
    const race = FESTIVALS.find(f => f.season === 'all');
    html += `<div class="card"><div class="tags" style="margin-bottom:6px"><span class="tag moss">Días 6 y 20 de cada estación</span></div><div class="idea-head"><div class="emoji-badge">${pic(race.en + '.png', ini(race.name))}</div><div class="main"><h3 style="margin:0">${esc(race.name)}</h3></div></div><p class="small" style="margin:0">${esc(race.desc)}</p></div>`;
    SPECIAL_EVENTS.forEach((e, k) => { html += `<div class="card"><div class="idea-head"><div class="emoji-badge">${pic(['Rite of Passage.png', 'Union.png'][k], ini(e.name))}</div><div class="main"><h3 style="margin:0">${esc(e.name)}</h3></div></div><p class="small" style="margin:0">${esc(e.desc)}</p></div>`; });
    html += `</div><div class="callout">A la mayoría de festivales se llega hablando con Jag en la hoguera antes de las 18:00.</div>${footer()}`;
    view.innerHTML = html;
  });

  /* ——— Profecías ——— */
  route('/profecias', 'mas', view => {
    setHeader('Profecías', 'La pirámide de la Jungla', { back: true });
    const complete = PROPHECIES.filter((p, i) => p.reqs.every((_, j) => S.prophecies[i + '-' + j])).length;
    let html = `<div class="card"><div style="display:flex;justify-content:space-between;align-items:center"><strong>${complete} de ${PROPHECIES.length} profecías completas</strong><span class="count-badge">${Math.round(complete / PROPHECIES.length * 100)}%</span></div>
      <div class="progress"><span style="width:${complete / PROPHECIES.length * 100}%;background:var(--moss)"></span></div>
      <p class="small muted" style="margin:0">Desde el día 8 de primavera del año 1 puedes entrar en la Jungla. Cada profecía completada se coloca en la pirámide.</p></div>
      <div class="section-head"><h2>Fases de la Jungla</h2></div><div class="list">
      ${JUNGLE_STAGES.map(j => `<div class="row static top ${complete >= j.need ? 'done' : 'locked'}"><div class="emoji-badge stage">${j.need}</div><div class="main"><div class="title">Fase ${j.n}${complete >= j.need ? ' · desbloqueada' : ''}</div><div class="meta wrap">${esc(j.desc)}</div></div></div>`).join('')}
      </div><div class="section-head"><h2>Lista de profecías</h2></div>`;
    PROPHECIES.forEach((p, i) => {
      const n = p.reqs.filter((_, j) => S.prophecies[i + '-' + j]).length;
      html += `<div class="card"><div class="idea-head"><div class="emoji-badge">${pic(prophecyFile(p), ini(p.name))}</div><div class="main"><h3 style="margin:0">${esc(p.name)}</h3></div><span class="count-badge">${n}/4</span></div>
        <div style="margin-top:6px">${p.reqs.map((r, j) => `<label class="check"><input type="checkbox" data-k="${i}-${j}" ${S.prophecies[i + '-' + j] ? 'checked' : ''}><span>${esc(r)}</span></label>`).join('')}</div>
        <div class="small" style="margin-top:6px"><strong>Recompensa:</strong> ${esc(p.reward)}</div></div>`;
    });
    html += footer();
    view.innerHTML = html;
    $$('input[data-k]', view).forEach(cb => cb.onchange = () => { S.prophecies[cb.dataset.k] = cb.checked; save(); render({ keep: true }); });
  });

  /* ——— Primeros pasos ——— */
  route('/inicio', 'mas', view => {
    setHeader('Primeros pasos', 'Para empezar con buen pie', { back: true });
    view.innerHTML = `
      <div class="section-head"><h2>Regalos del primer día</h2><span class="small muted" id="fdCount"></span></div>
      <div class="card"><p class="small muted">Solo se pueden recoger el día 1, antes del Rito de Paso.</p>${FIRST_DAY.map((t, i) => `<label class="check"><input type="checkbox" data-fd="${i}" ${S.firstDay[i] ? 'checked' : ''}><span>${esc(t)}</span></label>`).join('')}</div>
      <div class="section-head"><h2>Momentos clave del año 1</h2></div>
      <div class="list">${TIMELINE.map(t => `<div class="row static"><div class="main"><div class="title">${esc(t.what)}</div><div class="meta wrap">${esc(t.when)}</div></div></div>`).join('')}</div>
      <div class="section-head"><h2>Señales de humo</h2></div>
      <div class="list">${SMOKE_SIGNALS.map(s => `<div class="row static top"><div class="main"><div class="title">${esc(s.goal)}</div><div class="meta loves">${esc(s.who)}: ${esc(s.reward)}</div></div></div>`).join('')}</div>
      <div class="section-head"><h2>Regalos</h2></div><ul class="notes">${GIFT_RULES.map(n => `<li>${esc(n)}</li>`).join('')}</ul>${footer()}`;
    const count = () => { $('#fdCount', view).textContent = `${Object.values(S.firstDay).filter(Boolean).length}/${FIRST_DAY.length}`; };
    $$('[data-fd]', view).forEach(cb => cb.onchange = () => { S.firstDay[cb.dataset.fd] = cb.checked; save(); count(); });
    count();
  });

  /* ——— Favoritos y seguimiento ——— */
  route('/favoritos', 'mas', view => {
    setHeader('Favoritos', 'Lo que sigues de cerca', { back: true });
    const court = VILLAGERS.filter(x => S.courting[x.id]);
    const v = VILLAGERS.filter(x => isFav(x.id) && !S.courting[x.id]), c = CROPS.filter(x => isFav(x.id));
    const r = RECIPES.filter(x => isFav(x.id));
    const items = S.favs.filter(id => id.startsWith('item:')).map(id => ITEMS.get(id.slice(5))).filter(Boolean);
    const fish = FISH.filter(x => isFav(x.id));
    const vRow = x => { const g = S.gifts[weekKey(x)] || 0; return birthdayRow(x, `Cumple el ${x.day} de ${seasonById(x.season).name.toLowerCase()} (${untilText(daysUntil(seasonIdx(x.season), x.day)).toLowerCase()}) · regalos esta semana ${g}/2`); };
    const itemRow = (en, href, meta) => `<a class="row" href="${href}"><div class="emoji-badge">${pic(itemIconFile(en), ini(itemLabel(en)))}</div><div class="main"><div class="title">${esc(itemLabel(en))}</div><div class="meta">${esc(meta)}</div></div>${chev}</a>`;
    let html = '';
    if (court.length) html += `<div class="section-head"><h2>Cortejando</h2></div><div class="list">${court.map(vRow).join('')}</div>`;
    if (v.length) html += `<div class="section-head"><h2>Aldeanos</h2></div><div class="list">${v.map(vRow).join('')}</div>`;
    if (c.length) html += `<div class="section-head"><h2>Cultivos</h2></div><div class="list cols">${c.map(x => cropRow(x)).join('')}</div>`;
    if (r.length) html += `<div class="section-head"><h2>Recetas</h2></div><div class="list cols">${r.map(x => itemRow(x.en, '#/receta/' + x.id, S.cooked[x.id] ? 'Ya la has cocinado' : 'Aún sin cocinar')).join('')}</div>`;
    if (fish.length || items.length) html += `<div class="section-head"><h2>Objetos</h2></div><div class="list cols">${fish.map(x => itemRow(x.name, itemHref(x.name), S.fish[x.id] ? 'Capturado' : 'Aún sin capturar')).join('')}${items.map(x => itemRow(x.en, itemHref(x.en), KIND_ES[itemKind(x)] || 'Objeto')).join('')}</div>`;
    if (!html) html = emptyState('hand', 'Aquí guardarás lo tuyo', 'Toca la estrella en cualquier ficha (aldeano, cultivo, receta u objeto) y el corazón en quien estés cortejando para tenerlo todo a mano.');
    const caught = Object.values(S.fish).filter(Boolean).length, cooked = RECIPES.filter(x => S.cooked[x.id]).length, ideas = IDEAS.filter(i => S.ideas[i.en]).length;
    html += `<div class="section-head"><h2>Lo que te falta</h2></div><div class="list">
      <a class="row" href="#/pesca?h=1"><div class="main"><div class="title">Peces por capturar</div><div class="meta">${FISH.length - caught} de ${FISH.length}</div></div>${chev}</a>
      <a class="row" href="#/recetas?h=1"><div class="main"><div class="title">Recetas por cocinar</div><div class="meta">${RECIPES.length - cooked} de ${RECIPES.length}</div></div>${chev}</a>
      <a class="row" href="#/ideas?f=pend"><div class="main"><div class="title">Ideas pendientes</div><div class="meta">${IDEAS.length - ideas} de ${IDEAS.length}</div></div>${chev}</a>
      <a class="row" href="#/profecias"><div class="main"><div class="title">Profecías</div><div class="meta">Metas de la pirámide de la Jungla</div></div>${chev}</a></div>`;
    view.innerHTML = html + footer();
  });

  /* ——— Ajustes ——— */
  route('/ajustes', 'mas', view => {
    setHeader('Ajustes', 'Personaliza la guía', { back: true });
    view.innerHTML = `
      <div class="section-head"><h2>Apariencia</h2></div>
      ${chipGroup('theme', 'Tema', [['auto', 'Como el sistema'], ['light', 'Claro'], ['dark', 'Oscuro (cueva)']], S.theme)}
      <div class="section-head"><h2>Nombres de objetos</h2></div>
      ${chipGroup('names', 'Nombres', [['es', 'Español (traducción)'], ['en', 'Original en inglés']], S.names)}
      <p class="small muted">Las traducciones son orientativas y pueden no coincidir con los nombres del juego en español. En modo español también verás el nombre original debajo. La búsqueda encuentra las cosas por los dos nombres.</p>
      <div class="section-head"><h2>Imágenes</h2></div>
      ${chipGroup('images', 'Imágenes', [[true, 'Mostrar imágenes de la wiki'], [false, 'Solo texto']], S.images)}
      <p class="small muted">Las imágenes son las de la Roots of Pacha Wiki y van incluidas en la app, así que funcionan sin conexión. Si eliges «Solo texto» verás la inicial de cada nombre.</p>
      <div class="section-head"><h2>Tus datos</h2></div>
      <div class="card"><p class="small">Todo se guarda solo en este dispositivo: día de la partida, favoritos, cortejos, flores de cada aldeano, peces capturados, recetas, ideas, profecías, regalos y los últimos filtros que usaste.</p>
        <button class="btn ghost block" type="button" data-reset>Borrar todos mis datos</button></div>${footer()}`;
    bindChips(view, 'theme', v => { S.theme = v; save(); applyTheme(); });
    bindChips(view, 'images', v => { S.images = v === 'true'; save(); toast(S.images ? 'Imágenes activadas' : 'Solo texto'); });
    bindChips(view, 'names', v => { S.names = v; save(); toast('Nombres actualizados'); });
    $('[data-reset]', view).onclick = () => {
      if (confirmReset()) { S = JSON.parse(JSON.stringify(defaults)); save(); applyTheme(); renderDatePill(); render(); toast('Datos borrados'); }
    };
  });
  let resetArmed = 0;
  function confirmReset() {
    if (Date.now() - resetArmed < 4000) return true;
    resetArmed = Date.now(); toast('Pulsa otra vez para borrarlo todo'); return false;
  }

  /* ——— Acerca de ——— */
  route('/acerca', 'mas', view => {
    setHeader('Acerca de', 'Guía Pacha', { back: true });
    view.innerHTML = `
      <div class="card"><h3 class="brand"><svg class="hand" viewBox="0 0 64 64" aria-hidden="true" style="color:var(--accent-soft)"><use href="#i-hand"/></svg>Guía Pacha — guía no oficial</h3>
        <p class="small">Una guía de bolsillo para <em>Roots of Pacha</em>: cultivos, aldeanos y sus regalos, calendario, recetas, ideas, minerales, herramientas, artesanía, festivales, pesca, animales y profecías. Funciona sin conexión.</p>
        <p class="small"><strong>Esta app no está afiliada, respaldada ni patrocinada por Soda Den ni por Crytivo.</strong> <em>Roots of Pacha</em> y sus nombres son marcas de sus respectivos propietarios.</p></div>
      <div class="card"><h3>Fuente de los datos</h3>
        <p class="small">Los datos proceden de la <strong>Official Roots of Pacha Wiki</strong> (rootsofpacha.wiki.gg), escrita por la comunidad y publicada bajo licencia <strong>CC BY-SA 4.0</strong>. Se han traducido y adaptado al español. Este contenido derivado se comparte bajo la misma licencia.</p>
        <p class="small">Las imágenes proceden de la wiki y son ilustraciones originales del juego. Pertenecen a sus autores (Soda Den); se incluyen solo para identificar cada objeto.</p>
        <p class="small muted">Si algo no cuadra con tu versión del juego, puede que la wiki haya cambiado: confírmalo allí.</p></div>
      <div class="card"><h3>Tipografías</h3><p class="small" style="margin:0">Grandstander y Nunito, con licencia SIL Open Font License 1.1.</p></div>
      <div class="card"><h3>Versión</h3><p class="small" style="margin:0">1.1.0 · Datos actualizados en noviembre de 2026</p></div>`;
  });

  /* ——— Buscador global: un índice de todo, tolerante a erratas y acentos ——— */
  let SEARCH_INDEX = null;
  function buildIndex() {
    const idx = [];
    const add = (type, keys, href, img, fb, sub, weight) => idx.push({ type, title: keys[0].t, en: keys[1] && keys[1].t, keys: keys.filter(k => k && k.t).map(k => ({ p: Fuzzy.prep(k.t), w: k.w })), href, img, fb, sub, weight: weight || 1 });
    VILLAGERS.forEach(v => add('Aldeano', [{ t: v.name, w: 1.08 }, { t: 'clan ' + v.clan, w: .5 }], '#/aldeano/' + v.id, villagerIconFile(v), ini(v.name),
      `Cumple el ${v.day} de ${seasonById(v.season).name.toLowerCase()} · le encanta: ${v.loves.slice(0, 3).map(itemLabel).join(', ')}`, 1.04));
    CROPS.forEach(c => add('Cultivo', [{ t: c.name }, { t: c.en, w: .95 }], '#/cultivo/' + c.id, c.en + '.png', ini(c.name),
      `${seasonsText(c.seasons)} · ${c.grow} días · ${c.contrib[1] ?? '—'} contrib.`, 1.02));
    RECIPES.forEach(r => add('Receta', [{ t: itemLabel(r.en) }, { t: r.en, w: .95 }], '#/receta/' + r.id, r.en + '.png', ini(itemLabel(r.en)),
      r.ing.map(([i]) => itemLabel(i)).join(' · ')));
    ITEMS.forEach(it => {
      if (it.kinds.crop || it.kinds.recipe) return;
      const k = itemKind(it);
      const loves = villagersFor(it.en, 'loves').map(v => v.name);
      const d = it.kinds[k] || {};
      const sub = loves.length ? `Le encanta a ${loves.slice(0, 4).join(', ')}${loves.length > 4 ? ` y ${loves.length - 4} más` : ''}`
        : d.seasons ? `${seasonsText(d.seasons)}${d.place ? ' · ' + place(d.place) : ''}` : (d.place || d.unlock || d.out || '');
      add(k === 'category' ? 'Categoría' : KIND_ES[k], [{ t: itemLabel(it.en) }, { t: it.en, w: .95 }], itemHref(it.en), itemIconFile(it.en), ini(itemLabel(it.en)), sub,
        k === 'gift' || k === 'material' || k === 'category' ? .92 : 1);
    });
    IDEAS.forEach(i => add('Idea', [{ t: i.es }, { t: i.en, w: .95 }], '#/ideas?i=' + encodeURIComponent(i.en), i.img, ini(i.es), `${i.who} · ${i.reward}`, .97));
    FESTIVALS.forEach(f => add('Festival', [{ t: f.name }, { t: f.en, w: .95 }], '#/festivales', f.en + '.png', ini(f.name), f.season === 'all' ? 'Días 6 y 20 de cada estación' : `${f.day} de ${seasonById(f.season).name.toLowerCase()}`, .97));
    [...FARM_ANIMALS, ...PETS].forEach(a => add('Animal', [{ t: a.name }, { t: a.en, w: .95 }], '#/animales', a.img, ini(a.name), place(a.place), .95));
    PROPHECIES.forEach(p => add('Profecía', [{ t: p.name }], '#/profecias', prophecyFile(p), ini(p.name), p.reward, .9));
    [['Calendario', '#/calendario', 'cumpleaños festivales'], ['Pesca', '#/pesca', 'peces capturados'], ['Recolección', '#/recoleccion', 'setas plantas árboles'],
      ['Recetas', '#/recetas', 'cocina platos'], ['Ideas', '#/ideas', 'investigaciones'], ['Minerales', '#/minerales', 'gemas'], ['Herramientas', '#/herramientas', 'mejoras'],
      ['Artesanía', '#/artesania', 'procesadores fertilizantes'], ['Profecías', '#/profecias', 'piramide jungla'], ['Festivales', '#/festivales', 'fiestas'],
      ['Animales', '#/animales', 'granja mascotas cobertizos'], ['Primeros pasos', '#/inicio', 'señales de humo'], ['Favoritos', '#/favoritos', 'cortejo seguimiento'],
      ['Ajustes', '#/ajustes', 'tema oscuro modo'], ['Acerca de', '#/acerca', 'creditos licencia']]
      .forEach(([t, h, kw]) => add('Sección', [{ t }, { t: kw, w: .7 }], h, null, '', '', .9));
    return idx;
  }
  function searchResults(q) {
    if (!SEARCH_INDEX) SEARCH_INDEX = buildIndex();
    const pq = Fuzzy.prep(q);
    if (!pq.words.length) return [];
    return SEARCH_INDEX.map(e => ({ e, s: Fuzzy.score(pq, e.keys) * e.weight })).filter(x => x.s > 0)
      .sort((a, b) => b.s - a.s).slice(0, 40).map(x => x.e);
  }
  const resRow = (e, i) => `<a class="row res" href="${e.href}" id="res-${i}" role="option" aria-selected="false" data-i="${i}">
    <div class="emoji-badge">${e.img ? pic(e.img, e.fb) : `<svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-basket"/></svg>`}</div>
    <div class="main"><div class="res-type">${esc(e.type)}</div><div class="title">${esc(e.title)}</div>${e.sub ? `<div class="meta">${esc(e.sub)}</div>` : ''}</div>${chev}</a>`;
  function openSearch() {
    $('#sheetContent').innerHTML = `<h2 id="sheetTitle">Buscar</h2>
      <div class="search">${searchIco}<input type="search" id="gq" placeholder="Aldeano, cultivo, regalo, receta…" aria-label="Buscar en toda la guía" role="combobox" aria-expanded="false" aria-controls="gres" aria-autocomplete="list" enterkeyhint="go" autocomplete="off" spellcheck="false"><button class="clear" type="button" aria-label="Borrar búsqueda" hidden>${closeIco}</button></div>
      <p class="sr-only" aria-live="polite" id="gcount"></p>
      <div id="gres" role="listbox" aria-label="Resultados"></div>`;
    openSheet();
    const inp = $('#gq'), clr = $('#sheetContent .clear'), box = $('#gres');
    let results = [], active = -1;
    const setActive = i => {
      active = i;
      $$('.res', box).forEach(r => { const on = +r.dataset.i === i; r.classList.toggle('active', on); r.setAttribute('aria-selected', String(on)); });
      if (i >= 0) { inp.setAttribute('aria-activedescendant', 'res-' + i); const el = $('#res-' + i); if (el) el.scrollIntoView({ block: 'nearest' }); }
      else inp.removeAttribute('aria-activedescendant');
    };
    const showIdle = () => {
      const rec = (S.recent || []).slice(0, 6);
      box.innerHTML = (rec.length ? `<div class="result-group">Lo último que abriste</div><div class="list recent">${rec.map((e, i) => resRow(e, i)).join('')}</div>` : '') +
        `<p class="search-hint">Busca lo que sea: «Touk», «calabza», «queso», «pizza», «cobre»… No importan las tildes ni las erratas.${matchMedia('(hover: hover)').matches ? ' Atajo: <span class="kbd">/</span>' : ''}</p>`;
      results = rec; setActive(-1); inp.setAttribute('aria-expanded', String(rec.length > 0));
    };
    const run = () => {
      const q = inp.value.trim();
      clr.hidden = !inp.value;
      if (!Fuzzy.norm(q)) return showIdle();
      results = searchResults(q).map(e => ({ type: e.type, title: e.title, en: e.en, sub: e.sub, href: e.href, img: e.img, fb: e.fb }));
      /* Dos objetos con la misma traducción: se distinguen con su nombre original */
      const seen = {};
      results.forEach(r => { seen[r.title] = (seen[r.title] || 0) + 1; });
      results.forEach(r => { if (seen[r.title] > 1 && r.en && r.en !== r.title) r.title += ` (${r.en})`; });
      box.innerHTML = results.length ? `<div class="list">${results.map(resRow).join('')}</div>`
        : emptyState('fire', 'Aquí no hay nada todavía', 'Siéntate junto al fuego y prueba con otra palabra, o con el nombre en inglés.');
      $('#gcount').textContent = results.length ? `${results.length} resultados` : 'Sin resultados';
      inp.setAttribute('aria-expanded', String(results.length > 0));
      setActive(results.length ? 0 : -1);
    };
    inp.oninput = run;
    clr.onclick = () => { inp.value = ''; run(); inp.focus(); };
    inp.onkeydown = e => {
      if (e.key === 'ArrowDown' && results.length) { e.preventDefault(); setActive(Math.min(results.length - 1, active + 1)); }
      else if (e.key === 'ArrowUp' && results.length) { e.preventDefault(); setActive(Math.max(0, active - 1)); }
      else if (e.key === 'Enter' && results[active < 0 ? 0 : active]) { e.preventDefault(); openResult(results[active < 0 ? 0 : active]); }
    };
    box.addEventListener('click', e => {
      const a = e.target.closest('.res');
      if (a) { e.preventDefault(); openResult(results[+a.dataset.i]); }
    });
    showIdle();
    setTimeout(() => inp.focus(), 60);
  }
  function openResult(r) {
    if (!r) return;
    S.recent = [{ type: r.type, title: r.title, sub: r.sub, href: r.href, img: r.img, fb: r.fb }, ...(S.recent || []).filter(x => x.href !== r.href)].slice(0, 6);
    save();
    closeSheet(true);
    if (location.hash === r.href) render(); else location.hash = r.href;
  }

  /* ——— Hoja inferior (diálogo accesible: foco dentro, Escape para cerrar, foco de vuelta) ——— */
  let sheetReturn = null;
  function openSheet() {
    sheetReturn = document.activeElement;
    const h = $('#sheetContent h2');
    if (h && !h.id) h.id = 'sheetTitle';
    $('#sheet').hidden = false; $('#sheetBackdrop').hidden = false; document.body.style.overflow = 'hidden';
    $('#view').setAttribute('aria-hidden', 'true');
    setTimeout(() => { const f = $('#sheet input, #sheet button, #sheet a'); if (f && document.activeElement === document.body) f.focus(); }, 30);
  }
  function closeSheet(silent) {
    if ($('#sheet').hidden) return;
    $('#sheet').hidden = true; $('#sheetBackdrop').hidden = true; document.body.style.overflow = '';
    $('#view').removeAttribute('aria-hidden');
    if (!silent && sheetReturn && sheetReturn.focus) sheetReturn.focus();
    sheetReturn = null;
  }
  $('#sheetBackdrop').onclick = () => closeSheet();
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !$('#sheet').hidden) { closeSheet(); return; }
    if (e.key === 'Tab' && !$('#sheet').hidden) {
      const f = $$('#sheet a[href], #sheet button:not([hidden]), #sheet input, #sheet select').filter(x => x.offsetParent !== null);
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
      return;
    }
    /* Atajos de escritorio: «/» o Ctrl/⌘+K abren el buscador */
    const typing = /^(INPUT|SELECT|TEXTAREA)$/.test(document.activeElement && document.activeElement.tagName);
    if ((e.key === '/' && !typing) || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k')) {
      if ($('#sheet').hidden) { e.preventDefault(); openSearch(); }
    }
  });
  $('#sheet').addEventListener('click', e => { if (e.target.closest('a[href^="#"]')) closeSheet(true); });

  /* ——— Favoritos ——— */
  function bindFav(view) {
    const b = $('[data-fav]', view);
    if (!b) return;
    b.onclick = () => {
      const id = b.dataset.fav;
      S.favs = isFav(id) ? S.favs.filter(x => x !== id) : [...S.favs, id];
      save(); b.setAttribute('aria-pressed', String(isFav(id)));
      toast(isFav(id) ? 'Guardado en favoritos' : 'Quitado de favoritos');
    };
  }

  function footer() {
    return `<p class="footer-note">Guía no oficial · Datos de la Roots of Pacha Wiki (CC BY-SA 4.0) · <a href="#/acerca">Créditos</a></p>`;
  }

  /* ——— Arranque ——— */
  $('#datePill').onclick = openDatePicker;
  $('#searchBtn').onclick = openSearch;
  /* «Volver»: si se entró directamente a una ficha (sin historial), sube a su lista en vez de salir */
  const PARENT = { cultivo: '#/cultivos', aldeano: '#/aldeanos', receta: '#/recetas', objeto: '#/mas' };
  let navCount = 0;
  window.addEventListener('hashchange', () => { navCount++; });
  $('#backBtn').onclick = () => {
    if (navCount > 0) { history.back(); return; }
    const seg = parseHash().path.split('/')[1];
    location.hash = PARENT[seg] || '#/mas';
  };
  window.addEventListener('scroll', () => $('.topbar').classList.toggle('scrolled', window.scrollY > 4), { passive: true });

  // Botón «atrás» de Android (lo envía el contenedor nativo)
  window.pachaBack = function () {
    if (!$('#sheet').hidden) { closeSheet(); return true; }
    const { path } = parseHash();
    if (path === '/hoy' || path === '') return false;
    if (['/calendario', '/cultivos', '/aldeanos', '/mas'].some(p => path === p)) { location.hash = '#/hoy'; return true; }
    if (navCount > 0) { history.back(); return true; }
    location.hash = PARENT[path.split('/')[1]] || '#/hoy'; return true;
  };

  applyTheme();
  renderDatePill();
  render();
  window.__pachaReady = true;
})();
