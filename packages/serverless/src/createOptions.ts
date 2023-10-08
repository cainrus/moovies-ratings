import { Payload } from './Payload';

const key = process.env.MOVIEDB_KEY;
if (!key) throw new Error('MOVIEDB_KEY is not defined');
const authorizationHeader = 'Bearer ' + key;
const     hostname = 'api.themoviedb.org';
const port = 443;

function addParam(uri: string, key: string, value?: string): string {
    if (!value) return uri;
    return uri + `&${key}=` + value;
}

const makePath = ({title, year = '', lang = ''}: Payload) => {
    const uri = '/3/search/movie?page=1&include_adult=false&query=' + encodeURIComponent(title);
    return addParam(addParam(uri, 'language', lang), 'year', year);
}

export default function createOptions(options: Payload): Parameters<typeof fetch> {
  const url = `https://${hostname}:${port}${makePath(options)}`;
  return [
      url,
      {
          method: 'GET',
          headers: {
              'Content-Type': 'application/json',
              accept: 'application/json',
              Authorization: authorizationHeader
          }
      }
  ]
}
