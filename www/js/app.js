/* Guía Pacha — lógica de la aplicación (sin dependencias) */
(function () {
  'use strict';

  /* ————— Estado persistente ————— */
  const STORE_KEY = 'pacha-guia-v1';
  const defaults = {
    season: 0, day: 1, year: 1, names: 'es', theme: 'auto', images: true,
    favs: [], prophecies: {}, fish: {}, gifts: {}, onboarded: false
  };
  let S = load();
  function load() {
    try { return Object.assign({}, defaults, JSON.parse(localStorage.getItem(STORE_KEY) || '{}')); }
    catch (e) { return Object.assign({}, defaults); }
  }
  function save() { try { localStorage.setItem(STORE_KEY, JSON.stringify(S)); } catch (e) { /* almacenamiento no disponible */ } }

  /* ————— Utilidades ————— */
  const $ = (sel, el = document) => el.querySelector(sel);
  const $$ = (sel, el = document) => Array.from(el.querySelectorAll(sel));
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const place = p => p.split(' / ').map(x => PLACES[x] || x).join(' / ');
  const seasonById = id => SEASONS.find(s => s.id === id);
  const seasonIdx = id => SEASONS.findIndex(s => s.id === id);
  const weekday = d => WEEKDAYS[(d - 1) % 7];
  const cur = () => SEASONS[S.season];
  const isFav = id => S.favs.includes(id);
  const ini = n => esc(String(n || '?').trim()[0] || '?');
  const sw = id => `<i class="sw s-${id}" aria-hidden="true"></i>`;
  const swatches = ids => ids.length === 4 ? '<span class="yr">Todo el año</span>' : ids.map(sw).join('');
  const starIco = '<svg class="star" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.8l-5.2 2.8 1-5.8-4.3-4.1 5.9-.8z"/></svg>';
  const heartIco = '<svg class="heart" viewBox="0 0 24 24" aria-label="Romance"><path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z"/></svg>';
  const chev = '<svg class="chev" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>';
  const searchIco = '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2"/></svg>';

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
  function villagersFor(en, kind) {
    return VILLAGERS.filter(v => v[kind].some(i => i === en || i === en + ' (W)' || i === en + ' (D)'));
  }
  function giftChip(en, cls) {
    const label = itemLabel(en);
    const showEn = S.names === 'es' && label !== en;
    const base = en.replace(/ \((W|D)\)$/, '');
    let href = null;
    if (cropByEn[base]) href = '#/cultivo/' + cropByEn[base].id;
    else if (fishByName[base]) href = '#/pesca?q=' + encodeURIComponent(base);
    const inner = `<span class="gi">${pic(itemIconFile(en), '')}</span>${esc(label)}${showEn ? `<span class="en">${esc(en)}</span>` : ''}`;
    return href ? `<a class="gift ${cls}" href="${href}">${inner}</a>` : `<span class="gift ${cls}">${inner}</span>`;
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
  function render() {
    const { path, params } = parseHash();
    closeSheet();
    for (const r of routes) {
      const m = path.match(r.re);
      if (m) {
        $$('.tabbar a').forEach(a => a.classList.toggle('active', a.dataset.tab === r.tab));
        const view = $('#view');
        view.innerHTML = '';
        view.classList.remove('view-enter'); void view.offsetWidth; view.classList.add('view-enter');
        r.fn(view, m.slice(1), params);
        window.scrollTo(0, 0);
        return;
      }
    }
    location.hash = '#/hoy';
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
      html += `<div class="card muted">Hoy no hay festivales ni cumpleaños. Buen día para la granja.</div>`;
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
    if (!upcoming.length) html += `<div class="card muted">Semana tranquila.</div>`;
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
    fishNow.forEach(f => { html += `<a class="tag ${s.id}" href="#/pesca?q=${encodeURIComponent(f.name)}"><span class="gi">${pic(f.name + '.png', '')}</span>${esc(f.name)}${f.rain ? '<small>con lluvia</small>' : ''}</a>`; });
    html += '</div>';

    // Favoritos
    const favV = VILLAGERS.filter(v => isFav(v.id));
    if (favV.length) {
      html += `<div class="section-head"><h2>Tus favoritos</h2><a class="link" href="#/favoritos">Ver</a></div><div class="list">`;
      favV.sort((a, b) => daysUntil(seasonIdx(a.season), a.day) - daysUntil(seasonIdx(b.season), b.day))
        .forEach(v => { html += birthdayRow(v, `Cumple: ${untilText(daysUntil(seasonIdx(v.season), v.day))}`); });
      html += '</div>';
    }
    html += footer();
    view.innerHTML = html;
    view.querySelector('[data-act=prev]').onclick = () => shiftDay(-1);
    view.querySelector('[data-act=next]').onclick = () => shiftDay(1);
  });

  function birthdayRow(v, meta) {
    const loves = v.loves.filter(i => i !== 'Mango' && i !== 'Poached Egg').slice(0, 3).map(itemLabel).join(', ');
    return `<a class="row" href="#/aldeano/${v.id}">${avatar(v)}<div class="main"><div class="title">${esc(v.name)}</div><div class="meta">${esc(meta)}</div><div class="meta loves">Le encanta: ${esc(loves)}</div></div>${chev}</a>`;
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
      html += `<button class="d ${today ? 'today' : ''} ${f.some(x => x.season !== 'all') ? 'has-fest' : ''}" data-d="${d}" aria-label="Día ${d}"><span class="n">${d}</span><span class="marks">${marks}</span></button>`;
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
    if (!f.length && !b.length) html += '<p class="muted">No hay eventos este día.</p>';
    f.forEach(x => { html += `<div class="card"><h3>${esc(x.name)}</h3><p class="small muted">${esc(place(x.place))}</p><p class="small">${esc(x.desc)}</p></div>`; });
    b.forEach(v => {
      html += `<div class="card"><div class="bday-head">${avatar(v)}<h3>Cumpleaños de ${esc(v.name)}</h3></div><div style="margin-top:6px">${v.loves.slice(0, 8).map(i => giftChip(i, 'love')).join('')}</div><a class="btn ghost" style="margin-top:6px" href="#/aldeano/${v.id}">Ver ficha</a></div>`;
    });
    html += `<button class="btn primary" style="width:100%;margin-top:14px" data-set>Poner como día actual</button>`;
    $('#sheetContent').innerHTML = html;
    $('#sheetContent [data-set]').onclick = () => { S.season = si; S.day = d; S.onboarded = true; save(); renderDatePill(); closeSheet(); render(); toast('Día actualizado'); };
    openSheet();
  }

  /* ——— Cultivos ——— */
  route('/cultivos', 'cultivos', (view, _, params) => {
    setHeader('Cultivos', `${CROPS.length} cultivos`);
    const st = { s: params.get('s') || 'all', t: params.get('t') || 'all', q: params.get('q') || '', sort: params.get('o') || 'name' };
    view.innerHTML = `
      <div class="search">${searchIco}<input type="search" placeholder="Buscar cultivo…" value="${esc(st.q)}" aria-label="Buscar cultivo"></div>
      <div class="chips" data-g="s">
        <button class="chip" data-v="all" aria-pressed="${st.s === 'all'}">Todas</button>
        ${SEASONS.map(x => `<button class="chip" data-v="${x.id}" aria-pressed="${st.s === x.id}">${sw(x.id)}${x.name}</button>`).join('')}
      </div>
      <div class="toolbar">
        <select data-g="t" aria-label="Tipo"><option value="all">Todos los tipos</option>${Object.entries(TYPES).map(([k, v]) => `<option value="${k}" ${st.t === k ? 'selected' : ''}>${v}</option>`).join('')}</select>
        <select data-g="o" aria-label="Ordenar"><option value="name">A–Z</option><option value="grow" ${st.sort === 'grow' ? 'selected' : ''}>Más rápidos</option><option value="contrib" ${st.sort === 'contrib' ? 'selected' : ''}>Más contribución</option></select>
      </div>
      <div class="list cols" id="cropList"></div>
      <div class="section-head"><h2>Notas</h2></div>
      <ul class="notes">${CROP_NOTES.map(n => `<li>${esc(n)}</li>`).join('')}</ul>${footer()}`;
    const draw = () => {
      const q = norm(st.q);
      let list = CROPS.filter(c => (st.s === 'all' || c.seasons.includes(st.s)) && (st.t === 'all' || c.type === st.t) &&
        (!q || norm(c.name).includes(q) || norm(c.en).includes(q)));
      if (st.sort === 'grow') list.sort((a, b) => a.grow - b.grow);
      else if (st.sort === 'contrib') list.sort((a, b) => (b.contrib[1] || 0) - (a.contrib[1] || 0));
      else list.sort((a, b) => a.name.localeCompare(b.name, 'es'));
      $('#cropList').innerHTML = list.length ? list.map(cropRow).join('') : `<div class="empty">Ningún cultivo con esos filtros.</div>`;
      safeReplace(`#/cultivos?s=${st.s}&t=${st.t}&o=${st.sort}${st.q ? '&q=' + encodeURIComponent(st.q) : ''}`);
    };
    $('input', view).oninput = e => { st.q = e.target.value; draw(); };
    $$('[data-g=s] .chip', view).forEach(b => b.onclick = () => { st.s = b.dataset.v; $$('[data-g=s] .chip', view).forEach(x => x.setAttribute('aria-pressed', x === b)); draw(); });
    $('[data-g=t]', view).onchange = e => { st.t = e.target.value; draw(); };
    $('[data-g=o]', view).onchange = e => { st.sort = e.target.value; draw(); };
    draw();
  });

  function cropRow(c) {
    const regrow = c.regrow ? ` · rebrota cada ${c.regrow}` : '';
    const ss = swatches(c.seasons);
    return `<a class="row" href="#/cultivo/${c.id}"><div class="emoji-badge">${cropPic(c)}</div><div class="main"><div class="title">${esc(c.name)}${isFav(c.id) ? starIco : ''}</div><div class="meta">${ss}${c.grow} días${regrow} · ${esc(place(c.place))}</div></div><div class="side"><div class="num">${c.contrib[1] ?? '—'}</div><div class="unit">contrib.</div></div></a>`;
  }

  route('/cultivo/([\\w-]+)', 'cultivos', (view, [id]) => {
    const c = CROPS.find(x => x.id === id);
    if (!c) return (location.hash = '#/cultivos');
    setHeader(c.name, TYPES[c.type], { back: true });
    const loves = villagersFor(c.en, 'loves'), likes = villagersFor(c.en, 'likes'), hates = villagersFor(c.en, 'hates');
    const q = ['Silvestre', 'Base', 'Buena', 'Mejor', 'Óptima'];
    const en = S.names === 'es' ? `<div class="muted small">${esc(c.en)}</div>` : '';
    let html = `
      <div class="detail-head"><div class="emoji-badge xl">${cropPic(c)}</div>
        <div><h2>${esc(c.name)}</h2>${en}<div class="tags" style="margin-top:8px">${seasonTags(c.seasons)}</div></div>
        <button class="fav-btn" data-fav="${c.id}" aria-label="Favorito" aria-pressed="${isFav(c.id)}">${starIco}</button></div>
      <div class="kv">
        <div><div class="k">Tipo</div><div class="v">${TYPES[c.type]}</div></div>
        <div><div class="k">Crece en</div><div class="v">${c.grow} días</div></div>
        <div><div class="k">Rebrota</div><div class="v">${c.regrow ? `cada ${c.regrow} días` : 'No (1 cosecha)'}</div></div>
        <div><div class="k">Semilla silvestre</div><div class="v">${esc(place(c.place))}</div></div>
      </div>
      <div class="section-head"><h2>Contribución por calidad</h2></div>
      <div class="card"><div class="harvest">${c.contrib.map((v, i) => `<div><div class="k">${q[i]}</div><div class="v">${v ?? '—'}</div></div>`).join('')}</div>
      <p class="small muted" style="margin:10px 0 0">Energía al comerlo: +8 / +10 / +11 / +12 / +14.</p></div>`;

    // Calculadora
    html += `<div class="section-head"><h2>Calculadora de siembra</h2></div><div class="card" id="calc"></div>`;

    html += `<div class="section-head"><h2>¿A quién regalarlo?</h2></div><div class="card">`;
    if (!loves.length && !likes.length && !hates.length) html += '<p class="muted small" style="margin:0">Nadie tiene una opinión especial sobre este cultivo.</p>';
    if (loves.length) html += `<div class="gift-group" style="margin-top:0"><h3><span class="dot" style="background:var(--love)"></span>Le encanta a</h3>${loves.map(v => vChip(v, 'love')).join('')}</div>`;
    if (likes.length) html += `<div class="gift-group"><h3><span class="dot" style="background:var(--like)"></span>Le gusta a</h3>${likes.map(v => vChip(v, 'like')).join('')}</div>`;
    if (hates.length) html += `<div class="gift-group"><h3><span class="dot" style="background:var(--hate)"></span>Lo odia</h3>${hates.map(v => vChip(v, 'hate')).join('')}</div>`;
    html += '</div>' + footer();
    view.innerHTML = html;
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
          <label class="small muted">Plantar el día</label>
          <div style="display:flex;gap:8px">
            <select data-cs>${inSeason.map(i => `<option value="${i}" ${i === cs ? 'selected' : ''}>${SEASONS[i].name}</option>`).join('')}</select>
            <select data-cd>${Array.from({ length: 28 }, (_, i) => `<option ${i + 1 === cd ? 'selected' : ''}>${i + 1}</option>`).join('')}</select>
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
  route('/aldeanos', 'aldeanos', (view, _, params) => {
    setHeader('Aldeanos', `${VILLAGERS.length} personajes`);
    const st = { f: params.get('f') || 'all', q: params.get('q') || '', o: params.get('o') || 'name' };
    view.innerHTML = `
      <div class="search">${searchIco}<input type="search" placeholder="Nombre o regalo (p. ej. «calabaza»)…" value="${esc(st.q)}" aria-label="Buscar aldeano o regalo"></div>
      <div class="chips" data-g="f">
        ${[['all', 'Todos'], ['Pachan', 'Pachan'], ['Mograni', 'Mograni'], ['Yakuan', 'Yakuan'], ['romance', 'Romance'], ['fav', 'Favoritos']]
          .map(([v, l]) => `<button class="chip" data-v="${v}" aria-pressed="${st.f === v}">${l}</button>`).join('')}
      </div>
      <div class="toolbar"><span class="small muted" id="vCount"></span>
        <select data-g="o" aria-label="Ordenar"><option value="name">A–Z</option><option value="bday" ${st.o === 'bday' ? 'selected' : ''}>Próximo cumpleaños</option></select></div>
      <div id="giftHits"></div>
      <div class="people" id="people"></div>
      <div class="section-head"><h2>Cómo funcionan los regalos</h2></div>
      <ul class="notes">${GIFT_RULES.map(n => `<li>${esc(n)}</li>`).join('')}</ul>${footer()}`;
    const draw = () => {
      const q = norm(st.q);
      let list = VILLAGERS.filter(v =>
        (st.f === 'all' || v.clan === st.f || (st.f === 'romance' && v.romance) || (st.f === 'fav' && isFav(v.id))));
      let hitsHtml = '';
      if (q.length >= 3) {
        const matchItem = i => norm(i).includes(q) || norm(itemLabel(i)).includes(q);
        const byLove = list.filter(v => v.loves.some(matchItem));
        const byLike = list.filter(v => v.likes.some(matchItem) && !byLove.includes(v));
        if (byLove.length || byLike.length) {
          hitsHtml = `<div class="card" style="margin-bottom:10px"><h3>Regalos que coinciden con «${esc(st.q)}»</h3>
            ${byLove.length ? `<div class="gift-group"><h3><span class="dot" style="background:var(--love)"></span>Le encanta</h3>${byLove.map(v => `<a class="gift love" href="#/aldeano/${v.id}">${esc(v.name)}<span class="en">${esc(v.loves.filter(matchItem).map(itemLabel).join(', '))}</span></a>`).join('')}</div>` : ''}
            ${byLike.length ? `<div class="gift-group"><h3><span class="dot" style="background:var(--like)"></span>Le gusta</h3>${byLike.map(v => `<a class="gift like" href="#/aldeano/${v.id}">${esc(v.name)}<span class="en">${esc(v.likes.filter(matchItem).map(itemLabel).join(', '))}</span></a>`).join('')}</div>` : ''}
          </div>`;
        }
      }
      list = list.filter(v => !q || norm(v.name).includes(q) || norm(v.role).includes(q));
      if (st.o === 'bday') list.sort((a, b) => daysUntil(seasonIdx(a.season), a.day) - daysUntil(seasonIdx(b.season), b.day));
      else list.sort((a, b) => a.name.localeCompare(b.name, 'es'));
      $('#giftHits').innerHTML = hitsHtml;
      $('#vCount').textContent = `${list.length} ${list.length === 1 ? 'personaje' : 'personajes'}`;
      $('#people').innerHTML = list.length ? list.map(v => {
        const s = seasonById(v.season);
        const until = daysUntil(seasonIdx(v.season), v.day);
        return `<a class="person clan-${v.clan.toLowerCase()}" href="#/aldeano/${v.id}">${isFav(v.id) ? `<span class="fav">${starIco}</span>` : ''}${avatar(v)}<div class="name">${esc(v.name)}</div><div class="bday">${sw(s.id)}${v.day} ${s.name.toLowerCase()}${until <= 7 ? `<b>${until === 0 ? 'hoy' : `en ${until} d`}</b>` : ''}</div></a>`;
      }).join('') : (hitsHtml ? '' : `<div class="empty">Nadie coincide con esa búsqueda.</div>`);
      safeReplace(`#/aldeanos?f=${st.f}&o=${st.o}${st.q ? '&q=' + encodeURIComponent(st.q) : ''}`);
    };
    $('input', view).oninput = e => { st.q = e.target.value; draw(); };
    $$('[data-g=f] .chip', view).forEach(b => b.onclick = () => { st.f = b.dataset.v; $$('[data-g=f] .chip', view).forEach(x => x.setAttribute('aria-pressed', x === b)); draw(); });
    $('[data-g=o]', view).onchange = e => { st.o = e.target.value; draw(); };
    draw();
  });

  route('/aldeano/([\\w-]+)', 'aldeanos', (view, [id]) => {
    const v = VILLAGERS.find(x => x.id === id);
    if (!v) return (location.hash = '#/aldeanos');
    const s = seasonById(v.season);
    setHeader(v.name, `Clan ${v.clan}`, { back: true });
    const until = daysUntil(seasonIdx(v.season), v.day);
    const wk = weekKey(v);
    const given = S.gifts[wk] || 0;
    const hates = v.hates.filter(h => !UNIVERSAL_HATES.includes(h));
    const likes = v.likes.filter(l => !UNIVERSAL_LIKES.includes(l));
    let html = `
      <div class="detail-head">${avatar(v, true)}
        <div><h2>${esc(v.name)}</h2><div class="role">${esc(v.role)}</div></div>
        <button class="fav-btn" data-fav="${v.id}" aria-label="Favorito" aria-pressed="${isFav(v.id)}">${starIco}</button></div>
      <div class="kv">
        <div><div class="k">Cumpleaños</div><div class="v">${sw(s.id)}${v.day} de ${s.name.toLowerCase()}</div></div>
        <div><div class="k">Falta</div><div class="v">${untilText(until)}</div></div>
        <div><div class="k">Clan</div><div class="v">${v.clan}</div></div>
        <div><div class="k">Romance</div><div class="v">${v.romance ? 'Sí' : 'Solo amistad'}</div></div>
      </div>
      <div class="section-head"><h2>Regalos esta semana</h2><span class="small muted">Semana ${Math.floor((S.day - 1) / 7) + 1} · ${cur().name}</span></div>
      <div class="card"><div class="week-gifts">
        <button data-g="1" class="${given >= 1 ? 'on' : ''}" aria-label="Primer regalo">Regalo 1</button>
        <button data-g="2" class="${given >= 2 ? 'on' : ''}" aria-label="Segundo regalo">Regalo 2</button>
        <span class="small muted">${given >= 2 ? 'Ya no admite más regalos esta semana.' : `Puedes darle ${2 - given} ${2 - given === 1 ? 'regalo' : 'regalos'} más (máx. 1 al día).`}</span>
      </div></div>
      <div class="section-head"><h2>Gustos</h2></div>
      <div class="card">
        <div class="gift-group" style="margin-top:0"><h3><span class="dot" style="background:var(--love)"></span>Le encanta</h3>${v.loves.map(i => giftChip(i, 'love')).join('')}</div>
        <div class="gift-group"><h3><span class="dot" style="background:var(--like)"></span>Le gusta</h3>${likes.length ? likes.map(i => giftChip(i, 'like')).join('') : '<span class="muted small">Solo los gustos generales.</span>'}</div>
        <div class="gift-group"><h3><span class="dot" style="background:var(--hate)"></span>Odia</h3>${hates.length ? hates.map(i => giftChip(i, 'hate')).join('') : '<span class="muted small">Solo lo que odia todo el mundo.</span>'}</div>
        <p class="small muted" style="margin:10px 0 0">Además, a casi todos les gusta el zumo de mango silvestre, el zumo de granada y el chocolate caliente, y casi nadie quiere excremento, fibra vegetal, estiércol, heno ni bichos.</p>
      </div>${footer()}`;
    view.innerHTML = html;
    bindFav(view);
    $$('.week-gifts button', view).forEach(b => b.onclick = () => {
      const n = +b.dataset.g;
      S.gifts[wk] = (S.gifts[wk] || 0) >= n ? n - 1 : n;
      save(); render();
    });
  });

  /* ——— Más ——— */
  route('/mas', 'mas', view => {
    setHeader('Más', 'Todo lo demás');
    const done = Object.values(S.prophecies).filter(Boolean).length;
    const caught = Object.values(S.fish).filter(Boolean).length;
    const metas = PROPHECIES.reduce((a, p, i) => a + p.reqs.filter((_, j) => S.prophecies[i + '-' + j]).length, 0);
    const big = [
      ['#/pesca', `${caught}<small>/${FISH.length}</small>`, 'Pesca', 'Peces y animales acuáticos que llevas capturados', FISH.slice(0, 3).map(f => f.name + '.png')],
      ['#/animales', FARM_ANIMALS.length, 'Animales', 'Granja, doma, mascotas y cobertizos', FARM_ANIMALS.slice(0, 3).map(a => a.img)],
      ['#/recoleccion', TREES.length + GATHER.length, 'Recolección', 'Árboles, plantas silvestres, setas y medicinales', GATHER.slice(0, 3).map(g => g.en + '.png')],
      ['#/profecias', `${metas}<small>/56</small>`, 'Profecías', 'Metas cumplidas de la pirámide de la Jungla', []],
      ['#/festivales', FESTIVALS.length, 'Festivales', 'Eventos del año y carreras', []]
    ];
    const small = [
      ['#/inicio', 'Primeros pasos', 'Día 1 y señales de humo'],
      ['#/favoritos', 'Favoritos', `${S.favs.length} guardados`],
      ['#/ajustes', 'Ajustes', 'Tema, nombres e imágenes'],
      ['#/acerca', 'Acerca de', 'Créditos y licencia']
    ];
    view.innerHTML = `<div class="tiles">${big.map(([h, n, t, d, imgs]) => `<a class="tile" href="${h}"><span class="n">${n}</span><span class="t">${t}</span><span class="d">${d}</span>${imgs.length ? `<span class="strip">${imgs.map(f => `<span class="gi lg">${pic(f, '')}</span>`).join('')}</span>` : ''}</a>`).join('')}</div>
      <div class="list">${small.map(([h, t, d]) => `<a class="row" href="${h}"><div class="main"><div class="title">${t}</div><div class="meta">${d}</div></div>${chev}</a>`).join('')}</div>${footer()}`;
    void done;
  });

  /* ——— Pesca ——— */
  route('/pesca', 'mas', (view, _, params) => {
    setHeader('Pesca', `${FISH.length} animales acuáticos`, { back: true });
    const st = { s: params.get('s') || 'all', m: 'all', q: params.get('q') || '', hide: false };
    view.innerHTML = `
      <div class="search">${searchIco}<input type="search" placeholder="Buscar pez…" value="${esc(st.q)}" aria-label="Buscar pez"></div>
      <div class="chips" data-g="s"><button class="chip" data-v="all" aria-pressed="${st.s === 'all'}">Todas</button>${SEASONS.map(x => `<button class="chip" data-v="${x.id}" aria-pressed="${st.s === x.id}">${sw(x.id)}${x.name}</button>`).join('')}</div>
      <div class="chips" data-g="m">${[['all', 'Cualquier método'], ['ah', 'Hacha o arpón'], ['h', 'Solo arpón'], ['rod', 'Caña'], ['trap', 'Trampa']].map(([v, l]) => `<button class="chip" data-v="${v}" aria-pressed="${st.m === v}">${l}</button>`).join('')}</div>
      <div class="toolbar"><span class="count-badge" id="caught"></span><label class="small" style="display:flex;gap:6px;align-items:center"><input type="checkbox" id="hideCaught"> Ocultar capturados</label></div>
      <div class="list cols" id="fishList"></div>
      <div class="section-head"><h2>Consejos</h2></div><ul class="notes">${FISH_NOTES.map(n => `<li>${esc(n)}</li>`).join('')}</ul>
      <p class="small muted">Para el hilo del tiempo n.º 1 de Martina hacen falta 50 animales acuáticos distintos.</p>${footer()}`;
    const draw = () => {
      const q = norm(st.q);
      const list = FISH.filter(f => (st.s === 'all' || f.seasons.includes(st.s)) && (st.m === 'all' || f.method === st.m) &&
        (!q || norm(f.name).includes(q) || norm(place(f.place)).includes(q)) && !(st.hide && S.fish[f.id]))
        .sort((a, b) => a.name.localeCompare(b.name));
      $('#caught').textContent = `${Object.values(S.fish).filter(Boolean).length}/${FISH.length} capturados`;
      $('#fishList').innerHTML = list.map(f => `
        <div class="row" data-id="${f.id}">
          <div class="emoji-badge">${fishPic(f)}</div>
          <div class="main"><div class="title">${esc(f.name)}${f.rain ? '<small class="rain">con lluvia</small>' : ''}</div>
            <div class="meta">${swatches(f.seasons)}${esc(place(f.place))} · ${esc(f.time)}</div>
            <div class="meta">${esc(f.tool)}${f.contrib ? ` · ${f.contrib} contrib.` : ''}</div></div>
          <label class="check solo" aria-label="Capturado"><input type="checkbox" ${S.fish[f.id] ? 'checked' : ''}><span></span></label>
        </div>`).join('') || `<div class="empty">Nada con esos filtros.</div>`;
      $$('#fishList input', view).forEach(cb => cb.onchange = () => {
        const id = cb.closest('[data-id]').dataset.id; S.fish[id] = cb.checked; save();
        $('#caught').textContent = `${Object.values(S.fish).filter(Boolean).length}/${FISH.length} capturados`;
        if (st.hide) draw();
      });
    };
    $('input[type=search]', view).oninput = e => { st.q = e.target.value; draw(); };
    $$('[data-g=s] .chip', view).forEach(b => b.onclick = () => { st.s = b.dataset.v; $$('[data-g=s] .chip', view).forEach(x => x.setAttribute('aria-pressed', x === b)); draw(); });
    $$('[data-g=m] .chip', view).forEach(b => b.onclick = () => { st.m = b.dataset.v; $$('[data-g=m] .chip', view).forEach(x => x.setAttribute('aria-pressed', x === b)); draw(); });
    $('#hideCaught', view).onchange = e => { st.hide = e.target.checked; draw(); };
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
      <tr><th>Animal</th><th>Dónde</th><th class="num">Corazones para acariciar</th><th>Montar</th></tr>
      ${PETS.map(p => `<tr><td><span style="display:inline-flex;align-items:center;gap:8px"><span class="gi lg">${pic(p.img, ini(p.name))}</span><strong>${esc(p.name)}</strong></span></td><td>${esc(place(p.place))}</td><td class="num">${p.pet}</td><td>${esc(p.ride)}</td></tr>`).join('')}
      </table></div></div>
      <div class="section-head"><h2>Cobertizos</h2></div><div class="list">
      ${SHEDS.map(s => `<div class="row static"><div class="main"><div class="title">${esc(s.name)}</div><div class="meta" style="white-space:normal">${esc(s.cost)}${s.note ? ' · ' + esc(s.note) : ''}</div></div><div class="side"><div class="num">${s.cap}</div><div class="unit">animales</div></div></div>`).join('')}
      </div>
      <div class="section-head"><h2>Consejos</h2></div><ul class="notes">${ANIMAL_TIPS.map(t => `<li>${esc(t)}</li>`).join('')}</ul>${footer()}`;
    view.innerHTML = html;
  });

  /* ——— Recolección ——— */
  route('/recoleccion', 'mas', (view, _, params) => {
    setHeader('Recolección', 'Plantas silvestres y árboles', { back: true });
    const st = { s: params.get('s') || 'all' };
    view.innerHTML = `<div class="chips" data-g="s"><button class="chip" data-v="all" aria-pressed="true">Todas</button>${SEASONS.map(x => `<button class="chip" data-v="${x.id}" aria-pressed="false">${sw(x.id)}${x.name}</button>`).join('')}</div><div id="gList"></div>${footer()}`;
    const draw = () => {
      const ok = x => st.s === 'all' || x.seasons.includes(st.s);
      let html = `<div class="section-head"><h2>Frutos de árbol</h2></div><div class="list cols">`;
      TREES.filter(ok).forEach(t => { html += gatherRow(t); });
      html += '</div>';
      ['Comida silvestre', 'Plantas', 'Medicinales', 'Otros'].forEach(g => {
        const items = GATHER.filter(x => x.group === g && ok(x));
        if (!items.length) return;
        html += `<div class="section-head"><h2>${g}</h2></div><div class="list cols">${items.map(x => gatherRow(x)).join('')}</div>`;
      });
      $('#gList').innerHTML = html;
    };
    $$('[data-g=s] .chip', view).forEach(b => b.onclick = () => { st.s = b.dataset.v; $$('[data-g=s] .chip', view).forEach(x => x.setAttribute('aria-pressed', x === b)); draw(); });
    draw();
  });
  function gatherRow(x) {
    const loves = villagersFor(x.en, 'loves').map(v => v.name);
    return `<div class="row static top"><div class="emoji-badge">${pic(x.en + '.png', ini(x.name))}</div><div class="main"><div class="title">${esc(x.name)}</div>
      <div class="meta">${swatches(x.seasons)}${esc(place(x.place))}</div>
      ${x.note ? `<div class="meta" style="white-space:normal">${esc(x.note)}</div>` : ''}
      ${loves.length ? `<div class="meta loves">Le encanta a ${esc(loves.join(', '))}</div>` : ''}</div>
      <div class="side"><div class="num">${x.contrib}</div><div class="unit">contrib.</div></div></div>`;
  }

  /* ——— Festivales ——— */
  route('/festivales', 'mas', view => {
    setHeader('Festivales', 'Eventos del año', { back: true });
    const sorted = FESTIVALS.filter(f => f.season !== 'all').sort((a, b) => daysUntil(seasonIdx(a.season), a.day) - daysUntil(seasonIdx(b.season), b.day));
    let html = '<div class="list">';
    sorted.forEach(f => {
      const s = seasonById(f.season);
      const n = daysUntil(seasonIdx(f.season), f.day);
      html += `<div class="card"><div class="tags" style="margin-bottom:6px"><span class="tag ${s.id}">${f.day} de ${s.name.toLowerCase()}</span><span class="tag">${untilText(n)}</span><span class="tag">${esc(place(f.place))}</span></div>
        <h3>${esc(f.name)}</h3>${S.names === 'es' ? `<div class="muted small" style="margin-top:-4px;margin-bottom:6px">${esc(f.en)}</div>` : ''}
        <p class="small" style="margin:0">${esc(f.desc)}</p>${f.req ? `<p class="small" style="margin:6px 0 0"><strong>Requisito:</strong> ${esc(f.req)}</p>` : ''}</div>`;
    });
    const race = FESTIVALS.find(f => f.season === 'all');
    html += `<div class="card"><div class="tags" style="margin-bottom:6px"><span class="tag moss">Días 6 y 20 de cada estación</span></div><h3>${esc(race.name)}</h3><p class="small" style="margin:0">${esc(race.desc)}</p></div>`;
    SPECIAL_EVENTS.forEach(e => { html += `<div class="card"><h3>${esc(e.name)}</h3><p class="small" style="margin:0">${esc(e.desc)}</p></div>`; });
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
      ${JUNGLE_STAGES.map(j => `<div class="row static top ${complete >= j.need ? 'done' : 'locked'}"><div class="emoji-badge stage">${j.need}</div><div class="main"><div class="title">Fase ${j.n}${complete >= j.need ? ' · desbloqueada' : ''}</div><div class="meta" style="white-space:normal">${esc(j.desc)}</div></div></div>`).join('')}
      </div><div class="section-head"><h2>Lista de profecías</h2></div>`;
    PROPHECIES.forEach((p, i) => {
      const n = p.reqs.filter((_, j) => S.prophecies[i + '-' + j]).length;
      html += `<div class="card"><div style="display:flex;justify-content:space-between;gap:10px;align-items:center"><h3 style="margin:0">${esc(p.name)}</h3><span class="count-badge">${n}/4</span></div>
        <div style="margin-top:6px">${p.reqs.map((r, j) => `<label class="check"><input type="checkbox" data-k="${i}-${j}" ${S.prophecies[i + '-' + j] ? 'checked' : ''}><span>${esc(r)}</span></label>`).join('')}</div>
        <div class="small" style="margin-top:6px"><strong>Recompensa:</strong> ${esc(p.reward)}</div></div>`;
    });
    html += footer();
    view.innerHTML = html;
    $$('input[data-k]', view).forEach(cb => cb.onchange = () => { S.prophecies[cb.dataset.k] = cb.checked; save(); render(); });
  });

  /* ——— Primeros pasos ——— */
  route('/inicio', 'mas', view => {
    setHeader('Primeros pasos', 'Para empezar con buen pie', { back: true });
    view.innerHTML = `
      <div class="section-head"><h2>Regalos del primer día</h2></div>
      <div class="card"><p class="small muted">Solo se pueden recoger el día 1, antes del Rito de Paso.</p>${FIRST_DAY.map(t => `<label class="check"><input type="checkbox"><span>${esc(t)}</span></label>`).join('')}</div>
      <div class="section-head"><h2>Momentos clave del año 1</h2></div>
      <div class="list">${TIMELINE.map(t => `<div class="row static"><div class="main"><div class="title">${esc(t.what)}</div><div class="meta">${esc(t.when)}</div></div></div>`).join('')}</div>
      <div class="section-head"><h2>Señales de humo</h2></div>
      <div class="list">${SMOKE_SIGNALS.map(s => `<div class="row static top"><div class="main"><div class="title">${esc(s.goal)}</div><div class="meta loves">${esc(s.who)}: ${esc(s.reward)}</div></div></div>`).join('')}</div>
      <div class="section-head"><h2>Regalos</h2></div><ul class="notes">${GIFT_RULES.map(n => `<li>${esc(n)}</li>`).join('')}</ul>${footer()}`;
  });

  /* ——— Favoritos ——— */
  route('/favoritos', 'mas', view => {
    setHeader('Favoritos', 'Lo que has marcado', { back: true });
    const v = VILLAGERS.filter(x => isFav(x.id)), c = CROPS.filter(x => isFav(x.id));
    let html = '';
    if (!v.length && !c.length) html = `<div class="empty">Marca aldeanos o cultivos con la estrella para tenerlos aquí.</div>`;
    if (v.length) html += `<div class="section-head"><h2>Aldeanos</h2></div><div class="list">${v.map(x => birthdayRow(x, `Cumple el ${x.day} de ${seasonById(x.season).name.toLowerCase()}`)).join('')}</div>`;
    if (c.length) html += `<div class="section-head"><h2>Cultivos</h2></div><div class="list cols">${c.map(cropRow).join('')}</div>`;
    view.innerHTML = html + footer();
  });

  /* ——— Ajustes ——— */
  route('/ajustes', 'mas', view => {
    setHeader('Ajustes', 'Personaliza la guía', { back: true });
    view.innerHTML = `
      <div class="section-head"><h2>Apariencia</h2></div>
      <div class="chips" data-g="theme">${[['auto', 'Como el sistema'], ['light', 'Claro'], ['dark', 'Oscuro']].map(([v, l]) => `<button class="chip" data-v="${v}" aria-pressed="${S.theme === v}">${l}</button>`).join('')}</div>
      <div class="section-head"><h2>Nombres de objetos</h2></div>
      <div class="chips" data-g="names">${[['es', 'Español (traducción)'], ['en', 'Original en inglés']].map(([v, l]) => `<button class="chip" data-v="${v}" aria-pressed="${S.names === v}">${l}</button>`).join('')}</div>
      <p class="small muted">Las traducciones son orientativas y pueden no coincidir con los nombres del juego en español. En modo español también verás el nombre original debajo.</p>
      <div class="section-head"><h2>Imágenes</h2></div>
      <div class="chips" data-g="images">${[[true, 'Mostrar imágenes de la wiki'], [false, 'Solo texto']].map(([v, l]) => `<button class="chip" data-v="${v}" aria-pressed="${S.images === v}">${l}</button>`).join('')}</div>
      <p class="small muted">Las imágenes se descargan de la Roots of Pacha Wiki la primera vez que las ves (necesita internet) y luego quedan en caché. Sin conexión verás la inicial de cada nombre.</p>
      <div class="section-head"><h2>Tus datos</h2></div>
      <div class="card"><p class="small">Todo se guarda solo en este dispositivo: día de la partida, favoritos, peces capturados, profecías y regalos.</p>
        <button class="btn ghost" data-reset style="width:100%">Borrar todos mis datos</button></div>${footer()}`;
    $$('[data-g=theme] .chip', view).forEach(b => b.onclick = () => { S.theme = b.dataset.v; save(); applyTheme(); render(); });
    $$('[data-g=images] .chip', view).forEach(b => b.onclick = () => { S.images = b.dataset.v === 'true'; save(); render(); });
    $$('[data-g=names] .chip', view).forEach(b => b.onclick = () => { S.names = b.dataset.v; save(); render(); toast('Nombres actualizados'); });
    $('[data-reset]', view).onclick = () => {
      if (confirmReset()) { S = Object.assign({}, defaults); save(); applyTheme(); renderDatePill(); render(); toast('Datos borrados'); }
    };
  });
  let resetArmed = 0;
  function confirmReset() {
    if (Date.now() - resetArmed < 4000) return true;
    resetArmed = Date.now(); toast('Pulsa otra vez para confirmar'); return false;
  }

  /* ——— Acerca de ——— */
  route('/acerca', 'mas', view => {
    setHeader('Acerca de', 'Guía Pacha', { back: true });
    view.innerHTML = `
      <div class="card"><h3>Guía Pacha — guía no oficial</h3>
        <p class="small">Una guía de bolsillo para <em>Roots of Pacha</em>: cultivos, aldeanos y sus regalos, calendario, festivales, pesca, animales y profecías. Funciona sin conexión.</p>
        <p class="small"><strong>Esta app no está afiliada, respaldada ni patrocinada por Soda Den ni por Crytivo.</strong> <em>Roots of Pacha</em> y sus nombres son marcas de sus respectivos propietarios.</p></div>
      <div class="card"><h3>Fuente de los datos</h3>
        <p class="small">Los datos proceden de la <strong>Official Roots of Pacha Wiki</strong> (rootsofpacha.wiki.gg), escrita por la comunidad y publicada bajo licencia <strong>CC BY-SA 4.0</strong>. Se han traducido y adaptado al español. Este contenido derivado se comparte bajo la misma licencia.</p>
        <p class="small">Las imágenes se cargan directamente desde la wiki. Son ilustraciones del juego y pertenecen a sus autores (Soda Den); no forman parte de esta app.</p>
        <p class="small muted">Si algo no cuadra con tu versión del juego, puede que la wiki haya cambiado: confírmalo allí.</p></div>
      <div class="card"><h3>Versión</h3><p class="small" style="margin:0">1.0.0 · Datos actualizados en noviembre de 2026</p></div>`;
  });

  /* ——— Buscador global ——— */
  function openSearch() {
    $('#sheetContent').innerHTML = `<h2>Buscar</h2><div class="search">${searchIco}<input type="search" id="gq" placeholder="Aldeano, cultivo, pez, regalo…" aria-label="Buscar en toda la guía"></div><div id="gres"><p class="small muted">Prueba con «Touk», «calabaza», «Zeus» o «miel».</p></div>`;
    openSheet();
    const inp = $('#gq');
    setTimeout(() => inp.focus(), 60);
    inp.oninput = () => {
      const q = norm(inp.value.trim());
      if (q.length < 2) { $('#gres').innerHTML = ''; return; }
      const vs = VILLAGERS.filter(v => norm(v.name).includes(q)).slice(0, 6);
      const cs = CROPS.filter(c => norm(c.name).includes(q) || norm(c.en).includes(q)).slice(0, 6);
      const fs = FISH.filter(f => norm(f.name).includes(q)).slice(0, 6);
      const gs = [...TREES, ...GATHER].filter(g => norm(g.name).includes(q) || norm(g.en).includes(q)).slice(0, 6);
      const items = new Map();
      VILLAGERS.forEach(v => v.loves.forEach(i => { if (norm(i).includes(q) || norm(itemLabel(i)).includes(q)) { if (!items.has(i)) items.set(i, []); items.get(i).push(v); } }));
      let html = '';
      if (vs.length) html += `<div class="result-group">Aldeanos</div><div class="list">${vs.map(v => birthdayRow(v, `Cumple el ${v.day} de ${seasonById(v.season).name.toLowerCase()}`)).join('')}</div>`;
      if (cs.length) html += `<div class="result-group">Cultivos</div><div class="list">${cs.map(cropRow).join('')}</div>`;
      if (fs.length) html += `<div class="result-group">Pesca</div><div class="list">${fs.map(f => `<a class="row" href="#/pesca?q=${encodeURIComponent(f.name)}"><div class="emoji-badge">${fishPic(f)}</div><div class="main"><div class="title">${esc(f.name)}</div><div class="meta">${esc(place(f.place))} · ${esc(f.time)}</div></div>${chev}</a>`).join('')}</div>`;
      if (gs.length) html += `<div class="result-group">Recolección</div><div class="list">${gs.map(g => `<a class="row" href="#/recoleccion"><div class="emoji-badge">${pic(g.en + '.png', ini(g.name))}</div><div class="main"><div class="title">${esc(g.name)}</div><div class="meta">${esc(place(g.place))}</div></div>${chev}</a>`).join('')}</div>`;
      if (items.size) {
        html += `<div class="result-group">Regalos favoritos</div><div class="card">`;
        [...items.entries()].slice(0, 6).forEach(([i, vlist]) => {
          html += `<div class="gift-group" style="margin-top:4px"><h3>${esc(itemLabel(i))}</h3>${vlist.map(v => vChip(v, 'love')).join('')}</div>`;
        });
        html += '</div>';
      }
      $('#gres').innerHTML = html || `<div class="empty">Sin resultados.</div>`;
    };
  }

  /* ——— Hoja inferior ——— */
  function openSheet() { $('#sheet').hidden = false; $('#sheetBackdrop').hidden = false; document.body.style.overflow = 'hidden'; }
  function closeSheet() { $('#sheet').hidden = true; $('#sheetBackdrop').hidden = true; document.body.style.overflow = ''; }
  $('#sheetBackdrop').onclick = closeSheet;
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSheet(); });
  $('#sheet').addEventListener('click', e => { if (e.target.closest('a[href^="#"]')) closeSheet(); });

  /* ——— Favoritos ——— */
  function bindFav(view) {
    const b = $('[data-fav]', view);
    if (!b) return;
    b.onclick = () => {
      const id = b.dataset.fav;
      S.favs = isFav(id) ? S.favs.filter(x => x !== id) : [...S.favs, id];
      save(); b.setAttribute('aria-pressed', isFav(id));
      toast(isFav(id) ? 'Añadido a favoritos' : 'Quitado de favoritos');
    };
  }

  function footer() {
    return `<p class="footer-note">Guía no oficial · Datos de la Roots of Pacha Wiki (CC BY-SA 4.0) · <a href="#/acerca">Créditos</a></p>`;
  }

  /* ——— Arranque ——— */
  $('#datePill').onclick = openDatePicker;
  $('#searchBtn').onclick = openSearch;
  $('#backBtn').onclick = () => { if (history.length > 1) history.back(); else location.hash = '#/hoy'; };
  window.addEventListener('scroll', () => $('.topbar').classList.toggle('scrolled', window.scrollY > 4), { passive: true });

  // Botón «atrás» de Android (lo envía el contenedor nativo)
  window.pachaBack = function () {
    if (!$('#sheet').hidden) { closeSheet(); return true; }
    const { path } = parseHash();
    if (path === '/hoy' || path === '') return false;
    if (['/calendario', '/cultivos', '/aldeanos', '/mas'].some(p => path.startsWith(p))) { location.hash = '#/hoy'; return true; }
    history.back(); return true;
  };

  applyTheme();
  renderDatePill();
  render();
})();
