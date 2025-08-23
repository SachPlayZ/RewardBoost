import { NextRequest, NextResponse } from 'next/server';
import { createKnowledgeBase } from '@/lib/rivalz-client';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { prisma } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import os from 'os';

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(request: NextRequest) {
  let tempFilePath: string | null = null;
  
  try {
    const formData = await request.formData();
    const file = formData.get('pdf') as File;
    const campaignId = formData.get('campaignId') as string;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No PDF file provided' },
        { status: 400 }
      );
    }
    
    if (!campaignId) {
      return NextResponse.json(
        { error: 'Campaign ID is required' },
        { status: 400 }
      );
    }
    
    // Validate file type
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Only PDF files are allowed' },
        { status: 400 }
      );
    }
    
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 10MB' },
        { status: 400 }
      );
    }
    
    // Generate unique filename
    const fileId = uuidv4();
    const fileName = `knowledge-base/${campaignId}/${fileId}-${file.name}`;
    
    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Save file temporarily for Rivalz processing
    // Use a more readable temp directory in the project
    const projectRoot = process.cwd();
    const tempDir = path.join(projectRoot, 'temp', 'rivalz-uploads');
    
    // Create temp directory if it doesn't exist
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    tempFilePath = path.join(tempDir, `${fileId}-${file.name}`);
    console.log('💾 Saving PDF to temp path:', tempFilePath);
    
    fs.writeFileSync(tempFilePath, buffer);
    
    // Upload to S3 for permanent storage
    const uploadCommand = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: fileName,
      Body: buffer,
      ContentType: file.type,
    });
    
    await s3Client.send(uploadCommand);
    
    // Generate S3 URL
    const fileUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
    
    // Create knowledge base with Rivalz using local file path
    const knowledgeBaseName = `campaign-${campaignId}-kb`;
    
    try {
      const knowledgeBase = await createKnowledgeBase(tempFilePath, knowledgeBaseName);
      
      // Update campaign with knowledge base data
      await prisma.campaign.update({
        where: { id: campaignId },
        data: {
          knowledgeBaseEnabled: true,
          knowledgeBasePdfFileName: file.name,
          knowledgeBasePdfUrl: fileUrl,
          knowledgeBaseId: knowledgeBase.id,
          knowledgeBaseStatus: knowledgeBase.status,
          knowledgeBaseErrorMessage: null, // Clear any previous error
        },
      });
      
      // Clean up temporary file
      fs.unlinkSync(tempFilePath);
      
      return NextResponse.json({
        success: true,
        knowledgeBaseId: knowledgeBase.id,
        fileName: file.name,
        fileUrl,
        status: knowledgeBase.status,
      });
    } catch (rivalzError) {
      console.error('Rivalz knowledge base creation failed:', rivalzError);
      
      // Update campaign with error status
      await prisma.campaign.update({
        where: { id: campaignId },
        data: {
          knowledgeBaseEnabled: true,
          knowledgeBasePdfFileName: file.name,
          knowledgeBasePdfUrl: fileUrl,
          knowledgeBaseStatus: 'error',
          knowledgeBaseErrorMessage: rivalzError instanceof Error ? rivalzError.message : 'Unknown error',
        },
      });
      
      // Clean up temporary file on error
      try {
        fs.unlinkSync(tempFilePath);
      } catch (cleanupError) {
        console.error('Failed to clean up temporary file:', cleanupError);
      }
      
      // Return partial success - file uploaded but knowledge base creation failed
      return NextResponse.json({
        success: false,
        fileName: file.name,
        fileUrl,
        error: 'Knowledge base creation failed',
        details: rivalzError instanceof Error ? rivalzError.message : 'Unknown error',
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Knowledge base upload error:', error);
    
    // Clean up temporary file if it was created
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      try {
        fs.unlinkSync(tempFilePath);
      } catch (cleanupError) {
        console.error('Failed to clean up temporary file in general error handler:', cleanupError);
      }
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to upload and process PDF',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
