(function () {
    'use strict';

    var THEME_KEY = 'gabrielle-theme';
    var root = document.documentElement;
    var toggle = document.getElementById('theme-toggle');

    function systemMode() {
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark' : 'light';
    }

    function savedMode() {
        try {
            var v = localStorage.getItem(THEME_KEY);
            return v === 'light' || v === 'dark' ? v : null;
        } catch (e) {
            return null;
        }
    }

    function syncToggle(mode) {
        if (!toggle) return;
        toggle.textContent = mode === 'dark' ? '☀️' : '🌙';
        toggle.setAttribute('aria-label',
            mode === 'dark' ? 'Переключить на светлую тему' : 'Переключить на тёмную тему');
    }

    function applyMode(mode) {
        root.setAttribute('data-mode', mode);
        syncToggle(mode);
    }

    if (toggle) {
        syncToggle(root.getAttribute('data-mode') || systemMode());
        toggle.addEventListener('click', function () {
            var next = root.getAttribute('data-mode') === 'dark' ? 'light' : 'dark';
            applyMode(next);
            try { localStorage.setItem(THEME_KEY, next); } catch (e) {  }
        });
    }

    var mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
    function onSystemChange(e) {
        if (!savedMode()) applyMode(e.matches ? 'dark' : 'light');
    }
    if (mq) {
        if (mq.addEventListener) mq.addEventListener('change', onSystemChange);
        else if (mq.addListener) mq.addListener(onSystemChange);  /* Safari < 14 */
    }

    var nav = document.querySelector('.topnav');
    var toTop = document.getElementById('to-top');

    function onScroll() {
        if (nav) nav.classList.toggle('is-scrolled', window.scrollY > 24);
        if (toTop) toTop.classList.toggle('is-visible', window.scrollY > 600);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();   

    if (toTop) {
        toTop.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
        });
    }

    var navLinks = document.querySelectorAll('a[data-scroll]');
    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    Array.prototype.forEach.call(navLinks, function (link) {
        link.addEventListener('click', function (e) {
            var target = document.getElementById(link.getAttribute('data-scroll'));
            if (!target) return;
            e.preventDefault();  
            closeMenu();
            target.scrollIntoView({
                behavior: reduceMotion ? 'auto' : 'smooth',
                block: 'start'
            });
        });
    });

    var burger = document.getElementById('nav-burger');

    function setMenuOpen(open) {
        if (!nav || !burger) return;
        nav.classList.toggle('is-open', open);
        burger.setAttribute('aria-expanded', open ? 'true' : 'false');
        burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    }

    function closeMenu() {
        setMenuOpen(false);
    }

    if (burger && nav) {
        burger.addEventListener('click', function () {
            setMenuOpen(!nav.classList.contains('is-open'));
        });

        document.addEventListener('click', function (e) {
            if (!nav.classList.contains('is-open')) return;
            if (e.target !== burger && !(burger.contains && burger.contains(e.target)) && !nav.contains(e.target)) {
                closeMenu();
            }
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') closeMenu();
        });

        window.addEventListener('resize', function () {
            if (window.innerWidth > 760) closeMenu();
        });
    }

    var sky = document.querySelector('.hero-sky');
    if (sky && reduceMotion && sky.pauseAnimations) sky.pauseAnimations();

    var toastTimer = null;

    function showToast(text) {
        var toast = document.querySelector('.egg-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.className = 'egg-toast';
            toast.setAttribute('role', 'status');
            document.body.appendChild(toast);
        }
        toast.textContent = text;
        toast.classList.add('is-visible');
        if (toastTimer) clearTimeout(toastTimer);
        toastTimer = setTimeout(function () {
            toast.classList.remove('is-visible');
        }, 4200);
    }

    var EGG_CLICKS = 7;  
    var EGG_CLICK_LAPSE = 2000; 

    var eggClicks = 0;
    var eggClickTimer = null;
    var lapseTimer = null;

    function runDayLapse() {
        if (lapseTimer) return; 
        var parts = ['morning', 'day', 'evening', 'night'];
        var realDaypart = root.getAttribute('data-daypart');
        showToast('Пасхалка обнаружена. Смотри, как меняется баннер в течение дня :)');
        window.scrollTo({
            top: 0,
            behavior: reduceMotion ? 'auto' : 'smooth'
        });
        if (reduceMotion) return;
        var step = 0;
        lapseTimer = setInterval(function () {
            root.setAttribute('data-daypart', parts[step % parts.length]);
            step += 1;
            if (step >= parts.length * 3) {
                clearInterval(lapseTimer);
                lapseTimer = null;
                root.setAttribute('data-daypart', realDaypart || 'day');
            }
        }, 1100);
    }

    if (toggle) {
        toggle.addEventListener('click', function () {
            eggClicks += 1;
            if (eggClickTimer) clearTimeout(eggClickTimer);
            if (eggClicks < EGG_CLICKS) {
                eggClickTimer = setTimeout(function () { eggClicks = 0; }, EGG_CLICK_LAPSE);
                return;
            }
            eggClicks = 0;
            eggClickTimer = null;
            runDayLapse();
        });
    }

    var EGG_WORD = 'Психолог';
    var eggWord = null;

    function textNodesUnder(el) {
        var nodes = [];
        (function walk(node) {
            if (node.nodeType === 3) {
                if (node.nodeValue) nodes.push(node);
            } else {
                for (var i = 0; i < node.childNodes.length; i += 1) {
                    walk(node.childNodes[i]);
                }
            }
        })(el);
        return nodes;
    }

    Array.prototype.forEach.call(document.querySelectorAll('.hero-tagline'), function (p) {
        if (eggWord) return;
        var nodes = textNodesUnder(p);
        for (var i = 0; i < nodes.length; i += 1) {
            var node = nodes[i];
            if (node.nodeType !== 3 || !node.nodeValue) continue; 
            var at = node.nodeValue.indexOf(EGG_WORD);
            if (at === -1) continue;
            var word = node.splitText(at); 
            word.splitText(EGG_WORD.length);
            eggWord = document.createElement('span');
            node.parentNode.insertBefore(eggWord, word);
            eggWord.appendChild(word);
            break;
        }
    });

    if (eggWord) {
        eggWord.addEventListener('click', function () {
            showToast('Что вы сейчас чувствуете? :)');
        });
    }

    var JUMBLE_WORD = 'Верстак';
    var JUMBLE_HOLD = 2200;   
    var JUMBLE_RETURN = 1600; 

    var jumbleBlocks = [];
    var jumbleNav = document.querySelector('.topnav');
    var jumbleHero = document.querySelector('.hero');
    var jumbleWrap = document.querySelector('.wrap');

    if (jumbleNav) jumbleBlocks.push(jumbleNav);
    if (jumbleHero) jumbleBlocks.push(jumbleHero);
    if (jumbleWrap) {
        Array.prototype.push.apply(jumbleBlocks, Array.prototype.slice.call(jumbleWrap.children));
    }

    var jumbleTimer = null;

    function jumbleOffset(min, max) {
        return (Math.random() < .5 ? -1 : 1) * (min + Math.random() * (max - min));
    }

    function scatterBlocks() {
        var maxX = Math.min(150, Math.max(60, window.innerWidth * .18));
        var maxY = Math.min(120, Math.max(50, window.innerHeight * .16));
        jumbleBlocks.forEach(function (el) {
            el.style.setProperty('--jx', Math.round(jumbleOffset(20, maxX)) + 'px');
            el.style.setProperty('--jy', Math.round(jumbleOffset(18, maxY)) + 'px');
            el.style.setProperty('--jrot', jumbleOffset(1.2, 5).toFixed(2) + 'deg');
            el.style.setProperty('--jdelay', Math.round(Math.random() * 150) + 'ms');
        });
        root.classList.add('is-jumbled');
    }

    function gatherBlocks() {
        root.classList.remove('is-jumbled');
        jumbleTimer = setTimeout(function () { 
            jumbleTimer = null;
            jumbleBlocks.forEach(function (el) {
                ['--jx', '--jy', '--jrot', '--jdelay'].forEach(function (name) {
                    el.style.removeProperty(name);
                });
            });
        }, JUMBLE_RETURN);
    }

    var jumbleWord = null;

    Array.prototype.forEach.call(document.querySelectorAll('.hero-tagline'), function (p) {
        if (jumbleWord) return;
        var nodes = textNodesUnder(p);
        for (var i = 0; i < nodes.length; i += 1) {
            var node = nodes[i];
            if (node.nodeType !== 3 || !node.nodeValue) continue;
            var at = node.nodeValue.indexOf(JUMBLE_WORD);
            if (at === -1) continue;
            var word = node.splitText(at);
            word.splitText(JUMBLE_WORD.length);
            jumbleWord = document.createElement('span');
            node.parentNode.insertBefore(jumbleWord, word);
            jumbleWord.appendChild(word);
            break;
        }
    });

    if (jumbleWord) {
        jumbleWord.addEventListener('click', function () {
            if (jumbleTimer) return;
            showToast('Разобрала страничку. Сейчас соберу обратно :)');
            if (reduceMotion) return; 
            scatterBlocks();
            jumbleTimer = setTimeout(gatherBlocks, JUMBLE_HOLD);
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('#g-stage .slide'));
    var dotsWrap = document.getElementById('g-dots');
    var current = 0;
    var autoTimer = null;
    var AUTO_DELAY = 4500;

    function go(index) {
        var total = slides.length;
        if (!total) return;
        index = ((index % total) + total) % total;
        slides[current].classList.remove('is-active');
        dots[current].classList.remove('is-active');
        current = index;
        slides[current].classList.add('is-active');
        dots[current].classList.add('is-active');
    }

    function restartAuto() {
        if (autoTimer) clearInterval(autoTimer);
        if (slides.length > 1) autoTimer = setInterval(function () { go(current + 1); }, AUTO_DELAY);
    }

    if (slides.length && dotsWrap) {
        slides.forEach(function (s, i) {
            var dot = document.createElement('button');
            dot.type = 'button';
            dot.className = 'dot' + (i === 0 ? ' is-active' : '');
            dot.setAttribute('aria-label', 'Фото ' + (i + 1));
            dot.addEventListener('click', function () { go(i); restartAuto(); });
            dotsWrap.appendChild(dot);
        });

        var dots = Array.prototype.slice.call(dotsWrap.children);
        var prev = document.getElementById('g-prev');
        var next = document.getElementById('g-next');
        var stage = document.getElementById('g-stage');

        if (prev) prev.addEventListener('click', function () { go(current - 1); restartAuto(); });
        if (next) next.addEventListener('click', function () { go(current + 1); restartAuto(); });

        if (stage) {
            stage.addEventListener('mouseenter', function () { if (autoTimer) clearInterval(autoTimer); });
            stage.addEventListener('mouseleave', restartAuto);
        }


        var SWIPE_MIN = 40; 

        var startX = 0, startY = 0, activeId = null;
        var dragging = false;
        var swiped = false;

        function gestureStart(id, x, y) {
            dragging = true;
            swiped = false;
            activeId = id;
            startX = x;
            startY = y;
            if (autoTimer) clearInterval(autoTimer); 
        }

        function gestureEnd(id, x, y) {
            if (!dragging || id !== activeId) return;
            dragging = false;
            var dx = x - startX;
            var dy = y - startY;
            if (Math.abs(dx) >= SWIPE_MIN && Math.abs(dx) > Math.abs(dy)) {
                swiped = true;
                go(dx < 0 ? current + 1 : current - 1);
            }
            restartAuto();
            if (swiped) swallowClickOnce();
        }

        function gestureCancel(id) {
            if (!dragging || id !== activeId) return;
            dragging = false;
            restartAuto();
        }

        function swallowClickOnce() {
            var swallow = function (e) {
                e.stopPropagation();
                e.preventDefault();
            };
            stage.addEventListener('click', swallow, { capture: true });
            window.setTimeout(function () {
                stage.removeEventListener('click', swallow, { capture: true });
            }, 0);
        }

        if (window.PointerEvent) {
            stage.addEventListener('pointerdown', function (e) {
                if (dragging) return;
                gestureStart(e.pointerId, e.clientX, e.clientY);

                if (e.pointerType === 'mouse' && !(e.target.closest && e.target.closest('.g-btn'))) {
                    try { stage.setPointerCapture(e.pointerId); } catch (err) { /* не критично */ }
                }
            });
            stage.addEventListener('pointerup', function (e) {
                gestureEnd(e.pointerId, e.clientX, e.clientY);
            });
            stage.addEventListener('pointercancel', function (e) {
                gestureCancel(e.pointerId);
            });
        } else {
            stage.addEventListener('touchstart', function (e) {
                if (dragging) return;
                var t = e.changedTouches[0];
                gestureStart(t.identifier, t.clientX, t.clientY);
            }, { passive: true });
            stage.addEventListener('touchend', function (e) {
                for (var i = 0; i < e.changedTouches.length; i++) {
                    var t = e.changedTouches[i];
                    if (t.identifier === activeId) gestureEnd(t.identifier, t.clientX, t.clientY);
                }
            }, { passive: true });
            stage.addEventListener('touchcancel', function (e) {
                for (var i = 0; i < e.changedTouches.length; i++) {
                    if (e.changedTouches[i].identifier === activeId) gestureCancel(e.changedTouches[i].identifier);
                }
            }, { passive: true });
        }

        restartAuto();
    }

    var floatToggle = document.getElementById('about-float-toggle');
    var aboutSection = document.getElementById('about');
    var aboutFull = document.querySelector('.about-full');
    var aboutShort = document.querySelector('.about-short');

    var scrollHandler = null;

    function updateFloatVisibility() {
        if (!floatToggle || !aboutSection) return;

        var projectsSection = document.getElementById('projects');
        var projectsVisible40 = false;
        if (projectsSection) {
            var projectsRect = projectsSection.getBoundingClientRect();
            projectsVisible40 = projectsRect.top < window.innerHeight * 0.6;
        }

        if (projectsVisible40) {
            floatToggle.classList.add('hidden');
        } else {
            floatToggle.classList.remove('hidden');
        }
    }

    function showShortAbout() {
        if (!aboutFull || !aboutShort || !aboutSection || !floatToggle) return;
        aboutFull.classList.add('hidden');
        aboutShort.classList.remove('hidden');
        floatToggle.classList.add('hidden');
        if (scrollHandler) {
            window.removeEventListener('scroll', scrollHandler, { passive: true });
            scrollHandler = null;
        }
        aboutSection.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    }

    function showFullAbout() {
        if (!aboutFull || !aboutShort || !aboutSection || !floatToggle) return;
        aboutShort.classList.add('hidden');
        aboutFull.classList.remove('hidden');
        floatToggle.classList.remove('hidden');

        scrollHandler = function () {
            updateFloatVisibility();
        };
        window.addEventListener('scroll', scrollHandler, { passive: true });
        updateFloatVisibility();

        aboutSection.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    }

    if (floatToggle) {
        floatToggle.addEventListener('click', showShortAbout);
    }

    var fullToggle = document.getElementById('about-full-toggle');
    if (fullToggle) {
        fullToggle.addEventListener('click', showFullAbout);
    }
    
})();