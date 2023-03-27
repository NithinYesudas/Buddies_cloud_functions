const functions = require('firebase-functions');
const admin = require('firebase-admin');



exports.createChatMessageMirror = functions.firestore
    .document('chats/{currentUserId}/people/{selectedUserId}/messages/{messageId}')
    .onCreate(async (snap, context) => {
        try
        {const currentUserId = context.params.currentUserId;
        const selectedUserId = context.params.selectedUserId;
        const messageId = context.params.messageId;
        const messageData = snap.data();

        const selectedUserMessageRef = admin.firestore()
            .collection('chats')
            .doc(selectedUserId)
            .collection('people')
            .doc(currentUserId)
            .collection('messages')
            .doc(messageId);

        const selectedUserMessageDoc = await selectedUserMessageRef.get();
        if (selectedUserMessageDoc.exists) {
            return null;
        }
        await admin.firestore()
        .collection('chats')
        .doc(selectedUserId)
        .collection('people')
        .doc(currentUserId).set({
            createdAt: messageData.createdAt
        })

        await selectedUserMessageRef.set({
            message: messageData.message,
            userId: messageData.userId,
            createdAt: messageData.createdAt,
            
        });





        return null;}
        catch(error){
            throw new functions.https.HttpsError('internal', 'Error while mirroring message', error.message);

        }
    });
