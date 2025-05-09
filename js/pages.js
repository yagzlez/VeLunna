// Navbar shrink on scroll
const navbar = document.getElementById("navbar");
window.addEventListener("scroll", () => {
  if (!document.body.classList.contains("static-logo")) {
    if (window.scrollY > 50) {
      navbar.classList.add("shrink");
    } else {
      navbar.classList.remove("shrink");
    }
  }
});

// Search bar logic
const searchIcon = document.getElementById("searchIcon");
const searchInput = document.getElementById("searchInput");

searchIcon.addEventListener("click", (event) => {
  event.stopPropagation();
  searchInput.classList.toggle("active");
  if (searchInput.classList.contains("active")) {
    searchInput.focus();
  }
});

// Modal logic
document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".product img").forEach(img => {
    img.addEventListener("click", () => {
      const modal = document.getElementById("productModal");
      const modalImg = document.getElementById("modalImg");
      const modalTitle = document.getElementById("modalTitle");
      const caption = document.getElementById("modalDescription");

      modal.style.display = "block";
      modalImg.src = img.src;
      modalTitle.innerText = img.alt;
      caption.innerText = `Detailed description of ${img.alt}. Sizes: S, M, L. Materials: 100% Organic Cotton.`;
    });
  });

  const modalClose = document.getElementById("modalClose");
  modalClose.addEventListener("click", () => {
    document.getElementById("productModal").style.display = "none";
  });
});
