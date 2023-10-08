import {getGenres} from "./getGenres";

function getMetaInfoStart(input: string) {
    let moovieMetaIndexStart = -1;
    do  {
        moovieMetaIndexStart = input.indexOf('[', moovieMetaIndexStart + 1)
        // Check next char is numeric.
        if (Number.isFinite(Number(input.charAt(moovieMetaIndexStart + 1)))) break;
    } while (moovieMetaIndexStart !== -1)
    return moovieMetaIndexStart;
}

function createOptions(description: string) {
    const metaInfoStart = getMetaInfoStart(description);
    const metaInfoEnd = description.indexOf(']', metaInfoStart)
    return {
        start: getMetaInfoStart(description),
        end: description.indexOf(']', metaInfoStart),
        tokens: description.slice(
            metaInfoStart + 1,
            metaInfoEnd,
        ).split(',')
    }
}

export class MovieDescriptionParser {

    constructor(
        private description: string,
        public readonly options = createOptions(description)
    ) {}

    private originalLanguage: string | null | undefined = null;
    getOriginalLanguage() {
        if (this.originalLanguage !== null) return this.originalLanguage;
        const token = 'Original (';
        const langStartIndex = this.description.indexOf(token, this.options.end);
        if (langStartIndex === -1) return undefined;
        const langEndIndex = this.description.indexOf(')', langStartIndex);
        if (langStartIndex !== -1) {
            const lang = this.description.slice(langStartIndex + token.length, langEndIndex).trim();
            if (lang) {
                this.originalLanguage = lang;
                return lang;
            }
        }
        console.warn('Unable to parse original language: ' + this.description.slice(langStartIndex));
        return this.originalLanguage = undefined;
    }

    private title: string | undefined;
    getTitle(offset = 0): string {
        if (this.title) return this.title;
        const { description } = this;
        const castIndexStart = description.indexOf('(');
        if (castIndexStart === -1) throw new Error("Expected '(' in movie description but it was not found.");
        const rawTitle = description.slice(0, castIndexStart);
        const titles = rawTitle.split('/');
        const title = titles[titles.length - 1 - offset]?.trim();
        if (!title) throw new Error(`Unable to get title from movie description (offset=${offset}).`);
        return this.title = title;
    }

    private year: string | undefined;
    getYear(): string {
        const year = this.options.tokens[0].trim();
        if (!Number.isFinite(+year)) throw new Error('Expected a year in movie description but found: ' + year);
        return this.year = year;

    }

    private genres: number[] | undefined;
    getGenres(): number[] {
        if (this.genres) return this.genres;
        return this.genres = this.options.tokens.slice(2, -1).reduce((acc, rawGenre) => {
            const lowCaseGenre = rawGenre.toLowerCase().trim();
            const foundGenre = getGenres().find(({name}) => lowCaseGenre == name);
            return foundGenre ? [...acc, foundGenre.id] : acc;
        }, [] as number[])
    }


}
