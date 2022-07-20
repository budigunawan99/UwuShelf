const books = [];
const RENDER_EVENT = "render-book";
const STORAGE_KEY = "UWUSHELF_APPS";
const ACTION = {
  INSERT: "insert_book",
  REMOVE: "remove_book",
  IS_FINISHED: "is_finished_book",
  SEARCH: "search_book",
};

const generateId = () => +new Date();

const generateBookObject = ({ id, title, writer, year, isFinished }) => ({
  id,
  title,
  writer,
  year,
  isFinished,
});

const isStorageExist = () => {
  if (typeof Storage === undefined) {
    alert("Your browser does not support local storage!");
    return false;
  }
  return true;
};

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
  }
}

const loadDataFromStorage = () => {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
};

const renderBook = ({ id, title, writer, year, isFinished }) => {
  const bookTitle = document.createElement("h3");
  bookTitle.innerText = title;

  const bookWriter = document.createElement("p");
  bookWriter.innerText = `Author: ${writer}`;

  const bookYear = document.createElement("p");
  bookYear.innerText = `Year: ${year}`;

  const containerLeft = document.createElement("div");
  containerLeft.classList.add("article_left");
  containerLeft.append(bookTitle, bookWriter, bookYear);

  const isFinishedButton = document.createElement("button");
  isFinishedButton.classList.add(
    isFinished ? "not_finished_button" : "finished_button"
  );
  isFinishedButton.innerHTML = `
    <i class="material-icons">
      ${isFinished ? "undo" : "check"}
    </i> 
  `;
  isFinishedButton.addEventListener("click", () =>
    setBook({
      id: id,
      type: ACTION.IS_FINISHED,
    })
  );

  const removeButton = document.createElement("button");
  removeButton.classList.add("remove_button");
  removeButton.innerHTML = `
    <i class="material-icons">
      delete
    </i> 
  `;
  removeButton.addEventListener("click", () => {
    document.getElementById("dialog_delete").style.display = "block";

    const dialogDeleteButton = document.querySelector(".btn_delete");

    dialogDeleteButton.onclick = () => {
      setBook({
        id: id,
        type: ACTION.REMOVE,
      });
      document.getElementById("dialog_delete").style.display = "none";
    };
  });

  const containerRight = document.createElement("div");
  containerRight.classList.add("article_right");
  containerRight.append(isFinishedButton, removeButton);

  const container = document.createElement("article");
  container.classList.add("card");
  container.append(containerLeft, containerRight);
  container.setAttribute("id", `book_${id}`);

  return container;
};

const renderNotification = (message) => {
  const messageElement = document.createElement("p");
  messageElement.innerText = message;

  const messageContainer = document.createElement("div");
  messageContainer.append(messageElement);
  messageContainer.classList.add("notification");

  return messageContainer;
};

const setBook = (action) => {
  switch (action.type) {
    case ACTION.INSERT:
      const bookObject = generateBookObject({
        id: generateId(),
        title: document.getElementById("title").value,
        writer: document.getElementById("writer").value,
        year: document.getElementById("year").value,
        isFinished: document.getElementById("is_finished").checked,
      });
      books.push(bookObject);
      document.dispatchEvent(new Event(RENDER_EVENT));
      saveData();
      const submitForm = document.getElementById("form_add");
      submitForm.reset();
      break;

    case ACTION.IS_FINISHED:
      books.some((book, index, books) => {
        if (book.id === action.id) {
          books[index] = { ...book, isFinished: !book.isFinished };
          document.dispatchEvent(new Event(RENDER_EVENT));
          saveData();
          return true;
        }
      });
      break;

    case ACTION.REMOVE:
      books.some((book, index, books) => {
        if (book.id === action.id) {
          books.splice(index, 1);
          document.dispatchEvent(new Event(RENDER_EVENT));
          saveData();
          return true;
        }
      });
      break;

    case ACTION.SEARCH:
      const keyword = document.getElementById("search").value.toLowerCase();
      const searchedBook = keyword
        ? books.filter((book) => book.title.toLowerCase() === keyword)
        : books;
      document.dispatchEvent(
        new CustomEvent(RENDER_EVENT, {
          detail: { type: ACTION.SEARCH, data: JSON.stringify(searchedBook) },
        })
      );
      const searchForm = document.getElementById("form_search");
      searchForm.reset();
  }
};

document.addEventListener("DOMContentLoaded", () => {
  const submitForm = document.getElementById("form_add");
  submitForm.addEventListener("submit", (event) => {
    event.preventDefault();
    setBook({
      id: null,
      type: ACTION.INSERT,
    });
  });

  const searchForm = document.getElementById("form_search");
  searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    setBook({
      id: null,
      type: ACTION.SEARCH,
    });
  });

  const cancelRemoveButton = document.querySelector(".btn_cancel");
  cancelRemoveButton.addEventListener("click", () => {
    document.getElementById("dialog_delete").style.display = "none";
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

document.addEventListener(RENDER_EVENT, (event) => {
  const notFinishedBook = document.getElementById("not_finished_book");
  const finishedBook = document.getElementById("finished_book");

  notFinishedBook.innerHTML = "";
  finishedBook.innerHTML = "";

  let booksForShow = null;
  if (event.detail?.type === ACTION.SEARCH) {
    booksForShow = JSON.parse(event.detail.data);
  } else {
    booksForShow = books;
  }

  booksForShow.forEach((book) => {
    const bookListItem = renderBook(book);
    if (book.isFinished) {
      finishedBook.append(bookListItem);
    } else {
      notFinishedBook.append(bookListItem);
    }
  });

  if (notFinishedBook.innerHTML === "") {
    notFinishedBook.append(
      renderNotification("No data found in not finished books")
    );
  }

  if (finishedBook.innerHTML === "") {
    finishedBook.append(renderNotification("No data found in finished books"));
  }
});
