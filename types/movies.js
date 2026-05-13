/*
    -------------------------------------------------------
    ----------  /types/movies.js  -------------------------
    -------------------------------------------------------
*/


/**
 * ---------------------
 * -----  `Movie`  -----
 * ---------------------
 * - Representa una película almacenada en movies.json.
 *
 * @typedef {Object} Movie
 * @property {string} id - Identificador único de la película.
 * @property {string} title - Título de la película.
 * @property {number} year - Año de estreno.
 * @property {string} director - Nombre del director o directores.
 * @property {number} duration - Duración en minutos.
 * @property {string} poster - URL del póster.
 * @property {string[]} genre - Lista de géneros.
 * @property {number} [rate] - Puntuación de la película.
 */


/**
 * - Datos necesarios para crear una película.
 *
 * @typedef {Object} MovieInput
 * @property {string} title
 * @property {string[]} genre
 * @property {number} year
 * @property {string} director
 * @property {number} duration
 * @property {string} poster
 * @property {number} [rate]
 */


/**
 * - Colección de películas persistida en el JSON local.
 *
 * @typedef {Movie[]} Movies
 */


export {};