var bodyParser = require('body-parser'),
methodOverride = require('method-override'),
expressSanitizer = require('express-sanitizer');
mongoose       = require('mongoose'),
express        = require('express'),
app            = express();

//connect DB & fix dependency issues
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);
mongoose.connect('mongodb://localhost/restful_blog_app', {useNewUrlParser: true});


app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer()); //must go after bodyParser
app.use(express.static("public")); 
app.use(methodOverride("_method"));


//Mongoose/Model config
//Blog Scheme:
//Title
//image
//body
//created (date)
var blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {type: Date, default: Date.now} //created should be a date and the default date is the day it was created
});

//Compile into Model
var Blog = mongoose.model("Blog", blogSchema);


//RESTFUL ROUTES



app.get("/", function(req,res){
    res.redirect("/blogs")
});

//INDEX Route
app.get("/blogs", function(req,res){
    Blog.find({}, function(err, blogs){
        if(err){
            console.log("ERROR!");
        }else {
            res.render("index", {blogs: blogs});
        }
    })
});

//NEW route
app.get("/blogs/new", function(req,res){
    res.render("new");
})

//CREATE route
app.post("/blogs", function(req,res){
    //create new blog
    req.body.blog.body = req.sanitize(req.body.blog.body)//sanitizer
    Blog.create(req.body.blog, function(err, newBlog){
        if(err){
            res.render("new");
        }else {
            //then, redirect to index
            res.redirect("/blogs");
        }
    })
});

//SHOW route
app.get("/blogs/:id",function(req,res){
    ///find blog
    Blog.findById(req.params.id, function(err, foundBlog){
        if(err){
            res.redirect("/blogs");
        } else {
            res.render("show", {blog: foundBlog});
        }
    });
});

//EDIT route
app.get("/blogs/:id/edit", function(req,res){
    //look up blog by id
    Blog.findById(req.params.id, function(err, foundBlog){
        if(err){
            res.redirect("/blogs");
        } else {
            res.render("edit", {blog: foundBlog});
        }
    });
});

//UPDATE route
app.put("/blogs/:id",function(req,res){
    req.body.blog.body = req.sanitize(req.body.blog.body)//sanitizer
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlogs){
        if(err){
            res.redirect("/blogs");
        } else {
            res.redirect("/blogs/" + req.params.id);
        }
    });
});

//DESTROY route
app.delete("/blogs/:id", function(req,res){
    //destory blog
    Blog.findByIdAndRemove(req.params.id, function(err){
        //redirect
        if(err){
            res.redirect("/blogs");
        } else {
            res.redirect("/blogs");
        }
    });
});


app.listen(3000, function(){
    console.log("Blog Server Started!");
});