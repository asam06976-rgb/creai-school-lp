// クリエアイ（架空）LP — 画面側の小さな動き
// 1) 未生成画像のプレースホルダー表示  2) デモダイアログ  3) 料金タブ  4) 固定CTA
(function () {
  'use strict';

  // 1) data-gen 画像: 読み込めない間は .is-missing でプレースホルダー表示
  document.querySelectorAll('img[data-gen]').forEach(function (img) {
    var box = img.closest('.ph');
    if (!box) return;
    box.setAttribute('data-label', img.getAttribute('data-gen'));
    var markMissing = function () { box.classList.add('is-missing'); };
    var markLoaded = function () { box.classList.remove('is-missing'); };
    if (img.complete) {
      if (img.naturalWidth === 0) markMissing(); else markLoaded();
    }
    img.addEventListener('error', markMissing);
    img.addEventListener('load', markLoaded);
  });

  // 2) デモダイアログ（購入・予約の代わり）
  var dialog = document.getElementById('demo-dialog');
  if (dialog) {
    document.querySelectorAll('.open-dialog').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (typeof dialog.showModal === 'function') dialog.showModal();
        else dialog.setAttribute('open', '');
      });
    });
    dialog.querySelectorAll('.close, .close-dialog').forEach(function (btn) {
      btn.addEventListener('click', function () { dialog.close(); });
    });
    dialog.addEventListener('click', function (e) {
      if (e.target === dialog) dialog.close();
    });
  }

  // 3) 料金タブ
  var tabs = document.querySelectorAll('.tab[data-tab]');
  var panels = document.querySelectorAll('[data-panel]');
  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var key = tab.getAttribute('data-tab');
      tabs.forEach(function (t) {
        var on = t === tab;
        t.classList.toggle('is-active', on);
        t.setAttribute('aria-selected', on ? 'true' : 'false');
      });
      panels.forEach(function (p) { p.hidden = p.getAttribute('data-panel') !== key; });
    });
  });

  // 4b) 手動横スクロール（カリキュラム）: 矢印ボタン・ドラッグ・キー操作
  document.querySelectorAll('[data-hscroll]').forEach(function (box) {
    var track = box.querySelector('.hs-track');
    var prev = box.querySelector('.hs-prev');
    var next = box.querySelector('.hs-next');
    if (!track) return;
    // 次／前のカード先頭位置へ移動（スナップ位置と一致させる）
    var go = function (dir) {
      var cards = Array.prototype.slice.call(track.children);
      var cur = track.scrollLeft, target = null;
      if (dir > 0) {
        for (var i = 0; i < cards.length; i++) { if (cards[i].offsetLeft - 4 > cur + 2) { target = cards[i].offsetLeft - 4; break; } }
        if (target === null) target = track.scrollWidth;
      } else {
        for (var j = cards.length - 1; j >= 0; j--) { if (cards[j].offsetLeft - 4 < cur - 2) { target = cards[j].offsetLeft - 4; break; } }
        if (target === null) target = 0;
      }
      track.scrollTo({ left: target, behavior: 'smooth' });
    };
    var update = function () {
      var max = track.scrollWidth - track.clientWidth - 1;
      if (prev) prev.disabled = track.scrollLeft <= 0;
      if (next) next.disabled = track.scrollLeft >= max;
    };
    if (prev) prev.addEventListener('click', function () { go(-1); });
    if (next) next.addEventListener('click', function () { go(1); });
    track.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
    // マウスドラッグでスクロール（タッチは標準動作に任せる）
    var down = false, startX = 0, startLeft = 0, moved = false;
    track.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse') return;
      down = true; moved = false; startX = e.clientX; startLeft = track.scrollLeft;
    });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - startX;
      if (Math.abs(dx) > 4) { moved = true; track.classList.add('is-dragging'); }
      if (moved) track.scrollLeft = startLeft - dx;
    });
    window.addEventListener('pointerup', function () {
      if (!down) return;
      down = false; track.classList.remove('is-dragging');
    });
    track.addEventListener('click', function (e) { if (moved) { e.preventDefault(); moved = false; } }, true);
  });

  // 4) 横流れカルーセル: 子要素を複製して継ぎ目なくループ。速度は data-speed（px/秒）
  document.querySelectorAll('.marquee').forEach(function (box) {
    var track = box.querySelector('.marquee-track');
    if (!track || track.children.length === 0) return;
    var items = Array.prototype.slice.call(track.children);
    items.forEach(function (el) {
      var clone = el.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      track.appendChild(clone);
    });
    var speed = parseFloat(box.getAttribute('data-speed')) || 60;
    var setDuration = function () {
      var half = track.scrollWidth / 2;
      track.style.setProperty('--marquee-duration', Math.max(10, half / speed) + 's');
    };
    setDuration();
    window.addEventListener('resize', setDuration);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(setDuration);
  });

  // 5) 固定CTA: FVを過ぎたら表示、料金セクションが見えている間は隠す
  var sticky = document.getElementById('sticky-cta');
  var hero = document.querySelector('.hero');
  var price = document.querySelector('.price');
  if (sticky && hero) {
    var update = function () {
      var heroBottom = hero.getBoundingClientRect().bottom;
      var hidePrice = false;
      if (price) {
        var r = price.getBoundingClientRect();
        hidePrice = r.top < window.innerHeight && r.bottom > 0;
      }
      sticky.classList.toggle('is-visible', heroBottom < 0 && !hidePrice);
    };
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  }
})();
