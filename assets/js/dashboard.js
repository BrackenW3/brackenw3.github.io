document.addEventListener('DOMContentLoaded', () => {
    const repos = [
        'VSCode_Folders',
        'VSCodespace',
        'GH_Models',
        'PyCharms_Projects'
    ];
    const username = 'brackenw3';
    const grid = document.getElementById('project-grid');

    // Fetch repository data
    async function fetchRepoData() {
        grid.innerHTML = ''; // Clear loading

        const promises = repos.map(async (repoName) => {
            try {
                const response = await fetch(`https://api.github.com/repos/${username}/${repoName}`);
                if (!response.ok) {
                    if (response.status === 404) {
                        console.warn(`Repo ${repoName} not found.`);
                        return null;
                    }
                    throw new Error(`Error fetching ${repoName}`);
                }
                return await response.json();
            } catch (error) {
                console.error(error);
                return {
                    name: repoName,
                    description: 'Repository not found or not accessible.',
                    html_url: `https://github.com/${username}/${repoName}`,
                    error: true
                };
            }
        });

        const results = await Promise.all(promises);
        const validRepos = results.filter(repo => repo && !repo.error);

        // Fetch local custom data
        let customProjects = [];
        try {
            const localResponse = await fetch('assets/data/data.json');
            if (localResponse.ok) {
                const localData = await localResponse.json();
                customProjects = localData.projects || [];
            }
        } catch (e) {
            console.log('No local data found or error loading it.', e);
        }

        // Combine GitHub repos and custom projects
        const allProjects = [...customProjects, ...validRepos];

        allProjects.forEach(repo => {
            createRepoCard(repo);
        });

        if (allProjects.length > 0) {
            renderChart(allProjects);
        }

        // Remove loading spinner if results were empty (though we handle specific errors)
        if (allProjects.length === 0) {
            grid.innerHTML = '<div class="col-12 text-center"><p>No repositories found.</p></div>';
        }
    }

    function renderChart(repos) {
        const ctx = document.getElementById('repoChart');
        if (!ctx) return; // Guard clause in case element is missing

        const names = repos.map(r => r.name);
        const stars = repos.map(r => r.stargazers_count);
        const forks = repos.map(r => r.forks_count);

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: names,
                datasets: [
                    {
                        label: 'Stars',
                        data: stars,
                        backgroundColor: 'rgba(54, 162, 235, 0.7)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 1
                    },
                    {
                        label: 'Forks',
                        data: forks,
                        backgroundColor: 'rgba(255, 99, 132, 0.7)',
                        borderColor: 'rgba(255, 99, 132, 1)',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Repository Engagement (Stars & Forks)'
                    },
                    legend: {
                        position: 'bottom'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { stepSize: 1 }
                    }
                }
            }
        });
    }

    function createRepoCard(repo) {
        const col = document.createElement('div');
        col.className = 'col';

        const langBadge = repo.language
            ? `<span class="badge bg-secondary mb-2">${repo.language}</span>`
            : '';

        const description = repo.description || 'No description provided.';
        const stars = repo.stargazers_count !== undefined
            ? `<small class="text-muted"><i class="fas fa-star text-warning"></i> ${repo.stargazers_count}</small>`
            : '';

        const cardHtml = `
            <div class="card h-100 shadow-sm hover-card">
                <div class="card-body d-flex flex-column">
                    <div class="d-flex justify-content-between align-items-start">
                        <h5 class="card-title text-primary">${repo.name}</h5>
                        ${stars}
                    </div>
                    ${langBadge}
                    <p class="card-text flex-grow-1">${description}</p>
                    <div class="mt-3">
                        <button class="btn btn-outline-primary btn-sm view-readme" data-repo="${repo.name}">
                            <i class="fas fa-book-open"></i> View Details
                        </button>
                        <a href="${repo.html_url}" target="_blank" class="btn btn-dark btn-sm">
                            <i class="fab fa-github"></i> Source
                        </a>
                    </div>
                </div>
            </div>
        `;

        // Sanitize the HTML before inserting
        col.innerHTML = DOMPurify.sanitize(cardHtml, { ADD_ATTR: ['target'] });
        grid.appendChild(col);
    }

    // Event delegation for Readme buttons
    grid.addEventListener('click', async (e) => {
        if (e.target.closest('.view-readme')) {
            const btn = e.target.closest('.view-readme');
            const repoName = btn.getAttribute('data-repo');
            await openReadmeModal(repoName);
        }
    });

    const modalElement = document.getElementById('readmeModal');
    const modalBody = document.getElementById('readmeModalBody');
    const modalLabel = document.getElementById('readmeModalLabel');
    const repoLinkBtn = document.getElementById('repoLink');
    const bsModal = new bootstrap.Modal(modalElement);

    async function openReadmeModal(repoName) {
        modalLabel.textContent = `${repoName} - README`;
        modalBody.innerHTML = '<div class="text-center"><div class="spinner-border text-primary" role="status"></div></div>';
        repoLinkBtn.href = `https://github.com/${username}/${repoName}`;

        bsModal.show();

        try {
            // Fetch the README specific endpoint
            const response = await fetch(`https://api.github.com/repos/${username}/${repoName}/readme`);
            if (!response.ok) throw new Error('Readme not found');

            const data = await response.json();
            // content is base64 encoded
            // We can also use download_url, which is the raw file
            const downloadUrl = data.download_url;

            const rawResponse = await fetch(downloadUrl);
            const markdown = await rawResponse.text();

            // Render Markdown
            const html = marked.parse(markdown);
            // Sanitize
            const cleanHtml = DOMPurify.sanitize(html);

            modalBody.innerHTML = cleanHtml;

        } catch (error) {
            console.error(error);
            modalBody.innerHTML = `<div class="alert alert-warning">
                Unable to load README. It might be missing or empty.<br>
                <a href="https://github.com/${username}/${repoName}" target="_blank">View on GitHub</a>
            </div>`;
        }
    }

    // Initialize
    fetchRepoData();
});
