/*
    *  ---------------------------------------------------  *
    *  -----  movies.js  --  /controllers/movies.js  -----  *
    *  ---------------------------------------------------  *
*/


//import { MovieModel } from '../models/local-file-system/movie.js';
import { MovieModel } from '../models/database/movies.js';
import { validateMovie, validatePartialMovie } from '../schemas/movies.js';



/**
 * -------------------------------------
 * -----  class `MovieController`  -----
 * -------------------------------------
 * `@class`
 * - Controlador para manejar las operaciones relacionadas con las películas.
 * - Proporciona métodos para obtener, crear, actualizar y eliminar películas.
 * @method getAll - Devuelve todas las películas, con opción de filtrar por género.
 * @method getById - Devuelve una película por su id.
 * @method create - Crea una nueva película con los datos proporcionados.
 * @method update - Actualiza una película existente por su id con los datos proporcionados.
 * @method delete - Elimina una película por su id.
 */

export class MovieController {


    /**
     * ------------------------
     * -----  `getAll()`  -----
     * ------------------------
     * `@async`
     * - Devuelve todas las películas almacenadas en movies.json.
     * - Si se proporciona un género, filtra las películas por ese género (case-insensitive).
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     */

    static async getAll(req, res) {

        try {

            /** @type {{ genre?: string }} */
            const { genre } = req.query;

            const movies = await MovieModel.getAll({ genre });

            return res.json(movies);
        }

        catch (error) {
            return res.status(500).json({ message: 'Internal server error' });
        }


    }


    /**
     * -------------------------
     * -----  `getById()`  -----
     * -------------------------
     * `@async`
     * - Devuelve la película con el id especificado.
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     */
    static async getById(req, res) {

        try {

            const { id } = /** @type {{ id: string }} */ (req.params);
            const movie = await MovieModel.getById({ id });

            if (movie)
                return res.json(movie);

            return res.status(404).json({ message: 'Movie not found' });
        }

        catch (error) {
            return res.status(500).json({ message: 'Internal server error' });
        }


    }


    /**
     * ------------------------
     * -----  `create()`  -----
     * ------------------------
     * `@async`
     * - Crea una nueva película con los datos proporcionados.
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     */
    static async create(req, res) {

        try {

            const result = validateMovie(req.body);

            if (!result.success)
                return res.status(400).json({ error: JSON.parse(result.error.message) });

            const newMovie = await MovieModel.create(result.data);

            return res.status(201).json(newMovie);
        }

        catch (error) {
            return res.status(500).json({ message: 'Internal server error' });
        }


    }


    /**
     * ------------------------
     * -----  `update()`  -----
     * ------------------------
     * `@async`
     * - Actualiza una película existente por su id con los datos proporcionados.
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     */
    static async update(req, res) {

        try {

            const result = validatePartialMovie(req.body);

            if (!result.success)
                return res.status(400).json({ error: JSON.parse(result.error.message) });

            const { id } = /** @type {{ id: string }} */ (req.params);
            const updatedMovie = await MovieModel.update({ id, input: result.data });

            if (!updatedMovie)
                return res.status(404).json({ message: 'Movie not found' });

            return res.json(updatedMovie);
        }

        catch (error) {
            return res.status(500).json({ message: 'Internal server error' });
        }


    }


    /**
     * ------------------------
     * -----  `delete()`  -----
     * ------------------------
     * `@async`
     * - Elimina una película por su id.
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     */

    static async delete(req, res) {

        try {

            const { id } = /** @type {{ id: string }} */ (req.params);
            const deleted = await MovieModel.delete({ id });

            if (!deleted)
                return res.status(404).json({ message: 'Movie not found' });

            return res.json({ message: 'Movie deleted' });
        }

        catch (error) {
            return res.status(500).json({ message: 'Internal server error' });
        }


    }



}