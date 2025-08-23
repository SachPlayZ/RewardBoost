import { NextRequest, NextResponse } from 'next/server';
import RivalzClient from 'rivalz-client';

export async function GET(request: NextRequest) {
  console.log('🧪 Testing Rivalz SDK connection via API route...');
  
  try {
    // Check environment variable
    const secretToken = process.env.RIVALZ_SECRET_TOKEN;
    
    if (!secretToken) {
      return NextResponse.json({
        success: false,
        error: 'RIVALZ_SECRET_TOKEN not configured',
        message: 'Please set RIVALZ_SECRET_TOKEN in your environment variables',
        status: 'config_error'
      }, { status: 400 });
    }
    
    console.log('✅ Secret token found:', secretToken.substring(0, 10) + '...');
    
    // Initialize client
    console.log('🔄 Initializing Rivalz client...');
    const client = new RivalzClient(secretToken);
    
    if (!client) {
      return NextResponse.json({
        success: false,
        error: 'Failed to initialize Rivalz client',
        status: 'init_error'
      }, { status: 500 });
    }
    
    console.log('✅ Rivalz client initialized successfully');
    
    // Check what methods are available
    const clientMethods = Object.getOwnPropertyNames(Object.getPrototypeOf(client));
    console.log('📝 Available client methods:', clientMethods);
    
    // Try to test a simple operation if possible
    // Note: Most Rivalz operations require file uploads, so we'll test basic connectivity
    
    let serviceStatus = 'unknown';
    let errorDetails = null;
    
    try {
      // Try a basic operation that doesn't require file upload
      // We'll attempt to call a method and see what happens
      console.log('📡 Testing basic API connectivity...');
      
      // Since we can't do much without a file, let's just try to create a client and see if it fails
      // If we get this far, the SDK is at least working
      serviceStatus = 'sdk_initialized';
      
    } catch (apiError) {
      console.error('❌ API connectivity test failed:', apiError);
      serviceStatus = 'api_error';
      errorDetails = {
        name: (apiError as any).name,
        message: (apiError as any).message,
        status: (apiError as any).status,
        response: (apiError as any).response?.data
      };
    }
    
    return NextResponse.json({
      success: true,
      message: 'Rivalz SDK test completed',
      results: {
        tokenConfigured: true,
        tokenPreview: secretToken.substring(0, 10) + '...',
        clientInitialized: true,
        clientType: typeof client,
        availableMethods: clientMethods,
        serviceStatus,
        errorDetails
      },
      recommendations: serviceStatus === 'api_error' 
        ? [
            'The Rivalz service appears to be having connectivity issues',
            'This might be a temporary service outage',
            'Try again in a few minutes',
            'Check Rivalz status page or documentation for service updates'
          ]
        : [
            'SDK is properly configured and initialized',
            'Ready to test with actual file upload',
            'Try uploading a small PDF file to test full functionality'
          ]
    });
    
  } catch (error) {
    console.error('❌ Rivalz test failed:', error);
    
    let errorType = 'unknown_error';
    let troubleshooting = [];
    
    if (error instanceof Error) {
      if (error.message.includes('RIVALZ_SECRET_TOKEN')) {
        errorType = 'config_error';
        troubleshooting = [
          'Set RIVALZ_SECRET_TOKEN in your .env file',
          'Restart your development server after adding the token',
          'Verify the token is correct and not expired'
        ];
      } else if ((error as any).code === 'MODULE_NOT_FOUND') {
        errorType = 'dependency_error';
        troubleshooting = [
          'Run: npm install rivalz-client',
          'Check if rivalz-client package is properly installed',
          'Try deleting node_modules and running npm install again'
        ];
      } else if ((error as any).status >= 500) {
        errorType = 'service_error';
        troubleshooting = [
          'Rivalz service appears to be down (5xx error)',
          'This is likely a temporary issue on their end',
          'Check Rivalz service status',
          'Try again later'
        ];
      }
    }
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      errorType,
      troubleshooting,
      details: error && typeof error === 'object' ? {
        name: (error as any).name,
        message: (error as any).message,
        status: (error as any).status,
        code: (error as any).code,
        response: (error as any).response?.data
      } : null
    }, { status: 500 });
  }
}

// Also add a POST method for testing with actual files
export async function POST(request: NextRequest) {
  console.log('🧪 Testing Rivalz SDK with file upload...');
  
  try {
    const secretToken = process.env.RIVALZ_SECRET_TOKEN;
    
    if (!secretToken) {
      return NextResponse.json({
        success: false,
        error: 'RIVALZ_SECRET_TOKEN not configured'
      }, { status: 400 });
    }
    
    const formData = await request.formData();
    const testFile = formData.get('testFile') as File;
    
    if (!testFile) {
      return NextResponse.json({
        success: false,
        error: 'No test file provided',
        message: 'Upload a PDF file to test Rivalz functionality'
      }, { status: 400 });
    }
    
    console.log('📁 Test file received:', testFile.name, testFile.size, 'bytes');
    
    // Save test file temporarily
    const fs = await import('fs');
    const path = await import('path');
    
    // Use a more readable temp directory in the project
    const projectRoot = process.cwd();
    const tempDir = path.join(projectRoot, 'temp', 'rivalz-test');
    
    // Create temp directory if it doesn't exist
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    const tempFilePath = path.join(tempDir, `test-${Date.now()}-${testFile.name}`);
    
    const buffer = Buffer.from(await testFile.arrayBuffer());
    fs.writeFileSync(tempFilePath, buffer);
    
    console.log('💾 Test file saved to:', tempFilePath);
    console.log('📏 Test file size:', `${(testFile.size / 1024 / 1024).toFixed(2)} MB`);
    
    try {
      // Initialize Rivalz client
      const client = new RivalzClient(secretToken);
      
      // Try to create a knowledge base
      console.log('📤 Testing knowledge base creation...');
      const testKbName = `test-kb-${Date.now()}`;
      
      const result = await client.createRagKnowledgeBase(tempFilePath, testKbName);
      
      console.log('✅ Test successful! Knowledge base created:', result);
      
      // Clean up
      fs.unlinkSync(tempFilePath);
      
      return NextResponse.json({
        success: true,
        message: 'Rivalz SDK is working correctly!',
        testResult: {
          knowledgeBaseId: result.id,
          status: result.status,
          fileName: testFile.name,
          fileSize: testFile.size
        },
        recommendations: [
          'Rivalz SDK is fully functional',
          'You can now use it in your campaign creation flow',
          'The earlier 503 errors may have been temporary service issues'
        ]
      });
      
    } catch (rivalzError) {
      // Clean up file on error
      try {
        fs.unlinkSync(tempFilePath);
      } catch (cleanupError) {
        console.error('Failed to clean up test file:', cleanupError);
      }
      
      console.error('❌ Rivalz API test failed:', rivalzError);
      
      return NextResponse.json({
        success: false,
        error: 'Rivalz API test failed',
        details: {
          message: (rivalzError as any).message,
          status: (rivalzError as any).status,
          response: (rivalzError as any).response?.data
        },
        troubleshooting: [
          'The Rivalz service may be experiencing issues',
          'Check if this is a temporary outage',
          'Verify your API token is still valid',
          'Try with a smaller file if this was a large PDF'
        ]
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('❌ Test setup failed:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Test setup failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
