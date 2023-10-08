import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import AWSXRay from "aws-xray-sdk";

import {assert} from "./guards/assert";


let client: DynamoDBClient | undefined;
export const getDBClient = (): DynamoDBClient => {
    if (!client) {
        const region = process.env.DYNAMO_DB_REGION;
        assert(region, 'DYNAMO_DB_REGION environment variable is not set');
        client = new DynamoDBClient({region: process.env.DYNAMO_DB_REGION});
        if (process.env.NO_TRACE) {
            return client;
        }
        client = AWSXRay.captureAWSv3Client(client);
    }
    return client;
}
