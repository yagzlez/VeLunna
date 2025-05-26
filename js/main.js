const navbar = document.getElementById("navbar");
const mainLogo = document.getElementById("mainLogo");
const slides = document.querySelectorAll(".carousel-img");
let currentIndex = 0;

function showNextSlide() {
  slides[currentIndex].classList.remove("active");
  currentIndex = (currentIndex + 1) % slides.length;
  slides[currentIndex].classList.add("active");
}

setInterval(showNextSlide, 4000);

// Shrink the navbar and logo on scroll
window.addEventListener("scroll", () => {
  const navbar = document.getElementById("navbar");
  if (!document.body.classList.contains("static-logo")) {
    if (window.scrollY > 50) {
      navbar.classList.add("shrink");
    } else {
      navbar.classList.remove("shrink");
    }
  }
});

const searchIcon = document.getElementById("searchIcon");
const searchInput = document.getElementById("searchInput");

if (searchIcon && searchInput) {
  searchIcon.addEventListener("click", (event) => {
    event.stopPropagation();
    searchInput.classList.toggle("active");
    if (searchInput.classList.contains("active")) {
      searchInput.focus();
    }
  });
}

document.addEventListener("DOMContentLoaded", function () {
  const modal = document.getElementById("productModal");
  const modalImg = document.getElementById("modalImg");
  const modalTitle = document.getElementById("modalTitle");
  const caption = document.getElementById("modalDescription");
  const modalClose = document.getElementById("modalClose");

  const productImages = document.querySelectorAll(".product img");

  if (modal && modalImg && modalTitle && caption && productImages.length > 0) {
    productImages.forEach(img => {
      img.addEventListener("click", () => {
        modal.style.display = "block";
        modalImg.src = img.src;
        modalTitle.innerText = img.alt;
        caption.innerText = `Detailed description of ${img.alt}. Sizes: S, M, L. Materials: 100% Organic Cotton.`;
      });
    });
  }

  if (modalClose && modal) {
    modalClose.addEventListener("click", () => {
      modal.style.display = "none";
    });
  }
});
