const route = require('express').Router();
const { getIdFromToken } = require('../services/token');
const { User, UserDetail, Article, Comments } = require('../index');

route.post('/articles/:slug/comments', async(req, res) => {
    if(req.headers.token) {
        const currentUserId = await getIdFromToken(req.headers.token);
        if(currentUserId.id) {
            try{
                const currentUser = await User.findById(currentUserId.id);

                const article = await Article.findOne({
                    where: {
                        slug: req.params.slug
                    }
                });

                const newComment = await Comments.create({
                    body: req.body.comment.body
                });

                newComment.setCommentedBy(currentUser);
                newComment.setBelongTo(article);

                const authorDetails = await UserDetail.findOne({
                    where: {
                        userId: currentUserId.id
                    }
                })

                return res.status(200).json({
                    comment: {
                        id: newComment.commentId,
                        createdAt: newComment.createdAt,
                        updatedAt: newComment.updatedAt,
                        body: newComment.body,
                        author: {
                            username: authorDetails.username,
                            bio: authorDetails.bio,
                            image: authorDetails.image,
                            following: false
                        }
                    }
                })
            } catch (err) {
                console.log(err);
                return res.status(500).json({
                    errors: {
                        message: "Internal Server Error"
                    }
                })
            }

        } else {
            return res.status(400).json({
                errors: {
                    message: "Invalid Token."
                }
            })
        }

    } else {
        return res.status(401).json({
            errors: {
                message: "Unauthorized."
            }
        })
    }
})

route.get('/articles/:slug/comments', async(req, res) => {
    try{
        let currentUser = null;
        if(req.headers.token) {
            currentUserId = await getIdFromToken(req.headers.token);
            if(!currentUserId.id) {
                return res.status(401).json({
                    errors: {
                        message: "Invalid Token"
                    }
                })
            } else {
                currentUser = await User.findById(currentUserId.id);
            }
        }

        const article = await Article.findOne({
            where: {
                slug: req.params.slug
            }
        });

        let commentsList = [];
        const article_comments = await Comments.findAll({
            where: {
                articleId: article.articleId
            }
        });

        for(let i=0; i<article_comments.length; i++) {
            let authorUser = await User.findById(article_comments[i].userId);
            let author = await UserDetail.findOne({
                where: {
                    userId: article_comments[i].userId
                }
            });

            let isFollowing = false;
            if(currentUser){
                isFollowing = await authorUser.hasFollower(currentUser);
            }

            let comment = {
                id: article_comments[i].commentId,
                createdAt: article_comments[i].createdAt,
                updatedAt: article_comments[i].updatedAt,
                body: article_comments[i].body,
                author: {
                    username: author.username,
                    bio: author.bio,
                    image: author.image,
                    following: isFollowing
                }
            }

            commentsList.push(comment);
        }
        return res.status(200).json({
            comments: commentsList
        });
    } catch (err) {
        return res.status(500).json({
            errors: {
                message: "Ïnternal Server Error"
            }
        })
    }  
})

route.delete('/articles/:slug/comments/:id', async (req, res) => {
    if(req.headers.token) {
        currentUserId = await getIdFromToken(req.headers.token);
        if(currentUserId.id) {
            try {
                const article = await Article.findOne({
                    where: {
                        slug: req.params.slug
                    }
                });
                
                await Comments.destroy({
                    where: {
                        commentId: req.params.id,
                        articleId: article.articleId
                    }
                });
                return res.status(200).json({
                    message: "Success"
                })
            } catch (err) {
                return res.status(500).json({
                    errors: {
                        message: "Internal Server Error"
                    }
                })
            }
        } else {
            return res.status(401).json({
                errors: {
                    message: "Invalid Token."
                }
            })
        }
    } else {
        return res.status(400).json({
            errors: {
                message: "Invalid Token."
            }
        })
    }
})

module.exports = route;