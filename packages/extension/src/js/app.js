document.addEventListener("DOMContentLoaded", async function() {
    const apiEndpoint = 'https://j1r5p36fi5.execute-api.eu-north-1.amazonaws.com/';

    if (!document.querySelector(".nav.nav-top a")?.href.includes("index.php?c=2")) return;
    class LocalStorageHelper {
        constructor() {
            this.expire = 12096;
            this.initTime = ((new Date).getTime() + "").substr(0, 7) | 0;
            this.expireTime = this.initTime + this.expire;
        }

        set(key, value) {
            localStorage.setItem(key, JSON.stringify({
                value,
                expire: this.expireTime
            }));
        }

        get(key) {
            let item = localStorage.getItem(key);
            let parsedItem = JSON.parse(item);
            if (!parsedItem || parsedItem.expire < this.initTime) {
                localStorage.removeItem(key);
                item = null;
            } else {
                item = parsedItem.value;
            }
            return item;
        }
    }

    const localStorageHelper = new LocalStorageHelper();
    // Use querySelector to select the specific table cell
    document.querySelectorAll("table tbody > tr > th").forEach(function(th, index) {
        let torTopicExists = th.querySelectorAll(".torTopic > .torTopic").length > 0;
        if (torTopicExists && index === 0) {
            let newTh = document.createElement("th");
            newTh.textContent = "IMDB";
            th.parentNode.insertBefore(newTh, th.nextSibling);
        }
    });

    const titleElementMapping = {};
    const cachedRating = {};
    const callbackMapping = {};

    function encodeText(text) {
        let encoder = new TextEncoder();
        let data = encoder.encode(text);
        return btoa(String.fromCharCode(...new Uint8Array(data)));
    }
    const getMovieData = async function (threadElement, movieKey, callback) {
        let storedRating = localStorageHelper.get(movieKey);

        if (storedRating === null) {
            let movieTitle = threadElement.innerText.trim();

            await fetch(`${apiEndpoint}?search=${encodeURIComponent(movieTitle)}`)
              .then(response => response.json())
              .then(response => {
                  let resolvedRating;
                  if (response.vote) {
                      resolvedRating = response.vote.toString();
                  } else if (response.error) {
                      console.warn(`Error fetching movie data: ${response.error}`);
                      resolvedRating = "N/A";
                  }

                  if (!resolvedRating) {
                      localStorageHelper.set(movieKey, "");
                      callback("N/A");
                      return;
                  }

                  let isNewTitle = !titleElementMapping[movieTitle];
                  if (isNewTitle) titleElementMapping[movieTitle] = [];
                  titleElementMapping[movieTitle].push(threadElement);

                  if (!callbackMapping[movieTitle]) callbackMapping[movieTitle] = [];
                  callbackMapping[movieTitle].push(callback);

                  if (isNewTitle && !cachedRating[movieTitle]) {
                      localStorageHelper.set(movieKey, resolvedRating);
                      callbackMapping[movieTitle].forEach(function(cb) {
                          cb(resolvedRating);
                      });
                  }
              })
              .catch(error => {
                  console.error(`Fetch error: ${error}`);
                  callback(null);
              });
        } else if (!!storedRating) {
            callback(storedRating);
        } else {
            callback("N/A");
        }
    };

    const threadLinks = document.querySelectorAll("tr[id]:has(span.seedmed) .torTopic > .torTopic");

    document.querySelectorAll(".tt").forEach((elem) => {
        let loadingText = elem.closest("tr[id]:has(span.seedmed)") ? "загрузка…" : "";
        let newTd = document.createElement("td");
        newTd.className = "cainr-rutracker-rating-imdb";
        newTd.textContent = loadingText;
        elem.parentNode.insertBefore(newTd, elem.nextSibling);
    });

    for (const threadElement of threadLinks) {
        let threadId = threadElement.id.replace(/[^\d]+/, "");
        let prefix = "imdb";
        let composedKey = prefix + threadId;
        await getMovieData(threadElement, composedKey, rating => updateRating(threadElement, rating));
    }

    function updateRating(element, rating) {
        let parentElement = element.closest('.tt');
        if(parentElement) {
            let nextSibling = parentElement.nextElementSibling;
            if (nextSibling && nextSibling.classList.contains('cainr-rutracker-rating-imdb')) {
                nextSibling.innerHTML = rating;
            }
        }
    }

})
