const http = require('http');
const fs = require('fs');
const path = require('path');
const { Request } = require('./request');
const { Response } = require('./response');
const { exec } = require('child_process');

class App {
   /**
   * @param {Object} options
   * @param {number} options.port
   * @param {boolean} [options.autoRedirect]
   * @param {Object} [options.logs]
   * @param {boolean} [options.logs.enabled]
   * @param {string} [options.logs.dir]
   * @param {number} [options.maxRequest]
   * @param {number} [options.maxRequestTime]
   * @param {string} [options.static]
   */
  constructor(options = {}) {
    const routes = { GET: {}, POST: {}, PUT: {}, DELETE: {} };
    const staticDir = options.static || path.join(__dirname, 'frontend');
    let activeRequests = 0;

    if (options.logs?.enabled) {
      const logPath = path.join(process.cwd(), options.logs?.dir || 'logs', 'errors.log');
      fs.mkdirSync(path.dirname(logPath), { recursive: true });
    }

    const server = http.createServer((rq, rs) => {
      if (options.maxRequest && activeRequests >= options.maxRequest) {
        return rs.writeHead(429, { 'Content-Type': 'text/plain' }).end('Too Many Requests');
      }

      activeRequests++;
      const method = rq.method;
      const url = rq.url.split('?')[0];
      const handler = routes[method]?.[url];

      const request = new Request(rq);
      const response = new Response(rs);

      let timeout;
      if (options.maxRequestTime) {
        timeout = setTimeout(() => {
          response.status(408).send('Request Timeout');
          activeRequests--;
        }, options.maxRequestTime);
      }

      if (handler) {
        try {
          handler(request, response);
        } catch (error) {
          if (options.logs?.enabled) {
            fs.appendFileSync(logPath, `[${new Date().toISOString()}] ${error.stack || error}\n`);
          }
          response.status(500).send('Internal Server Error');
        }
      } else if (staticDir) {
        const filePath = path.join(staticDir, url === '/' ? 'index.html' : url);
        fs.readFile(filePath, 'utf-8', (err, data) => {
          if (err) {
            response.status(404).send('Not Found');
          } else {
            response.setHeader('Content-Type', 'text/html; charset=utf-8');
            response.send(data);
          }
        });
      } else {
        response.status(404).send('Not Found');
      }

      rs.on('finish', () => {
        clearTimeout(timeout);
        activeRequests--;
      });
    });

    server.listen(options.port, () => {
      console.log(`🚀 Server Started ${options.port} On Port!`);

      if (options.autoRedirect) {
        setTimeout(() => {
        const url = `http://localhost:${options.port}`
        const open_command = process.platform === 'win32' ? `start ${url}` :
                            process.platform === 'darwin' ? `open ${url}` :
                            `xdg-open ${url}`;
        exec(open_command, (err) => {
          if (err) {
            const errorMessage = `[${new Date().toISOString()}] Cannot Open Browser: ${err.message || err}`;
            
            if (options.logs?.enabled) {
              fs.appendFileSync(logPath, errorMessage + '\n');
            } else {
              console.error(errorMessage);
            }
          }
        })
      }, 2000)
  }
  });

    /** 
     * @param {string} path 
     * @param {(rq: Request, rs: Response) => void} callback 
     */
    this.Get = (path, callback) => {
      routes.GET[path] = callback;
    };

    /** 
     * @param {string} path 
     * @param {(rq: Request, rs: Response) => void} callback 
     */
    this.Post = (path, callback) => {
      routes.POST[path] = callback;
    };

     /** 
     * @param {string} path 
     * @param {(rq: Request, rs: Response) => void} callback 
     */
     this.Put = (path, callback) => {
      routes.PUT[path] = callback;
    };

    /** 
     * @param {string} path 
     * @param {(rq: Request, rs: Response) => void} callback 
     */
    this.Delete = (path, callback) => {
      routes.DELETE[path] = callback;
    };

    /**
     * @param {string} [file='index.html']
     */
    this.static = (file = 'index.html') => {
      return (rq, rs) => {
        if (!staticDir) {
          rs.status(500).send('Static directory is not defined.');
          return;
        }
        const filePath = path.join(staticDir, file);
        fs.readFile(filePath, 'utf-8', (err, data) => {
          if (err) {
            rs.status(404).send('File Not Found');
          } else {
            rs.setHeader('Content-Type', 'text/html; charset=utf-8');
            rs.send(data);
          }
        });
      };
    };
  }
}

module.exports = { App };
