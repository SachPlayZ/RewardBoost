// Test script to verify Rivalz SDK connection
require("dotenv").config();
const RivalzClient = require("rivalz-client");
const fs = require("fs");
const path = require("path");

// Polyfill fetch for Node.js if not available
if (!global.fetch) {
  global.fetch = (...args) =>
    import("node-fetch").then(({ default: fetch }) => fetch(...args));
}

async function testBasicConnection() {
  console.log("🧪 Testing Rivalz SDK basic connection...");

  // Check environment variable
  const secretToken = process.env.RIVALZ_SECRET_TOKEN;

  if (!secretToken) {
    console.error("❌ RIVALZ_SECRET_TOKEN is not set in environment variables");
    console.log("💡 Please add RIVALZ_SECRET_TOKEN to your .env file");
    return false;
  }

  console.log("✅ Secret token found:", secretToken.substring(0, 10) + "...");

  try {
    // Initialize client
    console.log("🔄 Initializing Rivalz client...");
    const client = new RivalzClient(secretToken);

    console.log("✅ Rivalz client initialized successfully");
    console.log("📝 Client type:", typeof client);
    console.log(
      "📝 Client methods:",
      Object.getOwnPropertyNames(Object.getPrototypeOf(client))
    );

    return { success: true, client };
  } catch (error) {
    console.error("❌ Error testing Rivalz connection:", error);

    if (error.response) {
      console.error("📄 Response data:", error.response.data);
      console.error("📊 Response status:", error.response.status);
      console.error("📋 Response headers:", error.response.headers);
    } else if (error.request) {
      console.error("📤 Request made but no response received:", error.request);
    } else {
      console.error("⚙️ Error setting up request:", error.message);
    }

    return { success: false, error };
  }
}

async function testWithActualFile(client) {
  console.log("\n📄 Testing with actual file upload...");

  // Look for any PDF files in common locations
  const possiblePaths = [
    "./test.pdf",
    "./sample.pdf",
    "./test-document.pdf",
    "../test.pdf",
    "./temp/test.pdf",
    "./temp/sample.pdf",
    process.env.TEST_PDF_PATH,
  ].filter(Boolean);

  let testFilePath = null;

  for (const filePath of possiblePaths) {
    if (fs.existsSync(filePath)) {
      testFilePath = filePath;
      console.log("📁 Found test file:", filePath);
      break;
    }
  }

  if (!testFilePath) {
    console.log("💡 No test PDF file found. To test file upload:");
    console.log("   📁 Suggested locations to place a test PDF:");
    console.log("      - ./test.pdf (project root)");
    console.log("      - ./temp/test.pdf (temp directory)");
    console.log("      - ./sample.pdf (project root)");
    console.log(
      "   🔧 Or set TEST_PDF_PATH environment variable to your PDF file path"
    );
    console.log("   📄 Any PDF file under 10MB will work for testing");
    return { success: false, reason: "no_test_file" };
  }

  try {
    const testKbName = `test-kb-${Date.now()}`;
    console.log("🚀 Testing knowledge base creation with:", testFilePath);
    console.log("📝 Knowledge base name:", testKbName);

    const result = await client.createRagKnowledgeBase(
      testFilePath,
      testKbName
    );

    console.log("✅ SUCCESS! Knowledge base created:");
    console.log("   📋 ID:", result.id);
    console.log("   📊 Status:", result.status);
    console.log("   📄 Full result:", JSON.stringify(result, null, 2));

    return { success: true, result };
  } catch (error) {
    console.error("❌ File upload test failed:", error);

    if (error.response) {
      console.error("📄 Response data:", error.response.data);
      console.error("📊 Response status:", error.response.status);

      if (error.response.status === 503) {
        console.log(
          "💡 The 503 error suggests Rivalz service is temporarily unavailable"
        );
        console.log(
          "   This is likely a service issue on their end, not your configuration"
        );
      }
    }

    return { success: false, error };
  }
}

async function testViaAPIRoute() {
  console.log("\n🌐 Testing via API route...");

  try {
    const response = await fetch("http://localhost:3000/api/test-rivalz");
    const result = await response.json();

    console.log("📡 API route test result:", JSON.stringify(result, null, 2));

    return result;
  } catch (error) {
    console.error("❌ API route test failed:", error.message);
    console.log("💡 Make sure your Next.js dev server is running: npm run dev");
    return { success: false, error: error.message };
  }
}

async function runAllTests() {
  console.log("🎯 Starting comprehensive Rivalz SDK tests...\n");

  // Test 1: Basic connection
  const basicTest = await testBasicConnection();

  if (!basicTest.success) {
    console.log(
      "\n❌ Basic connection failed. Fix this first before proceeding."
    );
    return;
  }

  // Test 2: File upload test
  const fileTest = await testWithActualFile(basicTest.client);

  // Test 3: API route test (requires dev server)
  console.log("\n" + "=".repeat(50));
  const apiTest = await testViaAPIRoute();

  // Summary
  console.log("\n" + "=".repeat(50));
  console.log("📊 TEST SUMMARY:");
  console.log("=".repeat(50));
  console.log("✅ Basic SDK Connection:", basicTest.success ? "PASS" : "FAIL");
  console.log(
    "📄 File Upload Test:",
    fileTest.success
      ? "PASS"
      : fileTest.reason === "no_test_file"
      ? "SKIPPED (no test file)"
      : "FAIL"
  );
  console.log("🌐 API Route Test:", apiTest.success ? "PASS" : "FAIL");

  if (fileTest.success) {
    console.log("\n🎉 All tests passed! Rivalz SDK is working correctly.");
    console.log("💡 You can now use the SDK in your application.");
  } else if (basicTest.success && fileTest.reason === "no_test_file") {
    console.log("\n⚠️  Basic connection works, but file upload not tested.");
    console.log("💡 Add a test PDF file to verify complete functionality.");
  } else {
    console.log("\n❌ Some tests failed. Check the errors above.");
    console.log(
      "💡 If you see 503 errors, the Rivalz service may be temporarily down."
    );
  }

  console.log(
    "\n🌐 You can also test via web interface: http://localhost:3000/test-rivalz"
  );
}

// Run the tests
runAllTests().catch(console.error);
