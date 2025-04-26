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
  if (window.scrollY > 50) {
    navbar.classList.add("shrink");
  } else {
    navbar.classList.remove("shrink");
  }
});


const searchIcon = document.getElementById("searchIcon");
const searchInput = document.getElementById("searchInput");

searchIcon.addEventListener("click", (event) => {
  event.stopPropagation(); // Stop click from reaching the body
  searchInput.classList.toggle("active");
  if (searchInput.classList.contains("active")) {
    searchInput.focus();
  }
});

// Close search input if clicking outside
document.addEventListener("click", (event) => {
  if (!searchInput.contains(event.target) && !searchIcon.contains(event.target)) {
    searchInput.classList.remove("active");
  }
});
