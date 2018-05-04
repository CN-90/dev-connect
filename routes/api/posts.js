const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

// Post model
const Post = require("../../models/Post");
const Profile = require("../../models/Profile");

// Validation
const validatePostInput = require("../../validation/posts");

router.get("/test", (req, res) => {
  res.json({
    msg: "Posts works..."
  });
});

// Get all posts
router.get("/", (req, res) => {
  Post.find()
    .sort({ date: -1 })
    .then(posts => res.json(posts))
    .catch(err => res.status(404).json({ nopostsfound: "No posts found" }));
});

// Get single post
router.get("/:id", (req, res) => {
  Post.findById(req.params.id)
    .then(post => res.json(post))
    .catch(err =>
      res.status(404).json({ nopostfound: "No post found with that ID" })
    );
});

// Create posts
router.post( "/", passport.authenticate("jwt", { session: false }), (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);
    if (!isValid) {
      // if any errors, send 400 with error object
      return res.status(400).json(errors);
    }
    const newPost = new Post({
      text: req.body.text,
      name: req.body.name,
      avatar: req.body.avatar,
      user: req.user.id
    });
    newPost.save().then(post => res.json(post));
  }
);

// Delete post
router.delete("/:id", passport.authenticate("jwt", { session: false }), (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Post.findById(req.params.id).then(post => {
        // check for post owner.
        if (post.user.toString() !== req.user.id) {
          // Return error if user is unauthorized.
          return res
            .status(401)
            .json({ notauthorized: "User is not authorized to delete post." });
        }
        // Delete
        post
          .remove()
          .then(() => res.json({ sucess: true }))
          .catch(err =>
            res.status(404).json({ postnotfound: "No post was found." })
          );
      });
    });
  }
);

// route to like post
router.post("/like/:id", passport.authenticate("jwt", { session: false }), (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          if (
            post.likes.filter(like => like.user.toString() === req.user.id)
              .length > 0
          ) {
            return res
              .status(400)
              .json({ alreadyliked: "User already liked this post." });
          }
          post.likes.unshift({ user: req.user.id });
          post.save().then(post => res.json(post));
        })
        .catch(err =>
          res.status(404).json({ postnotfound: "No post was found." })
        );
    });
  }
);

// route to unlike post.
router.post( "/unlike/:id", passport.authenticate("jwt", { session: false }), (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          if (
            post.likes.filter(like => like.user.toString() === req.user.id)
              .length === 0
          ) {
            return res
              .status(400)
              .json({ notliked: "You have not yet liked this post." });
          }
          // get remove index
          const removeIndex = post.likes
            .map(item => item.user.toString())
            .indexOf(req.user.id);

          // splice like from likes array
          post.likes.splice(removeIndex, 1);
          post.save().then(post => res.json(post));
        })
        .catch(err =>
          res.status(404).json({ postnotfound: "No post was found." })
        );
    });
  }
);

// create comment route
router.post("/comment/:id", passport.authenticate("jwt", { session: false }), (req, res) => {
  const { errors, isValid } = validatePostInput(req.body);
    if (!isValid) {
      // if any errors, send 400 with error object
      return res.status(400).json(errors);
  }
  
    Post.findById(req.params.id)
      .then(post => {
        const newComment = {
          text: req.body.text,
          name: req.body.name,
          avatar: req.body.avatar,
          user: req.user.id
        };

        // Add to comments array
        post.comments.unshift(newComment);
        post.save().then(post => res.json(post));
      })
      .catch(err =>
        res.status(404).json({ postnotfound: "No post was found." })
      );
})

// Remove comment from post
router.delete("/comment/:id/:comment_id", passport.authenticate("jwt", { session: false }), (req, res) => {
    Post.findById(req.params.id)
      .then( post => {
        // check to see if comment exists
        if (post.comments.filter(comment => comment._id.toString() === req.params.comment_id).length === 0) {
          return res.status(404).json({ commentnotexists: 'Comment does not exist'})
        }
        // Get remove index of comment
        const removeIndex = post.comments
          .map(item => item._id.toString())
          .indexOf(req.params.comment_id, 1);
        
        // Splice comment out of array
        post.comments.splice(removeIndex, 1);
        post.save().then(post => res.json(post));

      })
      .catch(err =>
        res.status(404).json({ postnotfound: "No post was found." })
      );
  })

module.exports = router;


//post id 5aeb38d446bb313420dc8c74
//comment id 5aeb4783f8dad13508590784