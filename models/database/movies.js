/*
    *  -------------------------------------------------------  *
    *  -----  movies.js  --  /models/database/movies.js  -----  *
    *  -------------------------------------------------------  *
*/


import { MongoClient, ObjectId, ServerApiVersion } from 'mongodb';
import { MovieModel as LocalMovieModel } from '../local-file-system/movie.js';


/**  -----  `URL de conexión a MongoDB` -----  */
const MONGODB_URI = process.env.MONGODB_URI ?? 'mongodb+srv://user:password@cluster0.mongodb.net/?retryWrites=true&w=majority';

/** -----  `Nombre de la base de datos y colección` ----- */
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME ?? 'database';

/** -----  `Nombre de la colección` ----- */
const MONGODB_COLLECTION_NAME = 'movies';


/**
 * - Tipo de documento de MongoDB para una película, con un campo _id opcional.
 * @typedef {import('../../types/movies.js').MovieInput & { _id?: ObjectId }} MovieDbDocument
 */

/** @type {MongoClient | null} */
let client = null;

/** @type {import('mongodb').Collection<MovieDbDocument> | null} */
let moviesCollection = null;

/** @type {boolean} */
let databaseAvailable = true;


/**
 * -----------------------------
 * -----  `toMovieView()`  -----
 * -----------------------------
 * - Convierte un documento de MongoDB al tipo Movie de la API.
 * @param {import('mongodb').WithId<MovieDbDocument>} document
 * @returns {import('../../types/movies.js').Movie}
 */
const toMovieView = (document) => ({
    id: document._id.toString(),
    title: document.title,
    year: document.year,
    director: document.director,
    duration: document.duration,
    poster: document.poster,
    genre: document.genre,
    rate: document.rate
});


/**
 * ------------------------
 * -----  `connect()` -----
 * ------------------------
 * - Abre y reutiliza una única conexión a la colección movies.
 * @returns {Promise<import('mongodb').Collection<MovieDbDocument>>}
 */
const connect = async () => {

    if (moviesCollection)
        return moviesCollection;

    if (!databaseAvailable)
        throw new Error('MongoDB is not available');

    client = new MongoClient(MONGODB_URI, {
        serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true
        }
    });

    try {

        await client.connect();

        const db = client.db(MONGODB_DB_NAME);
        moviesCollection = db.collection(MONGODB_COLLECTION_NAME);

        return moviesCollection;
    }

    catch (error) {

        databaseAvailable = false;
        console.error('MongoDB connection failed. Falling back to local file system model.');
        console.error(error);

        if (client) {
            await client.close().catch(() => undefined);
            client = null;
        }

        throw error;
    }
};


/**
 * --------------------------------
 * -----  class `MovieModel`  -----
 * --------------------------------
 */
export class MovieModel {


    /**
     * @template T
     * @param {() => Promise<T>} fromDatabase
     * @param {() => Promise<T>} fromLocal
     * @returns {Promise<T>}
     */
    static async withFallback(fromDatabase, fromLocal) {

        try {
            return await fromDatabase();
        }

        catch {
            return fromLocal();
        }
    }


    /**
     * @param {{ genre?: string }} params
     * @returns {Promise<import('../../types/movies.js').Movies>}
     */
    static async getAll({ genre }) {

        return MovieModel.withFallback(
            async () => {

                const db = await connect();

                /** @type {import('mongodb').Filter<MovieDbDocument>} */
                const filter = genre
                    ? {
                          genre: {
                              $elemMatch: {
                                  $regex: genre,
                                  $options: 'i'
                              }
                          }
                      }
                    : {};

                const documents = await db.find(filter).toArray();

                return documents.map(toMovieView);
            },
            () => LocalMovieModel.getAll({ genre })
        );
    }


    /**
     * @param {{ id: string }} params
     * @returns {Promise<import('../../types/movies.js').Movie | null>}
     */
    static async getById({ id }) {

        return MovieModel.withFallback(
            async () => {

                if (!ObjectId.isValid(id))
                    return null;

                const db = await connect();
                const document = await db.findOne({ _id: new ObjectId(id) });

                if (!document)
                    return null;

                return toMovieView(document);
            },
            () => LocalMovieModel.getById({ id })
        );
    }


    /**
     * @param {import('../../types/movies.js').MovieInput} input
     * @returns {Promise<import('../../types/movies.js').Movie>}
     */
    static async create(input) {

        return MovieModel.withFallback(
            async () => {

                const db = await connect();
                const { insertedId } = await db.insertOne(input);

                return {
                    id: insertedId.toString(),
                    ...input
                };
            },
            () => LocalMovieModel.create(input)
        );
    }


    /**
     * @param {{ id: string }} params
     * @returns {Promise<boolean>}
     */
    static async delete({ id }) {

        return MovieModel.withFallback(
            async () => {

                if (!ObjectId.isValid(id))
                    return false;

                const db = await connect();
                const { deletedCount } = await db.deleteOne({ _id: new ObjectId(id) });

                return deletedCount > 0;
            },
            () => LocalMovieModel.delete({ id })
        );
    }


    /**
     * @param {{ id: string, input: Partial<import('../../types/movies.js').MovieInput> }} params
     * @returns {Promise<import('../../types/movies.js').Movie | null>}
     */
    static async update({ id, input }) {

        return MovieModel.withFallback(
            async () => {

                if (!ObjectId.isValid(id))
                    return null;

                const db = await connect();
                const result = await db.findOneAndUpdate(
                    { _id: new ObjectId(id) },
                    { $set: input },
                    { returnDocument: 'after' }
                );

                if (!result)
                    return null;

                return toMovieView(result);
            },
            () => LocalMovieModel.update({ id, input })
        );
    }
}
