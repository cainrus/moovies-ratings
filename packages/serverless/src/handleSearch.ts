import callApi, {MovieSearchError} from "./callApi";
import {MovieDescriptionParser} from "./MovieDescriptionParser";
import reduceResults from "./reduceResults";

export async function handleSearch(
    search: string,
    movieDescriptionParser: MovieDescriptionParser,
    options: { titleOffset?: number , skipYear?: boolean } = {},
): Promise<number> {
    const {
        titleOffset= 0,
        skipYear = false
    } = options;
    try {
        const results = await callApi({
            year: skipYear ? undefined : movieDescriptionParser.getYear(),
            title: movieDescriptionParser.getTitle(titleOffset),
            lang: movieDescriptionParser.getOriginalLanguage(),
        });
        const searchResult = reduceResults(results, movieDescriptionParser);

        if (!searchResult) {
            throw new MovieSearchError('Unable to get search result');
        }

        return searchResult.vote_average;
    } catch (err) {
        if (err instanceof MovieSearchError) {
            if (!skipYear && !titleOffset) {
                console.warn('Additional search attempt for', search);
                return Promise.any([
                    handleSearch(search, movieDescriptionParser, {titleOffset: titleOffset + 1}),
                    handleSearch(search, movieDescriptionParser, {skipYear: true}),
                ])
            }
        }
        throw err;
    }
}
