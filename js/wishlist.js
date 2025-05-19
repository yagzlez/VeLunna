import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabase = createClient(
  'https://nhfuyokthqnzbmhbfdjd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5oZnV5b2t0aHFuemJtaGJmZGpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYzODE5MTMsImV4cCI6MjA2MTk1NzkxM30.egjmV7jARfDpYns93oPpYeciqdkP7SmIBeBsViLz6cQ'
);

const gallery = document.querySelector('.product-gallery');
const loginContainer = document.getElementById('nav-login');

async function getCurrentUserId() {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
}

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

window.toggleDropdown = function () {
  document.getElementById('userDropdown').classList.toggle('open');
};

window.logout = async function () {
  await supabase.auth.signOut();
  window.location.reload();
};

async function removeFromWishlist(productId, productTable) {
  const userId = await getCurrentUserId();
  if (!userId) return;

  const { data: existing } = await supabase
    .from('Wishlist')
    .select('id')
    .eq('user_id', userId)
    .eq('product_id', productId)
    .eq('product_table', productTable)
    .single();

  if (existing) {
    await supabase.from('Wishlist').delete().eq('id', existing.id);
    loadWishlistProducts();
  }
}

async function loadWishlistProducts() {
  const userId = await getCurrentUserId();
  if (!userId) return;

  const { data: wishlistItems } = await supabase
    .from('Wishlist')
    .select('product_id, product_table')
    .eq('user_id', userId);

  if (!wishlistItems?.length) {
    gallery.innerHTML = `<p>Your wishlist is empty.</p>`;
    return;
  }

  const womenIds = wishlistItems
    .filter(item => item.product_table === 'Products_Women')
    .map(item => item.product_id);

  const menIds = wishlistItems
    .filter(item => item.product_table === 'Products_Men')
    .map(item => item.product_id);

  const { data: womenProducts } = womenIds.length
    ? await supabase.from('Products_Women').select('*').in('id', womenIds)
    : { data: [] };

  const { data: menProducts } = menIds.length
    ? await supabase.from('Products_Men').select('*').in('id', menIds)
    : { data: [] };

  const allProducts = [
    ...(womenProducts || []).map(p => ({ ...p, product_table: 'Products_Women' })),
    ...(menProducts || []).map(p => ({ ...p, product_table: 'Products_Men' })),
  ];

  gallery.innerHTML = '';

  allProducts.forEach(product => {
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
      document.getElementById('productModal').setAttribute('data-product-id', product.id);
      document.getElementById('productModal').setAttribute('data-product-table', product.product_table);
      document.getElementById('modalImg').src = product.image_url;
      document.getElementById('modalTitle').textContent = product.title;
      document.getElementById('modalDescription').textContent = product.description;
      document.getElementById('modalPrice').textContent = `£${product.price.toFixed(2)}`;

      const sizeSelect = document.getElementById('sizeSelect');
      sizeSelect.innerHTML = '';
      product.sizes?.split(',').forEach(size => {
        const option = document.createElement('option');
        option.value = size.trim();
        option.textContent = size.trim();
        sizeSelect.appendChild(option);
      });

      const basketBtn = document.querySelector('.basket-btn');
      basketBtn.style.display = isSoldOut ? 'none' : 'block';

      const wishlistBtn = document.querySelector('.wishlist-btn');
      wishlistBtn.textContent = "♥ Remove from Wishlist";
      wishlistBtn.onclick = () => removeFromWishlist(product.id, product.product_table);

      document.getElementById('productModal').style.display = 'block';
    });

    gallery.appendChild(div);
  });
}

document.getElementById('modalClose').addEventListener('click', () => {
  document.getElementById('productModal').style.display = 'none';
});

loadUser();
loadWishlistProducts();
