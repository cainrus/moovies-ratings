console.log('Loading function');

import type {APIGatewayEvent, Context} from 'aws-lambda';
import createRedisClient from "./createRedisClient";
import createSuccessResponse from "./createSuccessResponse";
import createErrorResponse from "./createErrorResponse";
import withTimeout from "./withTimeout";
import setRedisValue from "./writeRedisValue";
import reduceResults from "./reduceResults";
import parseSearch from "./parseSearch";
import readRedisValue from "./readRedisValue";
import callApi from "./callApi";

export const handler = async (event: APIGatewayEvent, context: Context) => {
    context.callbackWaitsForEmptyEventLoop = false;
    const client = await createRedisClient();
    let search: string | undefined;

    try {
        const query = event.queryStringParameters || {};
        search = query.search;

        if (!search) throw new Error('Expected GET query "search" param to be defined.');

        const value = await withTimeout(readRedisValue(client, search), 200, 'cache:get');

        if (!value) {
            console.debug(`cache miss`);
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
                return createErrorResponse({message: 'Unable to get search result'})
            }

            const vote = searchResult.vote_average;
            console.debug('vote result', vote);
            await withTimeout(setRedisValue(client, search, `${vote}`), 200, 'cache:set');
            return createSuccessResponse({vote});
        } else {
            console.debug(`cache hit`);
            return createSuccessResponse({vote: value});
        }
    } catch (error) {
        console.error(`Error handling search: ${search}`, error);
        return createErrorResponse();
    } finally {
        console.info('quiting redis')
        await client.quit();
    }
};
