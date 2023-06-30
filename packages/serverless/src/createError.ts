import type {ErrorCode} from "./ErrorCode";

interface AppError extends Error {
    code: ErrorCode
}

export default function createError(message: string, code: ErrorCode): AppError {
    return Object.assign(new Error(message), {
        code
    })
}
