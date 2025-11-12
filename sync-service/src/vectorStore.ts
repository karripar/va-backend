import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';

export class VectorStoreService {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }

  /**
   * Get all files currently in the vector store
   */
  async getVectorStoreFiles(
    vectorStoreId: string
  ): Promise<Map<string, string>> {
    try {
      const files = await this.openai.vectorStores.files.list(vectorStoreId);

      const fileMap = new Map<string, string>();

      // Check if files.data exists and is an array
      if (!files || !files.data || !Array.isArray(files.data)) {
        console.log('⚠️  No files found in vector store or invalid response');
        return fileMap;
      }

      for (const file of files.data) {
        // Get file details to get the filename
        const fileDetails = await this.openai.files.retrieve(file.id);
        fileMap.set(fileDetails.filename, file.id);
      }

      return fileMap;
    } catch (error) {
      console.error('❌ Error fetching vector store files:', error);
      throw error;
    }
  }

  /**
   * Upload a file to the vector store
   */
  async uploadFile(vectorStoreId: string, filePath: string): Promise<string> {
    try {
      const fileName = path.basename(filePath);
      console.log(`📤 Uploading to vector store: ${fileName}`);

      // Upload file to OpenAI
      const file = await this.openai.files.create({
        file: fs.createReadStream(filePath),
        purpose: 'assistants',
      });

      // Add file to vector store
      await this.openai.vectorStores.files.create(vectorStoreId, {
        file_id: file.id,
      });

      console.log(`✅ Uploaded: ${fileName} (${file.id})`);
      return file.id;
    } catch (error) {
      console.error(`❌ Error uploading ${filePath}:`, error);
      throw error;
    }
  }

  /**
   * Remove a file from the vector store
   */
  async removeFile(
    vectorStoreId: string,
    fileId: string,
    fileName: string
  ): Promise<void> {
    try {
      console.log(`🗑️  Removing from vector store: ${fileName}`);

      await this.openai.vectorStores.files.delete(fileId, {
        vector_store_id: vectorStoreId,
      });

      console.log(`✅ Removed: ${fileName}`);
    } catch (error) {
      console.error(`❌ Error removing ${fileName}:`, error);
      throw error;
    }
  }

  /**
   * Get vector store info
   */
  async getVectorStoreInfo(vectorStoreId: string) {
    try {
      const vectorStore = await this.openai.vectorStores.retrieve(
        vectorStoreId
      );
      return vectorStore;
    } catch (error) {
      console.error('❌ Error fetching vector store info:', error);
      throw error;
    }
  }
}
