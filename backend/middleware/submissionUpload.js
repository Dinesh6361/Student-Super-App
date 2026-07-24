const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDirectory = path.join(
  __dirname,
  "../uploads/submissions"
);

// Create folder automatically
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, {
    recursive: true,
  });
}

const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, uploadDirectory);
  },

  filename: function (req, file, callback) {
    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9);

    const extension = path.extname(
      file.originalname
    );

    callback(
      null,
      `submission-${uniqueName}${extension}`
    );
  },
});

const fileFilter = function (
  req,
  file,
  callback
) {
  const allowedExtensions =
    /pdf|doc|docx|jpg|jpeg|png/;

  const extensionIsValid =
    allowedExtensions.test(
      path
        .extname(file.originalname)
        .toLowerCase()
    );

  const mimeTypeIsValid =
    allowedExtensions.test(
      file.mimetype.toLowerCase()
    );

  if (
    extensionIsValid &&
    mimeTypeIsValid
  ) {
    callback(null, true);
  } else {
    callback(
      new Error(
        "Only PDF, Word and image files are allowed."
      ),
      false
    );
  }
};

const submissionUpload = multer({
  storage,

  limits: {
    fileSize: 10 * 1024 * 1024,
  },

  fileFilter,
});

module.exports = submissionUpload;