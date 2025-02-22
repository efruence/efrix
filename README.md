# Efrix.js

Efrix.js is a lightweight Node.js web framework for creating simple HTTP servers with built-in request and response handling, logging.

## Features
- Lightweight and fast
- Supports GET and POST requests
- Auto-redirect to localhost
- Logging system
- Request limits

## Installation

```sh
npm install efrix
```

## Usage

### Basic Example

```js
const { App } = require('efrix');
const app = new App({ port: 3000, autoRedirect: true, logs: { enabled: true } });

app.Get('/', (req, res) => {
    res.send('Hello, world!');
});

app.Post('/data', (req, res) => {
    res.json({ received: req.body });
});
```

## Options

| Option          | Type    | Default | Description |
|----------------|---------|---------|-------------|
| `port`         | Number  | `3000`  | Server port |
| `autoRedirect` | Boolean | `false` | Auto-redirect to `https://localhost:port` |
| `logs.enabled` | Boolean | `false` | Enable error logging |
| `logs.dir`     | String  | `./logs/errors.log` | Log file directory |
| `maxRequests`  | Number  | `null`  | Maximum allowed requests per session |
| `maxReqTime`   | Number  | `null`  | Maximum time (ms) before request timeout |
