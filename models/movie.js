/*
    *  ----------------------------------------------  *
    *  -----  movies.js  --  /models/movies.js  -----  *
    *  ----------------------------------------------  *
*/


/** -----  import crypto  ----- */
import { randomUUID } from 'node:crypto';

/** -----  import createRequire para importar JSON  ----- */
import { createRequire } from 'node:module';


/** -----  require para importar JSON  ----- */
const require = createRequire(import.meta.url);

/** @type {import('../types/movies.js').Movies} - colección de peliculas */
const movies = require('../movies.json');




/**
 * --------------------------------
 * -----  class `MovieModel`  -----
 * --------------------------------
 * @class
 * - Modelo para interactuar con la colección de películas almacenada en movies.json.
 * - Proporciona métodos para obtener, crear, actualizar y eliminar películas.
 * @method getAll
 * @method getById
 * @method create
 * @method update
 * @method delete
 */

export class MovieModel {


    /**
     * ------------------------
     * -----  `getAll()`  -----
     * ------------------------
     * - Devuelve todas las películas almacenadas en movies.json.
     * - Si se proporciona un género, filtra las películas por ese género (case-insensitive).
     * @param {{ genre?: string }} params
     * @returns {Promise<import('../types/movies.js').Movies>}
     */
    static async getAll({ genre }) {

        if (genre) {

            return movies.filter(
                movie => movie.genre.some(g => g.toLowerCase() === genre.toLowerCase())
            );
        }

        return movies;

    };



    /**
     * ---------------------------
     * -----  `getById()`  -----
     * ---------------------------
     * - Devuelve la película con el id especificado.
     * @param {{ id: string }} params
     * @returns {Promise<import('../types/movies.js').Movie | null>}
     */

    static async getById({ id }) {

        const movie = movies.find(movie => movie.id === id);
        return movie || null;

    }



    /**
     * ------------------------
     * -----  `create()`  -----
     * ------------------------
     * - Crea una nueva película con los datos proporcionados y la guarda en movies.json.
     * @param {import('../types/movies.js').MovieInput} input 
     */

    static async create(input) {

        /** @type {import('../types/movies.js').Movie} */
        const newMovie = {
            id: randomUUID(), // uuid v4
            ...input
        };
       
        movies.push(newMovie);

        return newMovie;
    }



    /**
     * ------------------------
     * -----  `update()`  -----
     * ------------------------
     * - Actualiza una película existente por su id con los datos proporcionados.
     * @param {{ id: string, input: Partial<import('../types/movies.js').MovieInput> }} params
     * @returns {Promise<import('../types/movies.js').Movie | null>} - Devuelve la película actualizada o null si no se encontró.
     */
    
    static async update({ id, input }) {

        const movieIndex = movies.findIndex(movie => movie.id === id);

        if (movieIndex === -1)
            return null;

        const updatedMovie = {
            ...movies[movieIndex],
            ...input
        };

        movies[movieIndex] = updatedMovie;

        return updatedMovie;

    }


    /**
     * ------------------------
     * -----  `delete()`  -----
     * ------------------------
     * - Elimina una película por su id.
     * @param {{ id: string }} params
     * @returns {Promise<boolean>} - Devuelve true si la película fue eliminada, false si no se encontró.
     */
    
    static async delete({ id }) {

        /** -----  Buscar índice de la película por id  ----- */
        const movieIndex = movies.findIndex(movie => movie.id === id);

        if (movieIndex === -1)
            return false;
        
        movies.splice(movieIndex, 1);
        
        return true;

    }


}
