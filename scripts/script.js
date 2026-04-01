async function loadSection(slotId, url) {
    const slot = document.getElementById(slotId);
    if (!slot) {
        return;
    }

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to load ${url}: ${response.status}`);
    }

    const html = await response.text();
    const template = document.createElement("template");
    template.innerHTML = html;

    const scripts = Array.from(template.content.querySelectorAll("script"));
    scripts.forEach((script) => script.remove());

    slot.replaceChildren(template.content.cloneNode(true));

    for (const script of scripts) {
        const scriptElement = document.createElement("script");
        scriptElement.async = false;

        for (const attribute of script.attributes) {
            scriptElement.setAttribute(attribute.name, attribute.value);
        }

        if (!script.src) {
            scriptElement.textContent = script.textContent;
        }

        document.body.appendChild(scriptElement);
    }
}



function changeColor(element) {
    const body = document.body;
    const isLight = body.classList.toggle("body-light");
    body.classList.toggle("body-dark", !isLight);
    element.classList.toggle("is-light", isLight);
    if (typeof window.setGlobeTheme === "function") {
        window.setGlobeTheme(isLight);
    }
}

function initRevealAnimations() {
    const revealElements = document.querySelectorAll(".reveal");
    if (!revealElements.length) {
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
            } else {
                entry.target.classList.remove("is-visible");
            }
        });
    }, {
        threshold: 0.2,
        rootMargin: "0px 0px -18% 0px"
    });

    revealElements.forEach(element => observer.observe(element));
}

function initAnimatedHeader() {
    let width;
    let height;
    const largeHeader = document.getElementById("large-header");
    const canvas = document.getElementById("demo-canvas");
    const ctx = canvas ? canvas.getContext("2d") : null;
    let points = [];
    let target;

    if (!largeHeader || !canvas || !ctx) {
        return;
    }

    function getDistance(p1, p2) {
        return Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2);
    }

    function createCircle(point) {
        return {
            point,
            radius: 2 + Math.random() * 2,
            active: 0
        };
    }

    function initHeader() {
        width = window.innerWidth;
        height = window.innerHeight;
        target = { x: width / 2, y: height / 2 };

        largeHeader.style.width = `${width}px`;
        largeHeader.style.height = `${height}px`;
        canvas.width = width;
        canvas.height = height;
        points = [];

        for (let x = 0; x < width; x += width / 20) {
            for (let y = 0; y < height; y += height / 20) {
                const px = x + Math.random() * (width / 20);
                const py = y + Math.random() * (height / 20);
                const point = {
                    x: px,
                    y: py,
                    originX: px,
                    originY: py,
                    targetX: px,
                    targetY: py,
                    active: 0
                };
                points.push(point);
            }
        }

        points.forEach((point) => {
            const closest = [];

            points.forEach((candidate) => {
                if (point === candidate) {
                    return;
                }

                if (closest.length < 5) {
                    closest.push(candidate);
                    return;
                }

                let farthestIndex = 0;
                for (let i = 1; i < closest.length; i += 1) {
                    if (getDistance(point, closest[i]) > getDistance(point, closest[farthestIndex])) {
                        farthestIndex = i;
                    }
                }

                if (getDistance(point, candidate) < getDistance(point, closest[farthestIndex])) {
                    closest[farthestIndex] = candidate;
                }
            });

            point.closest = closest;
            point.circle = createCircle(point);
        });
    }

    function shiftTargets() {
        points.forEach((point) => {
            point.targetX = point.originX - 50 + Math.random() * 100;
            point.targetY = point.originY - 50 + Math.random() * 100;
        });
    }

    function movePoints() {
        points.forEach((point) => {
            point.x += (point.targetX - point.x) * 0.015;
            point.y += (point.targetY - point.y) * 0.015;

            if (Math.abs(point.targetX - point.x) < 1 && Math.abs(point.targetY - point.y) < 1) {
                point.targetX = point.originX - 50 + Math.random() * 100;
                point.targetY = point.originY - 50 + Math.random() * 100;
            }
        });
    }

    function drawLines(point) {
        if (!point.active) {
            return;
        }

        point.closest.forEach((closePoint) => {
            ctx.beginPath();
            ctx.moveTo(point.x, point.y);
            ctx.lineTo(closePoint.x, closePoint.y);
            ctx.strokeStyle = `rgba(156, 217, 249, ${point.active})`;
            ctx.stroke();
        });
    }

    function drawCircle(circle) {
        if (!circle.active) {
            return;
        }

        ctx.beginPath();
        ctx.arc(circle.point.x, circle.point.y, circle.radius, 0, 2 * Math.PI, false);
        ctx.fillStyle = `rgba(156, 217, 249, ${circle.active})`;
        ctx.fill();
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        movePoints();

        points.forEach((point) => {
            const distance = getDistance(target, point);

            if (distance < 4000) {
                point.active = 0.3;
                point.circle.active = 0.6;
            } else if (distance < 20000) {
                point.active = 0.1;
                point.circle.active = 0.3;
            } else if (distance < 40000) {
                point.active = 0.02;
                point.circle.active = 0.1;
            } else {
                point.active = 0;
                point.circle.active = 0;
            }

            drawLines(point);
            drawCircle(point.circle);
        });

        requestAnimationFrame(animate);
    }

    function handleMouseMove(event) {
        const rect = largeHeader.getBoundingClientRect();
        target.x = event.clientX - rect.left;
        target.y = event.clientY - rect.top;
    }

    function handleResize() {
        initHeader();
    }

    initHeader();
    shiftTargets();
    animate();

    if (!("ontouchstart" in window)) {
        window.addEventListener("mousemove", handleMouseMove);
    }
    window.addEventListener("resize", handleResize);
}

const GITHUB_USERNAME = "jportabellag";

function updateStat(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value;
    }
}

function parseLastPage(linkHeader) {
    if (!linkHeader) {
        return null;
    }

    const match = linkHeader.match(/&page=(\d+)>; rel="last"/);
    return match ? Number(match[1]) : null;
}

async function fetchJson(url, options = {}) {
    const response = await fetch(url, options);

    if (!response.ok) {
        throw new Error(`GitHub request failed: ${response.status}`);
    }

    return response.json();
}

async function renderProjects() {
    const container = document.getElementById("projects");
    if (!container) {
        return;
    }

    const privateProjects = [
        {
            name: "TikTok Auto Unfollow",
            language: "Chrome Extension / HTML / JavaScript",
            description: "Private Chrome extension built to automate the TikTok unfollow flow from the browser, with configurable delays, max actions, optional friend filtering and scripted interaction over the following modal.",
            html_url: "",
            homepage: "https://chromewebstore.google.com/detail/tiktok-auto-unfollow/edlbaijpjebfecionlegehagaofhejbn",
            topics: ["chrome-extension", "automation", "private-build"],
            statusLabel: "Published Extension",
            primaryActionLabel: "Chrome Web Store"
        }
    ];

    const fallbackProjects = [
        {
            name: "Portfolio Website",
            language: "HTML / CSS / JavaScript",
            description: "Personal portfolio focused on clean layout, motion, GitHub integration and interactive visuals.",
            html_url: `https://github.com/${GITHUB_USERNAME}`,
            homepage: "",
            topics: ["frontend", "portfolio", "ui"]
        },
        {
            name: "CS50 Projects",
            language: "Python / Flask / SQL",
            description: "Collection of course projects exploring backend logic, databases and full-stack development fundamentals.",
            html_url: `https://github.com/${GITHUB_USERNAME}`,
            homepage: "",
            topics: ["full-stack", "python", "sql"]
        }
    ];
    const layout = container.dataset.layout;

    container.innerHTML = "";

    let repos = fallbackProjects;

    try {
        const githubRepos = await fetchJson(`https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&sort=updated`);
        repos = privateProjects.concat(githubRepos.filter(repo => !repo.fork));
    } catch (error) {
        console.error("Error loading projects:", error);
        repos = privateProjects.concat(fallbackProjects);
    }

    if (layout === "showcase") {
        renderProjectsCarousel(container, repos.slice(0, 7));
        return;
    }

    repos.forEach(repo => {
        const div = document.createElement("div");
        div.classList.add("project-card");
        div.innerHTML = `
            <h5>${repo.name}</h5>
            <p>${repo.description || "No description"}</p>
            <p>${repo.language || ""}</p>
            <a href="${repo.html_url}" target="_blank" rel="noreferrer">GitHub</a>
        `;
        container.appendChild(div);
    });
}

function renderProjectsCarousel(container, repos) {
    if (!repos.length) {
        return;
    }

    let activeIndex = 0;
    const wrapper = document.createElement("div");
    wrapper.className = "projects-carousel reveal reveal-up is-visible";
    wrapper.innerHTML = `
        <button class="projects-carousel-control projects-carousel-prev" type="button" aria-label="Previous project">
            <i class="fa-solid fa-arrow-left"></i>
        </button>
        <div class="projects-carousel-stage" aria-live="polite"></div>
        <button class="projects-carousel-control projects-carousel-next" type="button" aria-label="Next project">
            <i class="fa-solid fa-arrow-right"></i>
        </button>
    `;

    const stage = wrapper.querySelector(".projects-carousel-stage");
    const cards = repos.map((repo, index) => {
        const tech = repo.language || "Codebase";
        const scope = repo.topics && repo.topics.length ? repo.topics.slice(0, 3).join(" / ") : "Personal Project";
        const coverImage = getProjectCoverImage(repo);
        const detailsAction = repo.html_url
            ? `<a class="project-action" href="${repo.html_url}" target="_blank" rel="noreferrer">More Details</a>`
            : `<span class="project-action project-action-muted">Private Project</span>`;
        const repoAction = repo.html_url
            ? `<a class="project-action" href="${repo.html_url}" target="_blank" rel="noreferrer">
                            <i class="fa-brands fa-github"></i>
                            GitHub
                        </a>`
            : "";
        const liveAction = repo.homepage
            ? `<a class="project-action project-action-primary" href="${repo.homepage}" target="_blank" rel="noreferrer">${repo.primaryActionLabel || "Live Site"}</a>`
            : "";

        const card = document.createElement("article");
        card.className = "project-carousel-card";
        card.dataset.index = String(index);
        card.innerHTML = `
            <div class="project-carousel-surface">
                <div class="project-carousel-visual${coverImage ? " has-cover" : ""}"${coverImage ? ` style="background-image: linear-gradient(180deg, rgba(8, 10, 16, 0.18), rgba(8, 10, 16, 0.82)), url('${coverImage}');"` : ""}>
                    <span class="project-preview-kicker">Featured repository</span>
                    <h3>${repo.name}</h3>
                    <p>${tech}</p>
                </div>
                <div class="project-carousel-copy">
                    <div class="project-carousel-header">
                        <h2>${repo.name}</h2>
                        <span class="project-carousel-tech">${tech}</span>
                    </div>
                    <div class="project-meta">
                        <div>
                            <span class="project-meta-label">Scope</span>
                            <p>${scope}</p>
                        </div>
                        <div>
                            <span class="project-meta-label">Status</span>
                            <p>${repo.statusLabel || (repo.homepage ? "Live" : "Repository")}</p>
                        </div>
                    </div>
                    <p class="project-description">${repo.description || "Repository published on GitHub with ongoing work, documentation and source code."}</p>
                    <div class="project-actions">
                        ${detailsAction}
                        ${repoAction}
                        ${liveAction}
                    </div>
                </div>
            </div>
        `;

        card.addEventListener("click", () => {
            if (index === activeIndex) {
                return;
            }

            activeIndex = index;
            updateCarousel();
        });

        stage.appendChild(card);
        return card;
    });

    function getWrappedDelta(index) {
        const total = repos.length;
        let delta = index - activeIndex;

        if (delta > total / 2) {
            delta -= total;
        } else if (delta < -total / 2) {
            delta += total;
        }

        return delta;
    }

    function updateCarousel() {
        cards.forEach((card, index) => {
            const delta = getWrappedDelta(index);
            card.classList.remove("is-active", "is-left-1", "is-left-2", "is-right-1", "is-right-2", "is-hidden");

            if (delta === 0) {
                card.classList.add("is-active");
            } else if (delta === -1) {
                card.classList.add("is-left-1");
            } else if (delta === -2) {
                card.classList.add("is-left-2");
            } else if (delta === 1) {
                card.classList.add("is-right-1");
            } else if (delta === 2) {
                card.classList.add("is-right-2");
            } else {
                card.classList.add("is-hidden");
            }
        });
    }

    wrapper.querySelector(".projects-carousel-prev").addEventListener("click", () => {
        activeIndex = (activeIndex - 1 + repos.length) % repos.length;
        updateCarousel();
    });

    wrapper.querySelector(".projects-carousel-next").addEventListener("click", () => {
        activeIndex = (activeIndex + 1) % repos.length;
        updateCarousel();
    });

    container.appendChild(wrapper);
    updateCarousel();
}

function getProjectCoverImage(repo) {
    const repoName = (repo.name || "").toLowerCase();
    const homepage = (repo.homepage || "").toLowerCase();
    const description = (repo.description || "").toLowerCase();

    if (
        repoName.includes("gold coral") ||
        repoName.includes("gold-coral") ||
        homepage.includes("goldcoral.vip") ||
        description.includes("gold coral")
    ) {
        return "img/gold-coral_caratula.png";
    }

    return "";
}

async function fetchRepoCommitCount(repoName) {
    const response = await fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${repoName}/commits?author=${GITHUB_USERNAME}&per_page=1`);

    if (!response.ok) {
        return 0;
    }

    const commits = await response.json();
    if (!Array.isArray(commits) || commits.length === 0) {
        return 0;
    }

    const lastPage = parseLastPage(response.headers.get("link"));
    return lastPage || commits.length;
}

async function renderGithubStats() {
    const repos = await fetchJson(`https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100`);
    updateStat("repos-count", repos.length);

    const mergedData = await fetchJson(
        `https://api.github.com/search/issues?q=is:pr+is:merged+author:${GITHUB_USERNAME}`
    );
    updateStat("merged-count", mergedData.total_count);

    const commitCounts = await Promise.all(
        repos.map(repo => fetchRepoCommitCount(repo.name))
    );
    const totalCommits = commitCounts.reduce((sum, count) => sum + count, 0);
    updateStat("commits-count", totalCommits);
}

async function initGithubData() {
    try {
        await Promise.all([
            renderProjects(),
            renderGithubStats()
        ]);
    } catch (error) {
        console.error("Error loading GitHub data:", error);
        updateStat("repos-count", "1");
        updateStat("commits-count", "3");
        updateStat("merged-count", "0");
    }
}

async function initPage() {
    await Promise.all([
        loadSection("header-slot", "sections/header.html"),
        loadSection("home-slot", "sections/home.html"),
        loadSection("aboutme-slot", "sections/about-me.html"),
        loadSection("skills-slot", "sections/skills.html")
    ]);

    initGithubData();
    initRevealAnimations();
    initAnimatedHeader();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
        initPage().catch((error) => {
            console.error("Error initializing page:", error);
        });
    });
} else {
    initPage().catch((error) => {
        console.error("Error initializing page:", error);
    });
}
