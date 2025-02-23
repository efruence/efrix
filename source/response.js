class Response {
    /**
     * @param {Object} rs 
     */
    constructor(rs) {
        this.raw = rs;
    }

    status(code) {
        this.raw.statusCode = code;
        return this;
    }

    json(data) {
        this.raw.setHeader('Content-Type', 'application/json');
        this.raw.end(JSON.stringify(data));
    }

    send(data) {
        if (typeof data === 'object') {
            this.json(data);
        } else {
            const contentType = data.trim().startsWith("<") ? "text/html" : "text/plain";
            this.raw.setHeader("Content-Type", contentType);
            this.raw.end(data);
        }
    }    

    setHeader(key, value) {
        this.raw.setHeader(key, value);
        return this;
    }

    redirect(url) {
        this.raw.statusCode = 302;
        this.raw.setHeader('Location', url);
        this.raw.end();
    }
}

module.exports = { Response };
