import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Uploads a file to Cloudinary.
 * @param file The file to upload (can be a File object from FormData)
 * @param folder The folder in Cloudinary to upload to
 * @param resourceType The type of resource to upload (image, video, auto)
 */
export async function uploadToCloudinary(
  file: File, 
  folder: string = 'car-images',
  resourceType: 'image' | 'video' | 'auto' = 'auto'
) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
      const uploadOptions: any = {
        folder: folder,
        resource_type: resourceType,
        timeout: 120000, // 2 minutes timeout for slow connections
      };

      // Apply optimization for images
      if (resourceType === 'image' || resourceType === 'auto') {
        uploadOptions.transformation = [
          { quality: "auto:good", fetch_format: "auto" }, // Intelligent compression
          { width: 1920, height: 1920, crop: "limit" } // Resize if larger than 1920px
        ];
      }

      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            reject(error);
          } else if (result) {
            resolve({
              secure_url: result.secure_url,
              public_id: result.public_id,
            });
          } else {
            reject(new Error('Upload result is undefined'));
          }
        }
      );

      uploadStream.end(buffer);
    });
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
}


/**
 * Deletes a file from Cloudinary.
 * @param publicId The public ID of the file to delete
 * @param resourceType The type of resource to delete
 */
export async function deleteFromCloudinary(publicId: string, resourceType: 'image' | 'video' = 'image') {
    try {
        return new Promise((resolve, reject) => {
            cloudinary.uploader.destroy(publicId, { resource_type: resourceType }, (error, result) => {
                if (error) reject(error);
                else resolve(result);
            });
        });
    } catch (error) {
        console.error('Error deleting from Cloudinary:', error);
        throw error;
    }
}

export default cloudinary;
