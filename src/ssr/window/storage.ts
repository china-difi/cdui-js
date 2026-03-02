// @ts-ignore
const localStorage = new Map();

global.localStorage = global.sessionStorage = {
  get length() {
    return localStorage.size;
  },
  key(index) {
    return localStorage.keys()[index];
  },
  getItem(key) {
    return localStorage.get(key) || '';
  },
  setItem(key, value) {
    localStorage.set('' + key, '' + value);
  },
  removeItem(key) {
    localStorage.delete(key);
  },
  clear() {
    localStorage.clear();
  }
};
