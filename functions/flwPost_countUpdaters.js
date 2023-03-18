const functions = require('firebase-functions');
const admin = require('firebase-admin');
exports.updatePostCount = functions.firestore
    .document('posts/{userId}/images/{imageId}')
    .onCreate(async (snapshot, context) => {
        const userId = context.params.userId;
        const userRef = admin.firestore().collection('users').doc(userId);
        const userDoc = await userRef.get();//fetching the user's document
        const postCount = userDoc.data().postCount || 0;

        return userRef.update({ // updating the post count by incrementing it by one
            postCount: postCount + 1
        });
    });
exports.updateFollowingCount = functions.firestore
    .document('users/{userId}/following/{followingId}')
    .onCreate(async (snapshot, context) => {
        const userId = context.params.userId;
        const userRef = admin.firestore().collection('users').doc(userId);
        const userDoc = await userRef.get();
        const followingCount = userDoc.data().followingCount || 0; // Fix typo here

        return userRef.update({
            followingCount: followingCount + 1
        });
    });

exports.updateFollowersCount = functions.firestore // for updating the followers count when a user follows
    .document('users/{userId}/followers/{followersId}')
    .onCreate(async (snapshot, context) => {
        const userId = context.params.userId;
        const userRef = admin.firestore().collection('users').doc(userId);
        const userDoc = await userRef.get();
        const followersCount = userDoc.data().followersCount || 0;

        return userRef.update({
            followersCount: followersCount + 1
        });
    });

exports.decrementFollowersCount = functions.firestore // for decrementing the followers count when a user unfollows
    .document('users/{userId}/followers/{followersId}')
    .onDelete(async (snapshot, context) => {
        const userId = context.params.userId;
        const userRef = admin.firestore().collection('users').doc(userId);
        const userDoc = await userRef.get();
        const followersCount = userDoc.data().followersCount || 0;

        return userRef.update({
            followersCount: followersCount - 1
        });
    });
exports.decrementFollowingCount = functions.firestore // for decrementing the following count when a user unfollows
    .document('users/{userId}/following/{followingId}')
    .onDelete(async (snapshot, context) => {
        const userId = context.params.userId;
        const userRef = admin.firestore().collection('users').doc(userId);
        const userDoc = await userRef.get();
        const followingCount = userDoc.data().followingCount || 0;

        return userRef.update({
            followingCount: followingCount - 1
        });
    });
exports.updatePostId = functions.firestore // for updating the postId when a post is made
    .document('posts/{userId}/images/{postId}')
    .onCreate((snap, context) => {
        const postId = snap.id;
        const userId = context.params.userId;

        const postRef = snap.ref;

        return postRef.update({ postId });
    });

