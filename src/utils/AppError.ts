// ----------------------------------
// AppError
// Its a custom error class that extends the built-in Error class.
// It is used to throw errors with a message and a status code.
// ----------------------------------


export class AppError extends Error {

    constructor(message: string, public statusCode: number) {
        super(message);
        Error.captureStackTrace(this, this.constructor);
    }
    
}