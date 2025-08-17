#!/usr/bin/env node

const { IntelligentLogRetrieval } = require('./intelligent-log-retrieval.js');

class ToggleLoopBenchmark {
  constructor() {
    this.retriever = new IntelligentLogRetrieval();
    this.results = [];
  }

  async runBenchmark(iterations = 5) {
    console.log('🏁 Toggle Loop Performance Benchmark');
    console.log('═'.repeat(50));
    console.log(`📊 Running ${iterations} complete toggle cycles`);
    console.log('⏱️  Each cycle: Execute → Retrieve Logs → Analyze Results');
    console.log('');

    await this.retriever.initialize();

    for (let i = 1; i <= iterations; i++) {
      console.log(`\n🔄 CYCLE ${i}/${iterations}`);
      console.log('─'.repeat(30));
      
      const cycleStart = Date.now();
      
      try {
        // Execute test and get execution metadata
        console.log(`📋 [${i}] Executing font toggle test...`);
        const executeStart = Date.now();
        const executionData = await this.retriever.executeTest();
        const executeTime = Date.now() - executeStart;
        
        // Retrieve logs with smart polling
        console.log(`📋 [${i}] Retrieving execution logs...`);
        const logStart = Date.now();
        const logs = await this.retriever.getExecutionLogs(executionData);
        const logTime = Date.now() - logStart;
        
        const cycleTotal = Date.now() - cycleStart;
        
        // Analyze results
        const fontChanges = executionData.response?.result?.fontChanges?.length || 0;
        const processedElements = executionData.response?.result?.processedElements || 0;
        
        const result = {
          cycle: i,
          executeTime: executeTime,
          logTime: logTime,
          totalTime: cycleTotal,
          success: executionData.success,
          fontChanges: fontChanges,
          processedElements: processedElements,
          logsRetrieved: logs ? logs.length : 0
        };
        
        this.results.push(result);
        
        console.log(`✅ [${i}] Cycle completed in ${(cycleTotal/1000).toFixed(1)}s`);
        console.log(`   - Execution: ${(executeTime/1000).toFixed(1)}s`);
        console.log(`   - Log retrieval: ${(logTime/1000).toFixed(1)}s`);
        console.log(`   - Font changes: ${fontChanges}, Elements: ${processedElements}`);
        
      } catch (error) {
        const cycleTotal = Date.now() - cycleStart;
        console.error(`❌ [${i}] Cycle failed after ${(cycleTotal/1000).toFixed(1)}s: ${error.message}`);
        
        this.results.push({
          cycle: i,
          executeTime: 0,
          logTime: 0,
          totalTime: cycleTotal,
          success: false,
          error: error.message,
          fontChanges: 0,
          processedElements: 0,
          logsRetrieved: 0
        });
      }
      
      // Brief pause between cycles
      if (i < iterations) {
        console.log('⏸️  Pausing 3 seconds between cycles...');
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
    
    this.printSummary();
  }

  printSummary() {
    console.log('\n📊 BENCHMARK RESULTS SUMMARY');
    console.log('═'.repeat(50));
    
    const successful = this.results.filter(r => r.success);
    const failed = this.results.filter(r => !r.success);
    
    console.log(`🎯 Completed: ${successful.length}/${this.results.length} cycles`);
    
    if (successful.length > 0) {
      const totalTimes = successful.map(r => r.totalTime);
      const executeTimes = successful.map(r => r.executeTime);
      const logTimes = successful.map(r => r.logTime);
      
      const avgTotal = totalTimes.reduce((a, b) => a + b, 0) / totalTimes.length;
      const avgExecute = executeTimes.reduce((a, b) => a + b, 0) / executeTimes.length;
      const avgLog = logTimes.reduce((a, b) => a + b, 0) / logTimes.length;
      
      const minTotal = Math.min(...totalTimes);
      const maxTotal = Math.max(...totalTimes);
      
      console.log('\n⏱️  TIMING ANALYSIS:');
      console.log(`   Average cycle time: ${(avgTotal/1000).toFixed(1)}s`);
      console.log(`   Fastest cycle: ${(minTotal/1000).toFixed(1)}s`);
      console.log(`   Slowest cycle: ${(maxTotal/1000).toFixed(1)}s`);
      console.log(`   Average execution: ${(avgExecute/1000).toFixed(1)}s`);
      console.log(`   Average log retrieval: ${(avgLog/1000).toFixed(1)}s`);
      
      console.log('\n📈 INDIVIDUAL CYCLE TIMES:');
      successful.forEach(result => {
        console.log(`   Cycle ${result.cycle}: ${(result.totalTime/1000).toFixed(1)}s (exec: ${(result.executeTime/1000).toFixed(1)}s, logs: ${(result.logTime/1000).toFixed(1)}s, changes: ${result.fontChanges})`);
      });
      
      // Performance assessment
      const avgSeconds = avgTotal / 1000;
      console.log('\n🎯 PERFORMANCE ASSESSMENT:');
      if (avgSeconds < 30) {
        console.log('   🚀 EXCELLENT: Sub-30 second average cycle time achieved!');
      } else if (avgSeconds < 60) {
        console.log('   ✅ GOOD: Under 1 minute average cycle time');
      } else if (avgSeconds < 120) {
        console.log('   ⚠️  FAIR: 1-2 minute cycle times, room for improvement');
      } else {
        console.log('   ❌ SLOW: >2 minute cycle times, optimization needed');
      }
    }
    
    if (failed.length > 0) {
      console.log('\n❌ FAILED CYCLES:');
      failed.forEach(result => {
        console.log(`   Cycle ${result.cycle}: ${result.error}`);
      });
    }
    
    // Font toggle analysis
    const totalChanges = this.results.reduce((sum, r) => sum + (r.fontChanges || 0), 0);
    console.log(`\n🔤 FONT TOGGLE ANALYSIS:`);
    console.log(`   Total font changes across all cycles: ${totalChanges}`);
    console.log(`   Toggle pattern working: ${totalChanges > 0 ? '✅ YES' : '❌ NO'}`);
  }
}

async function main() {
  const benchmark = new ToggleLoopBenchmark();
  
  try {
    await benchmark.runBenchmark(5);
  } catch (error) {
    console.error('💥 Benchmark failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { ToggleLoopBenchmark };