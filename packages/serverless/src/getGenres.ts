import {isObject} from "./guards/isObject";
import {assert} from "./guards/assert";
import apiGenres from "./api-genres.json";

export function getGenres(): {name: string, id: number}[] {
    assert(
        apiGenres
            .every(item => isObject(item) && typeof item.id === 'number' && typeof item.name === 'string'),
    )
    return apiGenres;
}
