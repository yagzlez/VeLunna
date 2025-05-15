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

searchIcon.addEventListener("click", (event) => {
  event.stopPropagation();
  searchInput.classList.toggle("active");
  if (searchInput.classList.contains("active")) {
    searchInput.focus();
  }
});

// Modal Open/Close for carousel items
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

// 🧠 Supabase Login + Wishlist Dropdown
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabase = createClient(
  'https://nhfuyokthqnzbmhbfdjd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5oZnV5b2t0aHFuemJtaGJmZGpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYzODE5MTMsImV4cCI6MjA2MTk1NzkxM30.egjmV7jARfDpYns93oPpYeciqdkP7SmIBeBsViLz6cQ'

);

const loginContainer = document.getElementById('nav-login');

window.toggleDropdown = function () {
  document.getElementById('userDropdown')?.classList.toggle('open');
};

window.logout = async function () {
  await supabase.auth.signOut();
  window.location.reload();
};

async function loadUser() {
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const name = user.user_metadata?.first_name || user.user_metadata?.name || 'User';
    loginContainer.innerHTML = `
      <div class="welcome-container">
        <button class="welcome-toggle" onclick="toggleDropdown()">Welcome, ${name} <span>&#x25BE;</span></button>
        <div class="dropdown-menu" id="userDropdown">
          <a href="wishlist.html" class="dropdown-link">♡ View Wishlist</a>
          <hr class="dropdown-separator">
          <button onclick="logout()" class="logout-button">Logout</button>
        </div>
      </div>
    `;
  } else {
    loginContainer.innerHTML = `<a href="login.html" class="login-btn">Log in</a>`;
  }
}

loadUser();
