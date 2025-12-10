import { google } from 'googleapis';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import dotenv from 'dotenv';
import { VectorStoreService } from './vectorStore';

dotenv.config();

/**
 * Google Drive to Vector Store Sync
 * Uses Service Account - NO OAuth needed!
 */

const TEMP_DIR = path.join(os.tmpdir(), 'gdrive-sync');

interface GDriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime: string;
}

async function syncGoogleDrive() {
  console.log('Starting Google Drive to Vector Store sync...\n');

  // Validate environment variables
  if (!process.env.OPENAI_API_KEY || !process.env.VECTOR_STORE_ID) {
    throw new Error('Missing OPENAI_API_KEY or VECTOR_STORE_ID');
  }

  if (!process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
    throw new Error(
      'Missing GOOGLE_SERVICE_ACCOUNT_KEY - see README for setup'
    );
  }

  // Initialize services
  const vectorStore = new VectorStoreService(process.env.OPENAI_API_KEY);

  // Initialize Google Drive client
  const serviceAccountKey = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);

  const auth = new google.auth.GoogleAuth({
    credentials: serviceAccountKey,
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
  });

  const drive = google.drive({ version: 'v3', auth });

  // Create temp directory
  if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
  }

  try {
    // Get folder ID from env
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
    if (!folderId) {
      throw new Error('Missing GOOGLE_DRIVE_FOLDER_ID');
    }

    console.log(`Fetching files from Google Drive folder: ${folderId}`);

    // Allowed MIME types for Google Drive
    const allowedMimeTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'text/plain',
      'text/markdown',
      'application/msword', // .doc
    ];

    // List files in folder
    const response = await drive.files.list({
      q: `'${folderId}' in parents and trashed=false`,
      fields: 'files(id, name, mimeType, size, modifiedTime)',
      pageSize: 1000,
    });

    const gdriveFiles: GDriveFile[] =
      response.data.files
        ?.filter(
          (file) =>
            file.id &&
            file.name &&
            allowedMimeTypes.includes(file.mimeType || '')
        )
        .map((file) => ({
          id: file.id!,
          name: file.name!,
          mimeType: file.mimeType!,
          size: file.size || undefined,
          modifiedTime: file.modifiedTime!,
        })) || [];

    console.log(`==> Found ${gdriveFiles.length} files in Google Drive`);

    // Get current files in vector store
    const vectorStoreFiles = await vectorStore.getVectorStoreFiles(
      process.env.VECTOR_STORE_ID!
    );

    console.log(`\n==> Sync Status:`);
    console.log(`   Google Drive files: ${gdriveFiles.length}`);
    console.log(`   Vector Store files: ${vectorStoreFiles.size}`);

    // Determine which files need to be uploaded
    const filesToUpload = gdriveFiles.filter(
      (file) => !vectorStoreFiles.has(file.name)
    );

    // Determine which files need to be removed
    const gdriveFileNames = new Set(gdriveFiles.map((f) => f.name));
    const filesToRemove = Array.from(vectorStoreFiles.entries()).filter(
      ([name]) => !gdriveFileNames.has(name)
    );

    console.log(`\nNOTICE: Changes to apply:`);
    console.log(`   Files to upload: ${filesToUpload.length}`);
    console.log(`   Files to remove: ${filesToRemove.length}`);

    // Upload new files
    for (const file of filesToUpload) {
      const maxSize =
        parseInt(process.env.MAX_FILE_SIZE_MB || '20') * 1024 * 1024;
      const fileSize = parseInt(file.size || '0');

      if (fileSize > maxSize) {
        console.log(
          `==>  Skipping ${file.name} (too large: ${(
            fileSize /
            1024 /
            1024
          ).toFixed(2)}MB)`
        );
        continue;
      }

      // Download from Google Drive
      console.log(`==> Downloading: ${file.name}`);
      const dest = path.join(TEMP_DIR, file.name);

      const destStream = fs.createWriteStream(dest);
      const response = await drive.files.get(
        { fileId: file.id, alt: 'media' },
        { responseType: 'stream' }
      );

      await new Promise<void>((resolve, reject) => {
        response.data
          .on('end', () => resolve())
          .on('error', (err) => reject(err))
          .pipe(destStream);
      });

      // Copy to upload-server/uploads/ai-files for public access
      // Assuming we are in va-backend/sync-service and upload-server is in va-backend/upload-server
      const uploadServerDir = path.resolve(
        process.cwd(),
        '../upload-server/uploads/ai-files'
      );

      // Ensure directory exists
      if (!fs.existsSync(uploadServerDir)) {
        fs.mkdirSync(uploadServerDir, { recursive: true });
      }

      if (fs.existsSync(uploadServerDir)) {
        try {
          const publicDest = path.join(uploadServerDir, file.name);
          fs.copyFileSync(dest, publicDest);
          console.log(`==> Copied to public uploads: ${file.name}`);
        } catch (err) {
          console.error(`ERROR: Failed to copy to uploads: ${err}`);
        }
      } else {
        console.warn(
          `WARNING: Upload server directory not found at: ${uploadServerDir}`
        );
      }

      // Upload to Vector Store
      await vectorStore.uploadFile(process.env.VECTOR_STORE_ID!, dest);

      // Clean up
      fs.unlinkSync(dest);
    }

    // Remove old files
    for (const [fileName, fileId] of filesToRemove) {
      await vectorStore.removeFile(
        process.env.VECTOR_STORE_ID!,
        fileId,
        fileName
      );
    }

    console.log('\n==> Sync completed successfully!');

    // Get updated vector store info
    const info = await vectorStore.getVectorStoreInfo(
      process.env.VECTOR_STORE_ID!
    );
    console.log(`\n==> Vector Store Status:`);
    console.log(`   ID: ${info.id}`);
    console.log(`   Name: ${info.name}`);
    console.log(`   File count: ${info.file_counts.total}`);
  } catch (error) {
    console.error('\nERROR: Sync failed:', error);
    throw error;
  } finally {
    // Clean up temp directory
    if (fs.existsSync(TEMP_DIR)) {
      fs.rmSync(TEMP_DIR, { recursive: true, force: true });
    }
  }
}

// Run sync
syncGoogleDrive().catch((error) => {
  console.error(error);
  process.exit(1);
});
