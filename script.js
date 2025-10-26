l// Secure Admin Authentication
const adminConfig = {
    password: "trendz2024",
    isAuthenticated: false
};

// Product data structure
let products = JSON.parse(localStorage.getItem('trendzbyummi_products')) || [
    {
        id: 1,
        name: "Premium Unisex T-Shirt",
        price: 89.99,
        description: "100% cotton, perfect for everyday wear. Available in multiple colors.",
        image: ""
    },
    {
        id: 2,
        name: "Designer Hoodie Collection",
        price: 149.99,
        description: "Stay warm and stylish with our premium hoodies. Perfect for Accra weather.",
        image: ""
    },
    {
        id: 3,
        name: "Signature Jeans",
        price: 129.99,
        description: "Classic fit jeans that combine comfort and style. Various washes available.",
        image: ""
    }
];

let cart = JSON.parse(localStorage.getItem('trendzbyummi_cart')) || [];
let currentImageFile = null;

// DOM Elements
const productGrid = document.getElementById('productGrid');
const cartSidebar = document.getElementById('cartSidebar');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const cartCount = document.querySelector('.cart-count');
const cartIcon = document.querySelector('.cart-icon');
const closeCart = document.getElementById('closeCart');
const checkoutBtn = document.getElementById('checkoutBtn');
const checkoutModal = document.getElementById('checkoutModal');
const closeModal = document.querySelector('.close-modal');
const checkoutForm = document.getElementById('checkoutForm');
const adminToggle = document.getElementById('adminToggle');
const adminContent = document.getElementById('adminContent');
const addProductForm = document.getElementById('addProductForm');
const productCount = document.getElementById('productCount');
const orderCount = document.getElementById('orderCount');
const uploadArea = document.getElementById('uploadArea');
const imagePreview = document.getElementById('imagePreview');
const imageUrlInput = document.getElementById('productImage');
const uploadButton = document.getElementById('uploadButton');

// Initialize the store
function initStore() {
    displayProducts();
    updateCart();
    updateAdminStats();
    setupImageUpload();
    
    // Event Listeners
    cartIcon.addEventListener('click', toggleCart);
    closeCart.addEventListener('click', toggleCart);
    checkoutBtn.addEventListener('click', openCheckoutModal);
    closeModal.addEventListener('click', closeCheckoutModal);
    adminToggle.addEventListener('click', toggleAdminPanel);
    addProductForm.addEventListener('submit', addNewProduct);
    checkoutForm.addEventListener('submit', processOrder);
    
    // Show special offer on load
    setTimeout(showSpecialOffer, 2000);
    
    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === checkoutModal) {
            closeCheckoutModal();
        }
        if (!adminContent.contains(e.target) && e.target !== adminToggle) {
            adminContent.classList.remove('active');
        }
    });
}

// Image Upload Functionality
function setupImageUpload() {
    uploadArea.addEventListener('click', () => {
        document.getElementById('fileInput').click();
    });
    
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = 'var(--accent)';
        uploadArea.style.background = '#f0f0f0';
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.style.borderColor = '#ddd';
        uploadArea.style.background = '#fafafa';
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#ddd';
        uploadArea.style.background = '#fafafa';
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleImageFile(files[0]);
        }
    });
    
    document.getElementById('fileInput').addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleImageFile(e.target.files[0]);
        }
    });
    
    uploadButton.addEventListener('click', uploadToImgur);
}

function handleImageFile(file) {
    if (!file.type.startsWith('image/')) {
        showNotification('❌ Please select an image file');
        return;
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
        showNotification('❌ Image size should be less than 5MB');
        return;
    }
    
    currentImageFile = file;
    
    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
        imagePreview.src = e.target.result;
        imagePreview.style.display = 'block';
        uploadButton.disabled = false;
        uploadArea.innerHTML = '<i class="fas fa-check-circle" style="color: var(--accent);"></i><div class="upload-text">Image selected! Click upload</div>';
    };
    reader.readAsDataURL(file);
}

function uploadToImgur() {
    if (!currentImageFile) {
        showNotification('❌ Please select an image first');
        return;
    }
    
    uploadButton.disabled = true;
    uploadButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';
    
    const formData = new FormData();
    formData.append('image', currentImageFile);
    
    // Using a free image hosting service (imgbb as example)
    // Note: For production, use a proper backend or Imgur API with client ID
    fetch('https://api.imgbb.com/1/upload?key=YOUR_IMGBB_API_KEY', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const imageUrl = data.data.url;
            imageUrlInput.value = imageUrl;
            showNotification('✅ Image uploaded successfully!');
            uploadButton.innerHTML = '<i class="fas fa-check"></i> Uploaded';
            
            // Reset upload area
            setTimeout(() => {
                uploadArea.innerHTML = `
                    <i class="fas fa-cloud-upload-alt"></i>
                    <div class="upload-text">Tap to select product image<br><small>or drag & drop</small></div>
                `;
                imagePreview.style.display = 'none';
                uploadButton.disabled = true;
                uploadButton.innerHTML = '<i class="fas fa-upload"></i> Upload Image';
                currentImageFile = null;
            }, 2000);
        } else {
            throw new Error('Upload failed');
        }
    })
    .catch(error => {
        console.error('Upload error:', error);
        showNotification('❌ Upload failed. Using local image preview instead.');
        
        // Fallback: Use local data URL for demo purposes
        const reader = new FileReader();
        reader.onload = (e) => {
            imageUrlInput.value = e.target.result;
            uploadButton.innerHTML = '<i class="fas fa-check"></i> Local Image';
        };
        reader.readAsDataURL(currentImageFile);
    });
}

// Secure Admin Functions
function toggleAdminPanel() {
    if (!adminConfig.isAuthenticated) {
        showPasswordPrompt();
    } else {
        adminContent.classList.toggle('active');
    }
}

function showPasswordPrompt() {
    const password = prompt("🔐 Enter Admin Password:");
    if (password === adminConfig.password) {
        adminConfig.isAuthenticated = true;
        adminContent.classList.add('active');
        showNotification("✅ Admin access granted");
    } else if (password) {
        showNotification("❌ Incorrect password");
    }
}

function logoutAdmin() {
    adminConfig.isAuthenticated = false;
    adminContent.classList.remove('active');
    showNotification("🔒 Admin logged out");
}

// Display products
function displayProducts() {
    productGrid.innerHTML = '';
    
    products.forEach((product, index) => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.style.animationDelay = `${index * 0.1}s`;
        
        // Use placeholder if no image
        const imageContent = product.image ? 
            `<img src="${product.image}" alt="${product.name}" class="product-image" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjhmOWZhIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0jNmM3NTdkIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+UHJvZHVjdCBJbWFnZTwvdGV4dD48L3N2Zz4='">` :
            `<div class="product-image">
                <div style="text-align: center; padding: 2rem;">
                    <i class="fas fa-camera" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                    <div>Add Product Image</div>
                    <small style="opacity: 0.7;">Use admin panel to upload</small>
                </div>
            </div>`;
        
        productCard.innerHTML = `
            ${imageContent}
            <div class="product-info">
                <h3>${product.name}</h3>
                <div class="product-price">GHS ${product.price.toFixed(2)}</div>
                <p class="product-desc">${product.description}</p>
                <button class="add-to-cart" onclick="addToCart(${product.id})">
                    <i class="fas fa-shopping-bag"></i> Add to Cart
                </button>
            </div>
        `;
        productGrid.appendChild(productCard);
    });
}

// Cart functionality (keep all your existing cart functions)
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const cartItem = cart.find(item => item.id === productId);
    
    if (cartItem) {
        cartItem.quantity += 1;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }
    
    updateCart();
    showNotification(`✅ ${product.name} added to cart! 🛍️`);
    
    const cartIcon = document.querySelector('.cart-icon');
    cartIcon.classList.add('success-animation');
    setTimeout(() => cartIcon.classList.remove('success-animation'), 500);
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCart();
    showNotification("🗑️ Item removed from cart");
}

function updateCart() {
    localStorage.setItem('trendzbyummi_cart', JSON.stringify(cart));
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    cartItems.innerHTML = '';
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">Your cart is empty</p>';
        cartTotal.textContent = '0.00';
        return;
    }
    
    let total = 0;
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <img src="${item.image || 'https://via.placeholder.com/60'}" alt="${item.name}" class="cart-item-image">
            <div class="cart-item-details">
                <h4>${item.name}</h4>
                <div class="cart-item-price">GHS ${item.price.toFixed(2)} x ${item.quantity}</div>
            </div>
            <button class="remove-item" onclick="removeFromCart(${item.id})">
                <i class="fas fa-trash"></i>
            </button>
        `;
        cartItems.appendChild(cartItem);
    });
    
    cartTotal.textContent = total.toFixed(2);
}

function toggleCart() {
    cartSidebar.classList.toggle('active');
}

// Checkout functionality (keep all your existing checkout functions)
function openCheckoutModal() {
    if (cart.length === 0) {
        showNotification('🛒 Your cart is empty!');
        return;
    }
    checkoutModal.style.display = 'block';
}

function closeCheckoutModal() {
    checkoutModal.style.display = 'none';
}

function processOrder(e) {
    e.preventDefault();
    
    const formData = new FormData(checkoutForm);
    const name = checkoutForm.querySelector('input[type="text"]').value;
    const phone = checkoutForm.querySelector('input[type="tel"]').value;
    const email = checkoutForm.querySelector('input[type="email"]').value;
    const address = checkoutForm.querySelector('textarea').value;
    const paymentMethod = formData.get('payment');
    
    const orderDetails = {
        items: cart,
        total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        customer: { name, phone, email, address },
        paymentMethod,
        timestamp: new Date().toLocaleString()
    };
    
    sendWhatsAppOrder(orderDetails);
    
    const orders = JSON.parse(localStorage.getItem('trendzbyummi_orders')) || [];
    orders.push(orderDetails);
    localStorage.setItem('trendzbyummi_orders', JSON.stringify(orders));
    
    cart = [];
    updateCart();
    closeCheckoutModal();
    toggleCart();
    updateAdminStats();
    
    showNotification('✅ Order sent to WhatsApp! We will contact you shortly.');
    checkoutForm.reset();
}

function sendWhatsAppOrder(orderDetails) {
    const itemsText = orderDetails.items.map(item => 
        `• ${item.name} - GHS ${item.price.toFixed(2)} x ${item.quantity} = GHS ${(item.price * item.quantity).toFixed(2)}`
    ).join('%0A');
    
    const message = `🛍️ *NEW ORDER - TrendzByUmmi*%0A%0A` +
                   `👤 *Customer Details:*%0A` +
                   `Name: ${orderDetails.customer.name}%0A` +
                   `Phone: ${orderDetails.customer.phone}%0A` +
                   `Email: ${orderDetails.customer.email}%0A` +
                   `Address: ${orderDetails.customer.address}%0A%0A` +
                   `📦 *Order Items:*%0A${itemsText}%0A%0A` +
                   `💰 *Total: GHS ${orderDetails.total.toFixed(2)}*%0A` +
                   `💳 *Payment Method: ${orderDetails.paymentMethod.toUpperCase()}*%0A` +
                   `🕒 *Order Time: ${orderDetails.timestamp}*%0A%0A` +
                   `Thank you! 🎉`;
    
    const whatsappUrl = `https://wa.me/233591562900?text=${message}`;
    window.open(whatsappUrl, '_blank');
}

// Admin product management
function addNewProduct(e) {
    e.preventDefault();
    
    const newProduct = {
        id: Date.now(),
        name: document.getElementById('productName').value,
        price: parseFloat(document.getElementById('productPrice').value),
        description: document.getElementById('productDesc').value,
        image: imageUrlInput.value
    };
    
    products.push(newProduct);
    localStorage.setItem('trendzbyummi_products', JSON.stringify(products));
    
    displayProducts();
    addProductForm.reset();
    updateAdminStats();
    showNotification('✅ Product added successfully!');
}

function updateAdminStats() {
    productCount.textContent = products.length;
    const orders = JSON.parse(localStorage.getItem('trendzbyummi_orders')) || [];
    orderCount.textContent = orders.length;
}

// Utility functions
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: var(--accent);
        color: white;
        padding: 1rem 2rem;
        border-radius: 10px;
        z-index: 1003;
        animation: fadeInUp 0.3s ease;
        font-weight: 600;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'fadeInUp 0.3s ease reverse';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function showSpecialOffer() {
    showNotification("🎉 SPECIAL: FREE shipping on orders over GHS 300!");
}

// Initialize store when DOM is loaded
document.addEventListener('DOMContentLoaded', initStore);