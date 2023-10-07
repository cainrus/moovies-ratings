import type {APIGatewayEvent, Context} from 'aws-lambda';
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
    if (!payload) throw new Error('Invalid request');
    const { searches } = JSON.parse(payload);
    if (!Array.isArray(searches)) throw new Error('Invalid request');
    return searches;
}

const latency = 800;

export const handler = async (event: APIGatewayEvent, context: Context) => {
    context.callbackWaitsForEmptyEventLoop = false;

    try {
        const searches = parseSearches(event.body)
        const entries = await withTimeout(loadRatings(getDBClient(), searches), latency, 'cache:load');
        let newRatings: Record<string, number> = {};
        const result = await entries.reduce(async (acc, [name, score]) => {
            if (score === undefined) {
                try {
                    console.debug('Fetching score for', name);
                    const found = await handleSearch(name);
                    console.debug('Fetched score', found, 'for', name);
                    if (found) {
                        newRatings[name] = found;
                    }
                    return [...await acc, found];
                } catch (err) {
                    console.error('Unable to fetch rating for', name, err);
                    return [...await acc, undefined];
                }
            }
            return [...await acc, score];
        }, Promise.resolve([] as Optional<number>[]));
        if (Object.keys(newRatings).length) {
            await withTimeout(saveRatings(getDBClient(), newRatings), latency, 'cache:save');
        }
        return createSuccessResponse(result);
    } catch (error) {
        console.error(`Error handling search`, error);
        if (process.env.NODE_ENV !== 'production' && error instanceof Error) {
            return createErrorResponse(error);
        }
        return createErrorResponse();
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

    const vote = searchResult.vote_average;
    console.debug('vote result', vote, 'for', search);
    return vote;
}
