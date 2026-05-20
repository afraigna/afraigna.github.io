const GITHUB_USER = 'afraigna';
const API_BASE = 'https://api.github.com';

// Couleurs officielles GitHub par langage
const LANG_COLORS = {
  JavaScript: '#f1e05a', TypeScript: '#3178c6', Python: '#3572A5',
  HTML: '#e34c26', CSS: '#563d7c', SCSS: '#c6538c', Vue: '#41b883',
  React: '#61dafb', Svelte: '#ff3e00', Go: '#00ADD8', Rust: '#dea584',
  Java: '#b07219', 'C#': '#239120', 'C++': '#f34b7d', C: '#555555',
  PHP: '#4F5D95', Ruby: '#701516', Swift: '#F05138', Kotlin: '#A97BFF',
  Shell: '#89e051', Dockerfile: '#384d54', Lua: '#000080', R: '#198CE7',
  Dart: '#00B4AB', Elixir: '#6e4a7e', Haskell: '#5e5086', Nix: '#7e7eff',
};

function getLangColor(lang) {
  return LANG_COLORS[lang] ?? '#8b949e';
}

async function apiFetch(url) {
  const res = await fetch(url, { headers: { Accept: 'application/vnd.github+json' } });
  if (!res.ok) throw new Error(`HTTP ${res.status} — ${url}`);
  return res.json();
}

async function fetchRepos() {
  const repos = await apiFetch(
    `${API_BASE}/users/${GITHUB_USER}/repos?sort=updated&per_page=100&type=public`
  );
  return repos.filter(r => r.name !== `${GITHUB_USER}.github.io` && !r.private && !r.fork);
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days < 1) return "aujourd'hui";
  if (days === 1) return 'hier';
  if (days < 30) return `il y a ${days}j`;
  const months = Math.floor(days / 30);
  if (months < 12) return `il y a ${months} mois`;
  const years = Math.floor(months / 12);
  return `il y a ${years} an${years > 1 ? 's' : ''}`;
}

function buildLangBar(languages, cls = '') {
  const total = Object.values(languages).reduce((a, b) => a + b, 0);
  if (total === 0) return '';

  const segments = Object.entries(languages)
    .sort((a, b) => b[1] - a[1])
    .map(([lang, bytes]) => {
      const pct = ((bytes / total) * 100).toFixed(1);
      return `<span class="lang-segment" style="flex:${pct};background:${getLangColor(lang)}" title="${lang} ${pct}%"></span>`;
    }).join('');

  const legend = Object.entries(languages)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([lang, bytes]) => {
      const pct = ((bytes / total) * 100).toFixed(1);
      return `<span class="lang-legend-item">
        <span class="lang-legend-dot" style="background:${getLangColor(lang)}"></span>
        ${lang} <strong>${pct}%</strong>
      </span>`;
    }).join('');

  return `
    <div class="lang-bar ${cls}">${segments}</div>
    <div class="lang-legend">${legend}</div>
  `;
}

function buildCard(repo) {
  const lang = repo.language;
  const langDot = lang
    ? `<span class="meta-item"><span class="lang-dot" style="background:${getLangColor(lang)}"></span>${lang}</span>`
    : '';

  const stars = repo.stargazers_count > 0
    ? `<span class="meta-item">⭐ ${repo.stargazers_count}</span>`
    : '';

  const updated = `<span class="meta-item" title="${new Date(repo.updated_at).toLocaleDateString('fr-FR')}">Mis à jour ${timeAgo(repo.updated_at)}</span>`;

  const topics = repo.topics?.length
    ? `<div class="card-topics">${repo.topics.map(t => `<span class="topic">${t}</span>`).join('')}</div>`
    : '';

  const forkBadge = repo.fork ? '<span class="card-fork-badge">fork</span>' : '';

  const demoBtn = repo.homepage
    ? `<a href="${repo.homepage}" target="_blank" rel="noopener noreferrer" class="btn btn-primary" aria-label="Accéder à l'application ${repo.name}">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
        Accéder
      </a>`
    : '';

  return `
    <article class="card" data-repo="${repo.name}">
      <div class="card-header">
        <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer" class="card-name">${repo.name}</a>
        ${forkBadge}
      </div>
      <p class="card-desc${!repo.description ? ' empty' : ''}">${repo.description ?? 'Aucune description'}</p>
      ${topics}
      <div class="card-meta">
        ${langDot}${stars}${updated}
      </div>
      <div class="card-actions">
        <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer" class="btn btn-outline">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
          Code
        </a>
        ${demoBtn}
        <button class="btn btn-ghost" onclick="openModal('${repo.name}')" aria-label="Lire le README de ${repo.name}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
          README
        </button>
      </div>
    </article>
  `;
}

// ===== MODAL =====
const overlay = document.getElementById('modal-overlay');
const modalTitle = document.getElementById('modal-title');
const modalBody = document.getElementById('modal-body');
const modalLangBar = document.getElementById('modal-lang-bar');

document.getElementById('modal-close').addEventListener('click', closeModal);
overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

function closeModal() {
  overlay.hidden = true;
  document.body.style.overflow = '';
}

async function openModal(repoName) {
  modalTitle.textContent = repoName;
  modalBody.innerHTML = `<div class="modal-loading"><span class="spinner"></span> Chargement du README…</div>`;
  modalLangBar.innerHTML = '';
  overlay.hidden = false;
  document.body.style.overflow = 'hidden';

  const [readmeResult, langsResult] = await Promise.allSettled([
    apiFetch(`${API_BASE}/repos/${GITHUB_USER}/${repoName}/readme`),
    apiFetch(`${API_BASE}/repos/${GITHUB_USER}/${repoName}/languages`),
  ]);

  if (langsResult.status === 'fulfilled') {
    modalLangBar.innerHTML = buildLangBar(langsResult.value, 'lg');
  }

  if (readmeResult.status === 'fulfilled') {
    const markdown = decodeURIComponent(
      atob(readmeResult.value.content.replace(/\n/g, ''))
        .split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
    );
    modalBody.innerHTML = marked.parse(markdown);
    // Sécurité : ouvrir tous les liens du README dans un nouvel onglet
    modalBody.querySelectorAll('a').forEach(a => {
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
    });
  } else {
    modalBody.innerHTML = `<p style="color:var(--text-muted);font-style:italic">Aucun README disponible pour ce projet.</p>`;
  }
}

// ===== INIT =====
async function init() {
  const statusEl = document.getElementById('status');
  const grid = document.getElementById('projects-grid');

  try {
    const repos = await fetchRepos();
    statusEl.classList.add('hidden');

    if (repos.length === 0) {
      grid.innerHTML = `<p style="color:var(--text-muted)">Aucun repo public trouvé.</p>`;
      return;
    }

    grid.innerHTML = repos.map(buildCard).join('');
  } catch (err) {
    statusEl.classList.add('error');
    statusEl.innerHTML = `⚠ Impossible de charger les projets (${err.message}). Vérifiez votre connexion ou réessayez.`;
    console.error(err);
  }
}

init();
