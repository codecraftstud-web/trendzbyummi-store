// Product data structure
let products = JSON.parse(localStorage.getItem('trendzbyummi_products')) || [
    {
        id: 1,
        name: "Classic Unisex T-Shirt",
        price: 89.99,
        description: "Premium cotton t-shirt for everyday comfort",
        image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400"
    },
    {
        id: 2,
        name: "Designer Hoodie",
        price: 149.99,
        description: "Warm and stylish hoodie for all seasons",
        image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400"
    },
    {
        id: 3,
        name: "Casual Jeans",
        price: 129.99,
        description: "Comfortable jeans perfect for any occasion",
        image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400"
    }
];

let cart = JSON.parse(localStorage.getItem('trendzbyummi_cart')) || [];

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

// Initialize the store
function initStore() {
    displayProducts();
    updateCart();
    
    // Event Listeners
    cartIcon.addEventListener('click', toggleCart);
    closeCart.addEventListener('click', toggleCart);
    checkoutBtn.addEventListener('click', openCheckoutModal);
    closeModal.addEventListener('click', closeCheckoutModal);
    adminToggle.addEventListener('click', toggleAdminPanel);
    addProductForm.addEventListener('submit', addNewProduct);
    checkoutForm.addEventListener('submit', processOrder);
    
    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === checkoutModal) {
            closeCheckoutModal();
        }
    });
}

// Display products
function displayProducts() {
    productGrid.innerHTML = '';
    
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <img src="${product.image}" alt="${product.name}" class="product-image">
            <div class="product-info">
                <h3>${product.name}</h3>
                <div class="product-price">GHS ${product.price.toFixed(2)}</div>
                <p class="product-desc">${product.description}</p>
                <button class="add-to-cart" onclick="addToCart(${product.id})">
                    Add to Cart
                </button>
            </div>
        `;
        productGrid.appendChild(productCard);
    });
}

// Cart functionality
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
    showNotification(`${product.name} added to cart!`);
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCart();
}

function updateCart() {
    // Save to localStorage
    localStorage.setItem('trendzbyummi_cart', JSON.stringify(cart));
    
    // Update cart count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    // Update cart items display
    cartItems.innerHTML = '';
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p>Your cart is empty</p>';
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
            <img src="${item.image}" alt="${item.name}" class="cart-item-image">
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

// Checkout functionality
function openCheckoutModal() {
    if (cart.length === 0) {
        showNotification('Your cart is empty!');
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
    const paymentMethod = formData.get('payment');
    
    // Prepare order details
    const orderDetails = {
        items: cart,
        total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        customer: {
            name: checkoutForm.querySelector('input[type="text"]').value,
            phone: checkoutForm.querySelector('input[type="tel"]').value,
            email: checkoutForm.querySelector('input[type="email"]').value,
            address: checkoutForm.querySelector('textarea').value
        },
        paymentMethod: paymentMethod,
        timestamp: new Date().toISOString()
    };
    
    // Save order to localStorage (in a real app, this would go to a server)
    const orders = JSON.parse(localStorage.getItem('trendzbyummi_orders')) || [];
    orders.push(orderDetails);
    localStorage.setItem('trendzbyummi_orders', JSON.stringify(orders));
    
    // Send WhatsApp message
    sendWhatsAppOrder(orderDetails);
    
    // Clear cart and close modals
    cart = [];
    updateCart();
    closeCheckoutModal();
    toggleCart();
    
    showNotification('Order placed successfully! We will contact you shortly.');
    checkoutForm.reset();
}

function sendWhatsAppOrder(orderDetails) {
    const itemsText = orderDetails.items.map(item => 
        `${item.name} (GHS ${item.price.toFixed(2)} x ${item.quantity})`
    ).join('%0A');
    
    const message = `New Order from TrendzByUmmi Website!%0A%0A` +
                   `Customer: ${orderDetails.customer.name}%0A` +
                   `Phone: ${orderDetails.customer.phone}%0A` +
                   `Email: ${orderDetails.customer.email}%0A` +
                   `Address: ${orderDetails.customer.address}%0A%0A` +
                   `Items:%0A${itemsText}%0A%0A` +
                   `Total: GHS ${orderDetails.total.toFixed(2)}%0A` +
                   `Payment Method: ${orderDetails.paymentMethod.toUpperCase()}%0A` +
                   `Order Time: ${new Date(orderDetails.timestamp).toLocaleString()}`;
    
    const whatsappUrl = `https://wa.me/233591562900?text=${message}`;
    
    // Open WhatsApp in a new tab
    window.open(whatsappUrl, '_blank');
}

// Admin functionality
function toggleAdminPanel() {
    adminContent.classList.toggle('active');
}

function addNewProduct(e) {
    e.preventDefault();
    
    const newProduct = {
        id: Date.now(), // Simple ID generation
        name: document.getElementById('productName').value,
        price: parseFloat(document.getElementById('productPrice').value),
        description: document.getElementById('productDesc').value,
        image: document.getElementById('productImage').value
    };
    
    products.push(newProduct);
    localStorage.setItem('trendzbyummi_products', JSON.stringify(products));
    
    displayProducts();
    addProductForm.reset();
    showNotification('Product added successfully!');
}

// Utility functions
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: #e44c65;
        color: white;
        padding: 1rem 2rem;
        border-radius: 5px;
        z-index: 1003;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Initialize store when DOM is loaded
document.addEventListener('DOMContentLoaded', initStore);
