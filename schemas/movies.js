/*
    *  -----------------------------------------------  *
    *  -----  movies.js  --  /schemas/movies.js  -----  *
    *  -----------------------------------------------  *
*/


const z = require('zod');

/**
 * ---------------------------  
 * -----  `movieSchema`  -----
 * --------------------------- 
 * - Esquema de validación para una película, utilizando Zod.
 * - Define las reglas de validación para cada propiedad de una película.
 * - Se utiliza para validar los datos de entrada al crear o actualizar una película.
 */

const movieSchema = z.object({
    
    title: z.string({
        error: issue => issue.input === undefined
            ? 'Movie title is required.'
            : 'Movie title must be a string'
    }).min(1, 'Movie title is required.'),
    
    year: z.number().int().min(1900).max(2024),
    
    director: z.string(),
    
    duration: z.number().int().positive(),
    
    rate: z.number().min(0).max(10).default(5),
    
    poster: z.url({
        message: 'Poster must be a valid URL'
    }),
    
    genre: z.array(
        z.enum(['Action', 'Adventure', 'Crime', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Thriller', 'Sci-Fi']),
        {
            error: issue => issue.input === undefined
                ? 'Movie genre is required.'
                : 'Movie genre must be an array of enum Genre'
        }
    ).min(1, 'Movie genre is required.')
});



/**
 * -----------------------------
 * -----  `validateMovie`  -----
 * -----------------------------
 * - Valida un objeto de entrada contra el esquema `movieSchema`.
 * @param {unknown} input - El objeto a validar, típicamente el cuerpo de una solicitud HTTP.
 */
function validateMovie(input) {
    return movieSchema.safeParse(input);
}


/**
 * ------------------------------------
 * -----  `validatePartialMovie`  -----
 * ------------------------------------
 * - Valida un objeto parcial de entrada contra el esquema `movieSchema`.
 * - Ideal para actualizaciones parciales (PATCH).
 * @param {unknown} input - El objeto a validar, típicamente el cuerpo de una solicitud HTTP.
 */
function validatePartialMovie(input) {
    return movieSchema.partial().safeParse(input);
}


module.exports = {
    validateMovie,
    validatePartialMovie
}