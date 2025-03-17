
import { NextResponse } from "next/server";
import multer from "multer";
import path from "path";
import fs from "fs";

// Define upload folder
const uploadFolder = path.join(process.cwd(), "public", "uploads");

// Ensure the upload folder exists
if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder, { recursive: true });
}

// Multer setup for handling file upload
const upload = multer({
  dest: uploadFolder,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  },
});

// Handle file upload in the POST request
export async function POST(req: Request) {
  return new Promise<NextResponse>((resolve, reject) => {
    upload.single("image")(req as any, {} as any, (err: any) => {
      if (err) {
        return reject(new NextResponse("Error uploading file", { status: 400 }));
      }

      const file = (req as any).file;
      const imagePath = `/uploads/${file.filename}`;
      
      // Here, you can save the image path to your database
      return resolve(
        new NextResponse(
          JSON.stringify({ imagePath }),
          { status: 200 }
        )
      );
    });
  });
}
