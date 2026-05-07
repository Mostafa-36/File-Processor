const fs = require("fs");

console.log("=== Node.js Non-blocking I/O Demo ===\n");

console.log("1 - Starting file read operation (non-blocking)");

fs.readFile("./inputs/large-file.txt", "utf8", (err, data) => {
  if (err) throw err;

  console.log("3 - File read callback executed (handled by libuv thread pool)");
  console.log(`      File size: ${data.length} characters`);
  console.log(`      First 50 chars: ${data.substring(0, 50)}...`);
});

console.log("2 - Registering asynchronous file operation...");

console.log("\nNote:");
console.log("- Code execution is non-blocking");
console.log("- fs.readFile runs in libuv thread pool");
console.log("- Callback is queued back to the Event Loop when ready");
console.log("- This is why logs 1 → 2 → 3 are not in execution order\n");
