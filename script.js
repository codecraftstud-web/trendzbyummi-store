// Product data
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

// Initialize store
function initStore() {
    displayProducts();
    updateCart();
    
    // Event listeners
    document.querySelector('.cart-icon').addEventListener('click', toggleCart);
    document.getElementById('closeCart').addEventListener('click', toggleCart);
    document.getElementById('checkoutBtn').addEventListener('click', openCheckoutModal);
    document.querySelector('.close-modal').addEventListener('click', closeCheckoutModal);
    document.getElementById('adminToggle').addEventListener('click', toggleAdminPanel);
    document.getElementById('addProductForm').addEventListener('submit', addNewProduct);
    document.getElementById('checkoutForm').addEventListener('submit', processOrder);
    
    // Close modals when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === document.getElementById('checkoutModal')) {
            closeCheckoutModal();
        }
    });
}

// Display products
function displayProducts() {
    const productGrid = document.getElementById('productGrid');
    productGrid.innerHTML = '';
    
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        
        const imageContent = product.image ? 
            `<img src="${product.image}" alt="${product.name}" class="product-image">` :
            `<div class="product-image" style="display: flex; align-items: center; justify-content: center; color: #666;">
                <div style="text-align: center;">
                    <i class="fas fa-shirt" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                    <div>Product Image</div>
                </div>
            </div>`;
        
        productCard.innerHTML = `
            ${imageContent}
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

// Cart functions
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
    localStorage.setItem('trendzbyummi_cart', JSON.stringify(cart));
    
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.querySelector('.cart-count').textContent = totalItems;
    
    const cartItems = document.getElementById('cartItems');
    cartItems.innerHTML = '';
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p style="text-align: center; color: #666;">Your cart is empty</p>';
        document.getElementById('cartTotal').textContent = '0.00';
        return;
    }
    
    let total = 0;
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        const cartItemElement = document.createElement('div');
        cartItemElement.className = 'cart-item';
        cartItemElement.innerHTML = `
            <img src="${item.image || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2Y4ZjlmYSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiM2Yzc1N2QiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZTwvdGV4dD48L3N2Zz4='}" alt="${item.name}" class="cart-item-image">
            <div class="cart-item-details">
                <h4>${item.name}</h4>
                <div class="cart-item-price">GHS ${item.price.toFixed(2)} x ${item.quantity}</div>
            </div>
            <button class="remove-item" onclick="removeFromCart(${item.id})">
                <i class="fas fa-trash"></i>
            </button>
        `;
        cartItems.appendChild(cartItemElement);
    });
    
    document.getElementById('cartTotal').textContent = total.toFixed(2);
}

function toggleCart() {
    document.getElementById('cartSidebar').classList.toggle('active');
}

// Checkout functions
function openCheckoutModal() {
    if (cart.length === 0) {
        showNotification('Your cart is empty!');
        return;
    }
    document.getElementById('checkoutModal').style.display = 'block';
}

function closeCheckoutModal() {
    document.getElementById('checkoutModal').style.display = 'none';
}

function processOrder(e) {
    e.preventDefault();
    
    const formData = new FormData(document.getElementById('checkoutForm'));
    const name = document.querySelector('#checkoutForm input[type="text"]').value;
    const phone = document.querySelector('#checkoutForm input[type="tel"]').value;
    const email = document.querySelector('#checkoutForm input[type="email"]').value;
    const address = document.querySelector('#checkoutForm textarea').value;
    const paymentMethod = formData.get('payment');
    
    const orderDetails = {
        items: cart,
        total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        customer: { name, phone, email, address },
        paymentMethod: paymentMethod,
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
    
    showNotification('Order placed successfully! We will contact you shortly.');
    document.getElementById('checkoutForm').reset();
}

function sendWhatsAppOrder(orderDetails) {
    const itemsText = orderDetails.items.map(item => 
        `${item.name} (GHS ${item.price.toFixed(2)} x ${item.quantity})`
    ).join('%0A');
    
    const message = `New Order from TrendzByUmmi!%0A%0A` +
                   `Customer: ${orderDetails.customer.name}%0A` +
                   `Phone: ${orderDetails.customer.phone}%0A` +
                   `Email: ${orderDetails.customer.email}%0A` +
                   `Address: ${orderDetails.customer.address}%0A%0A` +
                   `Items:%0A${itemsText}%0A%0A` +
                   `Total: GHS ${orderDetails.total.toFixed(2)}%0A` +
                   `Payment: ${orderDetails.paymentMethod.toUpperCase()}%0A` +
                   `Time: ${orderDetails.timestamp}`;
    
    const whatsappUrl = `https://wa.me/233591562900?text=${message}`;
    window.open(whatsappUrl, '_blank');
}

// Admin functions
function toggleAdminPanel() {
    document.getElementById('adminContent').classList.toggle('active');
}

function addNewProduct(e) {
    e.preventDefault();
    
    const newProduct = {
        id: Date.now(),
        name: document.getElementById('productName').value,
        price: parseFloat(document.getElementById('productPrice').value),
        description: document.getElementById('productDesc').value,
        image: document.getElementById('productImage').value
    };
    
    products.push(newProduct);
    localStorage.setItem('trendzbyummi_products', JSON.stringify(products));
    
    displayProducts();
    document.getElementById('addProductForm').reset();
    showNotification('Product added successfully!');
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
        border-radius: 5px;
        z-index: 1003;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', initStore);