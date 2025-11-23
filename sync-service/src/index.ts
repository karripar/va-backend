import dotenv from 'dotenv';
import cron from 'node-cron';
import { execSync } from 'child_process';

dotenv.config();

console.log('🚀 Vector Store Sync Service Started');
console.log(`📅 Schedule: ${process.env.SYNC_SCHEDULE || '0 */6 * * *'}`);
console.log(`📂 Google Drive Folder ID: ${process.env.GOOGLE_DRIVE_FOLDER_ID}`);
console.log(`🗂️  Vector Store ID: ${process.env.VECTOR_STORE_ID}\n`);

// Run sync on startup
console.log('🔄 Running initial sync...');
try {
  execSync('npm run sync', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Initial sync failed');
}

// Schedule periodic syncs
const schedule = process.env.SYNC_SCHEDULE || '0 */6 * * *';
cron.schedule(schedule, () => {
  console.log(`\n🔄 [${new Date().toISOString()}] Running scheduled sync...`);
  try {
    execSync('npm run sync', { stdio: 'inherit' });
  } catch (error) {
    console.error('❌ Scheduled sync failed');
  }
});

console.log('✅ Scheduler is running. Press Ctrl+C to stop.\n');

// Keep process alive
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down gracefully...');
  process.exit(0);
});
