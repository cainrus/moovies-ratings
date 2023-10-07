import { BatchGetItemCommand, DynamoDBClient } from "@aws-sdk/client-dynamodb";

export async function loadRatings(client: DynamoDBClient, list:  string[]): Promise<[string, number | undefined][]> {
    const data = await client.send(new BatchGetItemCommand(getParams(list)));
    const entries: [string, number][] = data.Responses?.MooRatings
        ?.map<[string, number]>((item) => ([
            ensureString(item.id?.S),
            ensureNumber(Number(item.score?.N)),
        ])) ?? [];
    const dict: Record<string, number> = Object.fromEntries(entries);
    return list.map<[string, number | undefined]>((name) => {
        const cache = dict[name];
        if (cache) {
            console.debug(`cache hit for ${name}`);
        } else {
            console.debug(`cache miss for ${name}`);
        }
        return [name, cache]
    })
}

function getParams(list: string[]) {
    return {
        RequestItems: {
            MooRatings: {
                Keys: list.map(id => ({
                    "id": { S: id },
                })),
                ProjectionExpression: 'id,score'
            }
        }
    }
}

function ensureNumber(value: unknown): number {
    if (typeof value === 'number') {
        return value;
    }
    throw new Error(`Expected number, got ${value} (${typeof value})`);
}

function ensureString(value: unknown): string {
    if (typeof value === 'string') {
        return value;
    }
    throw new Error(`Expected string, got ${value} (${typeof value})`);
}
