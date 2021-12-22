const express = require('express');
const app = express();
const mysql = require('mysql');
const bodyParser = require('body-parser');
const PORT = process.env.port || 8080;
const cors = require('cors');

const whitelist = ["https://www.gamsungsoft.com","http://localhost:3000"];
const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not Allowed Origin!"));
    }
  },
};

const db = mysql.createPool({
  host: '3.130.190.15',
  user: 'user',
  password: 'rkatjdTHVMXM@0607',
  database: 'gamsung'
});

app.use(cors(corsOptions));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/api/posts", (req, res)=>{
  const sqlSelect = "SELECT * FROM notice_posts;";
  db.query(sqlSelect, (err, result)=>{
      res.send(result);
  })
})

app.post('/api/posts', (req, res) => {
  const title = req.body.title;
  const content = req.body.content;
  const category = req.body.category;
  const sqlInsert = "INSERT INTO notice_posts (title, content, category, created_at, modified_at ) VALUES (?, ?, ?, NOW(), NOW())";
  
  db.query(
    sqlInsert, 
    [title, content, category], 
  (err, result) => {
    res.send('success');
  })
});

app.listen(PORT, () => {
  console.log(`running on port ${PORT}`);
});