import { Table } from 'dynamodb-toolbox'

import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'

const marshallOptions = {
    // Whether to automatically convert empty strings, blobs, and sets to `null`.
    convertEmptyValues: false, // if not false explicitly, we set it to true.
    // Whether to remove undefined values while marshalling.
    removeUndefinedValues: false, // false, by default.
    // Whether to convert typeof object to map attribute.
    convertClassInstanceToMap: false, // false, by default.
}

const unmarshallOptions = {
    // Whether to return numbers as a string instead of converting them to native JavaScript numbers.
    // NOTE: this is required to be true in order to use the bigint data type.
    wrapNumbers: false, // false, by default.
}

const translateConfig = { marshallOptions, unmarshallOptions }

const client = new DynamoDBClient({
    region: 'eu-north-1',
    // endpoint: 'http://localhost:8000',
})
export const DocumentClient = DynamoDBDocumentClient.from(new DynamoDBClient({}), translateConfig)


// Instantiate a table
export const MooRatingsTable = new Table({
    // Specify table name (used by DynamoDB)
    name: 'MooRatings',

    // Define partition and sort keys
    partitionKey: 'id',

    // Add the DocumentClient
    DocumentClient
})
