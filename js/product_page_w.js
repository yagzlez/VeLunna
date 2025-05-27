import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabase = createClient(
  'https://nhfuyokthqnzbmhbfdjd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5oZnV5b2t0aHFuemJtaGJmZGpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYzODE5MTMsImV4cCI6MjA2MTk1NzkxM30.egjmV7jARfDpYns93oPpYeciqdkP7SmIBeBsViLz6cQ'
);

document.addEventListener("DOMContentLoaded", () => {
  const gallery = document.querySelector('.product-gallery');
  const modal = document.getElementById('productModal');
  const modalImgEl = document.getElementById('modalImg');
  const dots = document.getElementById('carouselDots');
  const variantButtons = document.getElementById('variantButtons');
  const variantSection = document.getElementById('variantSection');
  let imageList = [], currentIndex = 0;

  async function getCurrentUserId() {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id || null;
  }

  function renderCarousel(images) {
    imageList = images;
    currentIndex = 0;
    updateCarousel();

    const prevBtn = document.getElementById("prevImgBtn");
    const nextBtn = document.getElementById("nextImgBtn");
    const showArrows = imageList.length > 1;

    if (prevBtn && nextBtn) {
      prevBtn.style.display = showArrows ? 'flex' : 'none';
      nextBtn.style.display = showArrows ? 'flex' : 'none';
    }
  }

  function updateCarousel() {
    if (!imageList.length) return;
    modalImgEl.src = imageList[currentIndex];
    dots.innerHTML = imageList.map((_, i) => `
      <span class="dot ${i === currentIndex ? 'active' : ''}" data-index="${i}"></span>
    `).join('');
  }

  document.getElementById("prevImgBtn")?.addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + imageList.length) % imageList.length;
    updateCarousel();
  });

  document.getElementById("nextImgBtn")?.addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % imageList.length;
    updateCarousel();
  });

  dots?.addEventListener('click', (e) => {
    if (e.target.classList.contains("dot")) {
      currentIndex = parseInt(e.target.dataset.index);
      updateCarousel();
    }
  });

  async function handleWishlistClick() {
    const productId = modal.getAttribute("data-product-id");
    const productTable = modal.getAttribute("data-product-table");
    const userId = await getCurrentUserId();
    const wishlistBtn = document.querySelector(".wishlist-btn");
    if (!userId) return alert("Please log in to use wishlist.");

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
      await supabase.from("Wishlist").insert([{ user_id: userId, product_id: productId, product_table: productTable }]);
      wishlistBtn.textContent = "♥ Remove from Wishlist";
      alert("✅ Added to wishlist!");
    }
  }

  async function handleBasketClick() {
    const userId = await getCurrentUserId();
    if (!userId) return alert("Please log in to add items to the basket.");

    const productId = modal.getAttribute('data-product-id');
    const size = document.getElementById('sizeSelect').value;

    const { data: existingItem } = await supabase
      .from('Basket')
      .select('id, quantity')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .eq('size', size)
      .single();

    if (existingItem) {
      await supabase.from('Basket').update({ quantity: existingItem.quantity + 1 }).eq('id', existingItem.id);
      alert("🔁 Quantity updated in basket.");
    } else {
      await supabase.from('Basket').insert([{ user_id: userId, product_id: productId, size, quantity: 1 }]);
      alert("✅ Added to basket!");
    }
  }

  function populateSizes(product) {
    const sizeSelect = document.getElementById('sizeSelect');
    sizeSelect.innerHTML = '';
    product.sizes?.split(',').forEach(size => {
      const option = document.createElement('option');
      option.value = size.trim();
      option.textContent = size.trim();
      sizeSelect.appendChild(option);
    });
  }

  async function loadVariant(productId) {
    const { data: product } = await supabase.from('Products_Women').select('*').eq('id', productId).single();
    if (!product) return;

    modal.setAttribute('data-product-id', product.id);
    const images = [product.image_url].concat(product.images?.split(',').map(img => img.trim()) || []);
    renderCarousel(images);

    document.getElementById('modalTitle').textContent = product.title;
    document.getElementById('modalDescription').innerHTML = product.description;
    document.getElementById('modalPrice').textContent = `£${product.price.toFixed(2)}`;

    populateSizes(product);

    const basketBtn = document.querySelector('.basket-btn');
    basketBtn.style.display = product.stock === 0 ? 'none' : 'block';
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
  }

  async function openProductModal(product) {
    if (!product || !product.id) return;
    modal.setAttribute('data-product-id', product.id);
    modal.setAttribute('data-product-table', 'Products_Women');
    await loadVariant(product.id);

    const { data: variants } = await supabase
      .from('Products_Women')
      .select('id,image_url')
      .eq('group_id', product.group_id)
      .order('is_main_variant', { ascending: false });

    variantButtons.innerHTML = '';
    if (variants && variants.length > 1) {
      variantSection.style.display = 'block';
      variants.forEach(variant => {
        const btn = document.createElement('img');
        btn.src = variant.image_url;
        btn.className = 'variant-thumb';
        btn.onclick = () => loadVariant(variant.id);
        variantButtons.appendChild(btn);
      });
    } else {
      variantSection.style.display = 'none';
    }

    modal.style.display = 'block';
  }
  

  async function loadProducts() {
    gallery.innerHTML = '';
    const { data: products } = await supabase
      .from('Products_Women')
      .select('*')
      .eq('is_available', true)
      .eq('is_main_variant', true);

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

      div.querySelector('img').addEventListener('click', () => openProductModal(product));
      gallery.appendChild(div);
    });
  }

  document.getElementById('modalClose')?.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  // Zoom functionality
  const zoomBtn = document.getElementById('zoomToggleBtn');
  const zoomIcon = document.getElementById('zoomIcon');
  const zoomPanel = document.getElementById('zoomPanel');
  const zoomToggle = document.getElementById('zoomToggle');
  let zoomEnabled = false;

  zoomBtn?.addEventListener('click', () => {
    const isZoomed = modalImgEl.classList.toggle('zoomed');
    if (zoomIcon) {
      zoomIcon.src = isZoomed
        ? 'images/svg/magnifying_zoom_out.svg'
        : 'images/svg/magnifying_zoom_in.svg';
      zoomIcon.alt = isZoomed ? 'Zoom Out' : 'Zoom In';
    }
  });

  zoomToggle?.addEventListener('click', () => {
    zoomEnabled = !zoomEnabled;
    if (!zoomEnabled && zoomPanel) zoomPanel.style.display = 'none';
  });

  modalImgEl?.addEventListener('mousemove', e => {
    if (!zoomEnabled || !zoomPanel) return;
    const rect = modalImgEl.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    zoomPanel.style.display = 'block';
    zoomPanel.style.left = `${e.pageX + 20}px`;
    zoomPanel.style.top = `${e.pageY - 100}px`;
    zoomPanel.style.backgroundImage = `url('${modalImgEl.src}')`;
    zoomPanel.style.backgroundPosition = `${x}% ${y}%`;
  });

  modalImgEl?.addEventListener('mouseleave', () => {
    if (zoomEnabled && zoomPanel) zoomPanel.style.display = 'none';
  });

  loadProducts();
});
