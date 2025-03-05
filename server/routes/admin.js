const express = require("express");
const router = express.Router(); 
const Post = require("../models/Post");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const adminLayout = "../views/layouts/admin";



//check if user is logged in

const authMiddleware = (req, res, next) => { 
    const token = req.cookies.jwt;

    if(!token){
        return res.status(401).json({message: "Unauthorized"});
    }

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        next();
    }catch(error){
        return res.status(401).json({message: "Unauthorized"});
    }
};

//get admin login page
router.get("/admin", async (req,res) => {
    try {
        const locals = {
            title: "Alex's First Node Project",
            description: "Simple blog built in Node.js following a youtube video"
        }
        res.render("admin/index", { locals, layout: adminLayout });
    } catch (error) {
        console.log(error);
    }
    
});


router.post("/admin", async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        
        // If user is not found, render the invalid login page
        if (!user) {
            return res.render("admin/invalid-login", {
                title: "Invalid Login",
                description: "Invalid login attempt",
                layout: adminLayout
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        // If password is incorrect, render the invalid login page
        if (!isPasswordValid) {
            return res.render("admin/invalid-login", {
                title: "Invalid Login",
                description: "Invalid login attempt",
                layout: adminLayout
            });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.cookie("jwt", token, { httpOnly: true, maxAge: 3600000 });
        
        res.redirect("/dashboard");

    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

router.get("/dashboard", authMiddleware, async (req,res) => {  
    try {
        const locals = {
            title: "Dashboard",
            description: "Admin dashboard"
        };
        const data = await Post.find();
        res.render("admin/dashboard", {
            locals,
            data,
            layout: adminLayout
        });
        
    } catch (error) {
        res.status(500).json({message: "Internal Server Error"});
    }
});


//admin register
router.post("/register", async (req,res) => {
    try {
        const { username, password} = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        try{
            const user = await User.create({username, password: hashedPassword});
            res.status(201).json({message: "User created", user});

        }catch(error){
            if(error.code === 11000){
                res.status(409).json({message: "Username already exists"});
            }
            res.status(500).json({message: "Internal Server Error"});
        }
    } catch (error) {
        console.log(error);
    }
    
});



/* GET
    Admin - create new post
*/

router.get("/add-post", authMiddleware, async (req,res) => {
    try {
        const locals = {
            title: "Add Post",
            description: "Add a new post to the blog"
        };
        const data = await Post.find();
        res.render("admin/add-post", {
            locals,
            layout: adminLayout
        });
        
    } catch (error) {
        res.status(500).json({message: "Internal Server Error"});
    }  

});


/* POST
    Admin - create new post
*/

router.post("/add-post", authMiddleware, async (req,res) => {
        try{
            const newPost = new Post({
                title: req.body.title,
                body: req.body.body,
            });

        await Post.create(newPost);
        res.redirect("/dashboard");

        
    } catch (error) {
        res.status(500).json({message: "Internal Server Error"});
    }  

});


/* PUT
    Admin - update post
*/

router.put("/edit-post/:id", authMiddleware, async (req,res) => {
    try {

        await Post.findByIdAndUpdate(req.params.id, {
            title: req.body.title,
            body: req.body.body,
            updatedAt: Date.now()
        });

        res.redirect(`/edit-post/${req.params.id}`);
        
    } catch (error) {
        res.status(500).json({message: "Internal Server Error"});
    }  

});

/* GET
    Admin - update post
*/

router.get("/edit-post/:id", authMiddleware, async (req,res) => {
    try {

        const locals = {
            title: "Edit Post",
            description: "Edit an existing post"
        }

        const data = await Post.findOne({ _id: req.params.id });
            

        res.render("admin/edit-post", {
            data,
            locals,
            layout: adminLayout
        });
        
    } catch (error) {
        res.status(500).json({message: "Internal Server Error"});
    }  

});




/* POST
    Admin - delete post
*/

router.delete("/delete-post/:id", authMiddleware, async (req,res) => {
    try{

    await Post.deleteOne( { _id: req.params.id });
    res.redirect("/dashboard");

    
} catch (error) {
    res.status(500).json({message: "Internal Server Error"});
}  

});

/*
    Admin - logout
*/
router.get("/logout", (req,res) => {
    res.clearCookie("jwt");
    res.redirect("/admin");
});

module.exports = router;