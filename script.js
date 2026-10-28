// ============================================
// SCRIPT.JS  -  how the website behaves
// ============================================

// 1. OUR PRODUCTS
// This is an "array" (a list) of "objects" (one per product).
// To add a product, copy one block and change the values.
// To use a real photo: put it in an "images" folder and add  image: "images/my-photo.jpg"
const clothingSizes = ["S", "M", "L", "XL"];

const products = [
  { id: 1, name: "White Logo Tee", category: "tees",    price: 35, color: "#ececec", image: "images/white-logo-tee.png", sizes: clothingSizes },
  { id: 2, name: "Night Logo Tee", category: "tees",    price: 35, color: "#000000", image: "images/night-logo-tee.png", sizes: clothingSizes },
  { id: 3, name: "Heavy Hoodie",   category: "hoodies", price: 85, color: "#87051d", image: "images/red-hoodie.png",     sizes: clothingSizes },
  { id: 6, name: "Wool Beanie",    category: "caps",    price: 28, color: "#ececec", image: "images/logo-beanie.png",    sizes: ["One size"] },
];

// 2. THE CART
// An empty list at first. Each item will look like: { id: 1, quantity: 2 }
let cart = [];

// 3. GRAB ELEMENTS FROM THE HTML
// document.getElementById("x") finds the element with id="x"
const productGrid = document.getElementById("product-grid");
const filterButtons = document.querySelectorAll(".filter");
const cartCount = document.getElementById("cart-count");
const cartItems = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const cartDrawer = document.getElementById("cart-drawer");
const overlay = document.getElementById("overlay");

// Small helper: turns 35 into "€35.00"
function formatPrice(number) {
  return "€" + number.toFixed(2);
}

// 4. SHOW PRODUCTS ON THE PAGE
// "category" is "all", "tees", "hoodies" or "caps"
function showProducts(category) {
  // Keep only the products that match the chosen category
  let visibleProducts = products;
  if (category !== "all") {
    visibleProducts = products.filter(function (product) {
      return product.category === category;
    });
  }

  // Start with empty HTML, then add one card per product
  let html = "";
  visibleProducts.forEach(function (product) {
    // If the product has a photo, use it. If not, show a colored block with the name.
    let imageHtml;
    if (product.image) {
      imageHtml = '<img src="' + product.image + '" alt="' + product.name + '" loading="lazy">';
    } else {
      imageHtml = product.name;
    }

      if (product.image) {
    imageHtml = '<img src="' + product.image + '" alt="' + product.name + '" loading="lazy">';
  } else {
    imageHtml = product.name;
  }

  // Build the <option> list for the size dropdown
  let sizeOptions = "";
  if (product.sizes.length > 1) {
    sizeOptions += '<option value="" selected disabled>Select size</option>';
  }
  product.sizes.forEach(function (size) {
    sizeOptions += '<option value="' + size + '">' + size + "</option>";
  });

    html += `
      <article class="product-card">
        <div class="product-image" style="background:${product.color}; color:${product.textColor || "#000"}">
          ${imageHtml}
        </div>
        <div class="product-info">
          <span class="product-name">${product.name}</span>
          <span class="product-price">${formatPrice(product.price)}</span>
        </div>
          <label class="visually-hidden" for="size-${product.id}">Size for ${product.name}</label>
          <select class="size-select" id="size-${product.id}">${sizeOptions}</select>
          <button class="add-button" data-id="${product.id}">Add to cart</button>
      </article>
    `;
  });

  // Put the finished HTML inside the grid
  productGrid.innerHTML = html;
}

// 5. FILTER BUTTONS
// When a filter button is clicked: mark it active and show matching products
filterButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    filterButtons.forEach(function (b) {
      b.classList.remove("active");
    });
    button.classList.add("active");

    showProducts(button.dataset.filter);
  });
});

// 6. ADD TO CART
// One listener on the whole grid catches clicks on any "Add to cart" button
productGrid.addEventListener("click", function (event) {
  if (event.target.classList.contains("add-button")) {
    const id = Number(event.target.dataset.id);

    // Find the dropdown inside the same product card
    const card = event.target.closest(".product-card");
    const select = card.querySelector(".size-select");
    const size = select.value;

    // No size chosen yet: highlight the dropdown and stop
    if (size === "") {
      select.classList.add("error");
      select.focus();
      return;
    }

    addToCart(id, size);
  }
});

// Remove the red border as soon as a size is picked
productGrid.addEventListener("change", function (event) {
  if (event.target.classList.contains("size-select")) {
    event.target.classList.remove("error");
  }
});

function addToCart(id, size) {
  // Same product AND same size = same cart line
  const existing = cart.find(function (item) {
    return item.id === id && item.size === size;
  });

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ id: id, size: size, quantity: 1 });
  }

  saveCart();
  showCart();
  openCart();
}

// 7. SHOW THE CART
function showCart() {
  let html = "";
  let total = 0;
  let count = 0;

  cart.forEach(function (item) {
    // Look up the full product info using the id
    const product = products.find(function (p) {
      return p.id === item.id;
    });

    total += product.price * item.quantity;
    count += item.quantity;

    html += `
      <li class="cart-item">
        <div>
          <strong>${product.name}</strong> (${item.size})<br>
          ${formatPrice(product.price)}
          <div class="cart-item-controls">
            <button data-action="minus" data-id="${item.id}" data-size="${item.size}" aria-label="One less">-</button>
            <span>${item.quantity}</span>
            <button data-action="plus" data-id="${item.id}" data-size="${item.size}" aria-label="One more">+</button>
          </div>
        </div>
        <button class="remove-button" data-action="remove" data-id="${item.id}" data-size="${item.size}">Remove</button>
      </li>
    `;
  });

  if (cart.length === 0) {
    html = '<li class="cart-empty">Your cart is empty. Add something from the shop.</li>';
  }

  cartItems.innerHTML = html;
  cartTotal.textContent = formatPrice(total);
  cartCount.textContent = count;
}

// Clicks on the + / - / Remove buttons inside the cart
cartItems.addEventListener("click", function (event) {
  const action = event.target.dataset.action;
  const id = Number(event.target.dataset.id);
  const size = event.target.dataset.size;
  if (!action) return; // clicked something else, do nothing

  const item = cart.find(function (i) {
    return i.id === id && i.size === size;
  });

  if (action === "plus") {
    item.quantity += 1;
  } else if (action === "minus") {
    item.quantity -= 1;
  } else if (action === "remove") {
    item.quantity = 0;
  }

  // Throw away items with quantity 0
  cart = cart.filter(function (i) {
    return i.quantity > 0;
  });

  saveCart();
  showCart();
});

// 8. OPEN / CLOSE THE CART
function openCart() {
  cartDrawer.classList.add("open");
  overlay.classList.add("open");
}

function closeCart() {
  cartDrawer.classList.remove("open");
  overlay.classList.remove("open");
}

document.getElementById("open-cart").addEventListener("click", openCart);
document.getElementById("close-cart").addEventListener("click", closeCart);
overlay.addEventListener("click", closeCart);

// Press the Escape key to close the cart
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") closeCart();
});

// 9. REMEMBER THE CART AFTER A REFRESH
// localStorage keeps small bits of text inside the visitor's browser
function saveCart() {
  try {
    localStorage.setItem("oddHoursCart", JSON.stringify(cart));
  } catch (error) {
    // If storage is blocked, the cart still works, it just won't be remembered
  }
}

function loadCart() {
  try {
    const saved = localStorage.getItem("oddHoursCart");
    if (saved) cart = JSON.parse(saved);
  } catch (error) {
    cart = [];
  }

  // Drop saved items whose product no longer exists in the list
  cart = cart.filter(function (item) {
    return item.size && products.some(function (p) {
      return p.id === item.id;
    });
  });
}
// 10. CHECKOUT
// A real shop would send the visitor to a payment page here (see the money tips)
document.getElementById("checkout").addEventListener("click", function () {
  if (cart.length === 0) {
    alert("Your cart is empty.");
  } else {
    alert("This is a school project, so there is no real payment yet.");
  }
});

// 11. NEWSLETTER FORM
document.getElementById("newsletter-form").addEventListener("submit", function (event) {
  event.preventDefault(); // stop the page from reloading
  const email = document.getElementById("email").value;
  document.getElementById("newsletter-message").textContent = "Thanks! " + email + " is on the list.";
  this.reset();
});

// 12. START: run when the page loads
loadCart();
showProducts("all");
showCart();
