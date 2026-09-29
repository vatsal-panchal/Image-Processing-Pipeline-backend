# Image Processing Pipeline Backend

A robust backend service for image upload and automated processing pipeline built with Node.js, Express, TypeScript, Sharp, and MongoDB.

---

## Project Overview

This backend application handles image uploads, validates incoming files, saves original files locally, resizes and compresses images using Sharp, generates thumbnails, records comprehensive metadata in MongoDB, and provides RESTful endpoints to query and delete images.

---

## Features

- Multipart image upload handling with Multer
- Strict file format and size validation (5MB limit)
- Automatic image resizing up to 1200px width while preserving aspect ratio
- Format-specific image compression (JPEG, PNG, WEBP)
- 300px thumbnail generation
- Image metadata extraction using Sharp
- MongoDB persistence for tracking image records and processing states
- Pagination support for image listing
- Full cleanup of all generated disk files upon image deletion
- Centralized error handling with consistent JSON responses
- Static file serving for accessing uploaded and processed assets

---

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** MongoDB
- **ODM:** Mongoose
- **Image Processing:** Sharp
- **File Upload:** Multer
- **Configuration:** Dotenv

---

## Processing Pipeline

```
Client Upload
      ↓
File Validation (MIME type, extension, size <= 5MB)
      ↓
Save Original Image locally (`uploads/originals/`)
      ↓
Extract Metadata using Sharp (dimensions, format)
      ↓
Resize Image (max width: 1200px, aspect ratio preserved) & Compress
      ↓
Create Thumbnail (width: 300px, aspect ratio preserved)
      ↓
Save Processed & Thumbnail files (`uploads/processed/`, `uploads/thumbnails/`)
      ↓
Persist Metadata & Paths to MongoDB (status: COMPLETED)
      ↓
Return JSON Response to Client
```

---

## Folder Structure

```
.
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
├── README.md
├── uploads/
│   ├── originals/
│   ├── processed/
│   └── thumbnails/
└── src/
    ├── app.ts
    ├── server.ts
    ├── config/
    │   └── db.ts
    ├── controllers/
    │   └── image.controller.ts
    ├── middleware/
    │   ├── error.middleware.ts
    │   └── upload.middleware.ts
    ├── models/
    │   └── Image.ts
    ├── routes/
    │   └── image.routes.ts
    └── services/
        └── image.service.ts
```

---

## Installation

1. Clone or download the repository.
2. Install dependencies:

```bash
npm install
```

---

## Environment Setup

Create a `.env` file in the root directory based on `.env.example`:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/image_processing
```

---

## How to Run

### Development Mode (with hot-reload)

```bash
npm run dev
```

### Production Build & Run

```bash
npm run build
npm start
```

---

## Supported Formats

- JPG (`image/jpeg`)
- JPEG (`image/jpeg`)
- PNG (`image/png`)
- WEBP (`image/webp`)

---

## File Size Limit

- Maximum file size: **5MB** (5,242,880 bytes).
- Larger files are automatically rejected with a `400 Bad Request` response.

---

## API Endpoints

### 1. Upload Image

- **URL:** `POST /api/images`
- **Content-Type:** `multipart/form-data`
- **Body:** `image` (file)
- **Response:** `201 Created`

```json
{
  "success": true,
  "message": "Image processed successfully",
  "data": {
    "_id": "660c1bf6e2b10a241bfa4430",
    "originalName": "sample.jpg",
    "originalPath": "uploads/originals/60a56eb7-91a5-48b4-be7f-05c2491fa9a2.jpg",
    "processedPath": "uploads/processed/processed-60a56eb7-91a5-48b4-be7f-05c2491fa9a2.jpg",
    "thumbnailPath": "uploads/thumbnails/thumb-60a56eb7-91a5-48b4-be7f-05c2491fa9a2.jpg",
    "mimeType": "image/jpeg",
    "originalSize": 2048500,
    "processedSize": 412300,
    "width": 1200,
    "height": 800,
    "status": "COMPLETED",
    "createdAt": "2026-09-29T15:30:00.000Z",
    "updatedAt": "2026-09-29T15:30:02.000Z"
  }
}
```

### 2. List Images (with pagination)

- **URL:** `GET /api/images?page=1&limit=10`
- **Response:** `200 OK`

```json
{
  "success": true,
  "message": "Images retrieved successfully",
  "data": {
    "images": [ ... ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 10,
      "totalPages": 1
    }
  }
}
```

### 3. Get Image by ID

- **URL:** `GET /api/images/:id`
- **Response:** `200 OK`

```json
{
  "success": true,
  "message": "Image retrieved successfully",
  "data": {
    "_id": "660c1bf6e2b10a241bfa4430",
    "originalName": "sample.jpg",
    "originalPath": "uploads/originals/60a56eb7-91a5-48b4-be7f-05c2491fa9a2.jpg",
    "processedPath": "uploads/processed/processed-60a56eb7-91a5-48b4-be7f-05c2491fa9a2.jpg",
    "thumbnailPath": "uploads/thumbnails/thumb-60a56eb7-91a5-48b4-be7f-05c2491fa9a2.jpg",
    "mimeType": "image/jpeg",
    "originalSize": 2048500,
    "processedSize": 412300,
    "width": 1200,
    "height": 800,
    "status": "COMPLETED",
    "createdAt": "2026-09-29T15:30:00.000Z",
    "updatedAt": "2026-09-29T15:30:02.000Z"
  }
}
```

### 4. Delete Image by ID

- **URL:** `DELETE /api/images/:id`
- **Response:** `200 OK`

Deletes the MongoDB database record and removes the original, processed, and thumbnail files from the local filesystem.

```json
{
  "success": true,
  "message": "Image deleted successfully",
  "data": null
}
```

### 5. Accessing Generated Files

Files are statically served under the `/uploads` path:

- Original: `http://localhost:5000/uploads/originals/<filename>`
- Processed: `http://localhost:5000/uploads/processed/<filename>`
- Thumbnail: `http://localhost:5000/uploads/thumbnails/<filename>`

---

## Upload Example (cURL)

```bash
curl -X POST http://localhost:5000/api/images \
  -F "image=@/path/to/your/image.jpg"
```
