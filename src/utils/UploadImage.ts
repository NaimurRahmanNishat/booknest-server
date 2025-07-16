import { v2 as cloudinary } from "cloudinary";

cloudinary.config({ 
  cloud_name: 'ds0j7y0xb', 
  api_key: '225762813261742', 
  api_secret: 'gxAdpvcY-4NJrIckq198USgs-NA',
});

const opts = {
  overwrite: true,
  invalidate: true,
  resource_type: "auto" as const,
};

export const uploadToCloudinary = (image: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      image,
      opts,
      (error, result) => {
        if (result?.secure_url) {
          resolve(result.secure_url);
        } else {
          reject(error?.message || "Upload failed");
        }
      }
    );
  });
};
