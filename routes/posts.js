const express = require("express");
const Post = require("../models/posts");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();





//create
router.post("/create", authMiddleware, async (req, res) => {
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ message: " le contenu est obligatoire." });
  }

  try {
    const newPost = new Post({
      author: req.user.userId,  
      content,
    });

     await newPost.save();

     const populatedPost = await Post.findById(newPost._id).populate("author", "username");

    res.status(201).json({ message: "Post créé  .", post: populatedPost });
  } catch (error) {
    console.error("Erreur lors de la création ", error);
    res.status(500).json({ message: "Erreur du serveur." });
  }
});

//alll
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("author" , "username")
      .sort({ createdAt: -1 });

    res.status(200).json({ message: "success", posts });
  } catch (error) {
    console.error("Erreur lors de la récupération", error);
    res.status(500).json({ message: "Erreur du serveur." });
  }
});

//  by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const post = await Post.findById(id).populate("author", "username");
    if (!post) {
      return res.status(404).json({ message: "notfound." });
    }

    res.status(200).json({ message: "success", post });
  } catch (error) {
    console.error("Erreur lors de la récupération:", error);
    res.status(500).json({ message: "Erreur du serveur." });
  }
});


//delete
router.delete("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
     const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: " notfound" });
    }

    if (post.author.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Non autorisé ." });
    }

     await post.deleteOne();

    res.status(200).json({ message: "Post supprimé" });
  } catch (error) {
    console.error("Erreur lors de la suppression :", error);
    res.status(500).json({ message: "Erreur du serveur." });
  }
});


//modifier
router.put("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;

   if (!content) {
    return res.status(400).json({ message: "Le contenu est obligatoire" });
  }

  try {
     const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: "not found post" });
    }

     if (post.author.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Non autorisé" });
    }

     post.content = content;
    await post.save();

    res.status(200).json({ message: "Post mis à jour .", post });
  } catch (error) {
    console.error("Erreur lors de la mise à jour", error);
    res.status(500).json({ message: "Erreur du serveur." });
  }
});

//like/ unlike
router.put("/:id/like", authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post introuvable." });
    }

    const userId = req.user.userId;
    const username = req.user.username;
//check
     const hasLiked = post.likes.some((like) => like.userId.toString() === userId);

    if (hasLiked) {
       post.likes = post.likes.filter((like) => like.userId.toString() !== userId);
      post.likeCount -= 1;  
      await post.save();
      return res.status(200).json({ message: "unliked avec succès.", post });
    } else {
       post.likes.push({ userId, username });
      post.likeCount += 1;  
      await post.save();
      return res.status(200).json({ message: " succès.", post });
    }
  } catch (error) {
    console.error("Erreur lors de likes:", error);
    res.status(500).json({ message: "Erreur du serveur." });
  }
});


///comment
router.put("/:id/comment", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;

   if (!content) {
    return res.status(400).json({ message: "contenu obligatoire" });
  }

  try {
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: "introuvable." });
    }

     post.comments.push({
      author: req.user.userId,  
      username: req.user.username,  
      content,
      createdAt: new Date(),
    });

    await post.save();

    res.status(200).json({ message: " ajouté avec succès.", post });
  } catch (error) {
    console.error("Erreur lors de l'ajout du commentaire:", error);
    res.status(500).json({ message: "Erreur du serveur." });
  }
});



module.exports = router;
