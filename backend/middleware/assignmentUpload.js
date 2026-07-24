const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDirectory = path.join(
  __dirname,
  "../uploads/assignments"
);

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, {
    recursive: true,
  });
}

const storage = multer.diskStorage({
  destination(req, file, callback) {
    callback(null, uploadDirectory);
  },

  filename(req, file, callback) {
    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      path.extname(file.originalname);

    callback(null, uniqueName);
  },
});

const fileFilter = (req, file, callback) => {
  const allowedExtensions =
    /pdf|doc|docx|jpg|jpeg|png/;

  const extensionValid = allowedExtensions.test(
    path.extname(file.originalname).toLowerCase()
  );

  const allowedMimeTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/jpeg",
    "image/png",
  ];

  const mimeTypeValid = allowedMimeTypes.includes(
    file.mimetype
  );

  if (extensionValid && mimeTypeValid) {
    callback(null, true);
  } else {
    callback(
      new Error(
        "Only PDF, Word, JPG, JPEG and PNG files are allowed."
      )
    );
  }
};

const assignmentUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

module.exports = assignmentUpload;