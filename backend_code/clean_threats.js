const mongoose = require('mongoose');
const ThreatIncident = require('./models/ThreatIncident');

async function cleanThreats() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/skywatch');
    console.log('Connected to MongoDB');
    
    // Find all threats, sort by descending timestamp (newest first)
    const threats = await ThreatIncident.find().sort({ timestamp: -1 });
    
    if (threats.length <= 2) {
      console.log(`Only ${threats.length} threats found. No deletion needed.`);
    } else {
      // Get the IDs to delete (all except the first 2)
      const toDelete = threats.slice(2).map(t => t._id);
      
      const result = await ThreatIncident.deleteMany({ _id: { $in: toDelete } });
      console.log(`Deleted ${result.deletedCount} old threats. Kept the 2 most recent.`);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
}

cleanThreats();
