/*
    *  ----------------------------------------------  *
    *  -----  movies.js  --  /routes/movies.js  -----  *
    *  ----------------------------------------------  *
*/


import { Router } from 'express';

/** -----  import crypto  ----- */
import { randomUUID } from 'node:crypto';

/** -----  import createRequire para importar JSON  ----- */
import { createRequire } from 'node:module';

/** -----  import validation functions  ----- */
import { validateMovie, validatePartialMovie } from '../schemas/movies.js';


/** -----  require para importar JSON  ----- */
const require = createRequire(import.meta.url);

/** @type {import('../types/movies.js').Movies} - colección de peliculas */
const movies = require('../movies.json');

/** -----  create express router  ----- */
export const moviesRouter = Router();





/*  
    *  ---------------------------------------------------------------------------------
    *  -----  Crear una ruta GET  -  /movies  -  que devuelva todas las películas  -----
    *  ---------------------------------------------------------------------------------
 */

moviesRouter.get('/', (req, res) => {

    const { genre } = req.query;

    if (genre && typeof genre === 'string') {

        const filteredMovies = movies.filter(
            movie => movie.genre.some(g => g.toLowerCase() === genre.toLowerCase())
        );

        return res.json(filteredMovies)
    }

    res.json(movies);

});



/*  
    *  ----------------------------------------------------------------------------------------------------
    *  -----  Crear una ruta GET  -  /movies/:id  -  que devuelva la película con el id especificado  -----
    *  ----------------------------------------------------------------------------------------------------
 */

moviesRouter.get('/:id', (req, res) => {      //*  ==>  path-to-regexp

    const { id } = req.params;

    const movie = movies.find(movie => movie.id === id);


    if (movie)
        return res.json(movie);

    res.status(404).json({ message: 'Movie not found' });

});



/*
    *  --------------------------------------------------------------------------------------
    *  -----  Crear una ruta POST  -  /movies  -  que permita crear una nueva película  -----
    *  --------------------------------------------------------------------------------------
*/

moviesRouter.post('/', (req, res) => {


    /** -----  Result of validation  ----- */
    const result = validateMovie(req.body);

    if (result.error) {
        // 422 Unprocessable Entity
        return res.status(400).json({ error: JSON.parse(result.error.message) });
    }


    /** @type {import('../types/movies.js').Movie} */
    const newMovie = {
        id: randomUUID(), // uuid v4
        ...result.data
    };

    // Esto no sería REST, porque estamos guardando
    // el estado de la aplicación en memoria
    movies.push(newMovie);

    res.status(201).json(newMovie);

});



/*
    *  ------------------------------------------------------------------------------------------
    *  -----  Crear una ruta PATCH  -  /movies/:id  -  que permita actualizar una película  -----
    *  ------------------------------------------------------------------------------------------
*/

moviesRouter.patch('/:id', (req, res) => {

    const result = validatePartialMovie(req.body);

    if (!result.success) {
        return res.status(400).json({ error: JSON.parse(result.error.message) });
    }

    const { id } = req.params;
    const movieIndex = movies.findIndex(movie => movie.id === id);

    if (movieIndex === -1) {
        return res.status(404).json({ message: 'Movie not found' });
    }

    // Esto no sería REST, porque estamos guardando
    // el estado de la aplicación en memoria
    const updateMovie = {
        ...movies[movieIndex],
        ...result.data
    }

    movies[movieIndex] = updateMovie;

    return res.json(updateMovie);
});



/*
    *  ---------------------------------------------------------------------------------------------------
    *  -----  Crear una ruta DELETE  -  /movies/:id  -  que permita eliminar una película por su id  -----
    * ---------------------------------------------------------------------------------------------------
*/

moviesRouter.delete('/:id', (req, res) => {

    const { id } = req.params

    const movieIndex = movies.findIndex(movie => movie.id === id)

    if (movieIndex === -1)
        return res.status(404).json({ message: 'Movie not found' })


    movies.splice(movieIndex, 1)

    return res.json({ message: 'Movie deleted' })
})
