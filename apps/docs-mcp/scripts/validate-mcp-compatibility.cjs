#!/usr/bin/env node

/**
 * Validation script for MCP server SSE compatibility
 * 
 * This script tests that the MCP server correctly implements SSE streaming
 * without Content-Length headers, ensuring compatibility with MCP clients.
 */

const https = require('https');
const http = require('http');

const TESTS = {
  REQUIRED_HEADERS: [
    { name: 'content-type', expectedValue: 'text/event-stream', type: 'exact' },
    { name: 'cache-control', expectedValue: 'no-cache', type: 'contains' },
  ],
  FORBIDDEN_HEADERS: [
    'content-length', // SSE must NOT have Content-Length
  ],
  RECOMMENDED_HEADERS: [
    'x-accel-buffering', // Should be 'no' for nginx
  ]
};

function testMCPServer(url) {
  return new Promise((resolve, reject) => {
    console.log(`\n🔍 Testing MCP Server: ${url}`);
    console.log('=' .repeat(60));
    
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const postData = JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "2024-11-05",
        capabilities: {},
        clientInfo: { name: "mcp-validator", version: "1.0" }
      }
    });

    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'Accept': 'application/json, text/event-stream',
      }
    };

    const req = client.request(options, (res) => {
      const results = {
        url,
        status: res.statusCode,
        headers: res.headers,
        passed: true,
        errors: [],
        warnings: [],
      };

      console.log(`\n📊 Response Status: ${res.statusCode}`);
      console.log('\n📋 Response Headers:');
      Object.entries(res.headers).forEach(([key, value]) => {
        console.log(`   ${key}: ${value}`);
      });

      // Test 1: Required headers
      console.log('\n✅ Testing Required Headers:');
      TESTS.REQUIRED_HEADERS.forEach(({ name, expectedValue, type }) => {
        const actualValue = res.headers[name.toLowerCase()];
        if (!actualValue) {
          const error = `❌ Missing required header: ${name}`;
          console.log(`   ${error}`);
          results.errors.push(error);
          results.passed = false;
        } else if (type === 'exact' && actualValue !== expectedValue) {
          const error = `❌ Header ${name}: expected "${expectedValue}", got "${actualValue}"`;
          console.log(`   ${error}`);
          results.errors.push(error);
          results.passed = false;
        } else if (type === 'contains' && !actualValue.includes(expectedValue)) {
          const error = `❌ Header ${name}: expected to contain "${expectedValue}", got "${actualValue}"`;
          console.log(`   ${error}`);
          results.errors.push(error);
          results.passed = false;
        } else {
          console.log(`   ✅ ${name}: ${actualValue}`);
        }
      });

      // Test 2: Forbidden headers
      console.log('\n🚫 Testing Forbidden Headers:');
      TESTS.FORBIDDEN_HEADERS.forEach((name) => {
        const actualValue = res.headers[name.toLowerCase()];
        if (actualValue) {
          const error = `❌ CRITICAL: Found forbidden header: ${name} = ${actualValue}`;
          console.log(`   ${error}`);
          console.log(`      This will break MCP clients! SSE must use chunked encoding.`);
          results.errors.push(error);
          results.passed = false;
        } else {
          console.log(`   ✅ ${name}: correctly absent`);
        }
      });

      // Test 3: Check for chunked encoding
      console.log('\n📦 Testing Transfer Encoding:');
      const transferEncoding = res.headers['transfer-encoding'];
      if (transferEncoding && transferEncoding.includes('chunked')) {
        console.log(`   ✅ Using chunked encoding: ${transferEncoding}`);
      } else if (!res.headers['content-length']) {
        console.log(`   ✅ No Content-Length (chunked encoding implicit)`);
      } else {
        const warning = `⚠️  No explicit chunked encoding`;
        console.log(`   ${warning}`);
        results.warnings.push(warning);
      }

      // Test 4: Recommended headers
      console.log('\n💡 Testing Recommended Headers:');
      TESTS.RECOMMENDED_HEADERS.forEach((name) => {
        const actualValue = res.headers[name.toLowerCase()];
        if (actualValue) {
          console.log(`   ✅ ${name}: ${actualValue}`);
        } else {
          const warning = `⚠️  Missing recommended header: ${name}`;
          console.log(`   ${warning}`);
          results.warnings.push(warning);
        }
      });

      // Test 5: Parse response body
      let body = '';
      res.on('data', (chunk) => {
        body += chunk.toString();
      });

      res.on('end', () => {
        console.log('\n📝 Response Body:');
        console.log(body.substring(0, 300));
        
        try {
          // Try to parse SSE format
          if (body.includes('event:') && body.includes('data:')) {
            console.log('   ✅ Valid SSE format detected');
            
            const dataMatch = body.match(/data: (.+)/);
            if (dataMatch) {
              const jsonData = JSON.parse(dataMatch[1]);
              if (jsonData.result && jsonData.result.serverInfo) {
                console.log(`   ✅ MCP Server: ${jsonData.result.serverInfo.name} v${jsonData.result.serverInfo.version}`);
                console.log(`   ✅ Protocol: ${jsonData.result.protocolVersion}`);
              }
            }
          } else {
            const warning = '⚠️  Response may not be in SSE format';
            console.log(`   ${warning}`);
            results.warnings.push(warning);
          }
        } catch (err) {
          const warning = `⚠️  Could not parse response: ${err.message}`;
          console.log(`   ${warning}`);
          results.warnings.push(warning);
        }

        // Final verdict
        console.log('\n' + '='.repeat(60));
        if (results.passed && results.errors.length === 0) {
          console.log('✅ ALL TESTS PASSED - MCP client compatible!');
        } else {
          console.log('❌ TESTS FAILED - Issues detected:');
          results.errors.forEach(err => console.log(`   ${err}`));
        }
        
        if (results.warnings.length > 0) {
          console.log('\n⚠️  Warnings:');
          results.warnings.forEach(warn => console.log(`   ${warn}`));
        }
        
        console.log('='.repeat(60) + '\n');
        resolve(results);
      });
    });

    req.on('error', (err) => {
      console.error(`\n❌ Connection Error: ${err.message}\n`);
      reject(err);
    });

    req.write(postData);
    req.end();
  });
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const urls = args.length > 0 
    ? args 
    : [
        'http://localhost:3100/mcp',
        'https://mcp.staging.journium.app/mcp',
      ];

  console.log('🚀 MCP Server SSE Compatibility Validator');
  console.log('==========================================\n');
  console.log('This script validates that your MCP server correctly implements');
  console.log('Server-Sent Events (SSE) for MCP client compatibility.\n');

  const results = [];
  for (const url of urls) {
    try {
      const result = await testMCPServer(url);
      results.push(result);
    } catch (err) {
      console.error(`Failed to test ${url}:`, err.message);
      results.push({ url, passed: false, errors: [err.message] });
    }
  }

  // Summary
  console.log('\n📊 SUMMARY');
  console.log('='.repeat(60));
  results.forEach((result) => {
    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} - ${result.url}`);
  });
  
  const allPassed = results.every(r => r.passed);
  process.exit(allPassed ? 0 : 1);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
