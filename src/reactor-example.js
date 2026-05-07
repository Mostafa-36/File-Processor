/**
 * Reactor Pattern in Node.js:
 * 1. Request
 * 2. Demultiplexer waits for events
 * 3. Event Loop receives events
 * 4. Event Queue
 * 5. Handler (Callback)
 */

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

// Simulating Reactor pattern in Node.js
const reactor = new SimpleReactor();

// Register event handlers
reactor.registerHandler("file_read", (data) => {
  console.log(
    `Processing file: ${data.filename} - length: ${data.content.length}`,
  );
});

reactor.registerHandler("http_request", (data) => {
  console.log(`Processing request: ${data.url} - response: ${data.response}`);
});

// Start Event Loop
reactor.runEventLoop();

// Simulate asynchronous events
setTimeout(() => {
  reactor.addEvent({
    type: "file_read",
    data: { filename: "test.txt", content: "Hello World".repeat(100) },
  });
}, 1000);

setTimeout(() => {
  reactor.addEvent({
    type: "http_request",
    data: { url: "api.example.com", response: "200 OK" },
  });
}, 2000);
