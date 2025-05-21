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
  const modal = document.getElementById("productModal");
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
  } else {
    await supabase.from("Wishlist").insert([{ user_id: userId, product_id: productId, product_table: productTable }]);
    wishlistBtn.textContent = "♥ Remove from Wishlist";
  }
}

async function handleBasketClick() {
  const userId = await getCurrentUserId();
  const modal = document.getElementById("productModal");
  const productId = modal.getAttribute("data-product-id");
  const size = document.getElementById("sizeSelect").value;

  const { data: existingItem } = await supabase
    .from("Basket")
    .select("id, quantity")
    .eq("user_id", userId)
    .eq("product_id", productId)
    .eq("size", size)
    .single();

  if (existingItem) {
    await supabase.from("Basket").update({ quantity: existingItem.quantity + 1 }).eq("id", existingItem.id);
  } else {
    await supabase.from("Basket").insert([{ user_id: userId, product_id: productId, size, quantity: 1 }]);
  }
  alert("🛒 Added to Basket!");
}

function updateCarousel(images) {
  let currentIndex = 0;
  const imgElement = document.getElementById("modalImg");
  const dotsContainer = document.getElementById("carouselDots");
  const prev = document.querySelector(".carousel-prev");
  const next = document.querySelector(".carousel-next");

  const updateImage = () => {
    imgElement.src = images[currentIndex];
    dotsContainer.querySelectorAll("span").forEach((dot, i) => {
      dot.className = i === currentIndex ? "dot active" : "dot";
    });
  };

  dotsContainer.innerHTML = images.map((_, i) => `<span class="dot ${i === 0 ? 'active' : ''}"></span>`).join("");
  dotsContainer.querySelectorAll("span").forEach((dot, i) => dot.onclick = () => { currentIndex = i; updateImage(); });

  prev.onclick = () => { currentIndex = (currentIndex - 1 + images.length) % images.length; updateImage(); };
  next.onclick = () => { currentIndex = (currentIndex + 1) % images.length; updateImage(); };
  updateImage();
}

async function loadModelVariants(groupId, currentProductId) {
  const { data } = await supabase
    .from("Products_Women")
    .select("*")
    .eq("group_id", groupId)
    .eq("is_available", true);

  const container = document.getElementById("modelVariants");
  container.innerHTML = "";
  data.forEach(product => {
    const img = document.createElement("img");
    img.src = product.model_image;
    img.alt = product.model_name;
    img.className = "model-thumb";
    img.onclick = () => openProductModal(product);
    container.appendChild(img);
  });
}

function openProductModal(product) {
  const modal = document.getElementById("productModal");
  modal.setAttribute("data-product-id", product.id);
  modal.setAttribute("data-product-table", "Products_Women");

  const images = product.images ? product.images.split(",") : [product.image_url];
  updateCarousel(images);

  document.getElementById("modalTitle").textContent = product.title;
  document.getElementById("modalDescription").textContent = product.description;
  document.getElementById("modalPrice").textContent = `£${product.price.toFixed(2)}`;

  const sizeSelect = document.getElementById("sizeSelect");
  sizeSelect.innerHTML = "";
  product.sizes?.split(",").forEach(size => {
    const option = document.createElement("option");
    option.value = size.trim();
    option.textContent = size.trim();
    sizeSelect.appendChild(option);
  });

  document.querySelector(".basket-btn").onclick = handleBasketClick;
  document.querySelector(".wishlist-btn").onclick = handleWishlistClick;

  loadModelVariants(product.group_id, product.id);
  modal.style.display = "block";
}

async function loadProducts() {
  gallery.innerHTML = "";

  const { data: products } = await supabase
    .from("Products_Women")
    .select("*")
    .eq("is_available", true);

  products.forEach(product => {
    const div = document.createElement("div");
    div.className = "product";
    div.innerHTML = `
      <div class="product-img-wrapper">
        <img src="${product.image_url}" alt="${product.title}">
      </div>
      <p>${product.title}</p>
    `;
    div.querySelector("img").addEventListener("click", () => openProductModal(product));
    gallery.appendChild(div);
  });
}

document.getElementById("modalClose").addEventListener("click", () => {
  document.getElementById("productModal").style.display = "none";
});

loadProducts();
