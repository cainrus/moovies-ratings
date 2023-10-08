import {Payload} from "./Payload";
import {isObject} from "./guards/isObject";
import createOptions from "./createOptions";
import withTimeout from "./withTimeout";
import {assert} from "./guards/assert";
import {isMovieSearchResults} from "./guards/isMovieSearchResults";


export default async function callApi(payload: Payload) {
    const [url, options] = createOptions(payload);
    const abortController = new AbortController()
    const response = await withTimeout(
        fetch(url, { ...options, signal: abortController.signal }), {
        timeout: 1000,
        id: 'api:request',
        onTimeout: () => {
            void abortController.abort()
        }
    });

    const json = await response.json();
    assert(isObject(json))
    const results = json.results;
    assert(isMovieSearchResults(results), 'Unexpected response from API: ' + JSON.stringify(results), { Error: MovieSearchError })
    return results;
}

export class MovieSearchError extends Error {}
