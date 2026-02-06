const mobileMenuBtn = document.getElementById("mobileMenuBtn");
const mobileMenu = document.getElementById("mobileMenu");
const mobileMenuCloseBtn = document.getElementById("mobileMenuCloseBtn");
const mobileMenuOverlay = mobileMenu?.querySelector("[data-mobile-close]");

const openMobileMenu = () => {
  if (!mobileMenu) return;
  mobileMenu.classList.remove("hidden");
};

const closeMobileMenu = () => {
  if (!mobileMenu) return;
  mobileMenu.classList.add("hidden");
};

if (mobileMenuBtn && mobileMenu) {
  mobileMenuBtn.addEventListener("click", () => {
    if (mobileMenu.classList.contains("hidden")) {
      openMobileMenu();
      return;
    }
    closeMobileMenu();
  });
}

if (mobileMenuCloseBtn) {
  mobileMenuCloseBtn.addEventListener("click", closeMobileMenu);
}

if (mobileMenuOverlay) {
  mobileMenuOverlay.addEventListener("click", closeMobileMenu);
}
