import type {APIGatewayEvent, Context} from 'aws-lambda';
import {hash} from "./hash";
import {tracePromise} from "./tracePromise";
import {configureXRay} from "./configureXRay";
import {getDBClient} from "./getDBClient";
import createSuccessResponse from "./createSuccessResponse";
import createErrorResponse from "./createErrorResponse";
import withTimeout from "./withTimeout";
import reduceResults from "./reduceResults";
import parseSearch from "./parseSearch";
import callApi from "./callApi";
import { loadRatings } from './loadRating';
import { saveRatings } from './saveRatings';

type Optional<T> = T | undefined;

function parseSearches(payload: string | null) {
    if (!payload) throw new Error('Expected payload to be defined');
    const { searches } = JSON.parse(payload);
    if (!Array.isArray(searches)) throw new Error('Expected searches to be an array');
    return searches;
}

const latency = 1000;

export const handler = async (event: APIGatewayEvent, context: Context) => {
    try {
        configureXRay();
        const searches = parseSearches(event.body);
        const entries = await tracePromise(
            withTimeout(loadRatings(getDBClient(), searches), {timeout: latency, id: 'cache:load'}),
            'cache-load'
        );
        let newRatings: Record<string, number> = {};
        const result = await entries.reduce(async (acc, [name, score]) => {
            if (score === undefined) {
                try {
                    console.debug('Fetching score for', name);
                    const found = await tracePromise(handleSearch(name), 'fetch-score');
                    console.debug('Fetched score', found, 'for', name);
                    newRatings[hash(name)] = found;
                    return [...await acc, found];
                } catch (err) {
                    console.error('Unable to fetch rating for', name, err);
                    return [...await acc, -1];
                }
            }
            return [...await acc, score];
        }, Promise.resolve([] as Optional<number>[]));
        if (Object.keys(newRatings).length) {
            await withTimeout(saveRatings(getDBClient(), newRatings), {timeout: latency, id: 'cache:save'});
        }
        return createSuccessResponse(result);
    } catch (error) {
        console.error(`Error handling search`, error);
        if (process.env.NODE_ENV === 'production' || !(error instanceof Error)) {
            return createErrorResponse();
        }
        return createErrorResponse(error);
    }
};

async function handleSearch(search: string): Promise<number> {
    const {
        year,
        title,
        getGenres,
    } = parseSearch(search);

    const results = await callApi({
        year,
        title,
    });

    const searchResult = reduceResults(results, {title, year, getGenres})

    if (!searchResult) {
        throw new Error('Unable to get search result');
    }

    return searchResult.vote_average;
}
