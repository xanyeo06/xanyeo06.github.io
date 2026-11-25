(function () {
  'use strict';

  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  /* smooth scrolling only after the page has settled, so a refresh on a
     #hash lands where it should instead of gliding there */
  var root = document.documentElement;
  ['wheel', 'touchstart', 'pointerdown', 'keydown'].forEach(function (type) {
    window.addEventListener(type, function () {
      root.classList.remove('is-booting');
    }, { once: true, passive: true });
  });

  /* ---- nav: condense once scrolled, retreat on the way down ---- */
  var nav = document.querySelector('.nav');
  var lastY = window.scrollY;
  var ticking = false;

  var sectionLinks = [];
  Array.prototype.forEach.call(document.querySelectorAll('.nav-links a[href^="#"]'), function (a) {
    var section = document.querySelector(a.getAttribute('href'));
    if (section) sectionLinks.push({ link: a, el: section });
  });

  function markActive(y) {
    if (!sectionLinks.length) return;
    var probe = y + window.innerHeight * 0.35;
    var current = null;
    sectionLinks.forEach(function (s) {
      if (s.el.offsetTop <= probe) current = s;
    });
    sectionLinks.forEach(function (s) {
      s.link.classList.toggle('is-active', s === current);
    });
  }

  function onScroll() {
    var y = window.scrollY;
    if (nav) {
      nav.classList.toggle('is-stuck', y > 24);

      if (y > 320 && y > lastY + 4) {
        nav.classList.add('is-hidden');
      } else if (y < lastY - 4 || y < 120) {
        nav.classList.remove('is-hidden');
      }
    }

    markActive(y);
    lastY = y;
    ticking = false;
  }

  markActive(window.scrollY);

  window.addEventListener('scroll', function () {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(onScroll);
    }
  }, { passive: true });

  /* ---- project cards: reveal once, in reading order ---- */
  var targets = document.querySelectorAll('.grid > .card, .feature');

  Array.prototype.forEach.call(document.querySelectorAll('.grid'), function (grid) {
    Array.prototype.forEach.call(grid.children, function (el, i) {
      el.style.setProperty('--rd', Math.min(i, 5) * 55 + 'ms');
    });
  });

  if (!('IntersectionObserver' in window)) {
    Array.prototype.forEach.call(targets, function (el) { el.classList.add('is-in'); });
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in');
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 });

  Array.prototype.forEach.call(targets, function (el) { observer.observe(el); });

  /* safety net: never leave content hidden */
  window.setTimeout(function () {
    Array.prototype.forEach.call(targets, function (el) {
      if (!el.classList.contains('is-in')) el.classList.add('is-in');
    });
  }, 4000);
})();
