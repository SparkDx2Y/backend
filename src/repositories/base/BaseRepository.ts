import type { Document, FilterQuery, Model, UpdateQuery } from "mongoose";
import type { IBaseRepository } from "./IBaseRepository";


export class BaseRepository<T extends Document> implements IBaseRepository<T> {
    protected model: Model<T>

    constructor(model: Model<T>) {
        this.model = model
    }

    async create(data: Partial<T>): Promise<T> {
        return this.model.create(data)
    }

    async findById(id: string): Promise<T | null> {
        return  this.model.findById(id).exec() 
    }

    async find(query?: FilterQuery<T>): Promise<T[]> {
        return this.model.find(query || {}).exec()
    }

    async findOne(query: FilterQuery<T>): Promise<T | null> {
        return this.model.findOne(query).exec()
    }

    async updateById(id: string, update: UpdateQuery<T>): Promise<T | null> {
        return this.model.findByIdAndUpdate(id, update, { new: true}).exec()
    }

    async deleteById(id: string): Promise<T | null> {
        return this.model.findByIdAndDelete(id).exec()
    }
}