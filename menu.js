document.addEventListener("DOMContentLoaded", () => {
  const menuButton = document.getElementById("menuButton");
  const sidebarMenu = document.getElementById("sidebarMenu");
  const sidebarOverlay = document.getElementById("sidebarOverlay");
  const sidebarClose = document.getElementById("sidebarClose");

  if (!menuButton || !sidebarMenu || !sidebarOverlay) {
    return;
  }

  function openMenu() {
    sidebarMenu.classList.add("open");
    sidebarOverlay.classList.add("open");
    menuButton.setAttribute("aria-expanded", "true");
  }

  function closeMenu() {
    sidebarMenu.classList.remove("open");
    sidebarOverlay.classList.remove("open");
    menuButton.setAttribute("aria-expanded", "false");
  }

  menuButton.addEventListener("click", openMenu);
  sidebarOverlay.addEventListener("click", closeMenu);

  if (sidebarClose) {
    sidebarClose.addEventListener("click", closeMenu);
  }

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });
});
