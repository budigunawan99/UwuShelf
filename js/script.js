const books = [];
const RENDER_EVENT = "render-book";
const SAVED_EVENT = "saved-book";
const STORAGE_KEY = "UWUSHELF_APPS";
const ACTION = {
  INSERT: "insert_book",
  REMOVE: "remove_book",
  IS_FINISHED: "is_finished_book",
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
    document.dispatchEvent(new Event(SAVED_EVENT));
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

const renderBook = () => {};

const setBook = (action) => {
  switch (action.type) {
    case ACTION.INSERT:
      const bookObject = generateBookObject({
        id: generateId(),
        title: document.getElementById("title").value,
        writer: document.getElementById("writer").value,
        year: document.getElementById("year").value,
        isFinished: document.getElementById("is_finished").value,
      });
      books.push(bookObject);
      document.dispatchEvent(new Event(RENDER_EVENT));
      saveData();
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
  }
};

document.addEventListener("DOMContentLoaded", function () {
  const submitForm = document.getElementById("form_add");
  submitForm.addEventListener("submit", function (event) {
    event.preventDefault();
    setBook({
      id: null,
      type: ACTION.INSERT,
    });
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

document.addEventListener(SAVED_EVENT, () => {
  console.log("Data berhasil di simpan.");
});

document.addEventListener(RENDER_EVENT, function () {});
