/*
    *  ---------------------------------------------  *
    *  -----  main.js  --  /assets/js/main.js  -----  *
    *  ---------------------------------------------  *
*/


/** @typedef {import('../../types/movies.js').Movies} Movies */


/** ----- URL de la API de películas ----- */
const moviesApiUrl = 'http://localhost:1234/movies';

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

                <button class="movie-card__delete" type="button">Eliminar</button>

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
 * @param {Movies} movies */

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
            </header>

            <section class="movies-grid" aria-label="Listado de películas">
                ${html}
            </section>
        </section>
    `;

}


//  -----  Agregar un evento de clic para manejar la eliminación de películas  -----
document.addEventListener('click', e => {
    const target = e.target

    if (!(target instanceof Element) || !target.matches('.movie-card__delete')) {
        return;
    }

    const article = target.closest('.movie-card');

    if (!(article instanceof HTMLElement))
        return;


    const id = article.dataset.id;

    if (typeof id !== 'string')
        return;


    //  -----  Enviar una solicitud DELETE a la API para eliminar la película  -----
    fetch(`${moviesApiUrl}/${id}`, {
        method: 'DELETE'
    })
        .then(res => {
            if (res.ok)
                article.remove()
        })
})



//  -----  Obtener las películas de la API y renderizarlas  -----
fetch(moviesApiUrl)
    .then(res => res.json())
    .then(renderMovies)