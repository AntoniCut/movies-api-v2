/*
    *  ----------------------------------------------  *
    *  -----  movies.js  --  /routes/movies.js  -----  *
    *  ----------------------------------------------  *
*/


import { Router } from 'express';
import { validateMovie, validatePartialMovie } from '../schemas/movies.js';
import { MovieModel } from 'models/movie.js';


/** -----  create express router  ----- */
export const moviesRouter = Router();





/*  
    *  ---------------------------------------------------------------------------------
    *  -----  Crear una ruta GET  -  /movies  -  que devuelva todas las películas  -----
    *  ---------------------------------------------------------------------------------
 */

moviesRouter.get('/', async (req, res) => {

    try {
        
        /** @type {{ genre?: string }} - Parámetros de consulta */
        const { genre } = req.query;

        /**  -----  recuperar todas las películas ----- */
        const movies = await MovieModel.getAll({ genre });

        res.json(movies);

    } 
    
    catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }

});



/*  
    *  ----------------------------------------------------------------------------------------------------
    *  -----  Crear una ruta GET  -  /movies/:id  -  que devuelva la película con el id especificado  -----
    *  ----------------------------------------------------------------------------------------------------
 */

moviesRouter.get('/:id', async (req, res) => {      //*  ==>  path-to-regexp

    try {
        
        const { id } = req.params;

        /** -----  recuperar película por id  ----- */
        const movie = await MovieModel.getById({ id });

        if (movie)
            return res.json(movie);

        res.status(404).json({ message: 'Movie not found' });

    } 
    
    catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }

});



/*
    *  --------------------------------------------------------------------------------------
    *  -----  Crear una ruta POST  -  /movies  -  que permita crear una nueva película  -----
    *  --------------------------------------------------------------------------------------
*/

moviesRouter.post('/', async (req, res) => {

    try {
        
        /** -----  Result of validation  ----- */
        const result = validateMovie(req.body);

        if (result.error) {
            // 422 Unprocessable Entity
            return res.status(400).json({ error: JSON.parse(result.error.message) });
        }

        /**
         *  - Nueva película creada
         * @type {import('../types/movies.js').Movie}
         */
        const newMovie = await MovieModel.create(result.data);

        res.status(201).json(newMovie);

    } 
    
    catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }

});



/*
    *  ------------------------------------------------------------------------------------------
    *  -----  Crear una ruta PATCH  -  /movies/:id  -  que permita actualizar una película  -----
    *  ------------------------------------------------------------------------------------------
*/

moviesRouter.patch('/:id', async (req, res) => {

    try {
        
        const result = validatePartialMovie(req.body);

        if (!result.success) {
            return res.status(400).json({ error: JSON.parse(result.error.message) });
        }

        const { id } = req.params;

        /** -----  Actualizar película por id  ----- */
        const updateMovie = await MovieModel.update({ id, input: result.data });

        if (!updateMovie)
            return res.status(404).json({ message: 'Movie not found' });

        return res.json(updateMovie);
    } 
    
    catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }

});



/*
    *  ---------------------------------------------------------------------------------------------------
    *  -----  Crear una ruta DELETE  -  /movies/:id  -  que permita eliminar una película por su id  -----
    * ---------------------------------------------------------------------------------------------------
*/

moviesRouter.delete('/:id', async (req, res) => {

    try {
        
        const { id } = req.params;

        /** -----  Eliminar película por id  ----- */
        const result = await MovieModel.delete({ id });

        if (!result)
            return res.status(404).json({ message: 'Movie not found' });

        return res.json({ message: 'Movie deleted' });

    } 
    
    catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }

});
