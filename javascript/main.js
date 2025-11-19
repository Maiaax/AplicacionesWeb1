    document.addEventListener('DOMContentLoaded', async () => {  // Convertimos la función principal en 'async' para poder usar 'await'

    // --- Detecta la ruta base ---
    let basePath = '';
    const path = window.location.pathname;
    
    if (path.includes('/pages/') || path.includes('/categoria/')) {
        basePath = '../';
    }

    // ---  Traer información por medio de fetch ---
    const productos = await fetchProducts(basePath);

    // ---  Guardar datos del usuario en sessionStorage ---
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault(); 
            
            // Capturamos el email del formulario
            const email = loginForm.querySelector('#email').value;
            
            // Guardamos el email en sessionStorage
            sessionStorage.setItem('userEmail', email);
            
            console.log('Sesión exitosa, redirigiendo...');
            window.location.href = `${basePath}index.html`; 
        });
    }

    // --- RENDERIZADO DEL NAVBAR ---
    renderNavbar(basePath);

    // --- RENDERIZADO DEL FOOTER ---
    renderFooter(); 
    
    // --- INICIAR CARRUSEL ---
    initCarousel(basePath); 

    // ---  Cerrar Sesión ---
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Limpiamos el sessionStorage
            sessionStorage.removeItem('userEmail');
            
            console.log('Cerrando sesión, redirigiendo...');
            window.location.href = `${basePath}pages/login.html`;
        });
    }

    // --- Lógica de filtrado de categorías ---
    let categoryFilter = 'all'; 
    if (path.includes('/remeras.html')) {
        categoryFilter = 'remeras';
    } else if (path.includes('/pantalones.html')) {
        categoryFilter = 'pantalones';
    } else if (path.includes('/abrigos.html')) {
        categoryFilter = 'abrigos';
    } else if (path.includes('/accesorios.html')) {
        categoryFilter = 'accesorios';
    }

    // ---  Rellenar las cards ---
    renderProductGrid(basePath, categoryFilter, productos);
    
    // ---Lógica de la Página del Carrito ---
    const cartContainer = document.getElementById('cart-items-container');
    if (cartContainer) {
        // Si estamos en la página del carrito, dibujamos los items
        renderCartItems(cartContainer, basePath);
    }

});

// --- Función de Fetch  ---
async function fetchProducts(basePath) {
    try {
        const response = await fetch(`${basePath}data/productos.json`);
        if (!response.ok) {
            throw new Error(`Error al cargar productos: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(error);
        return []; 
    }
}

///////////
// --- Estructura de datos para el Navbar  ---
///////
const navLinks = [
    { title: 'Inicio', url: 'index.html' },
    { title: 'Remeras', url: 'categoria/remeras.html' },
    { title: 'Pantalones', url: 'categoria/pantalones.html' },
    { title: 'Abrigos', url: 'categoria/abrigos.html' },
    { title: 'Accesorios', url: 'categoria/accesorios.html' },
    { title: 'Carrito', url: 'pages/carrito.html' } // <-- ENLACE AL CARRITO
];

///////////
// --- Función para crear el componente Navbar  ---
///////////////////
function renderNavbar(basePath) {
    const header = document.getElementById('header-placeholder');
    if (!header) return; 

    const linksHtml = navLinks.map(link => 
        `<li><a href="${basePath}${link.url}">${link.title}</a></li>`
    ).join(''); 
    header.innerHTML = `
        <nav>
            <a href="${basePath}index.html" class="logo">
                <img src="${basePath}images/logo.png" alt="Logo Amarte Showroom">
            </a>
            <ul>
                ${linksHtml}
                <li><a href="#" id="logout-btn">Cerrar Sesión</a></li>
            </ul>
        </nav>
    `;
}

// --- Función Footer ---
function renderFooter() {
    const footer = document.getElementById('footer-placeholder');
    if (!footer) return;
    footer.innerHTML = `
        <p>© ${new Date().getFullYear()} Amarte Showroom. Todos los derechos reservados.</p>
    `;
}

// --- Función Carrusel  ---
function initCarousel(basePath) {
    const container = document.getElementById('carousel-placeholder');
    if (!container) return; 

    const images = [
        'images/abrigo.jpg',
        'images/jeans.jpg',
        'images/remera.jpg'
    ];
    let currentSlide = 0;

    images.forEach((img, index) => {
        const slide = document.createElement('div');
        slide.className = 'carousel-slide';
        if (index === 0) slide.classList.add('active');
        slide.innerHTML = `<img src="${basePath}${img}" alt="Slide ${index + 1}">`;
        container.appendChild(slide);
    });

    const slides = document.querySelectorAll('.carousel-slide');

    setInterval(() => {
        slides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.add('active');
    }, 4000); 
}

// --- Función Renderizado de Grilla  ---
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
    
    // ---  Añadir items al localStorage ---
    addCartEventListeners(productos);
}

// --- Función Estructura de Card (MODIFICADA) ---
function renderProductCard(producto) {
    return `
        <div class="product-card">
            <img src="${producto.img}" alt="${producto.title}">
            <div class="card-body">
                <h3>${producto.title}</h3>
                <p>${producto.desc}</p>
                <p class="price">$${producto.price.toLocaleString('es-AR')}</p>
                
                <div class="quantity-selector">
                    <button>-</button>
                    <span>1</span>
                    <button>+</button>
                </div>
                <button class="add-to-cart" data-id="${producto.id}">Agregar al carrito</button>
            </div>
        </div>
    `;
}

// ---  Añadir Event Listeners a los botones de las cards ---
function addCartEventListeners(productos) {
    const buttons = document.querySelectorAll('.add-to-cart');
    
    buttons.forEach(button => {
        button.addEventListener('click', (e) => {
            // 1. Obtenemos el ID del producto desde el atributo data-id
            const productId = e.target.dataset.id;
            
            // 2. Buscamos el producto completo en nuestro array de productos
            // Usamos '==' porque el id del JSON es número y el data-id es string
            const productToAdd = productos.find(p => p.id == productId);
            if (!productToAdd) return;

            // 3. Obtenemos el carrito actual de localStorage
            // Si no hay nada, '|| []' nos da un array vacío
            let cart = JSON.parse(localStorage.getItem('cart') || '[]');
            
            // 4. Añadimos el nuevo producto al array del carrito
            cart.push(productToAdd);
            
            // 5. Guardamos el array actualizado de vuelta en localStorage
            localStorage.setItem('cart', JSON.stringify(cart));
            
            console.log('Producto añadido al carrito:', productToAdd.title);
            alert('¡Producto añadido al carrito!');
        });
    });
}

// ---  Dibujar los items en la página del carrito ---
function renderCartItems(container, basePath) {
    // Obtenemos el carrito de localStorage
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    // Verificamos si está vacío
    if (cart.length === 0) {
        container.innerHTML = '<p class="cart-empty-message">Tu carrito está vacío.</p>';
        return;
    }
    
    // Si hay items, los dibujamos
    container.innerHTML = ''; // Limpiamos el contenedor
    cart.forEach(item => {
        // Corregimos la ruta de la imagen para que funcione en la página del carrito
        const itemConRuta = { ...item, img: `${basePath}${item.img}` };
        container.innerHTML += renderCartItem(itemConRuta);
    });
    
    addDeleteCartEventListeners(); // Añadimos los event listeners a los botones de "Eliminar"
}

// ---  Plantilla HTML para un item del carrito ---
function renderCartItem(item) {
    return `
        <div class="cart-item">
            <img src="${item.img}" alt="${item.title}">
            <div class="cart-item-info">
                <h3>${item.title}</h3>
                <p>$${item.price.toLocaleString('es-AR')}</p>
            </div>
            <button class="delete-btn" data-id="${item.id}">Eliminar</button>
        </div>
    `;
}

// ---  Añadir listeners a los botones de Eliminar ---
function addDeleteCartEventListeners() {
    const buttons = document.querySelectorAll('.delete-btn');
    
    buttons.forEach(button => {
        button.addEventListener('click', (e) => {
            // Obtenemos el ID del producto a eliminar
            const productId = e.target.dataset.id;
            
            // Obtenemos el carrito actual
            let cart = JSON.parse(localStorage.getItem('cart') || '[]');
            
            // Filtramos el carrito para crear un NUEVO array
            // que contenga todos los items MENOS el que tiene el ID a eliminar
            const newCart = cart.filter(item => item.id != productId);
            
            // Guardamos el nuevo carrito en localStorage
            localStorage.setItem('cart', JSON.stringify(newCart));
            
            // Recargamos la página para mostrar el carrito actualizado
            console.log('Producto eliminado, recargando carrito...');
            location.reload(); 
        });
    });
}