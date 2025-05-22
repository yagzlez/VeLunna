import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabase = createClient(
  'https://nhfuyokthqnzbmhbfdjd.supabase.co',
  'your-anon-key'
);

const gallery = document.querySelector('.product-gallery');

async function getCurrentUserId() {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
}

async function handleWishlistClick() {
  const modal = document.getElementById("productModal");
  const productId = modal.getAttribute("data-product-id");
  const productTable = modal.getAttribute("data-product-table");
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

function setupCarousel(images) {
  const carouselImages = document.getElementById('carouselImages');
  carouselImages.innerHTML = '';
  images.forEach((imgUrl, index) => {
    const img = document.createElement('img');
    img.src = imgUrl;
    img.classList.add('carousel-image');
    if (index === 0) img.classList.add('active');
    carouselImages.appendChild(img);
  });

  let currentIndex = 0;
  const totalImages = images.length;
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');

  function showImage(index) {
    const imgs = document.querySelectorAll('.carousel-image');
    imgs.forEach((img, i) => {
      img.classList.toggle('active', i === index);
    });
  }

  prevBtn.onclick = () => {
    currentIndex = (currentIndex - 1 + totalImages) % totalImages;
    showImage(currentIndex);
  };

  nextBtn.onclick = () => {
    currentIndex = (currentIndex + 1) % totalImages;
    showImage(currentIndex);
  };
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
      const modal = document.getElementById('productModal');
      modal.setAttribute('data-product-id', product.id);
      modal.setAttribute('data-product-table', 'Products_Women');

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
          .eq('product_id', product.id)
          .eq('product_table', 'Products_Women')
          .single();
        wishlistBtn.textContent = existing ? "♥ Remove from Wishlist" : "♡ Add to Wishlist";
      }

      wishlistBtn.onclick = handleWishlistClick;

      const images = product.images || [product.image_url];
      setupCarousel(images);

      modal.style.display = 'block';
    });

    gallery.appendChild(div);
  });
}

document.getElementById('modalClose').addEventListener('click', () => {
  document.getElementById('productModal').style.display = 'none';
});

loadProducts();
