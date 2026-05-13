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

/** -----  import movies router  ----- */
import { moviesRouter } from './routes/movies.js';

/** -----  import CORS middleware  ----- */
import { corsMiddleware } from './middlewares/cors.js';



/** -----  create express app  ----- */
const app = express();

/** -----  __dirname equivalente en ESM  ----- */
const __dirname = dirname(fileURLToPath(import.meta.url));


/** -----  configure CORS  ----- */
app.use(corsMiddleware());



//  -----  Deshabilitar el encabezado 'X-Powered-By' para mejorar la seguridad  -----
app.disable('x-powered-by');

//  -----  Middleware para parsear el cuerpo de las solicitudes como JSON  -----
app.use(express.json());

//  -----  Servir archivos estáticos desde las carpetas web y assets  -----
app.use(express.static(join(__dirname, 'web')));
app.use('/assets', express.static(join(__dirname, 'assets')));

//  -----  Usar el router de movies  -----
app.use(moviesRouter);


/*
    *  ---------------------------------------------------------------------------------
    *  -----  Configurar el servidor para que escuche en el puerto 5678 y mostrar  -----
    *  -----  un mensaje en la consola indicando que el servidor está escuchando   -----
    * ----------------------------------------------------------------------------------
*/

/** -----  `puerto` ----- */
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
