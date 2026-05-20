/* ============================================================
   CUSTOM CURSOR — reticle / crosshair
   ============================================================ */
function initCustomCursor() {
    if (window.matchMedia('(hover: none)').matches) return;

    const dot = document.createElement('div');
    dot.className = 'c-dot';

    const ret = document.createElement('div');
    ret.className = 'c-reticle';
    ret.innerHTML =
        '<div class="c-tl"></div>' +
        '<div class="c-tr"></div>' +
        '<div class="c-bl"></div>' +
        '<div class="c-br"></div>';

    document.body.appendChild(dot);
    document.body.appendChild(ret);

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let rx = mx, ry = my;
    let retEl = null; // element the reticle is locking onto

    document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

    (function loop() {
        // If element was removed from DOM (e.g. window closed), reset immediately
        if (retEl && !retEl.isConnected) {
            retEl = null;
            document.body.classList.remove('cur-active');
            ret.style.width  = '';
            ret.style.height = '';
        }

        if (retEl) {
            // Lerp toward element center
            const r  = retEl.getBoundingClientRect();
            const tx = r.left + r.width  / 2;
            const ty = r.top  + r.height / 2;
            rx += (tx - rx) * 0.18;
            ry += (ty - ry) * 0.18;
        } else {
            // Normal cursor follow
            rx += (mx - rx) * 0.13;
            ry += (my - ry) * 0.13;
        }
        dot.style.left = mx + 'px';
        dot.style.top  = my + 'px';
        ret.style.left = rx + 'px';
        ret.style.top  = ry + 'px';
        requestAnimationFrame(loop);
    })();

    const sel = 'a, button, select, .srv-row, .proj-row, .stat-cell, .tech-tag, .desktop-icon, .win-ctrl, .tb-win-btn, .tb-start-btn, .win-link, .win-menubar span';

    document.addEventListener('mouseover', e => {
        const el = e.target.closest(sel);
        if (!el) return;
        retEl = el;
        document.body.classList.add('cur-active');
        const r   = el.getBoundingClientRect();
        const pad = 10;
        ret.style.width  = (r.width  + pad * 2) + 'px';
        ret.style.height = (r.height + pad * 2) + 'px';
    });

    document.addEventListener('mouseout', e => {
        if (!e.target.closest(sel)) return;
        retEl = null;
        document.body.classList.remove('cur-active');
        ret.style.width  = '';
        ret.style.height = '';
    });
}

/* ============================================================
   TYPING EFFECT — cycles through strings with delete animation
   ============================================================ */
function initTypingEffect() {
    const el = document.getElementById('typing-text');
    if (!el) return;

    const strings = [
        'Open to new opportunities.',
        'Building full-stack experiences.',
        'Available for freelance projects.',
        'Turning ideas into real products.',
    ];

    let si = 0, ci = 0, deleting = false;
    const SPEED_TYPE = 55;
    const SPEED_DEL  = 30;
    const PAUSE_END  = 1800;
    const PAUSE_START = 400;

    function tick() {
        const current = strings[si];
        if (!deleting) {
            el.textContent = current.slice(0, ci + 1);
            ci++;
            if (ci === current.length) {
                deleting = true;
                setTimeout(tick, PAUSE_END);
                return;
            }
            setTimeout(tick, SPEED_TYPE);
        } else {
            el.textContent = current.slice(0, ci - 1);
            ci--;
            if (ci === 0) {
                deleting = false;
                si = (si + 1) % strings.length;
                setTimeout(tick, PAUSE_START);
                return;
            }
            setTimeout(tick, SPEED_DEL);
        }
    }

    setTimeout(tick, 900);
}

/* ============================================================
   SECTION LOADER
   ============================================================ */
async function loadSection(slotId, url) {
    const slot = document.getElementById(slotId);
    if (!slot) return;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to load ${url}: ${res.status}`);

    const html = await res.text();
    const tpl  = document.createElement('template');
    tpl.innerHTML = html;

    const scripts = Array.from(tpl.content.querySelectorAll('script'));
    scripts.forEach(s => s.remove());
    slot.replaceChildren(tpl.content.cloneNode(true));

    for (const s of scripts) {
        const el = document.createElement('script');
        el.async = false;
        for (const a of s.attributes) el.setAttribute(a.name, a.value);
        if (!s.src) el.textContent = s.textContent;
        document.body.appendChild(el);
    }
}

/* ============================================================
   THEME TOGGLE
   ============================================================ */
function changeColor(element) {
    document.body.classList.toggle('body-light');
    element.classList.toggle('is-light');
}

/* ============================================================
   SCROLL REVEAL
   ============================================================ */
function initRevealAnimations() {
    const els = document.querySelectorAll('.reveal');
    if (!els.length) return;

    const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) e.target.classList.add('is-visible');
            else e.target.classList.remove('is-visible');
        });
    }, { threshold: 0.14, rootMargin: '0px 0px -10% 0px' });

    els.forEach(el => obs.observe(el));
}

/* ============================================================
   CANVAS BACKGROUND — purple particle network
   ============================================================ */
function initAnimatedHeader() {
    let W, H;
    const header = document.getElementById('large-header');
    const canvas = document.getElementById('demo-canvas');
    const ctx    = canvas ? canvas.getContext('2d') : null;
    if (!header || !canvas || !ctx) return;

    let pts = [], target;

    function dist2(a, b) { return (a.x - b.x) ** 2 + (a.y - b.y) ** 2; }

    function build() {
        W = window.innerWidth; H = window.innerHeight;
        target = { x: W / 2, y: H / 2 };
        header.style.width  = W + 'px';
        header.style.height = H + 'px';
        canvas.width = W; canvas.height = H;
        pts = [];

        for (let x = 0; x < W; x += W / 20)
        for (let y = 0; y < H; y += H / 20) {
            const px = x + Math.random() * (W / 20);
            const py = y + Math.random() * (H / 20);
            pts.push({ x: px, y: py, ox: px, oy: py, tx: px, ty: py, a: 0,
                       circle: { r: 1.5 + Math.random() * 2, a: 0 } });
        }

        pts.forEach(p => {
            const cl = [];
            pts.forEach(q => {
                if (p === q) return;
                if (cl.length < 5) { cl.push(q); return; }
                let fi = 0;
                for (let i = 1; i < cl.length; i++) if (dist2(p, cl[i]) > dist2(p, cl[fi])) fi = i;
                if (dist2(p, q) < dist2(p, cl[fi])) cl[fi] = q;
            });
            p.closest = cl;
            p.circle.point = p;
        });
    }

    function move() {
        pts.forEach(p => {
            p.x += (p.tx - p.x) * 0.015; p.y += (p.ty - p.y) * 0.015;
            if (Math.abs(p.tx - p.x) < 1 && Math.abs(p.ty - p.y) < 1) {
                p.tx = p.ox - 50 + Math.random() * 100;
                p.ty = p.oy - 50 + Math.random() * 100;
            }
        });
    }

    function frame() {
        ctx.clearRect(0, 0, W, H);
        move();
        pts.forEach(p => {
            const d = dist2(target, p);
            if      (d < 4000)  { p.a = .24; p.circle.a = .5;  }
            else if (d < 20000) { p.a = .08; p.circle.a = .2;  }
            else if (d < 40000) { p.a = .02; p.circle.a = .07; }
            else                { p.a = 0;   p.circle.a = 0;   }

            if (p.a) p.closest.forEach(q => {
                ctx.beginPath();
                ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y);
                ctx.strokeStyle = `rgba(168,85,247,${p.a * .5})`;
                ctx.lineWidth   = 0.5;
                ctx.stroke();
            });

            if (p.circle.a) {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.circle.r, 0, 2 * Math.PI);
                ctx.fillStyle = `rgba(192,132,252,${p.circle.a})`;
                ctx.fill();
            }
        });
        requestAnimationFrame(frame);
    }

    build();
    frame();

    if (!('ontouchstart' in window)) {
        window.addEventListener('mousemove', e => {
            const r = header.getBoundingClientRect();
            target.x = e.clientX - r.left;
            target.y = e.clientY - r.top;
        });
    }
    window.addEventListener('resize', build);
}

/* ============================================================
   ANIMATED COUNTER
   ============================================================ */
function animateCounter(el, target, duration = 1800) {
    const t0 = performance.now();
    (function step(now) {
        const p = Math.min((now - t0) / duration, 1);
        const e = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.floor(target * e);
        if (p < 1) requestAnimationFrame(step);
    })(t0);
}

/* ============================================================
   GITHUB DATA
   ============================================================ */
const GH = 'jportabellag';

function setStat(id, val) {
    const el = document.getElementById(id);
    if (!el) return;
    const n = parseInt(val, 10);
    isNaN(n) ? (el.textContent = val) : animateCounter(el, n);
}

function lastPage(link) {
    if (!link) return null;
    const m = link.match(/&page=(\d+)>; rel="last"/);
    return m ? +m[1] : null;
}

async function gfetch(url) {
    const r = await fetch(url);
    if (!r.ok) throw new Error(r.status);
    return { data: await r.json(), headers: r.headers };
}

async function repoCommits(name) {
    try {
        const { data, headers } = await gfetch(
            `https://api.github.com/repos/${GH}/${name}/commits?author=${GH}&per_page=1`
        );
        if (!Array.isArray(data) || !data.length) return 0;
        return lastPage(headers.get('link')) || data.length;
    } catch { return 0; }
}

async function loadGithubStats() {
    const { data: repos } = await gfetch(`https://api.github.com/users/${GH}/repos?per_page=100`);
    setStat('repos-count', repos.length);

    const { data: prs } = await gfetch(
        `https://api.github.com/search/issues?q=is:pr+is:merged+author:${GH}`
    );
    setStat('merged-count', prs.total_count);

    const counts = await Promise.all(repos.map(r => repoCommits(r.name)));
    setStat('commits-count', counts.reduce((s, c) => s + c, 0));
}

/* ============================================================
   PROJECTS — list render
   ============================================================ */
async function renderProjects() {
    const container      = document.getElementById('projects');
    const isDesktopPage  = !!document.getElementById('desktop-icons');
    if (!container && !isDesktopPage) return;

    const ALLOWED = ['damm-router', 'gold-coral', 'myportfolio'];

    const PROJECTS_META = {
        'gold-coral': {
            description: 'Minimalist and responsive landing page with a sharp focus on UX and clean CSS design. No dependencies, fast load times and a pixel-perfect layout built to scale for future content and features.',
            topics: ['frontend', 'css', 'landing-page', 'ux', 'responsive'],
            statusLabel: 'Live',
            screenshots: ['img/gold-coral_caratula.png']
        },
        'myportfolio': {
            description: 'Personal portfolio featuring a retro JP/OS desktop interface, particle animation header, live GitHub stats, dark/light theme toggle and a fully responsive mobile layout — all without frameworks.',
            topics: ['portfolio', 'frontend', 'javascript', 'github-api', 'css'],
            statusLabel: 'Live',
            screenshots: ['img/my_page.png']
        },
        'damm-router': {
            description: 'TypeScript router built during a 48h hackathon. Implements dynamic path resolution, configurable routing rules and a modular architecture designed to be extended with middleware and nested routes.',
            topics: ['typescript', 'router', 'hackathon', 'backend'],
            statusLabel: 'Repo',
            screenshots: ['img/damm1.jpeg', 'img/damm2.jpeg']
        }
    };

    const fallback = ALLOWED.map(key => {
        const meta = PROJECTS_META[key];
        return { name: key, language: '', html_url: `https://github.com/${GH}/${key}`, homepage: '', ...meta };
    });

    const tiktok = {
        name: 'TikTok Auto Unfollow',
        language: 'JavaScript',
        description: 'Chrome extension that automates the TikTok unfollow flow with configurable delays, smart filters and batch processing. Published on the Chrome Web Store.',
        html_url: '',
        homepage: 'https://chromewebstore.google.com/detail/tiktok-auto-unfollow/edlbaijpjebfecionlegehagaofhejbn',
        topics: ['chrome-extension', 'automation', 'javascript'],
        statusLabel: 'Published',
        screenshots: []
    };

    let repos = fallback;
    try {
        const { data } = await gfetch(`https://api.github.com/users/${GH}/repos?per_page=100&sort=updated`);
        repos = data
            .filter(r => ALLOWED.includes(r.name.toLowerCase()))
            .map(r => ({ ...r, ...(PROJECTS_META[r.name.toLowerCase()] || {}) }))
            .sort((a, b) => ALLOWED.indexOf(a.name.toLowerCase()) - ALLOWED.indexOf(b.name.toLowerCase()));
    } catch (e) {
        console.error('Projects error:', e);
    }

    repos = [tiktok, ...repos];

    // ── desktop page: OS or mobile depending on screen ──
    if (isDesktopPage) {
        const isMobile = window.matchMedia('(max-width: 768px)').matches;
        if (isMobile) {
            renderMobileProjects(repos);
        } else {
            renderDesktopProjects(repos);
        }
        return;
    }

    // ── normal list page ──
    const layout = container.dataset.layout;
    container.innerHTML = '';

    if (layout === 'list') {
        renderProjectList(container, repos.slice(0, 10));
    } else {
        renderProjectList(container, repos.slice(0, 7));
    }
}

function renderProjectList(container, repos) {
    repos.forEach((repo, i) => {
        const num    = String(i + 1).padStart(2, '0');
        const status = repo.statusLabel || (repo.homepage ? 'Live' : 'Repo');
        const link   = repo.homepage || repo.html_url || '#';
        const icon   = repo.homepage ? 'fa-arrow-up-right' : 'fa-brands fa-github';

        const row = document.createElement('a');
        row.className = 'proj-row reveal reveal-up';
        row.href      = link;
        if (link !== '#') { row.target = '_blank'; row.rel = 'noreferrer'; }
        row.style.transitionDelay = (i * 0.04) + 's';

        row.innerHTML = `
            <span class="proj-n">${num}</span>
            <div class="proj-info">
                <h3>${repo.name}</h3>
                <p>${repo.description || 'Repository on GitHub.'}</p>
            </div>
            <span class="proj-badge">${status}</span>
            <span class="proj-tech">${(repo.language || '').split('/')[0].trim()}</span>
            <span class="proj-arrow"><i class="fa-solid ${icon}"></i></span>
        `;

        container.appendChild(row);
    });

    initRevealAnimations();
}

/* ============================================================
   INIT
   ============================================================ */
async function initGithubData() {
    try { await Promise.all([renderProjects(), loadGithubStats()]); }
    catch (e) {
        console.error('GitHub data error:', e);
        setStat('repos-count', 1);
        setStat('commits-count', 3);
        setStat('merged-count', 0);
    }
}

async function initPage() {
    await Promise.all([
        loadSection('header-slot',   'sections/header.html'),
        loadSection('home-slot',     'sections/home.html'),
        loadSection('aboutme-slot',  'sections/about-me.html'),
        loadSection('services-slot', 'sections/services.html'),
        loadSection('skills-slot',   'sections/skills.html'),
        loadSection('contact-slot',  'sections/contact.html'),
    ]);

    initCustomCursor();
    initRevealAnimations();
    initAnimatedHeader();
    initTypingEffect();
    initGithubData();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initPage().catch(console.error));
} else {
    initPage().catch(console.error);
}

/* ============================================================
   JP/OS — RETRO DESKTOP
   ============================================================ */

let _winZ = 20;
const _openWins = new Map(); // id → { el, tbBtn, minimized }

/* ── file-type resolver ──────────────────────────────────── */
function _fileInfo(repo) {
    const topics = (repo.topics || []).join(' ').toLowerCase();
    const lang   = (repo.language || '').toLowerCase();
    const name   = (repo.name    || '').toLowerCase();

    if (topics.includes('chrome-extension') || name.includes('extension'))
        return { icon:'fa-solid fa-puzzle-piece', color:'#39e58c', ext:'.crx', file:true };
    if (lang.includes('python'))
        return { icon:'fa-brands fa-python',      color:'#b87fff', ext:'.py',  file:true };
    if (lang.includes('html') || lang.includes('css') || lang.includes('javascript') || lang.includes('typescript'))
        return { icon:'fa-solid fa-code',          color:'#d8b4fe', ext:'.html',file:true };
    if (lang.includes('c') && lang.length <= 3)
        return { icon:'fa-solid fa-c',             color:'#7dd3fc', ext:'.c',   file:true };
    if (topics.includes('full-stack') || topics.includes('backend') || topics.includes('flask'))
        return { icon:'fa-solid fa-layer-group',   color:'#ffbd2e', ext:'.app', file:true };
    if (topics.includes('sql') || lang.includes('sql'))
        return { icon:'fa-solid fa-database',      color:'#f472b6', ext:'.db',  file:true };
    return      { icon:'fa-solid fa-folder',       color:'#b87fff', ext:'/',    file:false };
}

/* ── main render entry point ─────────────────────────────── */
function renderDesktopProjects(repos) {
    const col    = document.getElementById('desktop-icons');     // left  — projects
    const sysCol = document.getElementById('desktop-sys-icons'); // right — system
    if (!col) return;

    // ── System icons → right column ──
    const sys = [
        { name:'README.txt',       icon:'fa-solid fa-file-lines',    color:'#e8e0f8', action:'readme' },
        { name:'about_jordi.txt',  icon:'fa-solid fa-user-astronaut', color:'#b87fff', action:'about'  },
        { name:'github.lnk',       icon:'fa-brands fa-github',        color:'#c084fc', action:'github' },
        { name:'task_manager.exe', icon:'fa-solid fa-microchip',      color:'#39e58c', action:'tasks'  },
        { name:'Recycle Bin',      icon:'fa-solid fa-trash-can',      color:'#ff5f57', action:'trash'  },
    ];
    if (sysCol) {
        sys.forEach(s => sysCol.appendChild(_makeIcon(s.icon, s.color, s.name, '', null, s.action, false)));
    }

    // ── Project icons → left 2-col grid ──
    const projLabel = document.createElement('div');
    projLabel.className = 'desktop-section-label';
    projLabel.textContent = 'Projects';
    col.appendChild(projLabel);

    repos.forEach(repo => {
        const fi = _fileInfo(repo);
        col.appendChild(_makeIcon(fi.icon, fi.color, repo.name, fi.ext, repo, null, fi.file));
    });

    // Deselect on desktop background click
    document.getElementById('os-desktop')?.addEventListener('click', () => {
        document.querySelectorAll('.desktop-icon').forEach(d => d.classList.remove('selected'));
    });

    // ── Boot sequence: hide loader then open 2 windows ──
    setTimeout(() => {
        const ld = document.getElementById('desktop-loading');
        if (ld) { ld.classList.add('done'); setTimeout(() => ld.remove(), 600); }

        const desktop = document.getElementById('os-desktop');
        const dw = Math.max(desktop ? desktop.offsetWidth  : 900, 600);
        const dh = Math.max(desktop ? desktop.offsetHeight : 550, 400);

        // Window 1 — README (center-left, appears first)
        setTimeout(() => {
            if (!document.getElementById('sys-readme')) {
                _handleSysIcon('readme');
                const w = document.getElementById('sys-readme');
                if (w) {
                    w.style.left = Math.round(dw * .26) + 'px';
                    w.style.top  = Math.round(dh * .1)  + 'px';
                }
            }
        }, 300);

        // Window 2 — Task Manager (center-right, slight delay for stagger)
        setTimeout(() => {
            if (!document.getElementById('sys-tasks')) {
                _handleSysIcon('tasks');
                const w = document.getElementById('sys-tasks');
                if (w) {
                    w.style.left = Math.round(dw * .52) + 'px';
                    w.style.top  = Math.round(dh * .2)  + 'px';
                }
            }
        }, 700);

    }, 1600);

    initTaskbarClock();
    initDesktopClock();
}

/* ── icon factory ────────────────────────────────────────── */
function _makeIcon(icon, color, name, ext, repo, sysAction, isFile) {
    const div = document.createElement('div');
    div.className = 'desktop-icon';

    const label   = ext ? `${name}${ext}` : name;
    const wrapCls = `di-icon-wrap${isFile ? ' is-file' : ''}`;

    div.innerHTML = `
        <div class="${wrapCls}" style="border-color:${color}44;background:${color}11;color:${color}">
            <i class="${icon}"></i>
        </div>
        <span class="di-label">${label}</span>
    `;

    const isTouchDevice = window.matchMedia('(hover:none)').matches;
    const openEvent     = isTouchDevice ? 'click' : 'dblclick';

    div.addEventListener('click', e => {
        document.querySelectorAll('.desktop-icon').forEach(d => d.classList.remove('selected'));
        div.classList.add('selected');
        e.stopPropagation();
    });
    div.addEventListener(openEvent, () => {
        if (repo)      _openProjectWin(repo);
        else           _handleSysIcon(sysAction);
    });

    return div;
}

/* ── project window ──────────────────────────────────────── */
function _openProjectWin(repo) {
    const fi     = _fileInfo(repo);
    const id     = 'win-' + repo.name.replace(/\W+/g, '-').toLowerCase();
    if (_openWins.has(id)) { _restoreWin(id); return; }

    const status   = repo.statusLabel || (repo.homepage ? 'Live' : 'Repo');
    const ghLink   = repo.html_url  || '';
    const liveLink = repo.homepage  || '';

    const tagsHtml = [
        ...(repo.topics || []).map(t => `<span class="win-tag">${t}</span>`),
        repo.language ? `<span class="win-tag win-tag-lang">${repo.language}</span>` : '',
    ].filter(Boolean).join('');

    const linksHtml = [
        ghLink   ? `<a href="${ghLink}"   target="_blank" rel="noreferrer" class="win-link"><i class="fa-brands fa-github"></i> Source</a>` : '',
        liveLink ? `<a href="${liveLink}" target="_blank" rel="noreferrer" class="win-link win-link-primary"><i class="fa-solid fa-arrow-up-right"></i> Live</a>` : '',
    ].filter(Boolean).join('');

    const shots = repo.screenshots || [];
    const screenshotsHtml = shots.length ? `
        <div class="win-proj-gallery">
            <p class="win-meta" style="margin-bottom:.5rem">// Preview</p>
            <div class="win-gallery-track">
                ${shots.map(src => `<img src="${src}" class="win-gallery-img" alt="screenshot" loading="lazy">`).join('')}
            </div>
        </div>` : '';

    const body = `
        <div class="win-proj-head">
            <h2 class="win-proj-title">${repo.name}</h2>
            <span class="win-proj-status">${status}</span>
        </div>
        <p class="win-proj-desc">${repo.description || 'No description available.'}</p>
        ${screenshotsHtml}
        ${tagsHtml   ? `<div class="win-proj-tags">${tagsHtml}</div>`   : ''}
        ${linksHtml  ? `<div class="win-proj-links">${linksHtml}</div>` : ''}
        ${repo.language ? `<p class="win-meta">// Built with ${repo.language}</p>` : ''}
    `;

    _spawnWindow(id, `${repo.name}${fi.ext}`, fi.icon, fi.color, body);
}

/* ── system icon handler ─────────────────────────────────── */
function _handleSysIcon(action) {
    if (action === 'github') {
        window.open(`https://github.com/${GH}`, '_blank', 'noreferrer');
        return;
    }
    if (action === 'readme') {
        _spawnWindow('sys-readme', 'README.txt', 'fa-solid fa-file-lines', '#e8e0f8', `
            <p class="win-proj-desc">Welcome to JP/OS — a retro portfolio desktop.</p>
            <p class="win-proj-desc">Double-click any project icon on the left to explore it. System files give you quick access to info and social links.</p>
            <div style="border-top:1px solid var(--border);margin:.4rem 0;padding-top:.8rem;display:flex;flex-direction:column;gap:.3rem;">
                <p class="win-meta">// Author&nbsp;&nbsp;&nbsp;: Jordi Portabella</p>
                <p class="win-meta">// Location : Barcelona, Spain</p>
                <p class="win-meta">// Status&nbsp;&nbsp; : Open to work</p>
                <p class="win-meta">// Contact&nbsp; : jportabellag@gmail.com</p>
            </div>
        `);
        return;
    }
    if (action === 'about') {
        _spawnWindow('sys-about', 'about_jordi.txt', 'fa-solid fa-user-astronaut', '#b87fff', `
            <p class="win-proj-desc">Computer Engineer based in Barcelona, passionate about clean code and user-focused design.</p>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:.5rem;margin-top:.3rem;">
                <div style="border:1px solid var(--border);padding:.7rem 1rem;">
                    <p class="win-meta" style="margin-bottom:.35rem;color:var(--purple)">// Education</p>
                    <p class="win-meta">Computer Engineering</p>
                    <p class="win-meta" style="color:var(--subtle)">La Salle Bonanova</p>
                </div>
                <div style="border:1px solid var(--border);padding:.7rem 1rem;">
                    <p class="win-meta" style="margin-bottom:.35rem;color:var(--purple)">// Background</p>
                    <p class="win-meta">Physiotherapy &amp; Imaging</p>
                    <p class="win-meta" style="color:var(--subtle)">Healthcare → Tech</p>
                </div>
            </div>
            <div style="display:flex;gap:.5rem;margin-top:.4rem;">
                <a href="https://linkedin.com/in/jordi-portabella-332478149" target="_blank" rel="noreferrer" class="win-link" style="flex:1;justify-content:center"><i class="fa-brands fa-linkedin"></i> LinkedIn</a>
                <a href="https://instagram.com/jportabella.g" target="_blank" rel="noreferrer" class="win-link" style="flex:1;justify-content:center"><i class="fa-brands fa-instagram"></i> Instagram</a>
            </div>
        `);
        return;
    }
    if (action === 'tasks') {
        _spawnWindow('sys-tasks', 'task_manager.exe', 'fa-solid fa-microchip', '#39e58c', `
            <p class="win-meta" style="margin-bottom:.6rem;color:var(--green)">// Running processes</p>
            ${[
                ['HTML / CSS',      '#f97316', 92],
                ['JavaScript',      '#facc15', 88],
                ['Python / Flask',  '#b87fff', 78],
                ['SQL',             '#f472b6', 70],
                ['C',               '#7dd3fc', 55],
                ['Git / Bash',      '#39e58c', 80],
                ['Chrome APIs',     '#60a5fa', 75],
            ].map(([name, col, pct]) => `
                <div style="display:flex;align-items:center;gap:.6rem;font-size:.66rem;margin-bottom:.45rem;">
                    <span style="color:var(--muted);width:130px;flex-shrink:0">${name}</span>
                    <div style="flex:1;height:4px;background:rgba(255,255,255,.06);position:relative;">
                        <div style="position:absolute;inset:0;width:${pct}%;background:${col};box-shadow:0 0 6px ${col}66;transition:width .6s var(--ease)"></div>
                    </div>
                    <span style="color:${col};width:32px;text-align:right">${pct}%</span>
                </div>
            `).join('')}
            <p class="win-meta" style="margin-top:.6rem;">// CPU: curiosity — RAM: coffee</p>
        `);
        return;
    }
    if (action === 'trash') {
        _spawnWindow('sys-trash', 'Recycle Bin', 'fa-solid fa-trash-can', '#ff5f57', `
            <div style="text-align:center;padding:2rem 0;">
                <i class="fa-solid fa-trash-can" style="font-size:2.4rem;display:block;margin-bottom:1rem;color:var(--border-h)"></i>
                <p class="win-proj-desc" style="text-align:center">Recycle Bin is empty.</p>
                <p class="win-meta" style="margin-top:.4rem">// Nothing to discard yet.</p>
            </div>
        `);
        return;
    }
}

/* ── window spawner ──────────────────────────────────────── */
function _spawnWindow(id, title, icon, color, bodyHtml) {
    if (_openWins.has(id)) { _restoreWin(id); return; }

    const layer = document.getElementById('windows-layer');
    if (!layer) return;

    const win = document.createElement('div');
    win.className = 'os-window';
    win.id = id;
    win.style.cssText = `left:${130+Math.random()*160}px;top:${55+Math.random()*110}px;z-index:${++_winZ}`;
    win.innerHTML = `
        <div class="win-bar">
            <span class="win-bar-icon"><i class="${icon}" style="color:${color}"></i></span>
            <span class="win-title">${title}</span>
            <div class="win-controls">
                <button class="win-ctrl min"   title="Minimise">&#x2212;</button>
                <button class="win-ctrl max"   title="Maximise">&#x25A1;</button>
                <button class="win-ctrl close" title="Close">&#x2715;</button>
            </div>
        </div>
        <div class="win-menubar">
            <span>File</span><span>Edit</span><span>View</span><span>Help</span>
        </div>
        <div class="win-body">${bodyHtml}</div>
    `;

    layer.appendChild(win);
    _makeDraggable(win);
    win.addEventListener('mousedown', () => _toFront(win, id));

    // taskbar button
    const tb = document.getElementById('taskbar-windows');
    const tbBtn = document.createElement('button');
    tbBtn.className = 'tb-win-btn active';
    tbBtn.title     = title;
    tbBtn.innerHTML = `<i class="${icon}" style="color:${color}"></i>${title}`;
    tbBtn.addEventListener('click', () => {
        const s = _openWins.get(id);
        if (!s) return;
        if (s.minimized) {
            win.style.display = 'flex';
            s.minimized = false;
            tbBtn.classList.add('active');
            _toFront(win, id);
        } else if (parseInt(win.style.zIndex) === _winZ) {
            win.style.display = 'none';
            s.minimized = true;
            tbBtn.classList.remove('active');
        } else {
            _toFront(win, id);
        }
    });
    if (tb) tb.appendChild(tbBtn);

    const state = { el:win, tbBtn, minimized:false };
    _openWins.set(id, state);

    // controls
    win.querySelector('.win-ctrl.close').addEventListener('click', e => {
        e.stopPropagation();
        win.remove(); tbBtn.remove(); _openWins.delete(id);
    });
    win.querySelector('.win-ctrl.min').addEventListener('click', e => {
        e.stopPropagation();
        win.style.display = 'none';
        state.minimized = true;
        tbBtn.classList.remove('active');
    });
    win.querySelector('.win-ctrl.max').addEventListener('click', e => {
        e.stopPropagation();
        const tb2 = document.querySelector('.taskbar');
        const tbH = tb2 ? tb2.offsetHeight : 42;
        if (win.dataset.maximized) {
            win.style.cssText = win.dataset.prevCss;
            delete win.dataset.maximized;
            delete win.dataset.prevCss;
        } else {
            win.dataset.prevCss      = win.style.cssText;
            win.dataset.maximized    = '1';
            win.style.cssText = `left:0;top:0;width:100%;height:calc(100% - ${tbH}px);z-index:${++_winZ};max-width:none;border-radius:0;`;
        }
    });
}

/* ── helpers ─────────────────────────────────────────────── */
function _toFront(win, id) {
    win.style.zIndex = ++_winZ;
    _openWins.forEach((s, k) => s.tbBtn.classList.toggle('active', k === id));
}

function _restoreWin(id) {
    const s = _openWins.get(id);
    if (!s) return;
    s.el.style.display = 'flex';
    s.minimized = false;
    s.tbBtn.classList.add('active');
    _toFront(s.el, id);
}

function _makeDraggable(win) {
    const bar = win.querySelector('.win-bar');
    let drag = false, sx, sy, ol, ot;
    bar.addEventListener('mousedown', e => {
        if (e.target.closest('.win-ctrl')) return;
        drag = true; sx = e.clientX; sy = e.clientY;
        ol = win.offsetLeft; ot = win.offsetTop;
        win.style.transition = 'none';
        e.preventDefault();
    });
    document.addEventListener('mousemove', e => {
        if (!drag) return;
        win.style.left = (ol + e.clientX - sx) + 'px';
        win.style.top  = (ot + e.clientY - sy) + 'px';
    });
    document.addEventListener('mouseup', () => { drag = false; });
}

function initTaskbarClock() {
    const el = document.getElementById('tb-clock');
    if (!el) return;
    const tick = () => {
        const d = new Date();
        el.textContent = [d.getHours(), d.getMinutes()]
            .map(n => String(n).padStart(2,'0')).join(':');
    };
    tick();
    setInterval(tick, 10000);
}

/* ── desktop clock widget ──────────────────────────────────── */
function initDesktopClock() {
    const timeEl = document.getElementById('dcw-time');
    const dateEl = document.getElementById('dcw-date');
    if (!timeEl) return;

    const DAYS  = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const MONTHS= ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

    const tick = () => {
        const d = new Date();
        const h = String(d.getHours()).padStart(2,'0');
        const m = String(d.getMinutes()).padStart(2,'0');
        timeEl.textContent = `${h}:${m}`;
        if (dateEl) {
            dateEl.textContent = `${DAYS[d.getDay()]} · ${MONTHS[d.getMonth()]} ${d.getDate()}`;
        }
    };
    tick();
    setInterval(tick, 10000);
}

/* ============================================================
   MOBILE PROJECTS — card list for small screens
   ============================================================ */
function renderMobileProjects(repos) {
    const list = document.getElementById('mobile-proj-list');
    if (!list) return;

    repos.forEach(repo => {
        const fi      = _fileInfo(repo);
        const status  = repo.statusLabel || (repo.homepage ? 'Live' : 'Repo');
        const ghLink  = repo.html_url  || '';
        const liveLink= repo.homepage  || '';
        const lang    = (repo.language || '').split('/')[0].trim();

        const linksHtml = [
            ghLink   ? `<a href="${ghLink}"   target="_blank" rel="noreferrer" class="mp-card-link"><i class="fa-brands fa-github"></i> Source</a>` : '',
            liveLink ? `<a href="${liveLink}" target="_blank" rel="noreferrer" class="mp-card-link mp-card-link-primary"><i class="fa-solid fa-arrow-up-right"></i> Live</a>` : '',
        ].filter(Boolean).join('');

        const shots = repo.screenshots || [];
        const coverHtml = shots.length
            ? `<img src="${shots[0]}" class="mp-card-cover" alt="${repo.name} preview" loading="lazy">`
            : '';

        const card = document.createElement('div');
        card.className = 'mp-card';
        card.innerHTML = `
            ${coverHtml}
            <div class="mp-card-head">
                <h3 class="mp-card-name">${repo.name}</h3>
                <span class="mp-card-badge">${status}</span>
            </div>
            <p class="mp-card-desc">${repo.description || 'Repository on GitHub.'}</p>
            <div class="mp-card-footer">
                <span class="mp-card-tech">${lang}</span>
                <div class="mp-card-links">${linksHtml}</div>
            </div>
        `;
        list.appendChild(card);
    });
}
