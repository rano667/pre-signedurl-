require('dotenv').config({ path: "./.env" });
const express = require("express");
const aws = require("aws-sdk");
const cors = require("cors");

const app = express();
const port = 5000;

app.use(cors());

aws.config.update({
  accessKeyId: process.env.ACCESSKEYID,
  secretAccessKey: process.env.SECRETACCESSKEY,
  region: process.env.REGION,
});

const s3 = new aws.S3();

app.get("/", (req, res) => {
  res.send("MTube");
});

app.get("/get-upload-url", (req, res) => {
  const name = Date.now() + '.mp4'
  const params = {
    Bucket: process.env.BUCKET_NAME,
    Key: `videos/${name}`, // Unique key for each uploaded video
    ContentType: "video/mp4",
    // ACL: "public-read", // Adjust ACL as needed
  };

  s3.getSignedUrl("putObject", params, (err, url) => {
    if (err) {
      console.error("Error generating pre-signed URL:", err);
      return res
        .status(500)
        .json({ error: "Failed to generate pre-signed URL" });
    }

    res.json({ uploadUrl: url, key: name });
  });
});

// New route for streaming or downloading video
app.get("/stream-video/:videoKey", (req, res) => {
  const videoKey = req.params.videoKey;

  const params = {
    Bucket: "sfl360project",
    Key: `videos/${videoKey}`,
  };

  s3.getSignedUrl("getObject", params, (err, url) => {
    if (err) {
      console.error("Error generating pre-signed URL for reading:", err);
      return res
        .status(500)
        .json({ error: "Failed to generate pre-signed URL for reading" });
    }

    // Redirect the client to the pre-signed URL for streaming or downloading
    res.redirect(url);
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
