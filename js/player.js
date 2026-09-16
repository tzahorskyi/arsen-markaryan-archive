// Player & Theater Logic (watch.html)
async function initPlayer() {
  const params = new URLSearchParams(window.location.search);
  const vidId = params.get('v');

  if (!vidId) {
    window.location.href = 'catalog.html';
    return;
  }

  const video = await API.getVideoById(vidId);
  if (!video) {
    document.getElementById('watchTitle').textContent = 'Видео не найдено';
    return;
  }

  // Update Page Title
  document.title = `${video.title} — Архив Арсена Маркаряна`;

  // Record History
  Storage.recordWatch(video);

  // Set Iframe
  const iframe = document.getElementById('playerIframe');
  if (iframe) {
    iframe.src = `https://www.youtube.com/embed/${video.id}?autoplay=1&rel=0&modestbranding=1`;
  }

  // Set Info
  document.getElementById('watchTitle').textContent = video.title;
  document.getElementById('watchCatBadge').innerHTML = `${video.catIcon} ${video.catName}`;
  document.getElementById('watchCatBadge').href = `catalog.html?cat=${video.catId}`;
  
  if (video.subName) {
    const subBadge = document.getElementById('watchSubBadge');
    if (subBadge) {
      subBadge.textContent = video.subName;
      subBadge.style.display = 'inline-flex';
    }
  }

  document.getElementById('watchYear').textContent = `📅 ${video.year} год`;
  if (video.durationFormatted) {
    document.getElementById('watchDuration').textContent = `⏱️ ${video.durationFormatted}`;
  }
  if (video.viewsFormatted) {
    document.getElementById('watchViews').textContent = `👁️ ${video.viewsFormatted} просмотров`;
  }

  // YouTube Link
  const ytLink = document.getElementById('btnOpenYt');
  if (ytLink) ytLink.href = video.url;

  // Favorite Button
  const favBtn = document.getElementById('btnToggleFavWatch');
  if (favBtn) {
    const updateFavBtn = () => {
      const isFav = Storage.isFavorite(video.id);
      favBtn.classList.toggle('btn-primary', isFav);
      favBtn.classList.toggle('btn-secondary', !isFav);
      favBtn.innerHTML = isFav ? '❤️ В избранном' : '🤍 В избранное';
    };
    updateFavBtn();
    favBtn.addEventListener('click', () => {
      Storage.toggleFavorite(video.id);
      updateFavBtn();
    });
  }

  // Share Button
  const shareBtn = document.getElementById('btnShareWatch');
  if (shareBtn) {
    shareBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(window.location.href);
      const orig = shareBtn.innerHTML;
      shareBtn.innerHTML = '✅ Ссылка скопирована!';
      setTimeout(() => { shareBtn.innerHTML = orig; }, 2000);
    });
  }

  // Render Queue (videos from the same category)
  renderCategoryQueue(video);
}

async function renderCategoryQueue(currentVideo) {
  const queueList = document.getElementById('queueList');
  const queueTitle = document.getElementById('queueCatTitle');
  if (!queueList) return;

  if (queueTitle) {
    queueTitle.textContent = `Категория: ${currentVideo.catName}`;
  }

  const sameCatVideos = await API.getVideosByCategory(currentVideo.catId);
  const queueVideos = sameCatVideos.filter(v => v.id !== currentVideo.id).slice(0, 30);

  let html = '';
  queueVideos.forEach(v => {
    html += `
      <a href="watch.html?v=${v.id}" class="queue-item">
        <img class="queue-thumb" src="https://i.ytimg.com/vi/${v.id}/mqdefault.jpg" alt="${v.title}" loading="lazy">
        <div class="queue-item-info">
          <div class="queue-item-title">${v.title}</div>
          <div class="queue-item-meta">
            <span>${v.year} г.</span>
            ${v.durationFormatted ? ` • ${v.durationFormatted}` : ''}
          </div>
        </div>
      </a>
    `;
  });

  queueList.innerHTML = html;
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('playerIframe')) {
    initPlayer();
  }
});
