

import {MovieDescriptionParser} from './MovieDescriptionParser';
import type {MovieSearchResult} from './types/MovieSearchResult';

export default function reduceResults(
    results: MovieSearchResult[],
    movieDescriptionParser: MovieDescriptionParser
): undefined | MovieSearchResult {
    const recordsCount = results.length;
    if (results.length <= 1) {
        return results[0];
    }

    // Filtering based on title match
    const title = movieDescriptionParser.getTitle()
    const titleLowCase = title.toLowerCase();
    results = results.filter(item => item.original_title.toLowerCase() === titleLowCase);
    if (results.length <= 1) {
        return results[0];
    }

    // Filtering based on genre match
    const genres = movieDescriptionParser.getGenres();
    results = results.filter((item) => genres.every((genre) => item.genre_ids.includes(genre)));
    if (results.length <= 1) {
        return results[0];
    }

    // Filtering based on year match
    const year = movieDescriptionParser.getYear()
    results = results.filter((item) => !item.release_date || item.release_date.startsWith(year));

    // Throwing an error if we still have more than one result after all filters
    if (results.length > 1) {
        throw new Error(`Could not narrow down the search results from initial count of ${recordsCount}. 
                     Multiple matches found even after applying all filters - Title, Genre, and Year.`);
    }

    return results[0];
}
