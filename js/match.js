/* Generous Italian matching for a novice: accents, apostrophes, and close variants. */
(function (root) {
  "use strict";

  const FILLER = new Set(["ehm", "uhm", "um", "uh", "allora", "dunque", "mah", "boh"]);

  function normalize(value) {
    const base = String(value || "")
      .toLowerCase()
      .replace(/[’'`´]/g, " ")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (!base) return "";
    return base
      .split(" ")
      .filter(function (word) {
        return word && !FILLER.has(word);
      })
      .join(" ");
  }

  function tolerance(len) {
    if (len <= 4) return 0;
    if (len <= 8) return 1;
    if (len <= 16) return 2;
    return 3;
  }

  function levenshtein(a, b) {
    if (a === b) return 0;
    const n = a.length;
    const m = b.length;
    if (!n) return m;
    if (!m) return n;
    let prev = new Array(m + 1);
    let curr = new Array(m + 1);
    for (let j = 0; j <= m; j++) prev[j] = j;
    for (let i = 1; i <= n; i++) {
      curr[0] = i;
      const ca = a.charCodeAt(i - 1);
      for (let j = 1; j <= m; j++) {
        const cost = ca === b.charCodeAt(j - 1) ? 0 : 1;
        const del = prev[j] + 1;
        const ins = curr[j - 1] + 1;
        const sub = prev[j - 1] + cost;
        curr[j] = del < ins ? (del < sub ? del : sub) : ins < sub ? ins : sub;
      }
      const swap = prev;
      prev = curr;
      curr = swap;
    }
    return prev[m];
  }

  function wordsInOrder(needle, hay) {
    const nw = needle.split(" ").filter(Boolean);
    const hw = hay.split(" ").filter(Boolean);
    if (!nw.length || hw.length < nw.length) return false;
    let i = 0;
    for (let k = 0; k < hw.length; k++) {
      if (hw[k] === nw[i]) {
        i += 1;
        if (i === nw.length) return true;
      }
    }
    return false;
  }

  function matches(heard, acceptList) {
    const h = normalize(heard);
    if (h.length < 4) return false;
    const list = acceptList || [];
    for (let i = 0; i < list.length; i++) {
      const p = normalize(list[i]);
      if (!p) continue;
      if (h === p) return true;
      if (p.length >= 4 && h.indexOf(p) !== -1) return true;
      if (p.length >= 4 && wordsInOrder(p, h)) return true;
      // A clipped ending ("nuvolos" ~ "nuvoloso"), not a dropped word.
      if (h.length >= 4 && p.indexOf(h) !== -1 && p.length - h.length <= 2) return true;
      const gate = tolerance(Math.max(h.length, p.length));
      if (Math.abs(h.length - p.length) <= gate && levenshtein(h, p) <= tolerance(p.length)) {
        return true;
      }
    }
    return false;
  }

  root.NonnaMatch = {
    normalize: normalize,
    matches: matches,
    levenshtein: levenshtein
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
