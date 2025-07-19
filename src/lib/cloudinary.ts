
import { v2 as cloudinary } from 'cloudinary';

if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) {
  throw new Error('Missing NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME');
}

if (!process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY) {
  throw new Error('Missing NEXT_PUBLIC_CLOUDINARY_API_KEY');
}

if (!process.env.CLOUDINARY_API_SECRET) {
  throw new Error('Missing CLOUDINARY_API_SECRET');
}

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadImage = async (file: File) => {
  const fileBuffer = await file.arrayBuffer();
  let mime = file.type;
  let encoding = 'base64';
  let base64Data = Buffer.from(fileBuffer).toString('base64');
  let fileUri = 'data:' + mime + ';' + encoding + ',' + base64Data;

  try {
    const result = await cloudinary.uploader.upload(fileUri, {
      folder: 'team-shields',
    });
    return result.secure_url;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw new Error('Failed to upload image.');
  }
};
