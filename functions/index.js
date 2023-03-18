const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();
const flwPostCountUpdaters = require('./flwPost_countUpdaters');
const likeCommentCountUpdaters = require('./likeComment_countUpdaters')


const db = admin.firestore();

exports.decrementFollowersCount = flwPostCountUpdaters.decrementFollowersCount; //adding the functions written in countUpdaters.js file
exports.decrementFollowingCount = flwPostCountUpdaters.decrementFollowingCount;
exports.updateFollowersCount = flwPostCountUpdaters.updateFollowersCount;
exports.updateFollowingCount = flwPostCountUpdaters.updateFollowingCount;
exports.updatePostCount = flwPostCountUpdaters.updatePostCount;
exports.updatePostId = flwPostCountUpdaters.updatePostId;
exports.incrementPostLikesCount = likeCommentCountUpdaters.incrementPostLikesCount;
exports.decrementPostLikesCount = likeCommentCountUpdaters.decrementPostLikesCount;
exports.incrementPostCommentsCount = likeCommentCountUpdaters.incrementPostCommentsCount;
exports.decrementPostCommentsCount = likeCommentCountUpdaters.decrementPostCommentsCount;



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
    const postSnapshot = await db.collection('posts').doc(followingId).collection('images').orderBy("createdAt", "desc").get(); //fetching the posts in descending order of createdAt
    const posts = postSnapshot.docs.map(async (doc) => {
      const postData = doc.data();
      const postId = doc.id;
      const likeSnapshot = await db.collection('posts').doc(followingId).collection('images').doc(postId).collection("likes").where("userId", "==", userId).get();
      const isLiked = !likeSnapshot.empty;
      return { ...postData, isLiked:  isLiked };
    });
    followingPosts.push(...(await Promise.all(posts)));
  }

  return followingPosts;
});




exports.getMutualFollowers = functions.https.onCall(async (data, context) => {//to return the list of mutual followers of the current user and selected user
  const currentUserId = data.currentUserId;
  const selectedUserId = data.selectedUserId;

  const followingSnapshot = await admin.firestore().collection('users').doc(currentUserId).collection('following').get();
  const followersSnapshot = await admin.firestore().collection('users').doc(selectedUserId).collection('followers').get();

  const followingIds = followingSnapshot.docs.map((doc) => doc.id);//map the list of followingId
  const followerIds = followersSnapshot.docs.map(doc => doc.id);//map the list of followers of the selected user

  const mutualFollowerIds = followingIds.filter(id => followerIds.includes(id));//filtering out mutual followers
  if (mutualFollowerIds.length > 0) {
    const usersSnapshot = await admin.firestore().collection('users').where('userId', "in", mutualFollowerIds).get();
    const mutualFollowerNames = usersSnapshot.docs.map(doc => ({ imageUrl: doc.data().imageUrl, name: doc.data().name }));//mapping the imageUrl and name of mutual followers

    return mutualFollowerNames;


  }
  else { return []; }




});

exports.isFollowing = functions.https.onCall(async (data, context) => {//to return whether the current user follows the selected user.
  const currentUserId = data.currentUserId;
  const selectedUserId = data.selectedUserId;
  const followingSnapshot = await admin.firestore().collection('users').doc(currentUserId).collection('following').where("userId", '==', selectedUserId).get();
  const followingIds = followingSnapshot.docs.map((doc) => doc.id);
  if (followingIds.length == 0) {
    return false;
  }
  else {
    return true;
  }

})

exports.isLiked = functions.https.onCall(async (data, context) => {
  const currentUserId = context.auth.uid;
  const selectedUserId = data.selectedUserId;
  const postId = data.postId;
  const likeSnapshot = await admin.firestore().collection('posts').doc(selectedUserId).collection('images').doc(postId).collection("likes").where("userId", "==", currentUserId).get();
  if(likeSnapshot.empty){
    return false;
  }
  else{
    return true;
  }
})



