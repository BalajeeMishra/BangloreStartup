const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const uploadVideo = (path) =>
  cloudinary.uploader.upload_large(
    path,
    {
      resource_type: "video",
      public_id: "myfolder/mysubfolder/dog_closeup",
      chunk_size: 6000000000000,
      eager: [
        { width: 300, height: 300, crop: "pad", audio_codec: "none" },
        {
          width: 160,
          height: 100,
          crop: "crop",
          gravity: "south",
          audio_codec: "none",
        },
      ],
      eager_async: true,
      eager_notification_url: "https://mysite.example.com/notify_endpoint",
    },
    function (error, result) {
      console.log("hello world", result, error);
    }
  );

module.exports = {
  uploadVideo,
};
