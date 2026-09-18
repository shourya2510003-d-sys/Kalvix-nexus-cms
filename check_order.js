const admin = require('firebase-admin');
admin.initializeApp({
  databaseURL: "https://kalvix-9464d-default-rtdb.asia-southeast1.firebasedatabase.app/"
});
const db = admin.database();
db.ref('orders/DCWS_1002').once('value').then(s => {
  console.log(s.val());
  process.exit(0);
});
