#!/usr/bin/env node

/**
 * Full Batch Comparison Test
 * Tests both backends with ALL frontend mock data to find parsing differences
 */

const LOCAL_BACKEND = 'http://localhost:8787';
const DEPLOYED_BACKEND = 'https://sentiflow-workers-backend.harshulc2001.workers.dev';

// Read all feedback from mockData.ts
const mockDataContent = require('fs').readFileSync(
  './signalflow-insights/src/data/mockData.ts',
  'utf8'
);

// Extract all feedback items - handle multi-line format
const allFeedback = [];
const lines = mockDataContent.split('\n');

let currentItem = null;
for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  
  // Start of new item
  if (line.startsWith('{ id:')) {
    currentItem = {};
    // Extract id
    const idMatch = line.match(/id:\s*'([^']+)'/);
    if (idMatch) currentItem.id = idMatch[1];
    
    // Extract source
    const sourceMatch = line.match(/source:\s*'([^']+)'/);
    if (sourceMatch) currentItem.source = sourceMatch[1];
    
    // Extract content (might be on same line or next)
    const contentMatch = line.match(/content:\s*'([^']+)'/);
    if (contentMatch) {
      currentItem.content = contentMatch[1];
    } else {
      // Content might be on next line
      const nextLine = i + 1 < lines.length ? lines[i + 1].trim() : '';
      const nextContentMatch = nextLine.match(/content:\s*'([^']+)'/);
      if (nextContentMatch) {
        currentItem.content = nextContentMatch[1];
        i++; // Skip next line
      }
    }
    
    // Extract author
    const authorMatch = line.match(/author:\s*'([^']+)'/);
    if (authorMatch) {
      currentItem.author = authorMatch[1];
    } else {
      // Author might be on next line
      const nextLine = i + 1 < lines.length ? lines[i + 1].trim() : '';
      const nextAuthorMatch = nextLine.match(/author:\s*'([^']+)'/);
      if (nextAuthorMatch) {
        currentItem.author = nextAuthorMatch[1];
        i++; // Skip next line
      }
    }
    
    // If we have all required fields, add to array
    if (currentItem.id && currentItem.source && currentItem.content && currentItem.author) {
      allFeedback.push({
        id: currentItem.id,
        source: currentItem.source,
        content: currentItem.content,
        author: currentItem.author,
        timestamp: new Date().toISOString(),
      });
      currentItem = null;
    }
  }
}

console.log(`📊 Found ${allFeedback.length} feedback items from mockData.ts\n`);

async function testBatch(backendUrl, feedbackItems) {
  try {
    console.log(`Testing ${backendUrl} with ${feedbackItems.length} items...`);
    const startTime = Date.now();
    
    const response = await fetch(`${backendUrl}/api/analyze/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        feedback: feedbackItems,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const duration = Date.now() - startTime;
    
    // Calculate sentiment distribution
    const sentiments = data.map(d => d.sentiment);
    const counts = {
      positive: sentiments.filter(s => s === 'positive').length,
      neutral: sentiments.filter(s => s === 'neutral').length,
      negative: sentiments.filter(s => s === 'negative').length,
      total: data.length,
    };
    
    const percentages = {
      positive: Math.round((counts.positive / counts.total) * 100),
      neutral: Math.round((counts.neutral / counts.total) * 100),
      negative: Math.round((counts.negative / counts.total) * 100),
    };
    
    return {
      success: true,
      results: data,
      counts,
      percentages,
      duration,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

function compareResults(local, deployed) {
  const differences = [];
  
  if (!local.success || !deployed.success) {
    return {
      hasDifferences: true,
      differences: ['One or both backends failed'],
    };
  }
  
  // Compare counts
  if (local.counts.positive !== deployed.counts.positive) {
    differences.push({
      type: 'count',
      field: 'positive',
      local: local.counts.positive,
      deployed: deployed.counts.positive,
      diff: local.counts.positive - deployed.counts.positive,
    });
  }
  
  if (local.counts.neutral !== deployed.counts.neutral) {
    differences.push({
      type: 'count',
      field: 'neutral',
      local: local.counts.neutral,
      deployed: deployed.counts.neutral,
      diff: local.counts.neutral - deployed.counts.neutral,
    });
  }
  
  if (local.counts.negative !== deployed.counts.negative) {
    differences.push({
      type: 'count',
      field: 'negative',
      local: local.counts.negative,
      deployed: deployed.counts.negative,
      diff: local.counts.negative - deployed.counts.negative,
    });
  }
  
  // Compare individual items
  const itemDifferences = [];
  for (let i = 0; i < Math.min(local.results.length, deployed.results.length); i++) {
    const localItem = local.results[i];
    const deployedItem = deployed.results[i];
    
    if (localItem.sentiment !== deployedItem.sentiment) {
      itemDifferences.push({
        index: i,
        id: localItem.id,
        content: localItem.content.substring(0, 60) + '...',
        local: {
          sentiment: localItem.sentiment,
          emotion: localItem.emotion,
          theme: localItem.theme,
        },
        deployed: {
          sentiment: deployedItem.sentiment,
          emotion: deployedItem.emotion,
          theme: deployedItem.theme,
        },
      });
    }
  }
  
  return {
    hasDifferences: differences.length > 0 || itemDifferences.length > 0,
    differences,
    itemDifferences,
  };
}

async function main() {
  console.log('🧪 Full Batch Comparison Test');
  console.log('='.repeat(80));
  console.log(`Local Backend:    ${LOCAL_BACKEND}`);
  console.log(`Deployed Backend: ${DEPLOYED_BACKEND}`);
  console.log(`Total Items:      ${allFeedback.length}`);
  console.log('='.repeat(80));
  
  // Test both backends
  console.log('\n📡 Testing backends...\n');
  
  const [localResult, deployedResult] = await Promise.all([
    testBatch(LOCAL_BACKEND, allFeedback),
    testBatch(DEPLOYED_BACKEND, allFeedback),
  ]);
  
  // Display results
  console.log('\n📊 RESULTS');
  console.log('='.repeat(80));
  
  if (localResult.success) {
    console.log('\n✅ LOCAL BACKEND:');
    console.log(`   Positive: ${localResult.counts.positive} (${localResult.percentages.positive}%)`);
    console.log(`   Neutral:  ${localResult.counts.neutral} (${localResult.percentages.neutral}%)`);
    console.log(`   Negative: ${localResult.counts.negative} (${localResult.percentages.negative}%)`);
    console.log(`   Total:    ${localResult.counts.total}`);
    console.log(`   Duration: ${localResult.duration}ms`);
  } else {
    console.log('\n❌ LOCAL BACKEND ERROR:', localResult.error);
  }
  
  if (deployedResult.success) {
    console.log('\n✅ DEPLOYED BACKEND:');
    console.log(`   Positive: ${deployedResult.counts.positive} (${deployedResult.percentages.positive}%)`);
    console.log(`   Neutral:  ${deployedResult.counts.neutral} (${deployedResult.percentages.neutral}%)`);
    console.log(`   Negative: ${deployedResult.counts.negative} (${deployedResult.percentages.negative}%)`);
    console.log(`   Total:    ${deployedResult.counts.total}`);
    console.log(`   Duration: ${deployedResult.duration}ms`);
  } else {
    console.log('\n❌ DEPLOYED BACKEND ERROR:', deployedResult.error);
  }
  
  // Compare
  if (localResult.success && deployedResult.success) {
    const comparison = compareResults(localResult, deployedResult);
    
    console.log('\n🔍 COMPARISON');
    console.log('='.repeat(80));
    
    if (comparison.hasDifferences) {
      console.log('\n⚠️  DIFFERENCES FOUND:\n');
      
      if (comparison.differences.length > 0) {
        console.log('Count Differences:');
        comparison.differences.forEach(diff => {
          console.log(`   ${diff.field}: Local=${diff.local}, Deployed=${deployedResult.counts[diff.field]}, Diff=${diff.diff}`);
        });
      }
      
      if (comparison.itemDifferences.length > 0) {
        console.log(`\nItem Differences (${comparison.itemDifferences.length} items):`);
        comparison.itemDifferences.slice(0, 10).forEach(diff => {
          console.log(`\n   Item ${diff.index} (ID: ${diff.id}):`);
          console.log(`   Content: ${diff.content}`);
          console.log(`   Local:    sentiment=${diff.local.sentiment}, emotion=${diff.local.emotion}, theme=${diff.local.theme}`);
          console.log(`   Deployed: sentiment=${diff.deployed.sentiment}, emotion=${diff.deployed.emotion}, theme=${diff.deployed.theme}`);
        });
        if (comparison.itemDifferences.length > 10) {
          console.log(`   ... and ${comparison.itemDifferences.length - 10} more differences`);
        }
      }
    } else {
      console.log('\n✅ NO DIFFERENCES - Results are identical!');
    }
  }
  
  console.log('\n' + '='.repeat(80));
}

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
