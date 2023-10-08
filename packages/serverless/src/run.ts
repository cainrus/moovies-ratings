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
  const now = Date.now();
  console.log('result', await handler({
    body: JSON.stringify({
      searches: ["Ванильное небо / Vanilla Sky (Кэмерон Кроу / Cameron Crowe) [US Paramount Presents] [2001, США, Испания, драма, фантастика, BDRemux 1080p] Dub (R5 Netflix) + 5x MVO (Карусель, Астра-Медиа, ТНТ) + MVO Ukr (Новий канал) + DVO (DDV) + DVO Ukr (К1) + 2x AVO + 4x VO + Sub (Rus, Ukr, Eng) + Original Eng"],
    })
  }, {}));
  console.log('Result in', Date.now() - now);
  redisProcess.kill(0);
  process.exit(0);
}, 2000)

