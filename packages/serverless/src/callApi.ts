import {isObject} from "./guards/isObject";
import createOptions from "./createOptions";
import makeRequest from "./makeRequest";
import withTimeout from "./withTimeout";
import {assert} from "./guards/assert";
import {isMovieSearchResults} from "./guards/isMovieSearchResults";


export default async function callApi({year, title}: { year: string, title: string }) {
    const abortController = new AbortController()
    const options = createOptions({
        year,
        title,
    });

    const response = await withTimeout(fetch(...options).then(response => response.json()), {
        timeout: 1000,
        id: 'api:request',
        clean: () => void abortController.abort()
    });
    assert(isObject(response))
    const results = response.results;
    assert(isMovieSearchResults(results), 'Unexpected response from API: ' + JSON.stringify(results))
    return results;
}
