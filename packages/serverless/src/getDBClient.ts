import {DynamoDBClient} from "@aws-sdk/client-dynamodb";
import {assert} from "./guards/assert";

let client: DynamoDBClient | undefined;
export const getDBClient = (): DynamoDBClient => {
    if (!client) {
        const region = process.env.DYNAMO_DB_REGION;
        assert(region, 'DYNAMO_DB_REGION environment variable is not set');
        client = new DynamoDBClient({region: process.env.DYNAMO_DB_REGION});
    }
    return client;
}
