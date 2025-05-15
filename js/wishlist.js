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

async function removeFromWishlist(productId) {
  const userId = await getCurrentUserId();
  if (!userId) return;

  const { data: existing, error: checkError } = await supabase
    .from('Wishlist')
    .select('id')
    .eq('user_id', userId)
    .eq('product id', productId)
    .single();

  if (checkError) return console.error("Fetch error:", checkError.message);

  const { error: deleteError } = await supabase
    .from('Wishlist')
    .delete()
    .eq('id', existing.id);

  if (!deleteError) {
    await supabase.rpc('decrement_wishlist_count', {
      product_id_input: productId
    });
    loadWishlistProducts(); // Refresh view
  } else {
    console.error("Remove failed:", deleteError.message);
  }
}

async function loadWishlistProducts() {
  const userId = await getCurrentUserId();
  if (!userId) return;

  const { data: wishlistItems, error: wishlistError } = await supabase
    .from('Wishlist')
    .select('product id')
    .eq('user_id', userId);

  if (wishlistError) {
    console.error("❌ Wishlist load error:", wishlistError.message);
    return;
  }

  const productIds = wishlistItems.map(item => item["product id"]);

  if (!productIds.length) {
    gallery.innerHTML = `<p>Your wishlist is empty.</p>`;
    return;
  }

  const { data: products, error: productsError } = await supabase
    .from('Products')
    .select('*')
    .in('id', productIds);

  if (productsError) {
    console.error("❌ Products load error:", productsError.message);
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
      document.getElementById('productModal').setAttribute('data-product-id', product.id);
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
      wishlistBtn.onclick = () => removeFromWishlist(product.id);

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
