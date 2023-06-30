const key = process.env.MOVIEDB_KEY;
if (!key) throw new Error('MOVIEDB_KEY is not defined');
const authorizationHeader = 'Bearer ' + key;

export default function createOptions({
    year,
    title,
}: {
    year: string,
    title: string
}) {
  return {
    hostname: 'api.themoviedb.org',
    port: 443,
    path: '/3/search/movie?query=' + encodeURIComponent(title) + '&include_adult=false&language=en-US&page=1&year=' + year,
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: authorizationHeader
    }
  }
}
