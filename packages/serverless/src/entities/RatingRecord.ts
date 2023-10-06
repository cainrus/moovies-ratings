import { Entity } from 'dynamodb-toolbox'

import { MooRatingsTable } from './MooRatingsTable'

export const RatingRecord = new Entity({
    // Specify entity name
    name: 'RatingRecord',

    // Define attributes
    attributes: {
        id: { partitionKey: true, type: 'string' }, // flag as partitionKey
        score: { type: 'number', required: true }, // set the attribute type
    },

    // Assign it to our table
    table: MooRatingsTable,

    // In Typescript, the "as const" statement is needed for type inference
} as const)
