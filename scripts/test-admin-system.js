#!/usr/bin/env node

/**
 * CarShowX Admin System Test Runner
 * 
 * This script runs comprehensive tests for the admin system
 * Run with: npm run test:admin
 */

import AdminSystemTester from '../src/lib/AdminSystemTester';

async function main() {
  console.log('🚀 CarShowX Admin System Test Suite');
  console.log('=====================================\n');
  
  try {
    const tester = new AdminSystemTester();
    await tester.runAllTests();
  } catch (error) {
    console.error('❌ Test runner failed:', error);
    process.exit(1);
  }
}

// Only run if this script is called directly
if (require.main === module) {
  main().catch(console.error);
}
