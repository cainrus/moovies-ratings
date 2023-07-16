document.addEventListener("DOMContentLoaded", async function () {
  const apiEndpoint = 'https://j1r5p36fi5.execute-api.eu-north-1.amazonaws.com/';

  const colors = [
    "#460000",
    "#8B0000",
    "#8B2800",
    "#8B4500",
    "#8B5A00",
    "#8B7300",
    "#5E8B00",
    "#008B00",
    "#008B45",
    "#008B8B",
    "#00468B"
  ];




  class IndexedDataBase {
    constructor(dbName = 'ratings', storeName = 'moovies', version = 1) {
      this.dbName = dbName;
      this.storeName = storeName;
      this.version = version;
      this.expire = 12096;
      this.initTime = ((new Date).getTime() + "").substr(0, 7) | 0;
      this.expireTime = this.initTime + this.expire;
      this.initPromise = this.initialize();
    }

    async initialize() {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open(this.dbName, this.version);
        request.onupgradeneeded = (event) => {
          const db = event.target.result;
          db.createObjectStore(this.storeName, {autoIncrement: true});
        };
        request.onsuccess = (event) => {
          this.db = event.target.result;
          resolve();
        };
        request.onerror = (event) => {
          console.log(`Error opening db: ${event.target.errorCode}`);
          reject(event.target.errorCode);
        };
      });
    }

    async set(key, value) {
      await this.initPromise;
      const transaction = this.db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);
      store.put({value, expire: this.expireTime}, key);
    }

    async get(key) {
      await this.initPromise;
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(this.storeName, 'readonly');
        const store = transaction.objectStore(this.storeName);
        const request = store.get(key);
        request.onsuccess = (event) => {
          const result = event.target.result;
          if (!result || result.expire < this.initTime) {
            this.remove(key);
            resolve(null);
          } else {
            resolve(result.value);
          }
        };
        request.onerror = (event) => {
          reject(`Error fetching key: ${event.target.errorCode}`);
        };
      });
    }

    async remove(key) {
      await this.initPromise;
      const transaction = this.db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);
      store.delete(key);
    }
  }


  const indexedDataBase = new IndexedDataBase();
  // Use querySelector to select the specific table cell
  document.querySelectorAll("table tbody > tr > th").forEach(function (th, index) {
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

  const getMovieData = async function (threadElement, movieKey, callback) {
    let storedRating = await indexedDataBase.get(movieKey);

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
            indexedDataBase.set(movieKey, "");
            callback("N/A");
            return;
          }

          let isNewTitle = !titleElementMapping[movieTitle];
          if (isNewTitle) titleElementMapping[movieTitle] = [];
          titleElementMapping[movieTitle].push(threadElement);

          if (!callbackMapping[movieTitle]) callbackMapping[movieTitle] = [];
          callbackMapping[movieTitle].push(callback);

          if (isNewTitle && !cachedRating[movieTitle]) {
            indexedDataBase.set(movieKey, resolvedRating);
            callbackMapping[movieTitle].forEach(function (cb) {
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

  const list = [];
  function collectTrackerIds(startNode, skipIdList) {
    let node = startNode;
    let list = [];
    while(node) {

      if (node.tagName === 'OPTION') {
        const id = node.id.slice(3);
        const isRoot = node.classList.contains('root_forum');
        if (skipIdList.includes(id)) {
          console.log(id)
          if (isRoot) {
            node = document.querySelector(`#fs-${id} + * + .root_forum`);

          } else {
            node = node.nextSibling;
          }
          console.log(node)
          continue;
        }
        if (isRoot) {
          node = node.nextSibling;
          continue;
        }

        list.push(id);
      }
      node = node.nextSibling;
    }
    return list;
  }

  const skipList = [
      '511' /*theater*/,
      '921' /*animated-series*/,
      '33' /*anime*/,
    ];


  const url = new URL(location.href);
  const isForum = url.pathname.startsWith('/forum/viewforum.php');
  const isTracker = !isForum && url.pathname.startsWith('/forum/tracker.php');

  let headerTh;
  let threadLinks;

  if (isForum) {
    // Check parent forum is movies forum.
    if (!document.querySelector(".nav.nav-top a")?.href.includes("index.php?c=2")) return;

    const isAllowed = Array.from(
      document.querySelectorAll('.nav-top a')
    ).map(a => a.href.split('=').pop()).every(id => {
      return !skipList.includes(id)
    })

    if (!isAllowed) return;

    headerTh = document.querySelector('th.vf-col-t-title');
    threadLinks = document.querySelectorAll("tr[id]:has(span.seedmed) .torTopic > .torTopic");
  } else if (isTracker) {


    const idList = collectTrackerIds(document.querySelector('#fs-22'), skipList);
    threadLinks = Array.from(document.querySelectorAll('.f-name-col')).filter(fCol => {
      const href = fCol.querySelector('a').href;
      return idList.some(id => {
        return href.endsWith(`=${id}`)
      })
    }).map(fCol => fCol.nextElementSibling.querySelector('.tt-text'));
    if (!threadLinks.length ) {
      return;
    }
    headerTh = document.querySelector('.forumline th:nth-child(4)')

  } else {
    return;
  }


  const header = document.createElement('th');
  header.innerText = "⭐";
  header.title = 'TMDB Rating';
  headerTh.after(header)

  document.querySelectorAll(".tt").forEach((elem) => {
    let loadingText = isTracker || elem.closest("tr[id]:has(span.seedmed)") ? "…" : "";
    let newTd = document.createElement("td");
    newTd.className = "cainr-rutracker-rating-imdb";
    newTd.textContent = loadingText;
    elem.parentNode.insertBefore(newTd, elem.nextSibling);
  });

  for (const threadElement of threadLinks) {
    let threadId;
    if (isForum) {
      threadId = threadElement.id.replace(/[^\d]+/, "");
    } else if (isTracker) {
      threadId = threadElement.href?.split('=').pop();
    }
    if (!threadId) continue;
    let prefix = "tmdb";
    let composedKey = prefix + threadId;
    await getMovieData(threadElement, composedKey, rating => updateRating(threadElement, rating));
  }

  function updateRating(element, rating) {
    let parentElement = element.closest('.tt');
    if (parentElement) {
      let nextSibling = parentElement.nextElementSibling;
      if (nextSibling && nextSibling.classList.contains('cainr-rutracker-rating-imdb')) {
        const numericRating = +rating;
        const hasScore = Number.isFinite(numericRating);
        const scoreColor = hasScore ? colors[Math.round(numericRating)] : '#999';
        nextSibling.style.backgroundColor = `color-mix(in oklab, ${scoreColor}, #fff 75%)`
        nextSibling.innerHTML = `<span style="color:${scoreColor}">${rating}</span>`;
      }
    }
  }
})
