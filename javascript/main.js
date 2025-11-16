// Convertimos la función principal en 'async' para poder usar 'await'
document.addEventListener('DOMContentLoaded', async () => {

    // --- Detectamos la ruta base ---
    let basePath = '';
    const path = window.location.pathname;
    
    if (path.includes('/pages/') || path.includes('/categoria/')) {
        basePath = '../';
    }

    // Llamamos a la función que trae los productos y esperamos a que termine
    const productos = await fetchProducts(basePath);

    // --- Redirección de Login 
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault(); 
            console.log('Sesión exitosa, redirigiendo...');
            window.location.href = `${basePath}index.html`; 
        });
    }

    // --- RENDERIZADO DEL NAVBAR ---
    renderNavbar(basePath);

    // --- RENDERIZADO DEL FOOTER ---
    renderFooter(basePath);
    
    // --- INICIAR CARRUSEL ---
    initCarousel(basePath); 

    // --- Redirección del Logout/cerrar sesion 
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Cerrando sesión, redirigiendo...');
            window.location.href = `${basePath}pages/login.html`;
        });
    }

    // --- filtrado de categorías (por control y orden)---
    let categoryFilter = 'all'; // "all" es el default para el home
    if (path.includes('/remeras.html')) {
        categoryFilter = 'remeras';
    } else if (path.includes('/pantalones.html')) {
        categoryFilter = 'pantalones';
    } else if (path.includes('/abrigos.html')) {
        categoryFilter = 'abrigos';
    } else if (path.includes('/accesorios.html')) {
        categoryFilter = 'accesorios';
    }

    // --- ETAPA 4: Rellenar las cards ---
    renderProductGrid(basePath, categoryFilter, productos);

});

// ---  Usamos fetch para traer los productos del JSON ---
async function fetchProducts(basePath) {
    try {
        const response = await fetch(`${basePath}data/productos.json`); // Usamos la ruta base
        if (!response.ok) {
            throw new Error(`Error al cargar productos: ${response.status}`); // Manejo de errores básico
        }
        return await response.json();
    } catch (error) {
        console.error(error);
        return []; // Devuelve un array vacío si hay un error
    }
}

///////////
// --- Estructura de datos para el Navbar (Links) ---
///////
const navLinks = [
    { title: 'Inicio', url: 'index.html' },
    { title: 'Remeras', url: 'categoria/remeras.html' },
    { title: 'Pantalones', url: 'categoria/pantalones.html' },
    { title: 'Abrigos', url: 'categoria/abrigos.html' },
    { title: 'Accesorios', url: 'categoria/accesorios.html' }
];

///////////
// --- Función para crear el componente Navbar ---
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
//////////////////////  
// ---  FUNCIÓN PARA CREAR EL FOOTER ---
/////////////////////
function renderFooter() {
    const footer = document.getElementById('footer-placeholder'); // Obtener el contenedor del footer
    if (!footer) return;

    footer.innerHTML = `
        <p>© ${new Date().getFullYear()} Amarte Showroom. Todos los derechos reservados.</p>
    `;
}

// --- (NUEVA) FUNCIÓN PARA INICIAR EL CARRUSEL ---
function initCarousel(basePath) {
    const container = document.getElementById('carousel-placeholder'); // Contenedor del carrusel
    if (!container) return; // Si no existe, salimos

    // Imágenes que usará el carrusel. Se puede modificar según necesidad
    const images = [
        'images/abrigo.jpg',
        'images/jeans.jpg',
        'images/remera.jpg'
    ];
    let currentSlide = 0;

    // Crear las diapositivas dentro del contenedor
    images.forEach((img, index) => {
        const slide = document.createElement('div');
        slide.className = 'carousel-slide';
        if (index === 0) slide.classList.add('active'); // Primera imagen activa
        slide.innerHTML = `<img src="${basePath}${img}" alt="Slide ${index + 1}">`; // Ajustamos la ruta de la imagen
        container.appendChild(slide);
    });

    const slides = document.querySelectorAll('.carousel-slide');

    // ---  Lógica para que las imágenes cambien solas ---
    setInterval(() => {
        slides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.add('active');
    }, 4000); // Cambia cada 4 segundos/4000 milisegundoos (se puede ajustar)
}


// ---  Función para renderizar las cards  ---
function renderProductGrid(basePath, categoryFilter, productos) { //Ahora recibe productos
    const productGrid = document.querySelector('.product-grid'); // Contenedor de las cards
    if (!productGrid) return;
    productGrid.innerHTML = '';
    
    let productosAMostrar;
    
    // --- Lógica para la página de inicio ---
    if (categoryFilter === 'all') {
        productosAMostrar = [];
        const categorias = ['remeras', 'pantalones', 'abrigos', 'accesorios']; // Categorías a mostrar
        
        categorias.forEach(cat => {
            const productosDeCategoria = productos.filter(p => p.category === cat); // Filtra productos por categoría
            productosAMostrar.push(...productosDeCategoria.slice(0, 2));             // Agrega los primeros 2 de esa categoría a la lista
        });
    } 
    else 
    {
        productosAMostrar = productos.filter(producto => producto.category === categoryFilter); // Filtra productos por la categoría seleccionada
    }
    
    // Iteramos sobre el array YA FILTRADO
    productosAMostrar.forEach(producto => {
        const productoConRuta = { ...producto, img: `${basePath}${producto.img}` }; 
        productGrid.innerHTML += renderProductCard(productoConRuta);
    });
}

// --- Estructura del componente de Card  ---
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
                <button class="add-to-cart">Agregar al carrito</button>
            </div>
        </div>
    `;
}