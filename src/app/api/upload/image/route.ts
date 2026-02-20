import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    console.log('Upload request received');
    
    const formData = await request.formData();
    console.log('FormData parsed');
    
    const file = formData.get('file') as File;
    console.log('File from formData:', file ? `${file.name} (${file.size} bytes)` : 'null');

    if (!file) {
      console.error('No file in request');
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    console.log('File type:', file.type);
    
    if (!allowedTypes.includes(file.type)) {
      console.error('Invalid file type:', file.type);
      return NextResponse.json(
        { error: `Invalid file type: ${file.type}. Only JPG, PNG, WEBP, and GIF are allowed.` },
        { status: 400 }
      );
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      console.error('File too large:', file.size);
      return NextResponse.json(
        { error: `File size (${Math.round(file.size / 1024 / 1024)}MB) exceeds 5MB limit` },
        { status: 400 }
      );
    }

    console.log('Validation passed, converting to buffer...');
    
    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    console.log('Buffer created, size:', buffer.length);

    // Create unique filename
    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${timestamp}-${originalName}`;
    console.log('Filename:', filename);

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'blog');
    console.log('Upload directory:', uploadsDir);
    
    if (!existsSync(uploadsDir)) {
      console.log('Creating directory...');
      await mkdir(uploadsDir, { recursive: true });
      console.log('Directory created');
    }

    // Save file
    const filepath = join(uploadsDir, filename);
    console.log('Saving to:', filepath);
    
    await writeFile(filepath, buffer);
    console.log('File saved successfully');

    // Return public URL
    const publicUrl = `/uploads/blog/${filename}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: filename,
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
