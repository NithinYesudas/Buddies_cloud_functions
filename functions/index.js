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
    const postSnapshot = await db.collection('posts').doc(followingId).collection('images').orderBy("createdAt", "desc").get();
    const posts = postSnapshot.docs.map((doc) => doc.data());
    followingPosts.push(...posts);
  }


  return followingPosts;
});


exports.updatePostCount = functions.firestore
  .document('posts/{userId}/images/{imageId}')
  .onCreate(async (snapshot, context) => {
    const userId = context.params.userId;
    const userRef = admin.firestore().collection('users').doc(userId);
    const userDoc = await userRef.get();
    const postCount = userDoc.data().postCount || 0;

    return userRef.update({
      postCount: postCount + 1
    });
  });
exports.updateFollowingCount = functions.firestore
  .document('users/{userId}/following/{followingId}')
  .onCreate(async (snapshot, context) => {
    const userId = context.params.userId;
    const userRef = admin.firestore().collection('users').doc(userId);
    const userDoc = await userRef.get();
    const postCount = userDoc.data().followingCount || 0;

    return userRef.update({
      followingCount: followingCount + 1
    });
  });
exports.updateFollowingCount = functions.firestore
  .document('users/{userId}/followers/{followersId}')
  .onCreate(async (snapshot, context) => {
    const userId = context.params.userId;
    const userRef = admin.firestore().collection('users').doc(userId);
    const userDoc = await userRef.get();
    const postCount = userDoc.data().followersCount || 0;

    return userRef.update({
      followersCount: followersCount + 1
    });
  });

exports.getMutualFollowers = functions.https.onCall(async (data, context) => {
  const currentUserId = data.currentUserId;
  const selectedUserId = data.selectedUserId;

  const followingSnapshot = await admin.firestore().collection('users').doc(currentUserId).collection('following').get();
  const followersSnapshot = await admin.firestore().collection('users').doc(selectedUserId).collection('followers').get();

  const followingIds = followingSnapshot.docs.map((doc) => doc.id);
  const followerIds = followersSnapshot.docs.map(doc => doc.id);

  const mutualFollowerIds = followingIds.filter(id => followerIds.includes(id));
  const usersSnapshot = await admin.firestore().collection('users').where('userId', "in", mutualFollowerIds).get();

  const mutualFollowerNames = usersSnapshot.docs.map(doc => doc.data().name);

  return mutualFollowerNames;


});

