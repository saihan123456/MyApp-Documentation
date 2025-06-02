import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import db from '@/app/lib/db';
import { writeFile } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'public', 'uploads');

// GET /api/images - Get images with pagination
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    
    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: 'Invalid pagination parameters' },
        { status: 400 }
      );
    }
    
    const offset = (page - 1) * limit;
    
    // Get total count for pagination
    const countQuery = `SELECT COUNT(*) as total FROM images`;
    const { total } = db.prepare(countQuery).get();
    
    // Get paginated images
    const query = `
      SELECT id, filename, original_filename, file_path, file_size, width, height, mime_type, created_at
      FROM images
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    const images = db.prepare(query).all(limit, offset);
    
    // Add full URLs to images
    const imagesWithUrls = images.map(image => ({
      ...image,
      url: `/uploads/${image.filename}`
    }));
    
    return NextResponse.json({
      images: imagesWithUrls,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching images:', error);
    return NextResponse.json(
      { error: 'Failed to fetch images' },
      { status: 500 }
    );
  }
}

// POST /api/images - Upload new images
export async function POST(request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const formData = await request.formData();
    const files = formData.getAll('files');
    
    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files uploaded' },
        { status: 400 }
      );
    }
    
    const uploadedImages = [];
    
    // Process each uploaded file
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        continue; // Skip non-image files
      }
      
      const buffer = Buffer.from(await file.arrayBuffer());
      const fileExt = file.name.split('.').pop().toLowerCase();
      const uniqueFilename = `${uuidv4()}.${fileExt}`;
      const filePath = path.join(uploadsDir, uniqueFilename);
      
      // Get image dimensions using sharp
      const imageInfo = await sharp(buffer).metadata();
      
      // Save the file
      await writeFile(filePath, buffer);
      
      // Insert image info into database
      const result = db.prepare(`
        INSERT INTO images (
          filename, 
          original_filename, 
          file_path, 
          file_size, 
          width, 
          height, 
          mime_type, 
          uploaded_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        uniqueFilename,
        file.name,
        `/uploads/${uniqueFilename}`,
        file.size,
        imageInfo.width,
        imageInfo.height,
        file.type,
        session.user.id
      );
      
      // Get the inserted image
      const newImage = db.prepare(`
        SELECT id, filename, original_filename, file_path, file_size, width, height, mime_type, created_at 
        FROM images 
        WHERE id = ?
      `).get(result.lastInsertRowid);
      
      // Add URL
      newImage.url = `/uploads/${newImage.filename}`;
      
      uploadedImages.push(newImage);
    }
    
    return NextResponse.json(uploadedImages, { status: 201 });
  } catch (error) {
    console.error('Error uploading images:', error);
    return NextResponse.json(
      { error: 'Failed to upload images' },
      { status: 500 }
    );
  }
}

// DELETE /api/images - Delete an image
export async function DELETE(request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Image ID is required' },
        { status: 400 }
      );
    }
    
    // Get image info before deletion
    const image = db.prepare('SELECT filename FROM images WHERE id = ?').get(id);
    
    if (!image) {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      );
    }
    
    // Delete from database
    db.prepare('DELETE FROM images WHERE id = ?').run(id);
    
    // Try to delete the file (but don't fail if file doesn't exist)
    try {
      const fs = require('fs');
      const filePath = path.join(uploadsDir, image.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (fileError) {
      console.error('Error deleting image file:', fileError);
      // Continue even if file deletion fails
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting image:', error);
    return NextResponse.json(
      { error: 'Failed to delete image' },
      { status: 500 }
    );
  }
}
