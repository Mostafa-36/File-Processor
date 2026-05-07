# File Processor — Node.js Core Concepts Demo

## Overview

This project is a **simple educational project** built while studying Chapter 1 of Node.js Design Patterns.

The goal of this project is **not** to build a production-ready application.  
Instead, it focuses on understanding the internal ideas behind how Node.js works.

This project demonstrates the most important concepts from the chapter:

- How Node.js works
- Blocking I/O
- Non-blocking I/O
- The Reactor Pattern
- libuv, the I/O engine of Node.js
- The complete recipe for Node.js

The project also includes a **custom Reactor Pattern simulator** built from scratch to simplify the idea behind Node.js internals and event-driven architecture.

---

# Project Structure

```bash
file-url-analyzer/
│
├── inputs/
│   └── large-file.txt
│
├── src/
│   ├── blocking-demo.js
│   ├── non-blocking.js
│   └── reactor-example.js
│
└── package.json
```

---

# package.json

```json
{
  "name": "file-url-analyzer",
  "version": "1.0.0",
  "description": "Demo for Node.js core concepts",
  "main": "src/non-blocking.js",
  "scripts": {
    "start": "node src/non-blocking.js",
    "blocking": "node src/blocking-demo.js",
    "reactor": "node src/reactor-example.js"
  },
  "dependencies": {}
}
```

---

# Running The Project

## Run Non-blocking Demo

```bash
npm start
```

---

## Run Blocking I/O Demo

```bash
npm run blocking
```

---

## Run Reactor Pattern Simulation

```bash
npm run reactor
```

---

# JavaScript Execution in Node.js

JavaScript code itself runs on a single main thread.

Node.js achieves concurrency not by running JavaScript in parallel,
but by delegating I/O operations to libuv and the operating system.

This is why Node.js is often described as:

- Single-threaded for JavaScript execution
- Multi-threaded internally through libuv

---

# 1. Blocking I/O Demo

## Source Code

```js
const fs = require("fs");

console.log("1 - Starting the application (Blocking I/O)");

const data = fs.readFileSync("./inputs/large-file.txt", "utf8");

console.log("2 - File has been read (blocking operation)");

console.log(
  "3 - This line will only appear after the previous operation is completed",
);
```

---

# Expected Output

```bash
1 - Starting the application (Blocking I/O)

(waiting...)

2 - File has been read (blocking operation)

3 - This line will only appear after the previous operation is completed
```

---

# Why Does The Output Appear Like This?

The important line is:

```js
fs.readFileSync(...)
```

The word `Sync` means:

> "Stop everything until the operation finishes."

This is called **Blocking I/O**.

When Node.js reaches this line:

1. It sends the file reading request to the operating system.
2. The main thread becomes blocked.
3. The Event Loop cannot continue.
4. No other JavaScript code can execute.
5. After the file is fully read:
   - execution resumes
   - remaining lines run normally

During blocking operations, the Event Loop cannot process incoming requests,
timers, or other callbacks.

---

# Important Concepts

## Blocking I/O

Blocking means:

> The program waits for the operation to finish before doing anything else.

Problems with blocking:

- Freezes the application
- Reduces scalability
- Prevents concurrency
- Wastes CPU waiting time

---

# What Happens Internally?

## Complete Flow

```text
JavaScript Code
      ↓
fs.readFileSync()
      ↓
Node.js C++ Bindings
      ↓
libuv
      ↓
Operating System
      ↓
Disk
      ↓
Return Data
      ↓
Continue JavaScript Execution
```

---

# Key Learning Points

- `readFileSync()` blocks the main thread
- JavaScript execution pauses completely
- Event Loop cannot process events
- Suitable mostly for:
  - startup scripts
  - CLI tools
  - small utilities

---

# 2. Non-blocking I/O Demo

## Source Code

```js
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
console.log("- fs.readFile uses libuv for asynchronous file handling");
console.log("- File system operations are executed using libuv thread pool");
console.log("- Callback is queued back to the Event Loop when ready");
console.log("- This is why logs 1 → 2 → 3 are not in execution order\n");
```

---

# Expected Output

```bash
=== Node.js Non-blocking I/O Demo ===

1 - Starting file read operation (non-blocking)

2 - Registering asynchronous file operation...

Note:
- Code execution is non-blocking
- fs.readFile uses libuv for asynchronous file handling
- File system operations are executed using libuv thread pool
- Callback is queued back to the Event Loop when ready
- This is why logs 1 → 2 → 3 are not in execution order

3 - File read callback executed (handled by libuv thread pool)
      File size: 50000 characters
      First 50 chars: Lorem ipsum dolor sit amet...
```

---

# Why Does The Output Appear Like This?

This line changes the execution model completely:

```js
fs.readFile(...)
```

It is asynchronous, meaning Node.js does not block execution while waiting for the file to be read.

Instead:

1. Node.js delegates the operation to libuv
2. libuv handles the file system request using its internal thread pool
3. JavaScript continues executing immediately
4. Once the file is ready, a callback is pushed to the Event Queue
5. The Event Loop executes the callback later

---

# Important Concepts

## Non-blocking I/O

Non-blocking means:

> "Start the operation and continue executing other code."

This is one of the biggest reasons Node.js is scalable.

---

# Role of libuv

## libuv

`libuv` is the real engine behind Node.js asynchronous behavior.

Responsibilities:

- Async I/O operations
- Thread Pool
- Event Loop
- Event Queue

Without `libuv`, Node.js asynchronous I/O would not exist.

---

# What Happens Internally?

## Complete Recipe of Node.js

```text
JavaScript calls fs.readFile()
            ↓
Node.js sends task to libuv
            ↓
libuv delegates filesystem operation to thread pool
            ↓
JavaScript continues execution
            ↓
Thread pool finishes reading file
            ↓
libuv receives result
            ↓
Callback is queued in Event Queue
            ↓
Event Loop executes callback
```

---

# Key Learning Points

- JavaScript thread never blocks
- Event Loop keeps running
- libuv handles asynchronous operations
- Callback executes later
- Node.js achieves concurrency using events

---

# 3. Reactor Pattern Simulation

## Source Code

```js
class SimpleReactor {
  constructor() {
    this.eventQueue = [];
    this.eventHandlers = new Map();
  }

  registerHandler(eventType, handler) {
    this.eventHandlers.set(eventType, handler);
  }

  addEvent(event) {
    this.eventQueue.push(event);
  }

  runEventLoop() {
    console.log("Reactor Event Loop started");

    setInterval(() => {
      if (this.eventQueue.length > 0) {
        const event = this.eventQueue.shift();

        const handler = this.eventHandlers.get(event.type);

        if (handler) {
          console.log(` Processing event: ${event.type}`);
          handler(event.data);
        }
      }
    }, 100);
  }
}
```

---

# Expected Output

```bash
Reactor Event Loop started

(after 1 second)

 Processing event: file_read
Processing file: test.txt - length: 1100

(after another second)

 Processing event: http_request
Processing request: api.example.com - response: 200 OK
```

---

# Why Does The Output Appear Like This?

This project simulates how the Reactor Pattern works internally.

The flow is:

1. Events are added to the queue

2. Event Loop continuously checks the queue

3. If an event exists:
   - corresponding handler executes

4. System keeps listening forever

This is conceptually similar to how Node.js works internally.

---

# Reactor Pattern Flow

## Add Reactor Pattern Diagram Here

```text
[ Client Request ]
         ↓
[ Event Demultiplexer ]
         ↓
[ Event Queue ]
         ↓
[ Event Loop ]
         ↓
[ Event Handler / Callback ]
```

### The Reactor Pattern

> ![The Reactor Pattern](./The%20reactor%20pattern.png)

---

# Important Concepts

## Reactor Pattern

The Reactor Pattern is:

> A design pattern for handling asynchronous events using a central event loop.

Node.js internally follows this architecture.

The Reactor Pattern does not execute operations itself.
It coordinates events and dispatches handlers when operations become ready.

---

# Event Demultiplexer

The Event Demultiplexer waits for events from:

- files
- network sockets
- timers
- databases
- operating system

In Node.js:

- `libuv` acts as the Event Demultiplexer

---

# Event Queue

Completed events are pushed into the queue.

Example:

```text
[file_read_event]
[http_request_event]
[timer_event]
```

---

# Event Loop

The Event Loop continuously:

1. checks the queue
2. takes events
3. executes handlers

This loop never stops while the application is alive.

---

# Key Learning Points

- Reactor Pattern is the heart of Node.js
- Event Loop processes events continuously
- Handlers are executed when events become ready
- Node.js concurrency is event-driven
- libuv powers the entire system

---

# Final Summary

This project demonstrates the core philosophy behind Node.js:

- Single-threaded JavaScript execution
- Asynchronous I/O
- Event-driven architecture
- Reactor Pattern
- Event Loop
- libuv internals

The project intentionally simplifies the concepts to make the internal workflow easier to understand.

This is not a production system.

It is an educational implementation created to deeply understand:

- how Node.js works
- why Node.js is scalable
- how asynchronous execution really happens internally

---

# Main Takeaway

Node.js does NOT become fast because JavaScript is fast.

Node.js becomes scalable because:

- it minimizes blocking operations
- delegates I/O work to libuv
- uses the Event Loop
- processes events asynchronously
- follows the Reactor Pattern internally

