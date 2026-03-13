import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { v2 as cloudinary } from 'cloudinary';

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];

function getMaxUploadSizeBytes() {
  const mb = Number(process.env.IMAGE_MAX_UPLOAD_MB || '4');
  const safeMb = Number.isFinite(mb) && mb > 0 ? mb : 4;
  return Math.floor(safeMb * 1024 * 1024);
}

function getStorageProvider() {
  return (process.env.IMAGE_STORAGE_PROVIDER || 'local').toLowerCase();
}

function hasCloudinaryConfig() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
}

function sanitizeFilename(name: string) {
  return name.replace(/[^a-zA-Z0-9.-]/g, '_');
}

function getPublicId(originalName: string) {
  const timestamp = Date.now();
  const safeName = sanitizeFilename(originalName).replace(/\.[^.]+$/, '');
  return `${timestamp}-${safeName}`;
}

async function uploadToCloudinary(buffer: Buffer, originalName: string, mimeType: string) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });

  const folder = process.env.CLOUDINARY_FOLDER || 'cheapest-domain/blog';
  const publicId = getPublicId(originalName);
  const dataUri = `data:${mimeType};base64,${buffer.toString('base64')}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder,
    public_id: publicId,
    overwrite: false,
    resource_type: 'image',
  });

  return {
    url: result.secure_url,
    filename: `${publicId}${result.format ? `.${result.format}` : ''}`,
    storage: 'cloudinary',
  };
}

async function uploadToLocal(buffer: Buffer, originalName: string) {
  const timestamp = Date.now();
  const filename = `${timestamp}-${sanitizeFilename(originalName)}`;
  const uploadsDir = join(process.cwd(), 'public', 'uploads', 'blog');

  if (!existsSync(uploadsDir)) {
    await mkdir(uploadsDir, { recursive: true });
  }

  const filepath = join(uploadsDir, filename);
  await writeFile(filepath, buffer);

  return {
    url: `/uploads/blog/${filename}`,
    filename,
    storage: 'local',
  };
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type: ${file.type}. Only JPG, PNG, WEBP, GIF, and AVIF are allowed.` },
        { status: 400 }
      );
    }

    // Validate file size (defaults to 4MB)
    const maxSize = getMaxUploadSizeBytes();
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          error: `Image too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum allowed size is ${(maxSize / 1024 / 1024).toFixed(0)}MB.`,
        },
        { status: 413 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const provider = getStorageProvider();

    let uploaded;
    if (provider === 'cloudinary' && hasCloudinaryConfig()) {
      uploaded = await uploadToCloudinary(buffer, file.name, file.type);
    } else {
      uploaded = await uploadToLocal(buffer, file.name);
    }

    return NextResponse.json({
      success: true,
      url: uploaded.url,
      filename: uploaded.filename,
      storage: uploaded.storage,
    });
  } catch (error) {
    console.error('Image upload error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to upload image';
    return NextResponse.json(
      { 
        error: errorMessage,
        details: error instanceof Error ? error.stack : undefined 
      },
      { status: 500 }
    );
  }
}
