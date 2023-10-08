import { DynamoDBClient, BatchWriteItemCommand, WriteRequest } from "@aws-sdk/client-dynamodb";

const day = 60 * 60 * 24;

export async function saveRatings(client: DynamoDBClient, ratings: Record<string, number>): Promise<void> {
    const now = Date.now();
    const writeRequests: WriteRequest[] = Object.keys(ratings).map((id) => {
        return {
            PutRequest: {
                Item: {
                    "ttl": { N: String(now + day) },
                    "id": { S: id },
                    "score": { N: ratings[id].toString() }
                }
            }
        };
    });

    // Construct the parameters for BatchWriteItem
    const params = {
        RequestItems: {
            "MooRatings": writeRequests
        }
    };

    await client.send(new BatchWriteItemCommand(params));
}
