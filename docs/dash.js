// A small stand-in for the dashboard runtime the page was first written for.
// Datasets come from this browser (the loaded CSV, hand edits, the saved date);
// calculations re-run whenever data or filters change, then every drawing redraws.
(function () {
  const loaders = new Map();   // name -> fn({answer}) -> {rows}
  const calcs = new Map();     // name -> {inputs, fn}
  const draws = new Map();     // name -> fn(el)
  const raw = new Map();       // dataset name -> rows | undefined
  const errors = new Map();    // dataset name -> Error
  const results = new Map();   // name -> {status, data, error}
  const listeners = [];
  let params = readParams();

  function readParams() {
    const out = {};
    new URLSearchParams(location.hash.slice(1)).forEach((v, k) => { out[k] = v; });
    return out;
  }
  function writeParams() {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v !== null && v !== undefined && v !== '') q.set(k, v); });
    const h = q.toString();
    history.replaceState(null, '', h ? '#' + h : location.pathname + location.search);
  }

  function compute() {
    results.clear();
    const get = (name) => {
      if (results.has(name)) return results.get(name);
      let r;
      if (calcs.has(name)) {
        const c = calcs.get(name);
        const ins = c.inputs.map(get);
        const bad = ins.find((x) => x.status !== 'ok');
        if (bad) r = { status: bad.status, data: [], error: bad.error };
        else {
          try { r = { status: 'ok', data: c.fn(...ins.map((x) => x.data)) }; }
          catch (e) { console.error(name, e); r = { status: 'error', data: [], error: e }; }
        }
      } else if (errors.has(name)) r = { status: 'error', data: [], error: errors.get(name) };
      else if (raw.get(name) === undefined) r = { status: 'empty', data: [] };
      else r = { status: 'ok', data: raw.get(name) };
      results.set(name, r);
      return r;
    };
    calcs.forEach((_, name) => get(name));
  }

  function redraw(name) {
    const names = name ? [name] : [...draws.keys()];
    for (const n of names) {
      const fn = draws.get(n);
      if (!fn) continue;
      document.querySelectorAll('[data-draw="' + n + '"]').forEach((el) => {
        try { fn(el); } catch (e) { console.error('draw ' + n, e); }
      });
    }
  }

  let queued = false;
  function update() {
    if (queued) return;
    queued = true;
    queueMicrotask(() => {
      queued = false;
      compute();
      redraw();
      listeners.forEach((fn) => { try { fn(); } catch (e) { console.error(e); } });
    });
  }

  window.dash = {
    colors: ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)'],
    loader(name, def) { loaders.set(name, def.fn); },
    calc(name, def) { calcs.set(name, { inputs: def.inputs || [], fn: def.fn }); update(); },
    draw(name, fn) { if (fn) { draws.set(name, fn); update(); } else redraw(name); },
    data(name) { return results.get(name) || { status: 'loading', data: [] }; },
    params() { return { ...params }; },
    setParams(patch) {
      Object.entries(patch).forEach(([k, v]) => { if (v === null || v === undefined || v === '') delete params[k]; else params[k] = String(v); });
      writeParams();
      update();
    },
    onData(fn) { listeners.push(fn); },
    refresh() { update(); },
    // Not part of the original runtime: how this page feeds datasets in.
    setRows(name, rows) { errors.delete(name); raw.set(name, rows); update(); },
    load(name, text) {
      try { raw.set(name, loaders.get(name)({ answer: text }).rows); errors.delete(name); }
      catch (e) { raw.delete(name); errors.set(name, e); update(); throw e; }
      update();
    },
  };
})();
