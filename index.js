const express = require('express');
const app = express();
const mysql = require('mysql');
const bodyParser = require('body-parser');
const PORT = process.env.port || 8080;
const cors = require('cors');

const whitelist = [
  "https://www.gamsungsoft.com", 
  "https://test.gamsungsoft.com",
  "http://localhost:3000"] ;
  
const corsOptions = {
  credentials: true, 
  //origin: "http://localhost:3000",
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

//[get] get posts with query category
app.get("/api/posts", (req, res)=>{
  const category = req.query.category;
  const sqlSelect = category ?
   "SELECT * FROM notice_posts WHERE category=?;":
   "SELECT * FROM notice_posts";
  db.query(sqlSelect, category, (err, result)=>{
      res.send(result);
  })
})

//[get] get post with param seq
app.get("/api/posts/:seq", (req, res)=>{
  const postSeq = req.params.seq;
  const sqlSelect = "SELECT * FROM notice_posts WHERE seq=?;";
  db.query(sqlSelect, postSeq, (err, result)=>{
      res.send(result[0]);
  })
})

//[post] create post
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

//[delete] delete post with param seq
app.delete("/api/posts/:seq", (req, res)=>{
  const postSeq = req.params.seq;
  const sqlSelect = "DELETE * FROM notice_posts WHERE seq=?;";
  db.query(sqlSelect, postSeq, (err, result)=>{
      res.send(`delete post seq: ${postSeq}`);
      res.send(result[0]);
  })
})

app.listen(PORT, () => {
  console.log(`running on port ${PORT}`);
});