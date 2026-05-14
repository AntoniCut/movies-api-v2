/*
    *  ---------------------------------------------  *
    *  -----  main.js  --  /assets/js/main.js  -----  *
    *  ---------------------------------------------  *
*/


/** @typedef {import('../../types/movies.js').Movies} Movies */


/** ----- URL de la API de películas ----- */
const moviesApiUrl = window.location.hostname === 'localhost'
    ? 'http://localhost:1234/movies'
    : 'https://movies-api-v2-1.onrender.com/movies';

/** @type {HTMLMainElement | null} - Elemento principal donde se mostrarán las películas */
const main = document.querySelector('main');

if (!main)
    throw new Error('Main element not found');



/** 
 * --------------------------------------
 * -----  `renderMovieCard(movie)`  -----
 * --------------------------------------
 * - Genera el HTML para una tarjeta de película, utilizando las propiedades de la película.
 * @param {import('../../types/movies.js').Movie} movie - Objeto que representa una película, con propiedades como id, title, poster, year, etc.
 * @returns {string} - HTML de la tarjeta de película.
 */

const renderMovieCard = (movie) => {
    
    const movieRate = typeof movie.rate === 'number'
        ? movie.rate.toFixed(1)
        : 'Sin nota'

    const movieGenres = movie.genre
        .map(genre => `<li class="movie-card__genre">${genre}</li>`)
        .join('')

    return `
        
        <article class="movie-card" data-id="${movie.id}">
            
            <p class="movie-card__id">ID: ${movie.id}</p>
            <h2 class="movie-card__title">${movie.title}</h2>

            <div class="movie-card__poster-frame">
                <img class="movie-card__poster" src="${movie.poster}" alt="Poster de ${movie.title}" loading="lazy">
                <span class="movie-card__rate">★ ${movieRate}</span>
            </div>

            <div class="movie-card__content">
                
                <dl class="movie-card__details">
                    
                    <div class="movie-card__detail">
                        <dt>Año</dt>
                        <dd>${movie.year}</dd>
                    </div>

                    <div class="movie-card__detail">
                        <dt>Duración</dt>
                        <dd>${movie.duration} min</dd>
                    </div>

                    <div class="movie-card__detail movie-card__detail--wide">
                        <dt>Director</dt>
                        <dd>${movie.director}</dd>
                    </div>

                    <div class="movie-card__detail movie-card__detail--wide">
                        <dt>Géneros</dt>
                        <dd>
                            <ul class="movie-card__genres">
                                ${movieGenres}
                            </ul>
                        </dd>
                    </div>

                    <div class="movie-card__detail movie-card__detail--wide">
                        <dt>Poster</dt>
                        <dd>
                            <a class="movie-card__poster-link" href="${movie.poster}" target="_blank" rel="noreferrer">Abrir imagen original</a>
                        </dd>
                    </div>
                </dl>

                <div class="movie-card__actions">
                    <button class="movie-card__edit" type="button">Editar</button>
                    <button class="movie-card__delete" type="button">Eliminar</button>
                </div>

            </div>

        </article>
    `
}



/** 
 * ------------------------------------
 * -----  `renderMovies(movies)`  -----
 * ------------------------------------
 * - Renderiza una lista de películas en el elemento principal.
 * - Agrega un evento de clic para manejar la eliminación de películas.
 * @param {Movies} movies - Array de objetos de película a renderizar.
 * @returns {void}
 * @sideEffects - Modifica el DOM al insertar el HTML generado y agregar eventos de clic.
 */

const renderMovies = (movies) => {

    /** @type {import('../../types/movies.js').Movies} - Array de objetos de película a renderizar */
    const typedMovies = movies;

    /** @type {string} - HTML generado a partir de las tarjetas de película */
    const html = typedMovies.map(renderMovieCard).join('')

    //  -----  Insertar el HTML generado en el elemento principal  -----
    main.innerHTML = `
        <section class="movies-app">
            <header class="movies-app__hero">
                <p class="movies-app__eyebrow">Movies API</p>
                <h1 class="movies-app__title">Catálogo completo de películas</h1>
                <p class="movies-app__summary">Cada card muestra todos los campos relevantes de movies.json: id, póster, año, director, duración, géneros y valoración.</p>
                <button class="movies-app__create-btn" type="button">Crear nueva película</button>
            </header>

            <section class="movies-grid" aria-label="Listado de películas">
                ${html}
            </section>
        </section>
    `;

}


/** 
 * -------------------------------------------
 * -----  `createMovieModal(movie?)`  -----
 * -------------------------------------------
 * - Crea el HTML para el modal de crear/editar película.
 * @param {import('../../types/movies.js').Movie | null} [movie] - Objeto de película para edición (opcional).
 * @returns {string} - HTML del modal.
 */

const createMovieModal = (movie = null) => {
    const isEdit = movie !== null;
    const title = isEdit ? 'Editar película' : 'Crear nueva película';
    const submitText = isEdit ? 'Guardar cambios' : 'Crear película';

    const genres = ['Action', 'Adventure', 'Crime', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Thriller', 'Sci-Fi'];
    
    const genreCheckboxes = genres.map(genre => {
        const checked = isEdit && movie && movie.genre.includes(genre) ? 'checked' : '';
        return `
            <label class="movie-form__genre-label">
                <input type="checkbox" name="genre" value="${genre}" ${checked}>
                <span>${genre}</span>
            </label>
        `;
    }).join('');

    const movieId = isEdit && movie ? movie.id : '';
    const movieTitle = isEdit && movie ? movie.title : '';
    const movieYear = isEdit && movie ? movie.year : '';
    const movieDuration = isEdit && movie ? movie.duration : '';
    const movieDirector = isEdit && movie ? movie.director : '';
    const moviePoster = isEdit && movie ? movie.poster : '';
    const movieRate = isEdit && movie && movie.rate ? movie.rate : '5';

    return `
        <div class="movie-modal" id="movie-modal">
            <div class="movie-modal__overlay"></div>
            <div class="movie-modal__content">
                <div class="movie-modal__header">
                    <h2 class="movie-modal__title">${title}</h2>
                    <button class="movie-modal__close" type="button">&times;</button>
                </div>
                <form class="movie-form" id="movie-form" data-id="${movieId}">
                    <div class="movie-form__group">
                        <label class="movie-form__label" for="title">Título *</label>
                        <input class="movie-form__input" type="text" id="title" name="title" value="${movieTitle}" required>
                    </div>
                    
                    <div class="movie-form__row">
                        <div class="movie-form__group">
                            <label class="movie-form__label" for="year">Año *</label>
                            <input class="movie-form__input" type="number" id="year" name="year" min="1900" max="2024" value="${movieYear}" required>
                        </div>
                        <div class="movie-form__group">
                            <label class="movie-form__label" for="duration">Duración (min) *</label>
                            <input class="movie-form__input" type="number" id="duration" name="duration" min="1" value="${movieDuration}" required>
                        </div>
                    </div>
                    
                    <div class="movie-form__group">
                        <label class="movie-form__label" for="director">Director *</label>
                        <input class="movie-form__input" type="text" id="director" name="director" value="${movieDirector}" required>
                    </div>
                    
                    <div class="movie-form__group">
                        <label class="movie-form__label" for="poster">Poster URL *</label>
                        <input class="movie-form__input" type="url" id="poster" name="poster" value="${moviePoster}" required>
                    </div>
                    
                    <div class="movie-form__group">
                        <label class="movie-form__label" for="rate">Puntuación (0-10)</label>
                        <input class="movie-form__input" type="number" id="rate" name="rate" min="0" max="10" step="0.1" value="${movieRate}">
                    </div>
                    
                    <div class="movie-form__group">
                        <label class="movie-form__label">Géneros *</label>
                        <div class="movie-form__genres">
                            ${genreCheckboxes}
                        </div>
                    </div>
                    
                    <div class="movie-form__error" id="movie-form-error"></div>
                    
                    <div class="movie-form__actions">
                        <button class="movie-form__cancel" type="button">Cancelar</button>
                        <button class="movie-form__submit" type="submit">${submitText}</button>
                    </div>
                </form>
            </div>
        </div>
    `;
};

/** 
 * ------------------------------------
 * -----  `openMovieModal(movie?)`  -----
 * ------------------------------------
 * - Abre el modal para crear o editar una película.
 * @param {import('../../types/movies.js').Movie | null} [movie] - Objeto de película para edición (opcional).
 */

const openMovieModal = (movie = null) => {
    
    
    const modalHtml = createMovieModal(movie);
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    const modal = document.getElementById('movie-modal');
    const form = document.getElementById('movie-form');
    const closeBtn = modal?.querySelector('.movie-modal__close');
    const cancelBtn = modal?.querySelector('.movie-form__cancel');
    const overlay = modal?.querySelector('.movie-modal__overlay');
    
    const closeModal = () => {
        modal?.remove();
    };
    
    closeBtn?.addEventListener('click', closeModal);
    cancelBtn?.addEventListener('click', closeModal);
    overlay?.addEventListener('click', closeModal);
    
    if (!(form instanceof HTMLFormElement))
        return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(form);
        const id = form.dataset.id;
        
        const selectedGenres = formData.getAll('genre');
        
        const movieData = {
            title: formData.get('title')?.toString() ?? '',
            year: parseInt(formData.get('year')?.toString() ?? '0'),
            director: formData.get('director')?.toString() ?? '',
            duration: parseInt(formData.get('duration')?.toString() ?? '0'),
            poster: formData.get('poster')?.toString() ?? '',
            rate: parseFloat(formData.get('rate')?.toString() ?? '5') || 5,
            genre: selectedGenres.map(g => g.toString())
        };
        
        const errorDiv = document.getElementById('movie-form-error');
        if (errorDiv) errorDiv.textContent = '';
        
        try {
            const url = id ? `${moviesApiUrl}/${id}` : moviesApiUrl;
            const method = id ? 'PATCH' : 'POST';
            
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(movieData)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al guardar la película');
            }
            
            closeModal();
            
            const moviesResponse = await fetch(moviesApiUrl);
            const movies = await moviesResponse.json();
            renderMovies(movies);
            
        } catch (error) {
            if (errorDiv) {
                errorDiv.textContent = error instanceof Error ? error.message : 'Error desconocido';
            }
        }
    });
};

//  -----  Event delegation para botones de editar, eliminar y crear  -----
document.addEventListener('click', e => {
    const target = e.target;
    
    if (!(target instanceof Element))
        return;
    
    //  -----  Botón de eliminar  -----
    if (target.matches('.movie-card__delete')) {
        const article = target.closest('.movie-card');
        
        if (!(article instanceof HTMLElement))
            return;
        
        const id = article.dataset.id;
        
        if (typeof id !== 'string')
            return;
        
        fetch(`${moviesApiUrl}/${id}`, {
            method: 'DELETE'
        })
            .then(res => {
                if (res.ok)
                    article.remove();
            });
    }
    
    //  -----  Botón de editar  -----
    if (target.matches('.movie-card__edit')) {
        const article = target.closest('.movie-card');
        
        if (!(article instanceof HTMLElement))
            return;
        
        const id = article.dataset.id;
        
        if (typeof id !== 'string')
            return;
        
        fetch(`${moviesApiUrl}/${id}`)
            .then(res => res.json())
            .then(movie => openMovieModal(movie));
    }
    
    //  -----  Botón de crear  -----
    if (target.matches('.movies-app__create-btn')) {
        openMovieModal();
    }
});


//  -----  Cerrar modal con Escape  -----
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        const modal = document.getElementById('movie-modal');
        if (modal) {
            modal.remove();
        }
    }
});



//  -----  Obtener las películas de la API y renderizarlas  -----
fetch(moviesApiUrl)
    .then(res => res.json())
    .then(renderMovies)