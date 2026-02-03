const cloudinary = require('cloudinary').v2;

const config = {
  cloud_name: 'dh2yugqsf',
  api_key: '288695175165149',
  api_secret: 'JxdPxDKNXVJFyUYPnyEixr5gLCQ',
  secure: true
};

cloudinary.config(config);

async function testUpload() {
  console.log('Testing Cloudinary with config:', { ...config, api_secret: '***' });
  
  try {
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'test_folder', resource_type: 'image' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      
      // Upload a tiny 1x1 transparent GIF
      const buffer = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
      uploadStream.end(buffer);
    });
    
    console.log('✅ Upload Success:', result.secure_url);
  } catch (err) {
    console.error('❌ Upload Failed:', err);
  }
}

testUpload();
