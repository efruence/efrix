const querystring = require('querystring');

class Request {
    /**
     * @param {Object} rq 
     */
    constructor(rq, route = '') {
        this.method = rq.method;
        this.headers = rq.headers;
        this.body = {};
        this.query = {};
        this.params = {};

        const [path, queryString] = rq.url.split('?');
        this.url = path;
        if (queryString) {
            this.query = querystring.parse(queryString);
        }

        if (['POST', 'PUT', 'PATCH'].includes(this.method)) {
            let data = '';

            rq.on('data', chunk => {
                data += chunk;
            });

            rq.on('end', () => {
                try {
                    this.body = JSON.parse(data);
                } catch (err) {
                    this.body = querystring.parse(data);
                }
            });
        }

        if (route) {
            const routeParts = route.split('/');
            const urlParts = this.url.split('/');

            routeParts.forEach((part, index) => {
                if (part.startsWith(':')) {
                    const paramName = part.slice(1);
                    this.params[paramName] = urlParts[index];
                }
            });
        }
    }
}

module.exports = { Request };
