const POSTS_URL = 'https://jsonplaceholder.typicode.com/posts';
const USERS_URL = 'https://jsonplaceholder.typicode.com/users';

// Referencias al DOM principales
const postsContainer = document.getElementById('posts-container');
const loadingSpinner = document.getElementById('loading-spinner');
const errorMessage = document.getElementById('error-message');
const searchInput = document.getElementById('search-input');

// Referencias al DOM del Modal y Formulario
const openModalBtn = document.getElementById('open-modal-btn');
const closeModalBtn = document.getElementById('close-modal-btn');
const postModal = document.getElementById('post-modal');
const newPostForm = document.getElementById('new-post-form');
const newTitleInput = document.getElementById('new-title');
const newBodyInput = document.getElementById('new-body');
const userModal = document.getElementById('user-modal');
const closeUserModalBtn = document.getElementById('close-user-modal-btn');

let allPosts = [];
let allUsers = [];

/**
 * Inicializar aplicación cargando datos GET
 */
async function initApp() {
    showLoading(true);
    showError(false); // Corregido: Oculta el error al iniciar correctamente

    try {
        // Realizamos peticiones en paralelo usando Promise.all
        const [postsResponse, usersResponse] = await Promise.all([
            fetch(POSTS_URL),
            fetch(USERS_URL)
        ]);

        if (!postsResponse.ok || !usersResponse.ok) {
            throw new Error('Error al conectar con el servidor.');
        }

        const posts = await postsResponse.json();
        allUsers = await usersResponse.json();

        // Mapeamos los posts para adjuntar el nombre del autor
        allPosts = posts.map(post => {
            const author = allUsers.find(user => user.id === post.userId);
            return {
                ...post,
                authorName: author ? author.name : 'Usuario Desconocido'
            };
        });

        // Renderizamos las tarjetas en el DOM
        renderPosts(allPosts);

    } catch (error) {
        console.error('Hubo un problema:', error);
        showError(true);
    } finally {
        showLoading(false);
    }
}

/**
 * Renderizar tarjetas en el DOM
 */
function renderPosts(postsToRender) {
    if (postsToRender.length === 0) {
        postsContainer.innerHTML = `<p class="no-results" style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">No se encontraron publicaciones.</p>`;
        return;
    }

    const postsHTML = postsToRender.map(post => `
        <article class="post-card" data-user-id="${post.userId}" tabindex="0" role="button" aria-label="Ver datos de ${post.authorName}">
            <div>
                <h2 class="post-title">${post.title}</h2>
                <p class="post-body">${post.body}</p>
            </div>
            <span class="post-author">✍️ ${post.authorName}</span>
        </article>
    `).join('');

    postsContainer.innerHTML = postsHTML;
}

    function showUserDetails(userId) {
        const user = allUsers.find(item => item.id === Number(userId));
        if (!user) return;
        document.getElementById('user-id').textContent = user.id;
        document.getElementById('user-name').textContent = user.name;
        document.getElementById('user-username').textContent = user.username;
        document.getElementById('user-email').textContent = user.email;
        document.getElementById('user-phone').textContent = user.phone;
        document.getElementById('user-website').textContent = user.website;
        userModal.classList.remove('hidden');
        closeUserModalBtn.focus();
    }

    postsContainer.addEventListener('click', (event) => {
        const card = event.target.closest('.post-card');
        if (card) showUserDetails(card.dataset.userId);
    });

    postsContainer.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;

        const card = event.target.closest('.post-card');
        if (!card) return;

        event.preventDefault();
        showUserDetails(card.dataset.userId);
    });

/**
 * Manejo del Modal (Abrir y Cerrar)
 */
openModalBtn.addEventListener('click', () => {
    postModal.classList.remove('hidden');
    newTitleInput.focus();
});

closeModalBtn.addEventListener('click', () => {
    postModal.classList.add('hidden');
});

closeUserModalBtn.addEventListener('click', () => {
    userModal.classList.add('hidden');
});

// Cerrar si se hace clic fuera del contenido del modal
window.addEventListener('click', (e) => {
    if (e.target === postModal) {
        postModal.classList.add('hidden');
    }
    if (e.target === userModal) {
        userModal.classList.add('hidden');
    }
});

window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        userModal.classList.add('hidden');
    }
});

/**
 * Enviar Nueva Publicación mediante Petición POST
 */
newPostForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = newTitleInput.value.trim();
    const body = newBodyInput.value.trim();

    if (!title || !body) return;

    const newPostPayload = {
        title: title,
        body: body,
        userId: 1 // Simulamos que el usuario actual tiene ID 1
    };

    try {
        const response = await fetch(POSTS_URL, {
            method: 'POST',
            body: JSON.stringify(newPostPayload),
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
            },
        });

        if (!response.ok) {
            throw new Error('Error al registrar la publicación en el servidor.');
        }

        const createdPost = await response.json();
        createdPost.authorName = 'Tú (Autor Actual)';

        // Insertamos el nuevo post al inicio del arreglo global
        allPosts.unshift(createdPost);

        // Volvemos a renderizar la interfaz
        renderPosts(allPosts);

        // Limpiamos formulario y cerramos modal
        newPostForm.reset();
        postModal.classList.add('hidden');

        alert('¡Publicación creada exitosamente!');

    } catch (error) {
        console.error('Error al enviar POST:', error);
        alert('No se pudo crear la publicación. Inténtalo de nuevo.');
    }
});

/**
 * Buscador en tiempo real
 */
searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase().trim();

    const filteredPosts = allPosts.filter(post => 
        post.title.toLowerCase().includes(searchTerm) || 
        post.body.toLowerCase().includes(searchTerm)
    );

    renderPosts(filteredPosts);
});

// Funciones auxiliares de UI (Control de estados)
function showLoading(isLoading) {
    if (isLoading) {
        loadingSpinner.classList.remove('hidden');
    } else {
        loadingSpinner.classList.add('hidden');
    }
}

function showError(hasError) {
    if (hasError) {
        errorMessage.classList.remove('hidden');
    } else {
        errorMessage.classList.add('hidden');
    }
}

// Inicializar al cargar el DOM
document.addEventListener('DOMContentLoaded', initApp);