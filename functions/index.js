const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

const db = admin.firestore();

exports.getFollowingPosts = functions.https.onCall(async (data, context) => {
  // Check if the user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'You must be authenticated to access this resource.');
  }

  const userId = context.auth.uid;

  // Get the list of users the current user is following
  const followingSnapshot = await db.collection('users').doc(userId).collection('following').get();

  const followingIds = followingSnapshot.docs.map((doc) => doc.id);

  // Get the posts of the users the current user is following
  const followingPosts = [];

  for (const followingId of followingIds) {
    const postSnapshot = await db.collection('posts').doc(followingId).collection('images').orderBy("time","desc").get();
    const posts = postSnapshot.docs.map((doc) => doc.data());
    followingPosts.push(...posts);
  }

  // Return the posts in descending order of timestamp
  return followingPosts;
});
