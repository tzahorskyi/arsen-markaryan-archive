// Global Shared App Logic
document.addEventListener('DOMContentLoaded', () => {
  // Mobile Nav Drawer Toggle
  const btnMenu = document.getElementById('btnMenu');
  const mobileDrawer = document.getElementById('mobileDrawer');
  if (btnMenu && mobileDrawer) {
    btnMenu.addEventListener('click', () => {
      mobileDrawer.classList.toggle('open');
    });
  }
});
