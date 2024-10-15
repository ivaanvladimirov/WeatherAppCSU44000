const http = require('node:http');
const express = require('express');
const app = express();
 
app.use(express.json());

const port = process.env.PORT || 3001;

app.get('/', (req, res) => {
    res.send('Hello World!')
  });
  
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

//response.send(status);
//response.send(status);
//response.send(status);
app.get('/status', (request, response) => {
   const status = {
      'Status': 'Running'
   };
   
   response.send(status);
});

/*
const server = http.createServer((req, res) => {
    console.log("Request received");
    res.end("Hello World");
});

server.listen(3000, () => {
    console.log("Server is running on port 3000");
});

*/