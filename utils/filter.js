const Filter = require("bad-words");
const filter = new Filter();

filter.addWords(
  "terrorist","terrorism","bomb","blast","isis",
  "attack","kill","explosive","massacre"
);

function normalize(text) {
  return text
    .toLowerCase()
    .replace(/0/g, "o")
    .replace(/1/g, "i")
    .replace(/3/g, "e")
    .replace(/[@]/g, "a")
    .replace(/[^a-z\s]/g, "");
}

module.exports = {
  cleanMessage: (msg) => filter.clean(normalize(msg))
};