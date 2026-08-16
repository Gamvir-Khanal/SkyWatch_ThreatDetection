const mongoose = require('mongoose');

async function checkDrones() {
  await mongoose.connect('mongodb://127.0.0.1:27017/skywatch');
  const db = mongoose.connection.db;
  const drones = await db.collection('drones').find({}).toArray();
  console.log("DRONES IN DB:", drones);
  process.exit(0);
}

checkDrones();
