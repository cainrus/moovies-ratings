const key = process.env.MOVIEDB_KEY;
if (!key) throw new Error('MOVIEDB_KEY is not defined');
const authorizationHeader = 'Bearer ' + key;
const     hostname = 'api.themoviedb.org';
const port = 443;

const makePath = ({title, year}: {title: string, year: string}) => {
    return '/3/search/movie?query=' + encodeURIComponent(title) + '&include_adult=false&language=en-US&page=1&year=' + year
}

export default function createOptions({
    year,
    title,
    abortController,
}: {
    year: string,
    title: string,
    abortController?: AbortController
}): Parameters<typeof fetch> {
  const url = `https://${hostname}:${port}${makePath({year, title})}`;

  return [
      url,
      {
          method: 'GET',
          signal: abortController?.signal,
          headers: {
              'Content-Type': 'application/json',
              accept: 'application/json',
              Authorization: authorizationHeader
          }
      }
  ]
}
