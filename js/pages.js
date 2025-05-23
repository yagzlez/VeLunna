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

async function handleWishlistClick() {
  const productId = document.getElementById('productModal').getAttribute('data-product-id');
  const userId = await getCurrentUserId();
  const wishlistBtn = document.querySelector('.wishlist-btn');

  if (!userId) {
    alert("Please log in to use wishlist.");
    return;
  }

  const { data: existing, error: checkError } = await supabase
    .from('Wishlist')
    .select('id')
    .eq('user_id', userId)
    .eq('product id', productId)
    .single();

  if (checkError && checkError.code !== 'PGRST116') {
    console.error('Error checking wishlist:', checkError.message);
    alert("Error checking wishlist.");
    return;
  }

  if (existing) {
    const { error: deleteError } = await supabase
      .from('Wishlist')
      .delete()
      .eq('id', existing.id);

    if (deleteError) {
      console.error('Error removing from wishlist:', deleteError.message);
      alert("Failed to remove from wishlist.");
    } else {
      await supabase.rpc('decrement_wishlist_count', { product_id_input: productId });
      wishlistBtn.textContent = "♡ Add to Wishlist";
      alert("❌ Removed from wishlist.");
    }
  } else {
    const { error: insertError } = await supabase.from('Wishlist').insert([
      {
        user_id: userId,
        "product id": productId
      }
    ]);

    if (insertError) {
      console.error("❌ Wishlist insert error:", insertError.message);
      alert("Failed to add to wishlist.");
    } else {
      await supabase.rpc('increment_wishlist_count', { product_id_input: productId });
      wishlistBtn.textContent = "♥ Remove from Wishlist";
      alert("✅ Added to wishlist!");
    }
  }
}

async function handleBasketClick() {
  const userId = await getCurrentUserId();
  if (!userId) {
    alert("Please log in to add items to the basket.");
    return;
  }

  const productId = document.getElementById('productModal').getAttribute('data-product-id');
  const size = document.getElementById('sizeSelect').value;

  const { data: existingItem, error: checkError } = await supabase
    .from('Basket')
    .select('id, quantity')
    .eq('user_id', userId)
    .eq('product_id', productId)
    .eq('size', size)
    .single();

  if (checkError && checkError.code !== 'PGRST116') {
    console.error("❌ Basket check error:", checkError.message);
    alert("Failed to check basket.");
    return;
  }

  if (existingItem) {
    const { error: updateError } = await supabase
      .from('Basket')
      .update({ quantity: existingItem.quantity + 1 })
      .eq('id', existingItem.id);

    if (updateError) {
      console.error("❌ Update quantity error:", updateError.message);
      alert("Failed to update basket.");
    } else {
      alert("🔁 Quantity updated in basket.");
    }
  } else {
    const { error: insertError } = await supabase
      .from('Basket')
      .insert([{ user_id: userId, product_id: productId, size, quantity: 1 }]);

    if (insertError) {
      console.error("❌ Basket insert error:", insertError.message);
      alert("Failed to add to basket.");
    } else {
      alert("✅ Added to basket!");
    }
  }
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

const searchIcon = document.getElementById('searchIcon');
const searchInput = document.getElementById('searchInput');
searchIcon.addEventListener('click', () => {
  searchInput.classList.toggle('active');
  searchInput.focus();
});

async function loadProducts() {
  // Skip loading products on pages that are not shop-related
  const isShopPage = location.pathname.includes('index.html') ||
                     location.pathname.includes('woman.html') ||
                     location.pathname.includes('man.html');

  if (!isShopPage) return; // ⛔ Skip if not on product gallery page

  const { data: products, error } = await supabase.from('Products').select('*');
  if (error) return console.error('Load error:', error.message);

  const availableProducts = products.filter(p => String(p.is_available).toLowerCase() === 'true');
  gallery.innerHTML = availableProducts.length ? '' : '<p>No products available.</p>';

  // Render logic (you can keep this or trim it if you want)
  availableProducts.forEach(product => {
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

    // ... rest of product click logic (optional)
    gallery.appendChild(div);
  });
}

loadUser();
loadProducts();

document.getElementById('modalClose').addEventListener('click', () => {
  document.getElementById('productModal').style.display = 'none';
});
