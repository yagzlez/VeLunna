const navbar = document.getElementById("navbar");
window.addEventListener("scroll", () => {
  if (!document.body.classList.contains("static-logo")) {
    navbar.classList.toggle("shrink", window.scrollY > 50);
  }
});

const searchIcon = document.getElementById("searchIcon");
const searchInput = document.getElementById("searchInput");
searchIcon.addEventListener("click", (e) => {
  e.stopPropagation();
  searchInput.classList.toggle("active");
  if (searchInput.classList.contains("active")) searchInput.focus();
});

document.addEventListener("DOMContentLoaded", () => {
  const modalClose = document.getElementById("modalClose");
  modalClose.addEventListener("click", () => {
    document.getElementById("productModal").style.display = "none";
  });
});

// ---------- PRODUCT LOAD ---------- //
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabase = createClient(
  'https://nhfuyokthqnzbmhbfdjd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5oZnV5b2t0aHFuemJtaGJmZGpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYzODE5MTMsImV4cCI6MjA2MTk1NzkxM30.egjmV7jARfDpYns93oPpYeciqdkP7SmIBeBsViLz6cQ'
);

const gallery = document.querySelector('.product-gallery');
const loginContainer = document.getElementById('nav-login');

// 🔍 Detect category based on page URL
const pageCategory = window.location.pathname.includes("man") ? "men" : "women";

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

  } else {
    loginContainer.innerHTML = `<a href="login.html" class="login-btn">Log in</a>`;
  }
}

window.toggleDropdown = function () {
  document.getElementById('userDropdown').classList.toggle('open');
};

window.logout = async function () {
  await supabase.auth.signOut();
  window.location.reload();
};

async function loadProducts() {
  const { data: products, error } = await supabase
    .from('Products')
    .select('*')
    .eq('is_available', true)
    .eq('category', pageCategory);

  console.log("Loaded products:", products);

  if (error) {
    console.error('Supabase error:', error.message);
    return;
  }

  if (!products.length) {
    gallery.innerHTML = '<p>No products available in this category.</p>';
    return;
  }

  gallery.innerHTML = '';

  products.forEach(product => {
    const div = document.createElement('div');
    div.className = 'product';

    const isSoldOut = product.stock === 0;

    div.innerHTML = `
      <div class="product-img-wrapper ${isSoldOut ? 'sold-out' : ''}">
        <img src="${product.image_url}" alt="${product.title}">
        ${isSoldOut ? '<div class="sold-overlay">SOLD OUT</div>' : ''}
      </div>
      <p>${product.title}</p>
    `;

    div.querySelector('img').addEventListener('click', () => {
      document.getElementById('modalImg').src = product.image_url;
      document.getElementById('modalTitle').textContent = product.title;
      document.getElementById('modalDescription').textContent = product.description;

      const sizeSelect = document.getElementById('sizeSelect');
      sizeSelect.innerHTML = '';
      if (product.sizes) {
        product.sizes.split(',').forEach(size => {
          const option = document.createElement('option');
          option.value = size.trim();
          option.textContent = size.trim();
          sizeSelect.appendChild(option);
        });
      }

      const basketBtn = document.querySelector('.basket-btn');
      basketBtn.style.display = product.stock === 0 ? 'none' : 'block';

      document.getElementById('productModal').style.display = 'block';
    });

    gallery.appendChild(div);
  });
}

loadUser();
loadProducts();
