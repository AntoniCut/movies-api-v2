/*
    *  ----------------------------------------------  *
    *  -----  movies.js  --  /routes/movies.js  -----  *
    *  ----------------------------------------------  *
*/


import { Router } from 'express';
import { MovieController } from '../controllers/movies.js';


/** -----  `create express router`  ----- */
export const moviesRouter = Router();




//*  ----  Crear una ruta GET  -  /movies  -  que devuelva todas las películas  -----
moviesRouter.get('/', MovieController.getAll);


//*  ----  Crear una ruta GET  -  /movies/:id  -  que devuelva la película con el id especificado  -----
moviesRouter.get('/:id', MovieController.getById);      //*  ==>  path-to-regexp


//*  -----  Crear una ruta POST  -  /movies  -  que permita crear una nueva película  -----
moviesRouter.post('/', MovieController.create);


//*  -----  Crear una ruta PATCH  -  /movies/:id  -  que permita actualizar una película  -----
moviesRouter.patch('/:id', MovieController.update);


//*  -----  Crear una ruta DELETE  -  /movies/:id  -  que permita eliminar una película por su id  -----
moviesRouter.delete('/:id', MovieController.delete);
