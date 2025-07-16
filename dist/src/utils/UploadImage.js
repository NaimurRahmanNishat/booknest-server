"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadToCloudinary = void 0;
const cloudinary_1 = require("cloudinary");
cloudinary_1.v2.config({
    cloud_name: 'ds0j7y0xb',
    api_key: '225762813261742',
    api_secret: 'gxAdpvcY-4NJrIckq198USgs-NA',
});
const opts = {
    overwrite: true,
    invalidate: true,
    resource_type: "auto",
};
const uploadToCloudinary = (image) => {
    return new Promise((resolve, reject) => {
        cloudinary_1.v2.uploader.upload(image, opts, (error, result) => {
            if (result?.secure_url) {
                resolve(result.secure_url);
            }
            else {
                reject(error?.message || "Upload failed");
            }
        });
    });
};
exports.uploadToCloudinary = uploadToCloudinary;
