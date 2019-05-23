'use strict';

const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp(functions.config().firebase);

const db = admin.firestore()

exports.createProfile = functions.auth.user().onCreate((user) => {
  const uid = user.uid
  const email = user.email;
  return db
    .collection('users')
    .doc(uid)
    .set({ email })
    .catch(console.error)
});

/*
exports.createProfile = functions.auth.user().onDelete((user) => {
  const email = user.email;
  const displayName = user.displayName;

  return sendGoodbyeEmail(email, displayName);
});*/