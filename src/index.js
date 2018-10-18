const http = require('http');
const url = require('url');
const fs = require('fs');

console.log("Starting up...?");

const ACTIONS = {
  CREATE: (request, derived) => {
    const response = {};
    console.log('request.content', request.content);
    try {
      fs.writeFileSync(`articles/${derived.fileName}`, request.content);
    } catch(err) {
      console.log("ERROR:", err);
      throw err;
    }
    console.log('saved file', derived.fileName);
    return response;
  },

  READ: (request, derived) => {
    const response = {};
    response.content = fs.readFileSync(`articles/${derived.fileName}`).toString();
    //TODD(maxrad,rain): Handle errors
    return response;
  },

  UPDATE: (request, derived) => {
    ACTIONS.CREATE(request, derived);
  },

  DELETE: (request) => {

  }
};

http.createServer(function (req, res) {
  console.log("Handling request...");
  const path = url.parse(req.url, true).pathname;
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  if (path !== '/api') {
    res.statusCode = 403;
    res.end('forbidden');
    return;
  }
  try {
    let body = [];
    req.on('data', (chunk) => {
      body.push(chunk);
    }).on('end', () => {
      try {
        body = Buffer.concat(body).toString();

        const request = JSON.parse(body);
        const derived = {};
        derived.fileName = encodeURIComponent(request.articleName);
        console.log('filename', derived.fileName);

        let response = ACTIONS[request.action](request, derived);

        res.end(JSON.stringify(response));
      } catch (e) {
        res.statusCode = 500;
        res.end('we fucked up with the body');
      }
    });
  } catch (e) {
    res.statusCode = 500;
    res.end('we fucked up');
  }
}).listen(8081);

