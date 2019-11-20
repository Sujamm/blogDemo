var bodyParser = require("body-parser"),
	mongoose = require("mongoose"),
	methodOverride = require("method-override"),
	expressSanitier = require("express-sanitizer"),
	express = require("express"),
	app = express();

mongoose.connect("mongodb://localhost/blog_db", { useUnifiedTopology: true,
useNewUrlParser: true, 
useFindAndModify: false});
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(methodOverride("_method"));
app.use(expressSanitier());

//Mongoose model config
var blogSchema = new mongoose.Schema({
	title: String,
	image: String,
	body: String,
	created: {type: Date, default: Date.now}
});

var Blog = mongoose.model("Blog", blogSchema);

//RESTful Routes

app.get("/", (req, res) => {
	res.redirect("/blogs");
});

//New Route
app.get("/blogs/new", (req, res) => {
	res.render("new");
});

//Createa Route
app.post("/blogs", (req, res) => {
	console.log(req.body.blog.body);
	req.body.blog.body = req.sanitize(req.body.blog.body);
	console.log("+++++++++++++++");
	console.log(req.body.blog.body);
	Blog.create(req.body.blog, (err,newBlog) => {
		if(err){
			res.render("new");
		} else {
			res.redirect("/blogs");
		}
	});
});
//Show All Route
app.get("/blogs", (req, res) => {
	Blog.find({}, (err, blogs) => {
		if(err){
			console.log(err);
		} else {
			res.render("index", {blogs: blogs});
		}
	});
});

//Show One Route
app.get("/blogs/:id", (req, res) => {
	Blog.findById(req.params.id, (err, foundBlog) =>{
		if(err){
			res.redirect("/blogs");
		} else {
			res.render("show", {blog: foundBlog});
		}
	});
});

//Edit Route
app.get("/blogs/:id/edit", (req, res) => {
		Blog.findById(req.params.id, (err, foundBlog) =>{
		if(err){
			res.redirect("/blogs");
		} else {
			res.render("edit", {blog: foundBlog});
			console.log("Blogs ID from Show: " + req.params.id);
		}
	});
});

// Update Route
app.put("/blogs/:id", (req, res) => {
	req.body.blog.body = req.sanitize(req.body.blog.body);
	Blog.findOneAndUpdate(req.params.id, req.body.blog, (err, updatedBlog) =>{
		if(err){
			res.redirect("/blogs");
		} else {
			res.redirect("/blogs/" + req.params.id);
		}
	});
});

//Delete Route
app.delete("/blogs/:id", (req, res) => {
	console.log("Blogs ID from Delete: " + req.params.id);
    Blog.findOneAndRemove(req.params.id, (err) =>{
		if(err){
			res.redirect("/blogs");
			console.log("ERROR");
		} else {
			res.redirect("/blogs");
			console.log("DELETED " + req.params.id);
		}
	});
});
//Start server listening on port 3000
app.listen(3000, () => {
	console.log("Server Started....");
});