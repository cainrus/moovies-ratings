import {resolve} from "path";

import {spawn} from "child_process";


import dotenv from "dotenv";

dotenv.config()

const { handler } = require(resolve(process.argv[2]))

// Handle the cleaning up when the process exits
process.on('exit', () => {
  console.log('handling `exit` signal...')
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
      searches: [
        // "Барби / Barbie (Грета Гервиг / Greta Gerwig) [2023, США, Великобритания, комедия, приключения, фэнтези, WEBRip 1080p] Dub + 2x MVO (TVShows, LostFilm) + Dub (Ukr) + Original (Eng) + Sub (Rus, Eng, Heb)",
        // "Рептилии / Reptile (Грант Сингер / Grant Singer) [2023, США, детектив, триллер, драма, криминал, WEB-DL 1080p] MVO (Jaskier) + Dub Ukr + Sub (Rus, Ukr, Eng etc.) + Original Eng",
        // "Операция «Фортуна»: Искусство побеждать / Operation Fortune: Ruse de Guerre (Гай Ричи / Guy Ritchie) [2022, Великобритания, США, Боевик, комедия, BDRip 1080p] Dub (CPI Films) + 2х MVO (Jaskier, TVShows) + VO (Есарев) + Original (Eng) + Sub (rus, eng)",
        // "Вечные / Eternals (Хлоя Чжао / Chloé Zhao) [2021, США, фантастика, фэнтези, боевик, приключения, WEB-DL 1080p] MVO (HDRezka Studio) + Original (Eng) + Sub (Rus, Eng)",
        "Добыча / Prey (Дэн Трахтенберг / Dan Trachtenberg) [2022, США, Ужасы, фантастика, боевик, BDRip 1080p] 2x Dub + 3x MVO + AVO + VO + Original (Eng) + Sub (rus, eng)",
      ],
    })
  }, {}));
  console.log('Result in', Date.now() - now);
  process.exit(0);
}, 2000)

