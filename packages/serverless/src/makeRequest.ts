import https from 'https';
import {ErrorCode} from "./ErrorCode";
import createError from "./createError";
import {assert} from "./guards/assert";

interface RequestOptions extends https.RequestOptions {}

function makeResponse (options: RequestOptions): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const req = https.request(options, res => {
      let data = '';

      // Add this check to ensure that HTTP status code is 200
      if (res.statusCode && (res.statusCode < 200 || res.statusCode > 299)) {
        reject(new Error('Failed with status code: ' + res.statusCode));
      }

      res.on('data', chunk => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (err) {
          assert(err instanceof Error);
          reject(createError(err.message, ErrorCode.INVALID_API_RESPONSE));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

export default makeResponse;
