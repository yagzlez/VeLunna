import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabase = createClient(
  'https://nhfuyokthqnzbmhbfdjd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5oZnV5b2t0aHFuemJtaGJmZGpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYzODE5MTMsImV4cCI6MjA2MTk1NzkxM30.egjmV7jARfDpYns93oPpYeciqdkP7SmIBeBsViLz6cQ'
 
);

const gallery = document.querySelector('.product-gallery');
const modal = document.getElementById('productModal');
const modalImg = document.getElementById('modalImg');
const modalTitle = document.getElementById('modalTitle');
const modalDescription = document.getElementById('modalDescription');
const modalPrice = document.getElementById('modalPrice');
const sizeSelect = document.getElementById('sizeSelect');
const wishlistBtn = document.querySelector('.wishlist-btn');
const basketBtn = document.querySelector('.basket-btn');
const modelButtons = document.getElementById('modelButtons');
const carouselDots = document.getElementById('carouselDots');

let imageList = [];
let currentImageIndex = 0;

async function getCurrentUserId() {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
}

function updateCarousel() {
  modalImg.src = imageList[currentImageIndex] || '';
  carouselDots.innerHTML = imageList.map((_, i) =>
    `<span class="dot ${i === currentImageIndex ? 'active' : ''}" data-index="${i}"></span>`
  ).join('');

  document.querySelectorAll('.dot').forEach(dot => {
    dot.onclick = () => {
      currentImageIndex = parseInt(dot.dataset.index);
      updateCarousel();
    };
  });
}

document.getElementById('prevImage').onclick = () => {
  currentImageIndex = (currentImageIndex - 1 + imageList.length) % imageList.length;
  updateCarousel();
};

document.getElementById('nextImage').onclick = () => {
  currentImageIndex = (currentImageIndex + 1) % imageList.length;
  updateCarousel();
};

async function handleWishlistClick() {
  const productId = modal.getAttribute("data-product-id");
  const userId = await getCurrentUserId();
  if (!userId) return alert("Please log in.");

  const { data: existing } = await supabase
    .from("Wishlist")
    .select("id")
    .eq("user_id", userId)
    .eq("product_id", productId)
    .eq("product_table", "Products_Women")
    .single();

  if (existing) {
    await supabase.from("Wishlist").delete().eq("id", existing.id);
    wishlistBtn.textContent = "♡ Add to Wishlist";
  } else {
    await supabase.from("Wishlist").insert([{ user_id: userId, product_id: productId, product_table: "Products_Women" }]);
    wishlistBtn.textContent = "♥ Remove from Wishlist";
  }
}

async function handleBasketClick() {
  const userId = await getCurrentUserId();
  if (!userId) return alert("Please log in.");
  const productId = modal.getAttribute("data-product-id");
  const size = sizeSelect.value;

  const { data: existingItem } = await supabase
    .from("Basket")
    .select("id, quantity")
    .eq("user_id", userId)
    .eq("product_id", productId)
    .eq("size", size)
    .single();

  if (existingItem) {
    await supabase.from("Basket")
      .update({ quantity: existingItem.quantity + 1 })
      .eq("id", existingItem.id);
  } else {
    await supabase.from("Basket")
      .insert([{ user_id: userId, product_id: productId, size, quantity: 1 }]);
  }
}

async function loadProducts() {
  gallery.innerHTML = '';

  const { data: products, error } = await supabase
    .from('Products_Women')
    .select('*')
    .eq('is_available', true);

  if (error) return console.error('Load error:', error.message);
  if (!products?.length) return gallery.innerHTML = '<p>No products available.</p>';

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

    div.querySelector('img').onclick = () => openModal(product);
    gallery.appendChild(div);
  });
}

async function openModal(product) {
  modal.setAttribute('data-product-id', product.id);
  modal.setAttribute('data-product-table', 'Products_Women');

  modalTitle.textContent = product.title;
  modalDescription.textContent = product.description;
  modalPrice.textContent = `£${product.price.toFixed(2)}`;

  imageList = [product.image_url, ...(product.images?.split(',') || []).map(s => s.trim())];
  currentImageIndex = 0;
  updateCarousel();

  sizeSelect.innerHTML = '';
  product.sizes?.split(',').forEach(size => {
    const option = document.createElement('option');
    option.value = size.trim();
    option.textContent = size.trim();
    sizeSelect.appendChild(option);
  });

  const isSoldOut = product.stock === 0;
  basketBtn.style.display = isSoldOut ? 'none' : 'block';
  basketBtn.onclick = handleBasketClick;

  const userId = await getCurrentUserId();
  if (userId) {
    const { data: existing } = await supabase
      .from("Wishlist")
      .select("id")
      .eq("user_id", userId)
      .eq("product_id", product.id)
      .eq("product_table", "Products_Women")
      .single();
    wishlistBtn.textContent = existing ? "♥ Remove from Wishlist" : "♡ Add to Wishlist";
  }

  wishlistBtn.onclick = handleWishlistClick;
  await loadModels(product.group_id, product.id);
  modal.style.display = 'block';
}

async function loadModels(group_id, selectedId) {
  const { data: variants } = await supabase
    .from("Products_Women")
    .select("*")
    .eq("group_id", group_id);

  if (!variants?.length) return modelButtons.innerHTML = '';

  modelButtons.innerHTML = variants.map(variant => `
    <img src="${variant.image_url}"
         class="model-btn ${variant.id === selectedId ? 'active' : ''}"
         data-id="${variant.id}" />
  `).join('');

  modelButtons.querySelectorAll('.model-btn').forEach(btn => {
    btn.onclick = async () => {
      const id = btn.dataset.id;
      const { data: [selected] } = await supabase
        .from("Products_Women")
        .select("*")
        .eq("id", id);
      if (selected) openModal(selected);
    };
  });
}

document.getElementById("modalClose").onclick = () => {
  modal.style.display = 'none';
};

loadProducts();
