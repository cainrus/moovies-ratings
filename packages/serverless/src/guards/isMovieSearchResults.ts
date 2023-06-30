import type {MovieSearchResult} from "../types/MovieSearchResult";
import {isObject} from './isObject'
import {isArray} from './isArray'

export function isMovieSearchResults(result: unknown): result is Array<MovieSearchResult> {
    if (!isArray(result)) return false;
    return result.every((item) => {
        if (!isObject(item)) return false;
        const genres = item.genre_ids;
        if (!isArray(genres)) return false;
        if (!genres.every((genre) => typeof genre === 'number')) return false;
        if (typeof item.original_title !== 'string') return false;
        if (typeof item.release_date !== 'string') return false;
        return true;
    })
}
