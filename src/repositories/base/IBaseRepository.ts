import type { Document, FilterQuery, UpdateQuery } from "mongoose";

export interface IBaseRepository<T extends Document> {

    //? create a  new document
    create(data: Partial<T>): Promise<T>;

    //? find a document by id
    findById(id: string): Promise< T | null >;

    //? find a document by query or all documents
    find(query?: FilterQuery<T>): Promise<T[]>;

    //? find a single document by query
    findOne(query: FilterQuery<T>): Promise<T | null>

    //? update a document by id
    updateById(id:string, update: UpdateQuery<T>): Promise<T | null>

    deleteById(id: string): Promise<T | null> 

}