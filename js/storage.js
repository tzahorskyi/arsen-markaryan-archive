// Storage Module: Favorites & Watch History
const Storage = {
  getFavorites() {
    try {
      return JSON.parse(localStorage.getItem('amm_favs') || '[]');
    } catch {
      return [];
    }
  },

  isFavorite(id) {
    return this.getFavorites().includes(id);
  },

  toggleFavorite(id) {
    let favs = this.getFavorites();
    if (favs.includes(id)) {
      favs = favs.filter(x => x !== id);
    } else {
      favs.unshift(id);
    }
    localStorage.setItem('amm_favs', JSON.stringify(favs));
    this.updateCounters();
    return favs.includes(id);
  },

  getHistory() {
    try {
      return JSON.parse(localStorage.getItem('amm_hist') || '[]');
    } catch {
      return [];
    }
  },

  recordWatch(item) {
    if (!item || !item.id) return;
    let hist = this.getHistory().filter(x => x.id !== item.id);
    hist.unshift({
      id: item.id,
      title: item.title,
      catName: item.catName,
      watchedAt: Date.now()
    });
    if (hist.length > 100) hist.pop();
    localStorage.setItem('amm_hist', JSON.stringify(hist));
  },

  clearHistory() {
    localStorage.removeItem('amm_hist');
  },

  updateCounters() {
    const favCount = this.getFavorites().length;
    document.querySelectorAll('.fav-badge-count').forEach(el => {
      el.textContent = favCount;
      el.style.display = favCount > 0 ? 'inline-block' : 'none';
    });
  }
};

document.addEventListener('DOMContentLoaded', () => {
  Storage.updateCounters();
});
