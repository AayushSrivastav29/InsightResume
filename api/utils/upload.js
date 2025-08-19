const B2 = require('backblaze-b2');


class B2UploadService {
  constructor() {
    this.b2 = new B2({
      applicationKeyId: process.env.B2_APPLICATION_KEY_ID,
      applicationKey: process.env.BACKBLAZE_S3_API_KEY,
    });
    this.bucketId = process.env.B2_BUCKET_ID;
    this.bucketName = process.env.B2_BUCKET_NAME;
    this.authorized = false;
  }

  async authorize() {
    if (!this.authorized) {
      try {
        await this.b2.authorize();
        this.authorized = true;
        console.log('B2 authorized successfully');
      } catch (error) {
        console.error('B2 authorization failed:', error);
        throw error;
      }
    }
  }

  async uploadFile(file, userId) {
    try {
      await this.authorize();

      // Get upload URL
      const uploadUrlResponse = await this.b2.getUploadUrl({
        bucketId: this.bucketId
      });

      // Create file path: userId/resumeId/filename
      const fileName = `${userId}/${Date.now()}/${file.originalname}`;
      
      // Upload file to B2
      const uploadResponse = await this.b2.uploadFile({
        uploadUrl: uploadUrlResponse.data.uploadUrl,
        uploadAuthToken: uploadUrlResponse.data.authorizationToken,
        fileName: fileName,
        data: file.buffer,
        info: {
          userId: userId,
          originalName: file.originalname,
          uploadedAt: new Date().toISOString()
        }
      });

      // Construct the public URL
      const fileUrl = `https://f${this.bucketId.substring(0, 3)}.backblazeb2.com/file/${this.bucketName}/${fileName}`;

      return {
        success: true,
        fileId: uploadResponse.data.fileId,
        fileName: uploadResponse.data.fileName,
        fileUrl: fileUrl,
        uploadedAt: new Date(),
        size: file.size
      };

    } catch (error) {
      console.error('B2 upload error:', error);
      throw new Error(`Upload failed: ${error.message}`);
    }
  }

  async deleteFile(fileId, fileName) {
    try {
      await this.authorize();

      await this.b2.deleteFileVersion({
        fileId: fileId,
        fileName: fileName
      });

      return { success: true, message: 'File deleted successfully' };
    } catch (error) {
      console.error('B2 delete error:', error);
      throw new Error(`Delete failed: ${error.message}`);
    }
  }

  async getDownloadUrl(fileName) {
    try {
      const downloadUrl = `https://f${this.bucketId.substring(0, 3)}.backblazeb2.com/file/${this.bucketName}/${fileName}`;
      return downloadUrl;
    } catch (error) {
      console.error('B2 download URL error:', error);
      throw new Error(`Get download URL failed: ${error.message}`);
    }
  }
}

// Export singleton instance
const b2Service = new B2UploadService();
module.exports = { b2Service };
