const express = require("express");
const router = express.Router(); 
const Post = require("../models/Post");

//Get Home Route
router.get("", async (req,res) => {
    const locals = {
        title: "Alex's First Node Project",
        description: "Simple blog built in Node.js following a youtube video"
    }
    try {
        const data = await Post.find();
        res.render("index", { locals, data});
    } catch (error) {
        console.log(error);
    }
    
});


//Get Post: id Route
router.get("/post/:id", async (req,res) => {
    
    try {
        
        const locals = {
        title: "Alex's First Node Project",
        description: "Simple blog built in Node.js following a youtube video"
    }
        let slug = req.params.id;
        const data = await Post.findById({_id: slug});
        res.render("post", { locals, data});
    } catch (error) {
        console.log(error);
    }
    
});



router.get("/experience", (req,res) => {
    res.render("experience");
});

router.get("/contact", (req,res) => {
    res.render("contact");
});
router.get("/projects", (req,res) => {
    res.render("projects");
});

router.get("/login", (req,res) => {
    res.render("admin/index");
});

 
module.exports = router;

/*
function insertPostData(){
    Post.insertMany([
        {
            title: "Post 1",
            body: "This is the body of post 1"
        },
        {
            title: "Post 2",
            body: "This is the body of post 2"
        },
        {
            title: "Post 3",
            body: "This is the body of post 3" 

        }
    ])
}
insertPostData();
*/