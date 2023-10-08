import {getGenres} from "./getGenres";
import type {ParsedMovieDescription} from "./types/ParsedMovieDescription";

const apiGenres = getGenres();

export default function parseMovieDescription(description: string): ParsedMovieDescription {

    const castIndexStart = description.indexOf('(');
    if (castIndexStart === -1) throw new Error("Expected '(' in movie description but it was not found.");

    let moovieMetaIndexStart = -1;
    do  {
        moovieMetaIndexStart = description.indexOf('[', moovieMetaIndexStart + 1)
        // Check next char is numeric.
        if (Number.isFinite(Number(description.charAt(moovieMetaIndexStart + 1)))) break;
    } while (moovieMetaIndexStart !== -1)

    if (moovieMetaIndexStart === -1) throw new Error("Expected '[' in movie description but it was not found.");

    const moovieMetaIndexEnd = description.indexOf(']', moovieMetaIndexStart);
    if (moovieMetaIndexEnd === -1) throw new Error("Expected ']' in movie description but it was not found.");

    const rawTitle = description.slice(0, castIndexStart);
    const titles = rawTitle.split('/');
    const title = titles.pop()?.trim();
    if (!title) throw new Error('Unable to get title from movie description.');

    const moovieMetaInfo = description.slice(moovieMetaIndexStart + 1, moovieMetaIndexEnd).split(',');
    const year = moovieMetaInfo[0].trim();
    if (!Number.isFinite(+year)) throw new Error('Expected a year in movie description but found: ' + year);

    return {
        year,
        title,
        getGenres() {
            return moovieMetaInfo.slice(2, -1).reduce((acc, rawGenre) => {
                const lowCaseGenre = rawGenre.toLowerCase().trim();
                const foundGenre = apiGenres.find(({name}) => lowCaseGenre == name);
                return foundGenre ? [...acc, foundGenre.id] : acc;
            }, [] as number[])
        }
    }
}
