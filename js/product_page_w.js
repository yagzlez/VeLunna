import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabase = createClient(
  'https://nhfuyokthqnzbmhbfdjd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5oZnV5b2t0aHFuemJtaGJmZGpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYzODE5MTMsImV4cCI6MjA2MTk1NzkxM30.egjmV7jARfDpYns93oPpYeciqdkP7SmIBeBsViLz6cQ'
);

const gallery = document.querySelector('.product-gallery');

async function getCurrentUserId() {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
}

async function handleWishlistClick() {
  const productId = document
    .getElementById('productModal')
    .getAttribute('data-product-id');

  const userId = await getCurrentUserId();
  const wishlistBtn = document.querySelector('.wishlist-btn');

  if (!userId) {
    alert("Please log in to use wishlist.");
    return;
  }

  const { data: existing } = await supabase
    .from('Wishlist')
    .select('id')
    .eq('user_id', userId)
    .eq('product_id', productId)
    .eq('product_table', 'Products_Women')
    .single();

  if (existing) {
    await supabase.from('Wishlist').delete().eq('id', existing.id);
    wishlistBtn.textContent = "♡ Add to Wishlist";
    alert("❌ Removed from wishlist.");
  } else {
    await supabase.from('Wishlist').insert([{
      user_id: userId,
      product_id: productId,
      product_table: 'Products_Women'
    }]);
    wishlistBtn.textContent = "♥ Remove from Wishlist";
    alert("✅ Added to wishlist!");
  }
}async function handleWishlistClick() {
  const productId = document
    .getElementById("productModal")
    .getAttribute("data-product-id");

  const productTable = document
    .getElementById("productModal")
    .getAttribute("data-product-table"); // 👈 store source table!

  const userId = await getCurrentUserId();
  const wishlistBtn = document.querySelector(".wishlist-btn");

  if (!userId) {
    alert("Please log in to use wishlist.");
    return;
  }

  const { data: existing } = await supabase
    .from("Wishlist")
    .select("id")
    .eq("user_id", userId)
    .eq("product_id", productId)
    .eq("product_table", productTable)
    .single();

  if (existing) {
    await supabase.from("Wishlist").delete().eq("id", existing.id);
    wishlistBtn.textContent = "♡ Add to Wishlist";
    alert("❌ Removed from wishlist.");
  } else {
    await supabase.from("Wishlist").insert([
      {
        user_id: userId,
        product_id: productId,
        product_table: productTable,
      },
    ]);
    wishlistBtn.textContent = "♥ Remove from Wishlist";
    alert("✅ Added to wishlist!");
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

  const { data: existingItem } = await supabase
    .from('Basket')
    .select('id, quantity')
    .eq('user_id', userId)
    .eq('product_id', productId)
    .eq('size', size)
    .single();

  if (existingItem) {
    await supabase
      .from('Basket')
      .update({ quantity: existingItem.quantity + 1 })
      .eq('id', existingItem.id);
    alert("🔁 Quantity updated in basket.");
  } else {
    await supabase
      .from('Basket')
      .insert([{ user_id: userId, product_id: productId, size, quantity: 1 }]);
    alert("✅ Added to basket!");
  }
}

async function loadProducts() {
  gallery.innerHTML = '';

  const { data: products, error } = await supabase
    .from('Products_Women')
    .select('*')
    .eq('is_available', true);

  if (error) return console.error('❌ Load error:', error.message);

  if (!products || products.length === 0) {
    gallery.innerHTML = '<p>No products available.</p>';
    return;
  }

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

    div.querySelector('img').addEventListener('click', async () => {
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
      basketBtn.onclick = handleBasketClick;

      const wishlistBtn = document.querySelector('.wishlist-btn');
      const userId = await getCurrentUserId();
      if (userId) {
        const { data: existing } = await supabase
          .from('Wishlist')
          .select('id')
          .eq('user_id', userId)
          .eq('product id', product.id)
          .single();
        wishlistBtn.textContent = existing ? "♥ Remove from Wishlist" : "♡ Add to Wishlist";
      }

      wishlistBtn.onclick = handleWishlistClick;
      document.getElementById('productModal').style.display = 'block';
    });

    gallery.appendChild(div);
  });
}

document.getElementById('modalClose').addEventListener('click', () => {
  document.getElementById('productModal').style.display = 'none';
});

loadProducts();
