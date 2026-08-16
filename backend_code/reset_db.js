const mongoose = require('mongoose');
async function resetDB() {
  await mongoose.connect('mongodb://127.0.0.1:27017/skywatch');
  const db = mongoose.connection.db;
  console.log("Dropping collections...");
  await db.collection('drones').deleteMany({});
  await db.collection('threatincidents').deleteMany({});
  const kolkataDrone = {
    droneId: 'SKYW-KOL-01',
    callsign: 'KOLKATA WATCH',
    sector: 'KOLKATA-EAST',
    apiKey: 'kolkata-secret-key-12345',
    status: 'PATROLLING',
    telemetry: { battery: 98, altitude: 120, speed: 45, heading: 90, location: { lat: 22.5726, lng: 88.3639 } },
    waypoints: [],
    registeredAt: new Date(),
    updatedAt: new Date()
  };
  console.log("Seeding Kolkata Drone:", kolkataDrone.droneId);
  await db.collection('drones').insertOne(kolkataDrone);
  console.log("Done.");
  process.exit(0);
}
resetDB().catch(console.error);
