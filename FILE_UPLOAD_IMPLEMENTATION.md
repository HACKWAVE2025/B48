# File Upload Implementation for Study Session Chat

## Overview
Added comprehensive file upload functionality to the study session chat, allowing users to share images, videos, audio files, documents, and other file types.

## Features Implemented

### Supported File Types
- **Images**: JPEG, PNG, GIF, WebP, SVG
- **Videos**: MP4, MPEG, WebM, QuickTime, AVI
- **Audio**: MP3, WAV, OGG, WebM
- **Documents**: PDF, Word (.doc, .docx), Excel (.xls, .xlsx), PowerPoint (.ppt, .pptx), Text files, CSV
- **Archives**: ZIP, RAR, 7Z

### File Size Limit
- Maximum file size: **50MB**

## Backend Changes

### 1. Updated Message Model (`server/models/Message.js`)
Added new fields to support file attachments:
```javascript
{
  messageType: 'text' | 'image' | 'video' | 'audio' | 'file' | 'system',
  fileUrl: String,
  fileName: String,
  fileSize: Number,
  mimeType: String
}
```

### 2. Created Multer Configuration (`server/config/multer.js`)
- Configured file storage in `server/uploads/chat-files/`
- File validation based on MIME types
- Unique filename generation with timestamps
- 50MB file size limit

### 3. Updated Session Routes (`server/routes/sessionRoutes.js`)
Added new endpoint:
- `POST /api/sessions/sessions/:sessionId/upload` - Upload file to session chat
  - Requires authentication
  - Accepts file and optional caption
  - Returns message data with file information

### 4. Updated Server (`server/server.js`)
- Added static file serving for `/uploads` directory
- Files are accessible via HTTP

### 5. Updated Socket Handler (`server/socket/socketHandler.js`)
- Added `file_uploaded` event handler
- Broadcasts file messages to all users in the room (except sender)

## Frontend Changes

### 1. Updated StudySessionRoom Component
Added new features:
- File selection button (paperclip icon)
- File preview before sending
- Support for captions with files
- Loading state during upload
- File type detection and appropriate rendering

### 2. File Rendering
Different renderers based on file type:
- **Images**: Display inline with zoom capability
- **Videos**: Embedded video player with controls
- **Audio**: Audio player with controls
- **Documents/Files**: Download button with file info (name, size, icon)

### 3. UI Enhancements
- File preview card showing selected file
- Cancel button to remove selected file
- Upload progress indicator (spinner)
- File size formatting (Bytes, KB, MB, GB)
- File type icons

## How to Use

### Uploading a File
1. Click the paperclip (📎) button in the chat input area
2. Select a file from your device
3. (Optional) Add a caption/message
4. Click the send button
5. File will be uploaded and shared with all participants

### Viewing Files
- **Images**: Click to open in new tab
- **Videos/Audio**: Play directly in chat
- **Documents**: Click download button to save

## File Storage
Files are stored in: `server/uploads/chat-files/`
- Filename format: `originalname-timestamp-random.ext`
- Files persist on server
- Accessible via: `http://localhost:5000/uploads/chat-files/filename`

## Security Features
1. File type validation (whitelist approach)
2. File size limit enforcement
3. Authentication required for uploads
4. Sanitized filenames
5. MIME type verification

## Socket Events

### Client → Server
- `file_uploaded` - Notify room about new file upload

### Server → Client
- `file_uploaded` - Broadcast file message to room members

## Testing Checklist
- [ ] Upload image files (.jpg, .png, .gif)
- [ ] Upload video files (.mp4, .webm)
- [ ] Upload audio files (.mp3, .wav)
- [ ] Upload PDF documents
- [ ] Upload Word/Excel/PowerPoint files
- [ ] Test file size limit (try > 50MB)
- [ ] Test unsupported file types
- [ ] Verify file preview
- [ ] Test caption with files
- [ ] Verify real-time broadcasting
- [ ] Test file download
- [ ] Test video/audio playback
- [ ] Test image zoom/preview

## Notes
- Files are stored permanently unless manually deleted
- Consider implementing file cleanup for old sessions
- May want to add image compression for large images
- Consider cloud storage (AWS S3, Cloudinary) for production
- Add file scanning for malware in production
