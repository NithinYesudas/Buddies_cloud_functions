const functions = require('firebase-functions');
const admin = require('firebase-admin');
exports.incrementPostLikesCount = functions.firestore
    .document('posts/{followingId}/images/{postId}/likes/{likeId}')
    .onCreate(async (snap, context) => {
        const { followingId, postId } = context.params;
        const postRef = admin.firestore().collection('posts').doc(followingId).collection('images').doc(postId);

        // Get the current likes count from the post document
        const postDoc = await postRef.get();
        const currentLikesCount = postDoc.get('likesCount') || 0;

        // Increment the likes count and update the post document
        const newLikesCount = currentLikesCount + 1;
        await postRef.update({ likesCount: newLikesCount });


    });



exports.decrementPostLikesCount = functions.firestore
    .document('posts/{followingId}/images/{postId}/likes/{likeId}')
    .onDelete(async (snap, context) => {
        const { followingId, postId } = context.params;
        const postRef = admin.firestore().collection('posts').doc(followingId).collection('images').doc(postId);

        // Get the current likes count from the post document
        const postDoc = await postRef.get();
        const currentLikesCount = postDoc.get('likesCount') || 0;

        // Decrement the likes count and update the post document
        const newLikesCount = currentLikesCount - 1;
        await postRef.update({ likesCount: newLikesCount });


    });



exports.incrementPostCommentsCount = functions.firestore//increment comments count
    .document('posts/{followingId}/images/{postId}/comments/{commentsId}')
    .onCreate(async (snap, context) => {
        const { followingId, postId } = context.params;
        const postRef = admin.firestore().collection('posts').doc(followingId).collection('images').doc(postId);

        // Get the current likes count from the post document
        const postDoc = await postRef.get();
        const currentCommentsCount = postDoc.get('commentsCount') || 0;

        // Increment the likes count and update the post document
        const newCommentsCount = currentCommentsCount + 1;
        await postRef.update({ commentsCount: newCommentsCount });


    });



exports.decrementPostCommentsCount = functions.firestore// decrement comments count
    .document('posts/{followingId}/images/{postId}/comments/{commentsId}')
    .onDelete(async (snap, context) => {
        const { followingId, postId } = context.params;
        const postRef = admin.firestore().collection('posts').doc(followingId).collection('images').doc(postId);

        // Get the current likes count from the post document
        const postDoc = await postRef.get();
        const currentCommentsCount = postDoc.get('commentsCount') || 0;

        // Decrement the likes count and update the post document
        const newCommentsCount = currentCommentsCount - 1;
        await postRef.update({ commentsCount: newCommentsCount });


    });
