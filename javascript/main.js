// Convertimos la función principal en 'async' para poder usar 'await'
document.addEventListener('DOMContentLoaded', async () => {

    // --- Detecta la ruta base ---
    let basePath = '';
    const path = window.location.pathname;
    
    if (path.includes('/pages/') || path.includes('/categoria/')) {
        basePath = '../';
    }

    // --- Traer información por medio de fetch ---
    const productos = await fetchProducts(basePath);

    // --- Guardar datos del usuario en sessionStorage (Login) ---
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault(); 
            const email = loginForm.querySelector('#email').value;
            sessionStorage.setItem('userEmail', email);
            console.log('Sesión exitosa, redirigiendo...');
            window.location.href = `${basePath}index.html`; 
        });
    }

    // --- RENDERIZADO DE COMPONENTES ---
    renderNavbar(basePath); // <-- Aquí ahora decide qué botón mostrar
    renderFooter(); 
    initCarousel(basePath); 

    // --- Cerrar Sesión (Solo funciona si el botón existe) ---
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            sessionStorage.removeItem('userEmail'); // Borramos el usuario
            console.log('Cerrando sesión, redirigiendo...');
            window.location.href = `${basePath}pages/login.html`;
        });
    }

    // --- Lógica de filtrado de categorías ---
    let categoryFilter = 'all'; 
    if (path.includes('/remeras.html')) categoryFilter = 'remeras';
    else if (path.includes('/pantalones.html')) categoryFilter = 'pantalones';
    else if (path.includes('/abrigos.html')) categoryFilter = 'abrigos';
    else if (path.includes('/accesorios.html')) categoryFilter = 'accesorios';

    // --- Rellenar las cards (Catálogo) ---
    renderProductGrid(basePath, categoryFilter, productos);
    
    // --- Lógica de la Página del Carrito ---
    const cartContainer = document.getElementById('cart-items-container');
    if (cartContainer) {
        renderCartItems(cartContainer, basePath);
    }

});

// --- Función de Fetch ---
async function fetchProducts(basePath) {
    try {
        const response = await fetch(`${basePath}data/productos.json`);
        if (!response.ok) throw new Error(`Error al cargar productos: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error(error);
        return []; 
    }
}

// --- Estructura de datos para el Navbar ---
const navLinks = [
    { title: 'Inicio', url: 'index.html' },
    { title: 'Remeras', url: 'categoria/remeras.html' },
    { title: 'Pantalones', url: 'categoria/pantalones.html' },
    { title: 'Abrigos', url: 'categoria/abrigos.html' },
    { title: 'Accesorios', url: 'categoria/accesorios.html' },
    { title: 'Carrito', url: 'pages/carrito.html' }
];

// --- Render Navbar (CON LÓGICA DE LOGIN/LOGOUT) ---
function renderNavbar(basePath) {
    const header = document.getElementById('header-placeholder');
    if (!header) return; 

    // Verificamos si hay usuario logueado
    const user = sessionStorage.getItem('userEmail');

    // 2. Calculamos el contador del carrito
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
    const cartLabel = totalItems > 0 ? `Carrito (${totalItems})` : 'Carrito';

    const linksHtml = navLinks.map(link => {
        const title = link.title === 'Carrito' ? cartLabel : link.title;
        return `<li><a href="${basePath}${link.url}">${title}</a></li>`;
    }).join(''); 

    // Generamos el link de Login o Logout según corresponda
    let authLinkHtml = '';
    if (user) {
        // Si hay usuario: Botón de Cerrar Sesión
        authLinkHtml = `<li><a href="#" id="logout-btn" style="color: var(--color-primario); font-weight: bold;">Cerrar Sesión</a></li>`;
    } else {
        // Si NO hay usuario: Botón de Iniciar Sesión
        authLinkHtml = `<li><a href="${basePath}pages/login.html">Iniciar Sesión</a></li>`;
    }

    header.innerHTML = `
        <nav>
            <a href="${basePath}index.html" class="logo">
                <img src="${basePath}images/logo.png" alt="Logo Amarte Showroom">
            </a>
            <ul>
                ${linksHtml}
                ${authLinkHtml} </ul>
        </nav>
    `;
}

// --- Render Footer ---
function renderFooter() {
    const footer = document.getElementById('footer-placeholder');
    if (!footer) return;
    footer.innerHTML = `<p>© ${new Date().getFullYear()} Amarte Showroom. Todos los derechos reservados.</p>`;
}

// --- Render Carrusel (Luxury) ---
function initCarousel(basePath) {
    const container = document.getElementById('carousel-placeholder');
    if (!container) return; 

    const slidesData = [
        {
            img: 'images/banner1.jpg', 
            title: 'ELEGANCIA ATEMPORAL',
            text: 'Descubre la nueva colección 2025.'
        },
        {
            img: 'images/banner2.jpg', 
            title: 'ESENCIA & CARÁCTER',
            text: 'Prendas que definen tu estilo.'
        },
        {
            img: 'images/banner3.jpg', 
            title: 'DENIM DE ALTA COSTURA',
            text: 'La comodidad se encuentra con el lujo.'
        }
    ];

    let currentSlide = 0;

    slidesData.forEach((item, index) => {
        const slide = document.createElement('div');
        slide.className = 'carousel-slide';
        if (index === 0) slide.classList.add('active');

        slide.innerHTML = `
            <img src="${basePath}${item.img}" alt="${item.title}">
            <div class="carousel-overlay"></div>
            <div class="carousel-content">
                <h2>${item.title}</h2>
                <p>${item.text}</p>
                <a href="#" class="btn-luxury">VER COLECCIÓN</a>
            </div>
        `;
        container.appendChild(slide);
    });

    const slides = document.querySelectorAll('.carousel-slide');
    setInterval(() => {
        slides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.add('active');
    }, 5000); 
}

// --- Función Renderizado de Grilla (Catálogo) ---
function renderProductGrid(basePath, categoryFilter, productos) { 
    const productGrid = document.querySelector('.product-grid');
    if (!productGrid) return;
    productGrid.innerHTML = '';
    
    let productosAMostrar;
    
    if (categoryFilter === 'all') {
        productosAMostrar = [];
        const categorias = ['remeras', 'pantalones', 'abrigos', 'accesorios'];
        categorias.forEach(cat => {
            const productosDeCategoria = productos.filter(p => p.category === cat);
            productosAMostrar.push(...productosDeCategoria.slice(0, 2));
        });
    } else {
        productosAMostrar = productos.filter(producto => producto.category === categoryFilter);
    }
    
    productosAMostrar.forEach(producto => {
        const productoConRuta = { ...producto, img: `${basePath}${producto.img}` };
        productGrid.innerHTML += renderProductCard(productoConRuta);
    });
    
    activateProductCards(); 
    addCartEventListeners(productos, basePath); 
}

// --- Estructura de Card ---
function renderProductCard(producto) {
    return `
        <div class="product-card" data-id="${producto.id}">
            <img src="${producto.img}" alt="${producto.title}">
            <div class="card-body">
                <h3>${producto.title}</h3>
                <p>${producto.desc}</p>
                <p class="price">$${producto.price.toLocaleString('es-AR')}</p>
                
                <div class="quantity-selector">
                    <button class="btn-minus">-</button>
                    <span class="quantity-num">1</span>
                    <button class="btn-plus">+</button>
                </div>
                <button class="add-to-cart" data-id="${producto.id}">Agregar al carrito</button>
            </div>
        </div>
    `;
}

// --- Activar botones + y - ---
function activateProductCards() {
    const cards = document.querySelectorAll('.product-card');
    cards.forEach(card => {
        const btnMinus = card.querySelector('.btn-minus');
        const btnPlus = card.querySelector('.btn-plus');
        const quantitySpan = card.querySelector('.quantity-num');

        btnMinus.addEventListener('click', () => {
            let currentQty = parseInt(quantitySpan.innerText);
            if (currentQty > 1) quantitySpan.innerText = currentQty - 1;
        });

        btnPlus.addEventListener('click', () => {
            let currentQty = parseInt(quantitySpan.innerText);
            quantitySpan.innerText = currentQty + 1;
        });
    });
}

// --- Agregar al Carrito ---
function addCartEventListeners(productos, basePath) {
    const buttons = document.querySelectorAll('.add-to-cart');
    buttons.forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = e.target.dataset.id;
            const card = e.target.closest('.product-card');
            const quantity = parseInt(card.querySelector('.quantity-num').innerText);

            const productToAdd = productos.find(p => p.id == productId);
            if (!productToAdd) return;

            const cartItem = { ...productToAdd, quantity: quantity };
            let cart = JSON.parse(localStorage.getItem('cart') || '[]');
            
            const existingIndex = cart.findIndex(p => p.id == productId);
            if (existingIndex > -1) {
                cart[existingIndex].quantity += quantity;
            } else {
                cart.push(cartItem);
            }
            
            localStorage.setItem('cart', JSON.stringify(cart));
            
            // Actualizar Navbar (Contador)
            renderNavbar(basePath);

            alert(`¡Agregaste ${quantity} unidad(es) de "${productToAdd.title}" al carrito!`);
        });
    });
}

// --- Render Carrito (Página Carrito) ---
function renderCartItems(container, basePath) {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    if (cart.length === 0) {
        container.innerHTML = '<p class="cart-empty-message">Tu carrito está vacío.</p>';
        return;
    }
    
    container.innerHTML = ''; 
    let totalAmount = 0;

    cart.forEach(item => {
        const subtotal = item.price * item.quantity;
        totalAmount += subtotal;
        const itemConRuta = { ...item, img: `${basePath}${item.img}` };
        
        container.innerHTML += `
            <div class="cart-item">
                <img src="${itemConRuta.img}" alt="${item.title}">
                <div class="cart-item-info">
                    <h3>${item.title}</h3>
                    <p>Precio: $${item.price.toLocaleString('es-AR')}</p>
                    <p>Cantidad: ${item.quantity}</p>
                    <p>Subtotal: $${subtotal.toLocaleString('es-AR')}</p>
                </div>
                <button class="delete-btn" data-id="${item.id}">Eliminar</button>
            </div>
        `;
    });
    
    const summaryDiv = document.createElement('div');
    summaryDiv.className = 'cart-summary';
    summaryDiv.innerHTML = `
        <h3>Total a Pagar: $${totalAmount.toLocaleString('es-AR')}</h3>
        <button id="btn-buy" class="btn-buy">Finalizar Compra</button>
    `;
    container.appendChild(summaryDiv);

addDeleteCartEventListeners(); // Agregar funcionalidad de eliminar
    
    // === VALIDACIÓN DE LOGIN AL COMPRAR ===
    document.getElementById('btn-buy').addEventListener('click', () => {
        const user = sessionStorage.getItem('userEmail');
        
        if (!user) {
            // Si no hay usuario, mostramos alerta y redirigimos
            alert('⚠️ Para finalizar la compra, necesitas iniciar sesión primero.');
            window.location.href = `${basePath}pages/login.html`;
        } else {
            // Si está logueado, procesamos la compra
            simulatePurchase(cart, totalAmount);
        }
    });
}

// --- Simular Ticket ---
function simulatePurchase(cart, total) {
    const user = sessionStorage.getItem('userEmail') || 'Cliente';
    let ticket = `🧾 TICKET DE COMPRA - AMARTE SHOWROOM\n----------------------------------\n`;
    ticket += `Cliente: ${user}\nFecha: ${new Date().toLocaleDateString()}\n----------------------------------\n`;
    
    cart.forEach(item => {
        ticket += `${item.quantity} x ${item.title} - $${(item.price * item.quantity).toLocaleString('es-AR')}\n`;
    });
    
    ticket += `----------------------------------\nTOTAL PAGADO: $${total.toLocaleString('es-AR')}\n\n¡Gracias por tu compra! 💖`;

    alert(ticket);
    localStorage.removeItem('cart');
    location.reload();
}

// --- Borrar del Carrito ---
function addDeleteCartEventListeners(basePath) {
    const buttons = document.querySelectorAll('.delete-btn');
    buttons.forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = e.target.dataset.id;
            let cart = JSON.parse(localStorage.getItem('cart') || '[]');
            const newCart = cart.filter(item => item.id != productId);
            localStorage.setItem('cart', JSON.stringify(newCart));
            
            location.reload(); 
        });
    });
}