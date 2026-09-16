// API Module: Loads Data (with embedded fallback)
const API = {
  _videos: null,
  _categories: null,

  async getCategories() {
    if (this._categories) return this._categories;
    if (window.EMBEDDED_CATEGORIES) {
      this._categories = window.EMBEDDED_CATEGORIES;
      return this._categories;
    }
    try {
      const res = await fetch('data/categories.json');
      this._categories = await res.json();
      return this._categories;
    } catch (e) {
      console.warn('Fallback to embedded categories', e);
      return window.EMBEDDED_CATEGORIES || [];
    }
  },

  async getVideos() {
    if (this._videos) return this._videos;
    if (window.EMBEDDED_VIDEOS) {
      this._videos = window.EMBEDDED_VIDEOS;
      return this._videos;
    }
    try {
      const res = await fetch('data/videos.json');
      this._videos = await res.json();
      return this._videos;
    } catch (e) {
      console.warn('Fallback to embedded videos', e);
      return window.EMBEDDED_VIDEOS || [];
    }
  },

  async getVideoById(id) {
    const videos = await this.getVideos();
    return videos.find(v => v.id === id);
  },

  async getVideosByCategory(catId) {
    const videos = await this.getVideos();
    return videos.filter(v => v.catId === catId);
  }
};
