import {isObject} from "./guards/isObject";
import createOptions from "./createOptions";
import makeRequest from "./makeRequest";
import withTimeout from "./withTimeout";
import {assert} from "./guards/assert";
import {isMovieSearchResults} from "./guards/isMovieSearchResults";


export default async function callApi({year, title}: { year: string, title: string }) {
    const options = createOptions({
        year,
        title,
    });
    const response = await withTimeout(makeRequest(options), 1000, 'api:request');
    assert(isObject(response))
    const results = response.results;
    assert(isMovieSearchResults(results))
    return results;
}
