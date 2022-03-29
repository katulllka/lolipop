const express = require('express');
const path = require('path');


const app = express();

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(`${__dirname}/public/html/chat.html`);
});

app.listen(3000, () => {
    console.log('Application listening on port 3000!');
});