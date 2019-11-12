(async () => {
  let currentUser = await fetch("https://2886795326-5984-elsy04.environments.katacoda.com/_session", {
    credentials: "include"
  }).then(res => res.json());
  if (!currentUser.userCtx.name) {
    window.location.assign("/login");
  }

  // Registering Service Worker
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js");
  }

  const db = new PouchDB("test");
  let limit = 5;
  let skip = 0;

  const getData = async (offset, limit) => {
    //allDocs with offset
    return await db.allDocs({
      include_docs: true,
      skip: offset,
      attachments: true,
      binary: true,
      limit: limit
    });
  };

  //TODO: fix global state. Implement pure function instead
  const nextPage = async e => {
    let docs = await getData(skip + limit, limit);
    renderRows(docs.rows);
    calculatePagination(docs, limit);
    skip = docs.offset;
    return docs;
  };

  const previousPage = async e => {
    let docs = await getData(skip - limit, limit);
    renderRows(docs.rows);
    calculatePagination(docs, limit);
    skip = docs.offset;
    return docs;
  };

  const getPageNumber = (docs, limit) => {
    return Math.ceil(docs.offset / limit) + 1;
  };

  const getPageCount = (docs, limit) => {
    return Math.ceil(docs.total_rows / limit) + 1;
  };

  const calculatePagination = (docs, limit) => {
    document
      .getElementById("rowCount")
      .querySelector("[name='value']").innerText = limit;

    document
      .getElementById("pageCount")
      .querySelector("[name='value']").innerText = getPageCount(docs, limit);

    document
      .getElementById("pageNumber")
      .querySelector("[name='value']").innerText = getPageNumber(docs, limit);
  };

  const renderRows = rows => {
    let content = document.getElementById("content");
    content.innerHTML = "";
    return rows.map(value => {
      let { _id, _attachments, ...doc } = value.doc;
      if (!_attachments) {
        return;
      }
      let imageName = Object.getOwnPropertyNames(_attachments)[0];
      let article = document.createElement("article");
      article.setAttribute("id", _id);
      let template = `<img><h3>${doc.title}</h3><p>${doc.text}</p>`;
      article.innerHTML = template;
      let blob = _attachments[imageName].data;
      let url = URL.createObjectURL(blob);
      article.querySelector("img").src = url;
      content.appendChild(article);
    });
  };

  const rerenderArticle = doc => {
    let imageName = Object.getOwnPropertyNames(doc._attachments)[0];
    let article = document.getElementById(doc._id);
    if (article && imageName) {
      let url = URL.createObjectURL(doc._attachments[imageName].data);
      article.querySelector("h3").innerText = doc.title;
      article.querySelector("p").innerText = doc.text;
      article.querySelector("img").src = url;
      return true;
    } else {
      return false;
    }
  };

  // let articles = renderRows(docs.rows);

  const addContent = async docId => {
    let content = document.getElementById("content");
    let article = document.createElement("article");

    let { _id, _attachments, ...doc } = await db.get(docId);
    let imageName = Object.getOwnPropertyNames(_attachments)[0];

    article.setAttribute("id", _id);

    let template = `
    <img>
    <h3>${doc.title}</h3>
    <p>${doc.text}</p>
    `;
    article.innerHTML = template;
    let blob = await db.getAttachment(_id, imageName);
    let url = URL.createObjectURL(blob);
    article.querySelector("img").src = url;
    content.appendChild(article);
  };

  //Sync
  const sync = e => {
    // db.replicate.from("https://2886795326-5984-elsy04.environments.katacoda.com/test", { filter: "app/user" });
    let syncEvents = PouchDB.sync("test", "https://2886795326-5984-elsy04.environments.katacoda.com/test", {
      pull: { filter: "app/user" },
      live: true,
      retry: true
    });
    return syncEvents
      .on("change", info => {
        console.log(info);
        if (info.change.ok) {
          info.change.docs.forEach(doc => {
            let r = rerenderArticle(doc);
            if (!r) {
              rerenderCurrentPage();
            }
          });
        }
      })
      .on("paused", err => {
        console.log("paused", err);
      })
      .on("active", () => {
        console.log("active");
      })
      .on("denied", err => {
        console.log(err);
      })
      .on("complete", info => {
        console.log(info);
      })
      .on("error", err => {
        console.log("error", err);
      });
  };

  const addNewArticle = async e => {
    const addForm = document.getElementById("addForm");
    const photo = addForm.photo.files[0];
    try {
      let result = await db.post({
        title: addForm.title.value,
        text: addForm.text.value,
        shareWith: addForm.shareWith.value,
        shareWithGroup: addForm.shareWithGroup.value,
        userName: currentUser.userCtx.name,
        _attachments: {
          [photo.name]: {
            content_type: photo.type,
            data: photo
          }
        }
      });
      addContent(result.id);
      console.log(result);
    } catch (error) {
      console.log(error);
    }
  };

  const generateError = () => {
    setTimeout(() => {
      // error
      const a = b * b;
    }, 1000);
  };

  const rerenderCurrentPage = async () => {
    //TODO: initial render
    let docs = await getData(skip, limit);
    renderRows(docs.rows);
    calculatePagination(docs, limit);
  };

  const updateOnlineStatus = e => {
    const condition = navigator.onLine ? "online" : "offline";
    const online = document.getElementById("online");
    online.innerText = condition;
  };

  //get current rout
  if (window.location.pathname === "/") {
    document.getElementById("userName").innerText = currentUser.userCtx.name;
    const addButton = document.getElementById("addButton");
    const nextPageButton = document.getElementById("next");
    const previousPageButton = document.getElementById("prev");
    addButton.addEventListener("click", addNewArticle);
    nextPageButton.addEventListener("click", nextPage);
    previousPageButton.addEventListener("click", previousPage);
    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);

    rerenderCurrentPage();

    let events = sync();
    generateError();
  }
})();
