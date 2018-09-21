var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var exphbs = require("express-handlebars");
var axios = require("axios");
var cheerio = require("cheerio");
var db = require("./models");

var PORT = 3000;

var app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static("public"));

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);

app.engine("handlebars", exphbs({defaultLayout: "main"}));
app.set("view engine", "handlebars");

app.get("/", function(req, res) {
  db.Article.find()
    .then(function(articles) {
      res.render("index", {articles: articles, syncEnabled: true});
    });
});

app.get("/saved", function(req, res) {
  db.Article.find({saved: true})
    .then(function(articles) {
      res.render("saved", {articles: articles, syncEnabled: false});
    });
});

app.get("/notes/:id", function(req, res) {
  db.Article.findOne({ _id: req.params.id })
    .populate("notes")
    .then(function(article) {
      res.render("notes", {article: article, notes: article.notes, syncEnabled: false});
    });
});

app.get("/scrape", function(req, res) {
  axios.get("https://www.nytimes.com/section/travel").then(function(response) {
    var $ = cheerio.load(response.data);

    var articles = [];

    db.Article
      .find()
      .then((oldArticles) => {
        var oldUrls = oldArticles.map(article => {
          return article.url;
        });

        $('#latest-panel .theme-summary').each((i, element) => {
          var headline = $(element).find('h2.headline').text().trim();
          var summary = $(element).find('p.summary').text().trim();
          var url = $(element).find('.story-body > .story-link').attr('href').trim();

          var article = new db.Article({
            headline: headline,
            summary: summary,
            url: url,
            saved: false,
          });

          if (!oldUrls.includes(article.url)) {
            articles.push(article);
          }
        });

        if (articles.length > 0) {
          db.Article.create(articles).then(result => {
            res.send({found: articles.length, articles: articles});
          });
        } else {
          res.send({found: 0, articles: []});
        }
      });
  });
});

app.get("/articles", function(req, res) {
  db.Article.find()
    .then(function(articles) {
      res.json(articles);
    })
});

app.get("/articles/:id", function(req, res) {
  db.Article.findOne({ _id: req.params.id })
    .populate("notes")
    .then(function(article) {
      res.json(article);
    });
});

app.post("/articles/:id/note", function(req, res) {
  var note = new db.Note({
    message: req.body.message,
  });

  db.Note.create(note)
    .then(result => {
      db.Article.findOneAndUpdate({ _id: req.params.id}, {$push: {notes: result._id}}, {new: true})
        .then(data => {
          res.json(result);
        });
    })
    .catch(err => res.json(err));
});


app.post("/articles/:id/note/delete", function(req, res) {
  db.Note.deleteOne({_id: req.params.id})
    .then(result => {
      res.json(result);
    });
});

app.post("/articles/:id/save", function(req, res) {
  db.Article.updateOne({_id: req.params.id}, {saved: true})
    .then(result => {
      res.json(result);
    });
});

app.post("/articles/:id/unsave", function(req, res) {
  db.Article.updateOne({_id: req.params.id}, {saved: false})
    .then(result => {
      res.json(result);
    });
});

app.listen(process.env.PORT || PORT, function() {
  console.log("App running on port: " + PORT);
});
