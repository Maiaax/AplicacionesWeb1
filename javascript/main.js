// Espera a que todo el HTML esté cargado antes de ejecutar el script
document.addEventListener('DOMContentLoaded', () => {

    let basePath = '';
    const path = window.location.pathname;
    
    if (path.includes('/pages/') || path.includes('/categoria/')) {
        basePath = '../';
    }

    // --- Redirección de Login 
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault(); 
            console.log(' sesion exitosa, redirigiendo...');
            // Redirigimos al usuario a la página principal
            window.location.href = `${basePath}index.html`; 
        });
    }

    // --- RENDERIZADO DEL NAVBAR
    renderNavbar(basePath);
    
    // --- Redirección del Logout/cerrar sesion 
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Cerrando sesión, redirigiendo...');
            // Redirigimos al usuario a la página de login
            window.location.href = `${basePath}pages/login.html`;
        });
    }

    let categoryFilter = 'all'; // 'all' es el default para el home
    if (path.includes('/remeras.html')) {
        categoryFilter = 'remeras';
    } else if (path.includes('/pantalones.html')) {
        categoryFilter = 'pantalones';
    } else if (path.includes('/abrigos.html')) {
        categoryFilter = 'abrigos';
    } else if (path.includes('/accesorios.html')) {
        categoryFilter = 'accesorios';
    }
    // --- renderizado de las Cards de Productos 
    renderProductGrid(basePath, categoryFilter);

});
///////////
// --- Estructura de datos para el Navbar 
///////
const navLinks = [
    { title: 'Inicio', url: 'index.html' },
    { title: 'Remeras', url: 'categoria/remeras.html' },
    { title: 'Pantalones', url: 'categoria/pantalones.html' },
    { title: 'Abrigos', url: 'categoria/abrigos.html' },
    { title: 'Accesorios', url: 'categoria/accesorios.html' }
];


///////////
// --- Función para crear el componente Navbar
///////////////////


function renderNavbar(basePath) {
    const header = document.getElementById('header-placeholder');
    if (!header) return; 

    // Creamos los <li> de los enlaces usando el array 'navLinks'
    const linksHtml = navLinks.map(link => 
        `<li><a href="${basePath}${link.url}">${link.title}</a></li>`
    ).join(''); // ".join('')" une todos los <li> en un solo string

    // Insertamos el HTML del navbar en el header
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

///////////////
// --- Estructura de datos para las Cards 

//////////////
const productos = [
    {
        id: 1,
        img: 'images/remera.jpg',
        title: 'Remera Smashing Pumpkins',
        desc: 'Remera de algodón con estampa vintage.',
        price: 18500,
        category: 'remeras' 
    },
    {
        id: 2,
        img: 'images/pantalon.jpg',
        title: 'Pantalón Cargo Negro',
        desc: 'Pantalón cargo wide leg, tiro alto.',
        price: 27000,
        category: 'pantalones' 
    },
    {
        id: 3,
        img: 'images/abrigo.jpg',
        title: 'Abrigo Paño Camel',
        desc: 'Abrigo largo de paño con hombreras.',
        price: 82000,
        category: 'abrigos' 
    },
    {
        id: 4,
        img: 'images/accesorio.jpg',
        title: 'Cartera Charol Negra',
        desc: 'Cartera de mano con correa, simil charol.',
        price: 45000,
        category: 'accesorios' 
    },
    {
        id: 5,
        img: 'images/remera.jpg', 
        title: 'Remera Básica Blanca',
        desc: 'Remera 100% algodón, cuello redondo.',
        price: 12000,
        category: 'remeras'
    },
    {
        id: 6,
        img: 'images/pantalon.jpg', 
        title: 'Jean Mom Celeste',
        desc: 'Jean rígido, tiro alto, corte mom.',
        price: 24500,
        category: 'pantalones'
    }
];

// --- Función para renderizar todas las cards en la grilla
function renderProductGrid(basePath) {
    const productGrid = document.querySelector('.product-grid');
    // Si no hay grilla en esta página (ej: login), no hacemos nada
    if (!productGrid) return;

    productGrid.innerHTML = '';  //Vaciamos la grilla x control
    
    // Iteramos sobre el array de 'productos' y creamos una card para cada uno
    productos.forEach(producto => {
        const productoConRuta = { ...producto, img: `${basePath}${producto.img}` }; // Ajustamos la ruta de la imagen
        productGrid.innerHTML += renderProductCard(productoConRuta);
    });
}

// Estructura del componente de Card 
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