#!/usr/bin/env node

/**
 * Backend Comparison Test Script
 * Tests both local and deployed backends with frontend mock data
 * and compares the results to find differences
 */

const LOCAL_BACKEND = 'http://localhost:8787';
const DEPLOYED_BACKEND = 'https://sentiflow-workers-backend.harshulc2001.workers.dev';

// Sample test cases from frontend mock data
const testCases = [
  {
    id: '1',
    source: 'github',
    content: 'API returns 504 timeout on /upload endpoint with files >50MB. This is blocking our production deployment.',
    author: 'devops-mike',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: '2',
    source: 'gmail',
    content: 'Your customer support is phenomenal! Issue resolved in 10 minutes. Sarah was incredibly helpful.',
    author: 'happy-customer@company.com',
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  },
  {
    id: '3',
    source: 'github',
    content: 'Add TypeScript support to Workers SDK - would love better intellisense',
    author: 'ts-enthusiast',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
  },
  {
    id: '4',
    source: 'discord',
    content: 'Memory leak in dashboard when leaving tab open >1 hour. Chrome shows 2GB+ memory usage.',
    author: 'debug-queen',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: '5',
    source: 'github',
    content: 'Pages deploy times are insanely fast now! Under 30 seconds for our Next.js app.',
    author: 'speed-demon',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
  },
  {
    id: '6',
    source: 'gmail',
    content: 'Cant access dashboard - getting 403 errors after password change. Very urgent!',
    author: 'locked-out-user',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: '7',
    source: 'github',
    content: 'Request: Add bulk operations support for KV namespace',
    author: 'feature-requester',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
  },
];

async function testBackend(backendUrl, testCase) {
  try {
    const response = await fetch(`${backendUrl}/api/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: testCase.content,
        source: testCase.source,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      success: true,
      result: data.sentiment || data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

async function testBatch(backendUrl, testCases) {
  try {
    const response = await fetch(`${backendUrl}/api/analyze/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        feedback: testCases,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    return {
      success: true,
      results: data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

function compareResults(localResult, deployedResult, testCase) {
  const differences = [];
  
  if (!localResult.success || !deployedResult.success) {
    return {
      hasDifferences: true,
      differences: [
        {
          field: 'error',
          local: localResult.success ? 'OK' : localResult.error,
          deployed: deployedResult.success ? 'OK' : deployedResult.error,
        },
      ],
    };
  }

  const local = localResult.result;
  const deployed = deployedResult.result;

  // Compare sentiment
  if (local.sentiment !== deployed.sentiment) {
    differences.push({
      field: 'sentiment',
      local: local.sentiment,
      deployed: deployed.sentiment,
    });
  }

  // Compare emotion
  if (local.emotion !== deployed.emotion) {
    differences.push({
      field: 'emotion',
      local: local.emotion,
      deployed: deployed.emotion,
    });
  }

  // Compare score (with tolerance)
  const scoreDiff = Math.abs((local.score || 0) - (deployed.score || 0));
  if (scoreDiff > 0.01) {
    differences.push({
      field: 'score',
      local: local.score?.toFixed(4),
      deployed: deployed.score?.toFixed(4),
      difference: scoreDiff.toFixed(4),
    });
  }

  // Compare confidence
  const confDiff = Math.abs((local.confidence || 0) - (deployed.confidence || 0));
  if (confDiff > 0.01) {
    differences.push({
      field: 'confidence',
      local: local.confidence?.toFixed(4),
      deployed: deployed.confidence?.toFixed(4),
      difference: confDiff.toFixed(4),
    });
  }

  // Compare urgency
  if (local.urgency !== deployed.urgency) {
    differences.push({
      field: 'urgency',
      local: local.urgency,
      deployed: deployed.urgency,
    });
  }

  return {
    hasDifferences: differences.length > 0,
    differences,
  };
}

function formatComparison(testCase, localResult, deployedResult, comparison) {
  const lines = [];
  
  lines.push('\n' + '='.repeat(80));
  lines.push(`Test Case ${testCase.id}: ${testCase.content.substring(0, 60)}...`);
  lines.push('='.repeat(80));
  
  if (!localResult.success) {
    lines.push(`❌ LOCAL BACKEND ERROR: ${localResult.error}`);
  } else {
    const local = localResult.result;
    lines.push(`✅ LOCAL:  sentiment=${local.sentiment}, emotion=${local.emotion}, score=${local.score?.toFixed(4)}, confidence=${local.confidence?.toFixed(4)}`);
  }
  
  if (!deployedResult.success) {
    lines.push(`❌ DEPLOYED BACKEND ERROR: ${deployedResult.error}`);
  } else {
    const deployed = deployedResult.result;
    lines.push(`✅ DEPLOYED: sentiment=${deployed.sentiment}, emotion=${deployed.emotion}, score=${deployed.score?.toFixed(4)}, confidence=${deployed.confidence?.toFixed(4)}`);
  }
  
  if (comparison.hasDifferences) {
    lines.push('\n⚠️  DIFFERENCES FOUND:');
    comparison.differences.forEach(diff => {
      lines.push(`   - ${diff.field}:`);
      lines.push(`     Local:    ${diff.local}`);
      lines.push(`     Deployed: ${diff.deployed}`);
      if (diff.difference) {
        lines.push(`     Diff:     ${diff.difference}`);
      }
    });
  } else {
    lines.push('\n✅ NO DIFFERENCES - Results match!');
  }
  
  return lines.join('\n');
}

async function main() {
  console.log('🧪 Backend Comparison Test Script');
  console.log('='.repeat(80));
  console.log(`Local Backend:    ${LOCAL_BACKEND}`);
  console.log(`Deployed Backend: ${DEPLOYED_BACKEND}`);
  console.log(`Test Cases:       ${testCases.length}`);
  console.log('='.repeat(80));

  // Test connectivity first
  console.log('\n📡 Testing connectivity...');
  
  try {
    const localHealth = await fetch(`${LOCAL_BACKEND}/`);
    if (!localHealth.ok) throw new Error('Local backend not responding');
    console.log('✅ Local backend is reachable');
  } catch (error) {
    console.log(`❌ Local backend is NOT reachable: ${error.message}`);
    console.log('   Make sure to run: cd signalflow-backend/workers-backend && wrangler dev');
    process.exit(1);
  }

  try {
    const deployedHealth = await fetch(`${DEPLOYED_BACKEND}/`);
    if (!deployedHealth.ok) throw new Error('Deployed backend not responding');
    console.log('✅ Deployed backend is reachable');
  } catch (error) {
    console.log(`❌ Deployed backend is NOT reachable: ${error.message}`);
    process.exit(1);
  }

  // Run individual tests
  console.log('\n🔍 Running individual tests...');
  const individualResults = [];
  
  for (const testCase of testCases) {
    const [localResult, deployedResult] = await Promise.all([
      testBackend(LOCAL_BACKEND, testCase),
      testBackend(DEPLOYED_BACKEND, testCase),
    ]);
    
    const comparison = compareResults(localResult, deployedResult, testCase);
    individualResults.push({ testCase, localResult, deployedResult, comparison });
    
    console.log(formatComparison(testCase, localResult, deployedResult, comparison));
  }

  // Run batch test
  console.log('\n\n📦 Running batch test...');
  const [localBatch, deployedBatch] = await Promise.all([
    testBatch(LOCAL_BACKEND, testCases),
    testBatch(DEPLOYED_BACKEND, testCases),
  ]);

  if (localBatch.success && deployedBatch.success) {
    console.log(`✅ Local batch:    ${localBatch.results.length} items processed`);
    console.log(`✅ Deployed batch: ${deployedBatch.results.length} items processed`);
    
    // Compare batch results
    const batchDifferences = [];
    for (let i = 0; i < Math.min(localBatch.results.length, deployedBatch.results.length); i++) {
      const local = localBatch.results[i];
      const deployed = deployedBatch.results[i];
      
      if (local.sentiment !== deployed.sentiment) {
        batchDifferences.push({
          index: i,
          field: 'sentiment',
          local: local.sentiment,
          deployed: deployed.sentiment,
        });
      }
      if (local.emotion !== deployed.emotion) {
        batchDifferences.push({
          index: i,
          field: 'emotion',
          local: local.emotion,
          deployed: deployed.emotion,
        });
      }
      if (local.theme !== deployed.theme) {
        batchDifferences.push({
          index: i,
          field: 'theme',
          local: local.theme,
          deployed: deployed.theme,
        });
      }
    }
    
    if (batchDifferences.length > 0) {
      console.log(`\n⚠️  Batch differences found: ${batchDifferences.length}`);
      batchDifferences.forEach(diff => {
        console.log(`   Item ${diff.index}: ${diff.field} - Local: ${diff.local}, Deployed: ${diff.deployed}`);
      });
    } else {
      console.log('\n✅ Batch results match!');
    }
  } else {
    console.log(`❌ Batch test failed:`);
    if (!localBatch.success) console.log(`   Local: ${localBatch.error}`);
    if (!deployedBatch.success) console.log(`   Deployed: ${deployedBatch.error}`);
  }

  // Summary
  console.log('\n\n📊 SUMMARY');
  console.log('='.repeat(80));
  const totalTests = individualResults.length;
  const testsWithDifferences = individualResults.filter(r => r.comparison.hasDifferences).length;
  const testsMatching = totalTests - testsWithDifferences;
  
  console.log(`Total tests:        ${totalTests}`);
  console.log(`Results matching:   ${testsMatching} ✅`);
  console.log(`Results different:  ${testsWithDifferences} ⚠️`);
  
  if (testsWithDifferences > 0) {
    console.log('\n⚠️  Some tests show differences between local and deployed backends!');
    console.log('   Review the differences above to identify the issue.');
    process.exit(1);
  } else {
    console.log('\n✅ All tests passed! Local and deployed backends produce identical results.');
    process.exit(0);
  }
}

// Run the script
main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
