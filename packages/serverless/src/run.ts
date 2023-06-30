import {resolve} from "path";

import {spawn} from "child_process";


import dotenv from "dotenv";

dotenv.config()

const { handler } = require(resolve(process.argv[2]))


const redisProcess = spawn('redis-server');

redisProcess.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`);
});

redisProcess.stderr.on('data', (data) => {
  console.error(`stderr: ${data}`);
});

redisProcess.on('close', (code) => {
  console.log(`child process exited with code ${code}`);
});

// Handle the cleaning up when the process exits
process.on('exit', () => {
  console.log('handling `exit` signal...')
  redisProcess.kill(); // this will stop the redis server
});

// Also handle other ways the process could end
process.on('SIGINT', () => {
  console.log('handling `SIGINT` signal...')
  process.exit()
}); // handles Ctrl+C
process.on('uncaughtException', (err) => {
  console.error(err);
  process.exit()
});


setTimeout(async () => {
  console.log('result', await handler({
    queryStringParameters: {
      search: 'Феномен / Phenomenon (Джон Тёртелтауб / Jon Turteltaub) [1996, США, фэнтези, мелодрама, драма, HDTV 1080i]',
    }
  }, {}))
}, 2000)

