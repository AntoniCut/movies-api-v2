/*
    *  -----------------------------------------------  *
    *  -----  cors.js  --  /middlewares/cors.js  -----  *
    * -----------------------------------------------  *
*/


import cors from 'cors'; // middleware para habilitar CORS


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
];


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
];


/**
 * --------------------------------
 * -----  `corsMiddleware()`  -----
 * --------------------------------
 * - Configuración personalizada para el middleware CORS de Express.
 * - Define una función para validar el origen de las solicitudes entrantes, 
 *   permitiendo solo aquellas que provienen de orígenes confiables o patrones de desarrollo.
 * - Si el origen es válido, se permite la solicitud; de lo contrario, se rechaza con un error de CORS.
 * - También permite solicitudes sin origen (por ejemplo, desde Postman) y solicitudes desde file:// en desarrollo.
 * @param {{ acceptedOrigins?: string[] }} [originsOptions] - Lista de orígenes permitidos.
 * @param {{ acceptedDevOriginPatterns?: RegExp[] }} [patternsOptions] - Patrones regex para orígenes locales de desarrollo.
 * @returns {import('express').RequestHandler} - Middleware CORS configurado para Express.
 */

export const corsMiddleware = (
    
    {acceptedOrigins = ACCEPTED_ORIGINS } = {},
    {acceptedDevOriginPatterns = ACCEPTED_DEV_ORIGIN_PATTERNS } = {}

) => cors({

    /**
     * @param {string | undefined} origin
     * @param {(err: Error | null, allow?: boolean) => void} callback
     */
    origin: (origin, callback) => {

        //  -----  Si no hay origen (por ejemplo, en solicitudes desde Postman), permitir la solicitud  -----
        if (!origin)
            return callback(null, true)

        //  -----  Permitir index.html abierto directamente desde file:// en desarrollo  -----
        if (origin === 'null')
            return callback(null, true)

        //  -----  Verificar si el origen está en la lista de orígenes permitidos  -----
        if (acceptedOrigins.includes(origin))
            return callback(null, true)

        //  -----  Permitir orígenes locales típicos de desarrollo como Live Server  -----
        if (acceptedDevOriginPatterns.some(pattern => pattern.test(origin)))
            return callback(null, true)

        //  -----  Si el origen no está permitido, rechazar la solicitud con un error de CORS  -----
        return callback(new Error(`Not allowed by CORS: ${origin}`))
    }

})
