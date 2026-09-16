// Catalog Logic: 100vw Vertical & Horizontal Filtering
let allVideos = [];
let categories = [];
let activeCat = 'all';
let activeSub = 'all';
let activeEra = 'all';
let activeLength = 'all';
let activeTag = null;
let searchQuery = '';
let sortBy = 'views';
let currentPage = 1;
const PAGE_SIZE = 48;

async function initCatalog() {
  categories = await API.getCategories();
  allVideos = await API.getVideos();

  // Read URL params (e.g. catalog.html?cat=debates&sub=deb_sobolev)
  const params = new URLSearchParams(window.location.search);
  if (params.get('cat')) activeCat = params.get('cat');
  if (params.get('sub')) activeSub = params.get('sub');
  if (params.get('era')) activeEra = params.get('era');
  if (params.get('q')) {
    searchQuery = params.get('q');
    const input = document.getElementById('catalogSearch');
    if (input) input.value = searchQuery;
  }

  renderSidebarCategories();
  renderTopRibbon();
  applyFilters();

  // Setup search input
  const searchInput = document.getElementById('catalogSearch');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim().toLowerCase();
      currentPage = 1;
      applyFilters();
    });
  }

  // Setup sort select
  const sortSelect = document.getElementById('sortSelect');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      sortBy = e.target.value;
      applyFilters();
    });
  }

  // Mobile sidebar toggle
  const btnToggleSidebar = document.getElementById('btnToggleSidebar');
  const sidebar = document.getElementById('catalogSidebar');
  if (btnToggleSidebar && sidebar) {
    btnToggleSidebar.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
  }
}

function renderSidebarCategories() {
  const container = document.getElementById('sidebarCatList');
  if (!container) return;

  const totalCount = allVideos.length;
  let html = `
    <div class="sidebar-item ${activeCat === 'all' ? 'active' : ''}" onclick="selectCategory('all')">
      <div class="sidebar-item-label">
        <span>🌟</span>
        <span>Все видеоархивы</span>
      </div>
      <span class="sidebar-count">${totalCount}</span>
    </div>
  `;

  categories.forEach(c => {
    const isActive = activeCat === c.id;
    html += `
      <div class="sidebar-item ${isActive ? 'active' : ''}" onclick="selectCategory('${c.id}')">
        <div class="sidebar-item-label">
          <span>${c.icon}</span>
          <span title="${c.name}">${c.name}</span>
        </div>
        <span class="sidebar-count">${c.count}</span>
      </div>
    `;
  });

  container.innerHTML = html;
}

function renderTopRibbon() {
  const ribbon = document.getElementById('subcatRibbon');
  if (!ribbon) return;

  let subs = [];
  if (activeCat === 'all') {
    subs = [
      { id: 'all', name: 'Все материалы' },
      { id: 'popular', name: '🔥 Самые просматриваемые' },
      { id: 'long', name: '⏳ Большие эфиры (>1.5ч)' },
      { id: 'classic', name: '📜 Старая школа (2014-2017)' },
      { id: 'baza', name: '💎 Записи клуба «База»' }
    ];
  } else {
    const cat = categories.find(c => c.id === activeCat);
    if (cat && cat.subcategories) {
      subs = cat.subcategories;
    }
  }

  let html = '';
  subs.forEach(s => {
    const isActive = activeSub === s.id;
    html += `
      <button class="ribbon-pill ${isActive ? 'active' : ''}" onclick="selectSubcategory('${s.id}')">
        ${s.name}
      </button>
    `;
  });

  ribbon.innerHTML = html;
}

function selectCategory(catId) {
  activeCat = catId;
  activeSub = 'all';
  activeTag = null;
  currentPage = 1;
  renderSidebarCategories();
  renderTopRibbon();
  applyFilters();

  // Close mobile sidebar if open
  const sidebar = document.getElementById('catalogSidebar');
  if (sidebar) sidebar.classList.remove('open');
}

function selectSubcategory(subId) {
  activeSub = subId;
  currentPage = 1;
  renderTopRibbon();
  applyFilters();
}

function selectEra(eraId) {
  activeEra = activeEra === eraId ? 'all' : eraId;
  document.querySelectorAll('.era-item').forEach(el => {
    el.classList.toggle('active', el.dataset.era === activeEra);
  });
  currentPage = 1;
  applyFilters();
}

function selectTag(tag) {
  activeTag = activeTag === tag ? null : tag;
  document.querySelectorAll('.tag-chip').forEach(el => {
    el.classList.toggle('active', el.textContent === activeTag);
  });
  currentPage = 1;
  applyFilters();
}

function applyFilters() {
  let filtered = allVideos.slice();

  // Category filter
  if (activeCat !== 'all') {
    filtered = filtered.filter(v => v.catId === activeCat);
  }

  // Subcategory filter
  if (activeSub !== 'all') {
    if (activeCat === 'all') {
      if (activeSub === 'popular') filtered.sort((a,b) => (b.views || 0) - (a.views || 0));
      else if (activeSub === 'long') filtered = filtered.filter(v => v.lengthType === 'long');
      else if (activeSub === 'classic') filtered = filtered.filter(v => v.year <= 2017);
      else if (activeSub === 'baza') filtered = filtered.filter(v => v.title.toLowerCase().includes('база') || v.tags.includes('#база'));
    } else {
      filtered = filtered.filter(v => v.subId === activeSub);
    }
  }

  // Era filter
  if (activeEra !== 'all') {
    filtered = filtered.filter(v => v.eraId === activeEra);
  }

  // Tag filter
  if (activeTag) {
    filtered = filtered.filter(v => v.tags && v.tags.includes(activeTag));
  }

  // Search query
  if (searchQuery) {
    filtered = filtered.filter(v => {
      const full = (v.title + ' ' + (v.channel || '') + ' ' + (v.tags || []).join(' ')).toLowerCase();
      return full.includes(searchQuery);
    });
  }

  // Sort
  if (sortBy === 'views') {
    filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
  } else if (sortBy === 'newest') {
    filtered.sort((a, b) => (b.year || 0) - (a.year || 0));
  } else if (sortBy === 'duration') {
    filtered.sort((a, b) => (b.duration || 0) - (a.duration || 0));
  } else if (sortBy === 'title') {
    filtered.sort((a, b) => a.title.localeCompare(b.title));
  }

  // Update counter
  const counterEl = document.getElementById('resultsCounter');
  if (counterEl) {
    counterEl.innerHTML = `Найдено видео: <strong>${filtered.length}</strong>`;
  }

  renderVideoGrid(filtered);
}

function renderVideoGrid(videos) {
  const grid = document.getElementById('catalogGrid');
  if (!grid) return;

  if (videos.length === 0) {
    grid.innerHTML = `
      <div class="catalog-empty">
        <div class="empty-icon">🔍</div>
        <h3>Ничего не найдено</h3>
        <p>Попробуйте сбросить фильтры или ввести другой поисковый запрос</p>
        <button class="btn btn-secondary" style="margin-top: 14px;" onclick="resetAllFilters()">Сбросить фильтры</button>
      </div>
    `;
    return;
  }

  const paged = videos.slice(0, currentPage * PAGE_SIZE);

  let html = '';
  paged.forEach(v => {
    const isFav = Storage.isFavorite(v.id);
    const thumbUrl = `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`;

    html += `
      <div class="video-card" id="card-${v.id}">
        <div class="card-thumb-wrap">
          <img class="card-thumb" src="${thumbUrl}" alt="${v.title}" loading="lazy" onerror="this.src='https://i.ytimg.com/vi/${v.id}/mqdefault.jpg'">
          <div class="thumb-overlay">
            <div class="card-badges-top">
              <span class="badge" style="background: ${v.badgeColor}22; color: ${v.badgeColor}; border: 1px solid ${v.badgeColor}55;">
                ${v.catIcon} ${v.catName}
              </span>
              ${v.durationFormatted ? `<span class="card-dur-badge">${v.durationFormatted}</span>` : ''}
            </div>
          </div>
        </div>
        <div class="card-body">
          <h4 class="card-title" title="${v.title}">${v.title}</h4>
          <div class="card-meta">
            <span>📅 ${v.year} год</span>
            ${v.viewsFormatted ? `<span>👁️ ${v.viewsFormatted}</span>` : ''}
          </div>
        </div>
        <div class="card-actions">
          <a href="watch.html?v=${v.id}" class="btn-play-card">
            <span>▶️</span> Смотреть
          </a>
          <button class="btn-fav-card ${isFav ? 'active' : ''}" onclick="toggleFav('${v.id}')" title="В избранное">
            ${isFav ? '❤️' : '🤍'}
          </button>
        </div>
      </div>
    `;
  });

  if (paged.length < videos.length) {
    html += `
      <div style="grid-column: 1 / -1; text-align: center; padding: 20px;">
        <button class="btn btn-secondary" onclick="loadMore()">Показать ещё (${videos.length - paged.length})</button>
      </div>
    `;
  }

  grid.innerHTML = html;
}

function loadMore() {
  currentPage++;
  applyFilters();
}

function toggleFav(id) {
  const isNowFav = Storage.toggleFavorite(id);
  const btn = document.querySelector(`#card-${id} .btn-fav-card`);
  if (btn) {
    btn.classList.toggle('active', isNowFav);
    btn.innerHTML = isNowFav ? '❤️' : '🤍';
  }
}

function resetAllFilters() {
  activeCat = 'all';
  activeSub = 'all';
  activeEra = 'all';
  activeTag = null;
  searchQuery = '';
  const searchInput = document.getElementById('catalogSearch');
  if (searchInput) searchInput.value = '';
  currentPage = 1;
  renderSidebarCategories();
  renderTopRibbon();
  applyFilters();
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('catalogGrid')) {
    initCatalog();
  }
});
