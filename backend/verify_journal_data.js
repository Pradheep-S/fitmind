const mongoose = require('mongoose');
require('dotenv').config();

// Import the Journal model
const Journal = require('./models/Journal');

async function verifyJournalData() {
  try {
    // Connect to database
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fitmind', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB successfully!');

    // Get total count
    const totalCount = await Journal.countDocuments();
    console.log(`\nTotal journal entries in database: ${totalCount}`);

    // Get entries grouped by mood
    const moodCounts = await Journal.aggregate([
      {
        $group: {
          _id: '$mood',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    console.log('\nEntries by mood:');
    moodCounts.forEach(mood => {
      console.log(`  ${mood._id}: ${mood.count} entries`);
    });

    // Get date range
    const dateRange = await Journal.aggregate([
      {
        $group: {
          _id: null,
          earliest: { $min: '$date' },
          latest: { $max: '$date' }
        }
      }
    ]);

    if (dateRange.length > 0) {
      console.log(`\nDate range:`);
      console.log(`  Earliest entry: ${dateRange[0].earliest.toISOString().split('T')[0]}`);
      console.log(`  Latest entry: ${dateRange[0].latest.toISOString().split('T')[0]}`);
    }

    // Sample a few entries to verify structure
    console.log('\nSample entries:');
    const sampleEntries = await Journal.find({}).limit(3).select('date text mood confidence');
    sampleEntries.forEach((entry, index) => {
      console.log(`\n  Entry ${index + 1}:`);
      console.log(`    Date: ${entry.date.toISOString().split('T')[0]}`);
      console.log(`    Mood: ${entry.mood}`);
      console.log(`    Confidence: ${entry.confidence}`);
      console.log(`    Text: ${entry.text.substring(0, 60)}...`);
    });

    // Check for specific user ID
    const userEntries = await Journal.countDocuments({ user: new mongoose.Types.ObjectId('687cce4941425876d2545da5') });
    console.log(`\nEntries for user 687cce4941425876d2545da5: ${userEntries}`);

  } catch (error) {
    console.error('Error verifying data:', error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('\nDatabase connection closed.');
  }
}

// Run the verification
console.log('Starting journal data verification...');
verifyJournalData()
  .then(() => {
    console.log('Data verification completed.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });