/*
    *  ---------------------------------  *
    *  -----  app.js  --  /app.js  -----  *
    *  ---------------------------------  *
*/


/** -----  import express  ----- */
import express from 'express';

/** -----  import path  ----- */
import { join, dirname } from 'node:path';

/** -----  import url  ----- */
import { fileURLToPath } from 'node:url';

/** -----  import crypto  ----- */
import { randomUUID } from 'node:crypto'; // módulo nativo de Node.js para generar UUIDs

/** -----  import cors  ----- */
import cors from 'cors'; // middleware para habilitar CORS

/** -----  import validation functions  ----- */
import { validateMovie, validatePartialMovie } from './schemas/movies.js';

/** -----  import createRequire para importar JSON  ----- */
import { createRequire } from 'node:module';


/**  -----  require function para importar JSON  ----- */
const require = createRequire(import.meta.url);

/** -----  create express app  ----- */
const app = express();

/** -----  __dirname equivalente en ESM  ----- */
const __dirname = dirname(fileURLToPath(import.meta.url));


/** @type {import('./types/movies.js').Movies} - colección de peliculas */
const movies = require('./movies.json');


/**
 * --------------------------------
 * -----  `ACCEPTED_ORIGINS`  -----
 * --------------------------------
 * - Lista de orígenes permitidos para CORS.
 * - Se utiliza para validar el origen de las solicitudes entrantes y permitir solo aquellas que provienen de orígenes confiables.
 * - Incluye tanto orígenes de producción como patrones para orígenes locales comunes en desarrollo.
 */

const ACCEPTED_ORIGINS = [
    'http://localhost:8080',
    'http://localhost:1234',
    'https://movies.com',
    'https://midu.dev',
    'https://movies-api-v2-1.onrender.com'
]


/**
 * -------------------------
 * -----  `ACCEPTED_DEV_ORIGIN_PATTERNS`  -----
 * -------------------------
 * - Lista de patrones de expresiones regulares para orígenes locales comunes en desarrollo.
 * - Permite aceptar solicitudes desde cualquier puerto en localhost o 127.0.0.1.
 */

const ACCEPTED_DEV_ORIGIN_PATTERNS = [
    /^http:\/\/localhost:\d+$/,
    /^http:\/\/127\.0\.0\.1:\d+$/
]


/** -----  configure CORS  ----- */
app.use(cors({

    origin: (origin, callback) => {

        //  -----  Si no hay origen (por ejemplo, en solicitudes desde Postman), permitir la solicitud  -----
        if (!origin)
            return callback(null, true)

        //  -----  Permitir index.html abierto directamente desde file:// en desarrollo  -----
        if (origin === 'null')
            return callback(null, true)

        //  -----  Verificar si el origen está en la lista de orígenes permitidos  -----
        if (ACCEPTED_ORIGINS.includes(origin))
            return callback(null, true)

        //  -----  Permitir orígenes locales típicos de desarrollo como Live Server  -----
        if (ACCEPTED_DEV_ORIGIN_PATTERNS.some(pattern => pattern.test(origin)))
            return callback(null, true)

        //  -----  Si el origen no está permitido, rechazar la solicitud con un error de CORS  -----
        return callback(new Error(`Not allowed by CORS: ${origin}`))
    }

}));



//  -----  Deshabilitar el encabezado 'X-Powered-By' para mejorar la seguridad  -----
app.disable('x-powered-by');

//  -----  Middleware para parsear el cuerpo de las solicitudes como JSON  -----
app.use(express.json());

//  -----  Servir archivos estáticos desde las carpetas web y assets  -----
app.use(express.static(join(__dirname, 'web')));
app.use('/assets', express.static(join(__dirname, 'assets')));



/*  
    *  --------------------------------------------------------------------------------
    *  -----  Crear una ruta GET  -  /  -  que devuelva un mensaje de bienvenida  -----
    *  --------------------------------------------------------------------------------
 */

app.get('/', (req, res) => {

    res.send('API con Express');

});



/*  
    *  ---------------------------------------------------------------------------------
    *  -----  Crear una ruta GET  -  /movies  -  que devuelva todas las películas  -----
    *  ---------------------------------------------------------------------------------
 */

app.get('/movies', (req, res) => {
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

app.get('/movies/:id', (req, res) => {      //*  ==>  path-to-regexp

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

app.post('/movies', (req, res) => {


    /** -----  Result of validation  ----- */
    const result = validateMovie(req.body);

    if (result.error) {
        // 422 Unprocessable Entity
        return res.status(400).json({ error: JSON.parse(result.error.message) });
    }


    /** @type {import('./types/movies.js').Movie} */
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

app.patch('/movies/:id', (req, res) => {

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

app.delete('/movies/:id', (req, res) => {
    
    const { id } = req.params
    
    const movieIndex = movies.findIndex(movie => movie.id === id)

    if (movieIndex === -1) 
        return res.status(404).json({ message: 'Movie not found' })
    

    movies.splice(movieIndex, 1)

    return res.json({ message: 'Movie deleted' })
})



/*
    *  ---------------------------------------------------------------------------------
    *  -----  Configurar el servidor para que escuche en el puerto 5678 y mostrar  -----
    *  -----  un mensaje en la consola indicando que el servidor está escuchando   -----
    * ----------------------------------------------------------------------------------
*/

const PORT = process.env.PORT || 1234;


/**
 * -------------------------
 * -----  `🔥 server`  -----
 * ------------------------- 
 * - iniciar el servidor
 */

const server = app.listen(PORT, () => {
    console.log(`server listening on http://localhost:${PORT}`);
});



/**
 * -------------------------
 * -----  `shutdown()` -----
 * -------------------------
 * - apagar el servidor de forma segura
 */

const shutdown = () => {
    console.log('Apagando servidor...');

    server.close(() => {
        console.log('Servidor cerrado');
        process.exit(0);
    });
};


// Escuchar señales de terminación para apagar el servidor de forma segura
process.on('SIGINT', shutdown);

// SIGTERM es la señal que se envía cuando se detiene el proceso con `kill`
process.on('SIGTERM', shutdown);
