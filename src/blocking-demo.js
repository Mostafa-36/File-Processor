const fs = require("fs");

console.log("1 - Starting the application (Blocking I/O)");

const data = fs.readFileSync("./inputs/large-file.txt", "utf8");
console.log("2 - File has been read (blocking operation)");

console.log(
  "3 - This line will only appear after the previous operation is completed",
);
