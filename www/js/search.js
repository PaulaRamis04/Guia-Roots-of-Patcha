/* Guía Pacha — búsqueda tolerante a errores de escritura y acentos (sin dependencias).
   «calabza» encuentra «Calabaza», «pina» encuentra «Piña», «tuok» encuentra «Touk». */
const Fuzzy = (function () {
  'use strict';

  /* minúsculas, sin acentos ni signos */
  function norm(s) {
    return String(s == null ? '' : s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, ' ').trim();
  }

  /* Distancia de edición con trasposiciones (Damerau, alineación óptima), con corte temprano */
  function dist(a, b, max) {
    const la = a.length, lb = b.length;
    if (Math.abs(la - lb) > max) return max + 1;
    let prev2 = null, prev = Array.from({ length: lb + 1 }, (_, j) => j);
    for (let i = 1; i <= la; i++) {
      const cur = [i];
      let rowMin = i;
      for (let j = 1; j <= lb; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        let v = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
        if (prev2 && i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) v = Math.min(v, prev2[j - 2] + 1);
        cur[j] = v;
        if (v < rowMin) rowMin = v;
      }
      if (rowMin > max) return max + 1;
      prev2 = prev; prev = cur;
    }
    return prev[lb];
  }

  const allowed = n => (n <= 3 ? 0 : n <= 5 ? 1 : 2);

  /* Puntuación de una palabra buscada frente a las palabras de un texto (0 = no encaja) */
  function tokenScore(t, words) {
    let best = 0;
    for (const w of words) {
      let s = 0;
      if (w === t) s = 100;
      else if (w.startsWith(t)) s = 92 - Math.min(10, w.length - t.length);
      else if (t.length >= 3 && w.includes(t)) s = 62;
      else {
        const max = allowed(t.length);
        /* Las erratas casi nunca están en la primera letra: exigirla evita coincidencias absurdas */
        if (max && w[0] === t[0]) {
          const full = dist(t, w, max);
          /* Si aún se está escribiendo la palabra, se compara con su principio con una errata menos */
          const pre = w.length > t.length && max > 1 ? dist(t, w.slice(0, t.length), max - 1) : max + 1;
          const d = Math.min(full, pre <= max - 1 ? pre : max + 1);
          if (d <= max) s = 74 - d * 14;
        }
      }
      if (s > best) best = s;
      if (best === 100) break;
    }
    return best;
  }

  /* Prepara un texto una sola vez para buscar en él muchas veces */
  function prep(text) { const n = norm(text); return { n, words: n.split(' ').filter(Boolean) }; }

  /* Puntúa una consulta contra varios textos [{ p: prep(...), w: peso }]. Devuelve 0 si no encaja. */
  function score(query, keys) {
    const q = typeof query === 'string' ? prep(query) : query;
    if (!q.words.length) return 0;
    let best = 0;
    for (const k of keys) {
      if (!k.p || !k.p.words.length) continue;
      let sum = 0, ok = true;
      for (const t of q.words) {
        const s = tokenScore(t, k.p.words);
        if (!s) { ok = false; break; }
        sum += s;
      }
      if (!ok) continue;
      let s = sum / q.words.length;
      s -= Math.min(12, Math.max(0, k.p.words.length - q.words.length) * 4); /* a igualdad, el nombre más corto primero */
      if (k.p.n === q.n) s += 30;
      else if (k.p.n.startsWith(q.n)) s += 14;
      s *= k.w == null ? 1 : k.w;
      if (s > best) best = s;
    }
    return best;
  }

  /* ¿Encaja la consulta en alguno de estos textos? (para los buscadores de cada lista) */
  function match(query, ...texts) {
    const q = prep(query);
    if (!q.words.length) return true;
    return score(q, texts.filter(Boolean).map(t => ({ p: prep(t) }))) > 0;
  }

  return { norm, prep, score, match, dist };
})();
