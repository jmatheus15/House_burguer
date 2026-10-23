(function () {
  'use strict';
  document.documentElement.classList.add('js');

  var PHONE = '5583996330716';
  var clamp = function (v, lo, hi) { return Math.min(hi, Math.max(lo, v)); };
  var smooth = function (p, e0, e1) { var t = clamp((p - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t); };
  function rng(seed) { var s = seed >>> 0; return function () { return (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; }; }
  var RM = matchMedia('(prefers-reduced-motion: reduce)');

  // seeks travados: nunca escreve currentTime com um seek no ar, guarda só o alvo mais novo
  function seeker(video) {
    var busy = false, pending = null;
    function seek(t) {
      if (!video.duration) return;
      if (busy) { pending = t; return; }
      busy = true;
      video.currentTime = t;
    }
    video.addEventListener('seeked', function () {
      busy = false;
      if (pending !== null) { var t = pending; pending = null; seek(t); }
    });
    video.addEventListener('error', function () { busy = false; pending = null; });   // a saída do deadlock
    return seek;
  }
  // o vídeo inteiro como Blob: o scrub funciona mesmo em hospedagem sem suporte a Range
  function loadBlob(video, url) {
    return fetch(url).then(function (r) { if (!r.ok) throw new Error(r.status); return r.blob(); })
      .then(function (blob) {
        return new Promise(function (ok, fail) {
          video.addEventListener('loadeddata', ok, { once: true });
          video.addEventListener('error', fail, { once: true });
          video.src = URL.createObjectURL(blob);
          video.load();
        });
      });
  }

  /* ---------- divide os títulos das faixas em palavras e letras ---------- */
  var bands = Array.prototype.map.call(document.querySelectorAll('.band'), function (el, i) {
    var t = el.querySelector('.t'), text = t.textContent.trim(), r = rng(17 + i * 101);
    var perChar = el.classList.contains('fx-drip') || el.classList.contains('fx-grid');
    var words = text.split(' '), total = text.replace(/ /g, '').length, ci = 0;
    var sr = document.createElement('span'), vis = document.createElement('span');
    sr.className = 'sr-only'; sr.textContent = text; vis.setAttribute('aria-hidden', 'true');
    words.forEach(function (w, wi) {
      var ws = document.createElement('span');
      ws.className = 'w';
      ws.style.setProperty('--th', (wi / words.length * (el.classList.contains('fx-punch') ? .35 : .42) + r() * .05).toFixed(3));
      if (!perChar) ws.textContent = w;
      else Array.prototype.forEach.call(w, function (ch) {
        var cs = document.createElement('span');
        cs.className = 'c'; cs.textContent = ch;
        if (el.classList.contains('fx-drip')) cs.style.setProperty('--th', (r() * .5).toFixed(3));
        else {
          cs.style.setProperty('--th', (ci / total * .5 + r() * .06).toFixed(3));
          cs.style.setProperty('--jx', ((r() > .5 ? 1 : -1) * (10 + r() * 16)).toFixed(1) + 'px');
        }
        ws.appendChild(cs); ci++;
      });
      vis.appendChild(ws);
      if (wi < words.length - 1) vis.appendChild(document.createTextNode(' '));
    });
    t.textContent = ''; t.appendChild(sr); t.appendChild(vis);
    return { el: el, a: +el.dataset.a, b: +el.dataset.b, ramp: +el.dataset.ramp || 0, op: -1, k: -1, vis: null };
  });

  /* ---------- hero: o burger real se monta com o scroll ---------- */
  var hero = document.querySelector('.hero'), stage = hero.querySelector('.stage');
  var moved, target = 0, shown = 0, rafId = null, last = 0, loadK = 0, onScreen = true, scrubOn = false;
  var heroVid = document.getElementById('hero-video'), posterEl = hero.querySelector('.poster');
  var seekHero = seeker(heroVid), vidReady = false, vidStarted = false;

  // pôster e vídeo só existem fora do movimento reduzido, que recebe o hero parado sem baixar nada
  function initHeroVideoOnce() {
    if (vidStarted) return;
    vidStarted = true;
    posterEl.style.backgroundImage = "url('assets/hero-poster.jpg')";
    var began = false;
    function start() {
      if (began) return;
      began = true;
      loadBlob(heroVid, 'assets/hero-scrub.mp4').then(function () {
        vidReady = true;
        seekHero(shown * heroVid.duration);   // pousa na posição atual do scroll
        stage.classList.add('video-ready');
      }).catch(function () {
        stage.classList.add('video-failed');
        posterEl.style.backgroundImage = "url('assets/hero-ending.jpg')";   // o recuo parado mostra o burger montado
      });
    }
    var img = new Image();
    img.onload = img.onerror = start;   // o pôster vence a corrida de banda
    img.src = 'assets/hero-poster.jpg';
    setTimeout(start, 4000);
  }

  function progress() {
    var range = hero.offsetHeight - innerHeight;
    return range > 0 ? clamp(-hero.getBoundingClientRect().top / range, 0, 1) : 0;
  }

  function render(p) {
    if (vidReady) seekHero(p * heroVid.duration);
    var mv = p > .015;
    if (mv !== moved) { moved = mv; stage.classList.toggle('moved', mv); }
    bands.forEach(function (B, i) {
      var f = Math.min(.02, (B.b - B.a) / 3);
      var inn = i === 0 ? 1 : smooth(p, B.a, B.a + f);
      var out = i === bands.length - 1 ? 1 : 1 - smooth(p, B.b - f, B.b);
      var op = Math.round(inn * out * 1000) / 1000;
      var k = clamp((p - B.a) / (B.ramp || Math.min(.025, (B.b - B.a) * .35)), 0, 1);
      if (i === 0) k = Math.max(k, loadK);   // a faixa um abre montada e passa o bastão pro scroll
      k = Math.round(k * 125) / 125;         // degraus de 0.008: faixa parada não custa nada
      if (op !== B.op) {
        B.op = op; B.el.style.opacity = op;
        var v = op > .001;
        if (v !== B.vis) { B.vis = v; B.el.style.visibility = v ? 'visible' : 'hidden'; }
      }
      if (k !== B.k) { B.k = k; B.el.style.setProperty('--k', k); }
    });
  }

  function tick(now) {
    var dt = Math.min(100, now - (last || now));
    last = now;
    shown += (target - shown) * (1 - Math.pow(1 - .16, dt / 16.667));
    if (Math.abs(target - shown) < .0005) { shown = target; rafId = null; last = 0; }
    else rafId = requestAnimationFrame(tick);
    render(shown);
  }
  function kick() { if (rafId === null && scrubOn && onScreen) rafId = requestAnimationFrame(tick); }
  function onScroll() { target = progress(); kick(); }

  function enableScrub() {
    if (scrubOn) return;
    scrubOn = true;
    initHeroVideoOnce();
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll);
    bands.forEach(function (B) { B.op = -1; B.k = -1; B.vis = null; });   // reescreve estilos velhos
    moved = null;
    target = shown = progress();
    render(shown);
  }
  function disableScrub() {
    if (!scrubOn) return;
    scrubOn = false;
    removeEventListener('scroll', onScroll);
    removeEventListener('resize', onScroll);
    if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; last = 0; }
  }
  // movimento reduzido decide ao vivo, nas duas direções; o CSS fixa o hero parado com !important
  function applyHeroMode() { if (RM.matches) { loadK = 1; disableScrub(); } else enableScrub(); }
  RM.addEventListener('change', applyHeroMode);

  new IntersectionObserver(function (es) {
    onScreen = es[0].isIntersecting;
    if (onScreen) onScroll();
  }).observe(hero);

  applyHeroMode();
  if (!RM.matches) {
    var t0 = performance.now();
    (function ramp(now) {
      loadK = clamp((now - t0) / 1100, 0, 1);
      if (scrubOn) render(shown);
      if (loadK < 1) requestAnimationFrame(ramp);
    })(t0);
  }

  /* ---------- entradas das seções e elementos vivos ---------- */
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px', threshold: .12 });
  document.querySelectorAll('.rv, .steps-wrap').forEach(function (el) { io.observe(el); });
  document.addEventListener('transitionend', function (e) {
    var c = e.target.classList;
    if (c && c.contains('rv') && c.contains('in')) c.add('done');   // aposenta o atraso do escalonamento
  });
  var live = new IntersectionObserver(function (es) {
    es.forEach(function (e) { e.target.classList.toggle('live', e.isIntersecting); });
  });
  document.querySelectorAll('section:not(.hero)').forEach(function (s) { live.observe(s); });
  document.addEventListener('visibilitychange', function () { document.body.classList.toggle('paused', document.hidden); });

  var nav = document.querySelector('.nav'), navS = null;
  function onPageScroll() {
    var s = scrollY > 40;
    if (s !== navS) { navS = s; nav.classList.toggle('scrolled', s); }
  }
  addEventListener('scroll', onPageScroll, { passive: true });
  onPageScroll();

  /* ---------- segura aí: derreter o cheddar ---------- */
  var seg = document.querySelector('.segura'), holdBtn = seg.querySelector('.hold'), melt = seg.querySelector('.melt');
  var hp = 0, holding = false, hRaf = null, hLast = 0, hV = -1, done = false;
  var mvid = seg.querySelector('.mvid'), seekMelt = seeker(mvid), meltReady = false;
  function setH(v) {
    if (v === hV) return;
    hV = v;
    melt.style.setProperty('--h', v);
    holdBtn.style.setProperty('--h', v);
    if (meltReady) seekMelt(v * (mvid.duration - .05));   // segurar avança o derretimento, soltar volta
  }
  // o vídeo do cheddar só carrega quando a seção se aproxima, e nunca com movimento reduzido
  new IntersectionObserver(function (es, obs) {
    if (!es[0].isIntersecting || RM.matches) return;
    obs.disconnect();
    loadBlob(mvid, 'assets/cheddar-scrub.mp4').then(function () {
      meltReady = true;
      melt.classList.add('ready');
      hV = -1; setH(Math.round(hp * 200) / 200);
    }).catch(function () {});   // sem vídeo, o pôster parado fica e o botão continua funcionando
  }, { rootMargin: '600px 0px' }).observe(seg);
  function finish() {
    if (done) return;
    done = true; holding = false;
    seg.classList.add('done');
    holdBtn.querySelector('span').textContent = 'Derreteu!';
    holdBtn.setAttribute('aria-disabled', 'true');
  }
  function hTick(now) {
    var dt = Math.min(100, now - (hLast || now));
    hLast = now;
    hp = clamp(hp + (holding ? dt / 2200 : -dt / 1500), 0, 1);   // soltar cedo desce suave, nunca estala
    setH(Math.round(hp * 200) / 200);
    if (hp >= 1) { hRaf = null; hLast = 0; finish(); return; }
    if (!holding && hp <= 0) { hRaf = null; hLast = 0; return; }
    hRaf = requestAnimationFrame(hTick);
  }
  function startHold() {
    if (done) return;
    if (RM.matches) { hp = 1; setH(1); finish(); return; }
    holding = true;
    if (hRaf === null) hRaf = requestAnimationFrame(hTick);
  }
  function stopHold() { holding = false; }
  holdBtn.addEventListener('pointerdown', function (e) {
    if (e.button !== 0) return;
    if (holdBtn.setPointerCapture) holdBtn.setPointerCapture(e.pointerId);
    startHold();
  });
  ['pointerup', 'pointercancel', 'lostpointercapture', 'blur'].forEach(function (t) { holdBtn.addEventListener(t, stopHold); });
  holdBtn.addEventListener('keydown', function (e) {
    if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); if (!e.repeat) startHold(); }
  });
  holdBtn.addEventListener('keyup', function (e) { if (e.key === ' ' || e.key === 'Enter') stopHold(); });
  holdBtn.addEventListener('contextmenu', function (e) { e.preventDefault(); });

  /* ---------- cardápio, carrinho e pedido ---------- */
  var items = Array.prototype.map.call(document.querySelectorAll('.item[data-id]'), function (el) {
    var ctl = document.createElement('div');
    el.querySelector('.buy').appendChild(ctl);
    return { id: el.dataset.id, name: el.dataset.name, price: +el.dataset.price, ctl: ctl };
  });
  var qty = {};
  var list = document.querySelector('.order-list'), empty = document.querySelector('.empty');
  var totalEl = document.querySelector('.total'), cart = document.querySelector('.cart');
  var pedidoVisible = false;
  cart.hidden = false;

  function stepper(it, n) {
    return '<div class="qty" role="group" aria-label="Quantidade de ' + it.name + '">' +
      '<button type="button" data-act="-" data-id="' + it.id + '" aria-label="Tirar um ' + it.name + '">−</button>' +
      '<output>' + n + '</output>' +
      '<button type="button" data-act="+" data-id="' + it.id + '" aria-label="Mais um ' + it.name + '">+</button></div>';
  }
  function selected() {
    return items.filter(function (i) { return qty[i.id] > 0; })
      .map(function (i) { return { name: i.name, price: i.price, qty: qty[i.id] }; });
  }
  function renderCart() {
    var html = '', count = 0;
    items.forEach(function (it) {
      var n = qty[it.id] || 0;
      it.ctl.innerHTML = n ? stepper(it, n) : '<button type="button" class="btn btn-accent add" data-act="+" data-id="' + it.id + '" aria-label="Adicionar ' + it.name + '">Adicionar</button>';
      if (n) {
        count += n;
        html += '<li><div><p class="nm">' + it.name + '</p><p class="lp">' + Pedido.fmt(it.price * n) + '</p></div>' + stepper(it, n) + '</li>';
      }
    });
    list.innerHTML = html;
    empty.hidden = count > 0;
    var tot = Pedido.fmt(Pedido.total(selected()));
    totalEl.textContent = tot;
    cart.querySelector('.cart-n').textContent = count + (count === 1 ? ' item' : ' itens');
    cart.querySelector('.cart-t').textContent = tot;
    cart.classList.toggle('show', count > 0 && !pedidoVisible);
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-act]');
    if (!b) return;
    var id = b.dataset.id, act = b.dataset.act, scope = b.closest('.item, .order-list');
    qty[id] = Math.max(0, (qty[id] || 0) + (act === '+' ? 1 : -1));
    renderCart();
    // o botão clicado foi redesenhado: devolve o foco para o controle equivalente
    var again = scope && (scope.querySelector('[data-act="' + act + '"][data-id="' + id + '"]') || scope.querySelector('[data-id="' + id + '"]'));
    if (again) again.focus();
    else if (scope && scope.classList.contains('order-list')) (list.querySelector('button') || empty.querySelector('a')).focus();
  });
  new IntersectionObserver(function (es) {
    pedidoVisible = es[0].isIntersecting;
    renderCart();
  }).observe(document.querySelector('#pedido'));
  renderCart();

  var form = document.getElementById('form-pedido'), F = form.elements;
  var addr = form.querySelector('.addr'), errEl = form.querySelector('.err');
  var ok = form.querySelector('.ok'), okLink = form.querySelector('.ok-link');
  function modeNow() { return form.querySelector('input[name=modo]:checked').value; }
  form.addEventListener('change', function (e) { if (e.target.name === 'modo') addr.hidden = modeNow() === 'retirada'; });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var sel = selected(), name = F.nome.value.trim(), mode = modeNow(), address = F.endereco.value.trim();
    var errs = [], bad = [];
    [F.nome, F.endereco].forEach(function (i) { i.removeAttribute('aria-invalid'); });
    if (!sel.length) errs.push('Escolhe pelo menos um item no cardápio.');
    if (name.length < 2) { errs.push('Coloca seu nome pra gente saber de quem é o pedido.'); bad.push(F.nome); }
    if (mode === 'entrega' && address.length < 5) { errs.push('Falta o endereço da entrega.'); bad.push(F.endereco); }
    errEl.textContent = errs.join(' ');
    if (errs.length) {
      bad.forEach(function (i) { i.setAttribute('aria-invalid', 'true'); });
      if (bad[0]) bad[0].focus();
      ok.hidden = true;
      return;
    }
    var url = Pedido.waLink(PHONE, Pedido.buildMessage({
      items: sel, name: name, mode: mode, address: address, pay: F.pagamento.value, obs: F.obs.value.trim()
    }));
    okLink.href = url;
    ok.hidden = false;
    window.open(url, '_blank', 'noopener');
  });
})();
