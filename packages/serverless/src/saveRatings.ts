import { DynamoDBClient, BatchWriteItemCommand, WriteRequest } from "@aws-sdk/client-dynamodb";

export async function saveRatings(client: DynamoDBClient, ratings: Record<string, number>): Promise<void> {
    const writeRequests: WriteRequest[] = Object.keys(ratings).map((id) => {
        return {
            PutRequest: {
                Item: {
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
