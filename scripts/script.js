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

// Fetch repos de GitHub y crear tarjetas
fetch("https://api.github.com/users/jportabella/repos")
    .then(response => response.json())
    .then(data => {
        const container = document.getElementById("projects");

        data.forEach(repo => {
            const div = document.createElement("div");

            div.classList.add("card");

            div.innerHTML = `
                <div class="content">
                    <div class="back">
                        <div class="back-content">
                            <strong>${repo.name}</strong>
                        </div>
                    </div>

                    <div class="front">
                        <div class="front-content">
                            <small class="badge">${repo.language || "Code"}</small>

                            <div class="description">
                                <div class="title">
                                    <p><strong>${repo.name}</strong></p>
                                </div>

                                <p>${repo.description || "No description"}</p>

                                <p class="card-footer">
                                    <a href="${repo.html_url}" target="_blank">GitHub</a>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            container.appendChild(div);
        });
    })
    .catch(error => console.error("Error fetching repos:", error));