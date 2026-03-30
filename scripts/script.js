function changeColor(element) {
    const backcolor = document.querySelector('body');
    if (element.innerText === '🌑') {
        element.innerText = '☀️';
        backcolor.classList.add('body-light');
        backcolor.classList.remove('body-dark');
    } else {
        element.innerText = '🌑';
        backcolor.classList.add('body-dark');
        backcolor.classList.remove('body-light');
    }
}

fetch("https://api.github.com/users/jportabella/repos")
    .then(response => response.json())
    .then(data => {
        const container = document.getElementById("projects");

        data.forEach(repo => {
            const div = document.createElement("div");

            div.classList.add("project-card");

            div.innerHTML = `
                <h5>${repo.name}</h5>
                <p>${repo.description || "No description"}</p>
                <p>${repo.language || ""}</p>
                <a href="${repo.html_url}" target="_blank">GitHub</a>
            `;

            container.appendChild(div);
        });
    });