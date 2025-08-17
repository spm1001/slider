#!/usr/bin/env node

const fs = require('fs');
require('dotenv').config();

console.log('🔒 OAuth Scope Security Audit');
console.log('==============================');

// Current scopes in our deployment script
const deploymentScript = fs.readFileSync('deploy-web-manual.js', 'utf8');
const scopeMatch = deploymentScript.match(/requiredScopes = \[(.*?)\]/s);

if (scopeMatch) {
  const scopeText = scopeMatch[1];
  const currentScopes = scopeText
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.startsWith("'https://"))
    .map(line => line.replace(/[',]/g, ''));

  console.log('\n📋 Currently Configured OAuth Scopes:');
  console.log('────────────────────────────────────');
  
  currentScopes.forEach((scope, i) => {
    console.log(`${i + 1}. ${scope}`);
  });

  console.log('\n🔍 Scope Analysis:');
  console.log('─────────────────');

  const scopeAnalysis = [
    {
      scope: 'https://www.googleapis.com/auth/drive',
      category: '🔧 CORE',
      purpose: 'Access Drive files for Apps Script deployment',
      required: true,
      note: 'Essential for script project management'
    },
    {
      scope: 'https://www.googleapis.com/auth/drive.scripts',
      category: '❓ REVIEW',
      purpose: 'Legacy Apps Script file management',
      required: false,
      note: 'May be redundant with script.projects - TEST REMOVAL'
    },
    {
      scope: 'https://www.googleapis.com/auth/script.projects',
      category: '🔧 CORE',
      purpose: 'Create/update Apps Script projects',
      required: true,
      note: 'Essential for automated deployment'
    },
    {
      scope: 'https://www.googleapis.com/auth/presentations',
      category: '📊 FEATURE',
      purpose: 'Read/modify Google Slides presentations',
      required: true,
      note: 'Core functionality - font swapping'
    },
    {
      scope: 'https://www.googleapis.com/auth/spreadsheets',
      category: '📊 FEATURE',
      purpose: 'Read/modify Google Sheets (future charts)',
      required: false,
      note: 'Phase 2+ feature - could be removed for minimal setup'
    },
    {
      scope: 'https://www.googleapis.com/auth/logging.read',
      category: '🔍 DEBUG',
      purpose: 'Access detailed execution logs',
      required: false,
      note: 'Development convenience - not production essential'
    },
    {
      scope: 'https://www.googleapis.com/auth/script.processes',
      category: '🔍 DEBUG',
      purpose: 'View execution history and metadata',
      required: false,
      note: 'Development convenience - basic execution works without it'
    }
  ];

  scopeAnalysis.forEach(analysis => {
    const hasScope = currentScopes.some(scope => scope === analysis.scope);
    const status = hasScope ? '✅ PRESENT' : '⚪ ABSENT';
    
    console.log(`\n${analysis.category} ${status}`);
    console.log(`Scope: ${analysis.scope}`);
    console.log(`Purpose: ${analysis.purpose}`);
    console.log(`Required: ${analysis.required ? 'YES' : 'NO'}`);
    console.log(`Note: ${analysis.note}`);
  });

  console.log('\n🎯 Recommended Scope Sets:');
  console.log('──────────────────────────');

  console.log('\n📦 MINIMAL (Production Ready):');
  console.log('• https://www.googleapis.com/auth/drive');
  console.log('• https://www.googleapis.com/auth/script.projects');
  console.log('• https://www.googleapis.com/auth/presentations');

  console.log('\n🔬 DEVELOPMENT (With Debugging):');
  console.log('• https://www.googleapis.com/auth/drive');
  console.log('• https://www.googleapis.com/auth/script.projects');
  console.log('• https://www.googleapis.com/auth/presentations');
  console.log('• https://www.googleapis.com/auth/logging.read');

  console.log('\n🚀 FULL FEATURED (All Phases):');
  console.log('• https://www.googleapis.com/auth/drive');
  console.log('• https://www.googleapis.com/auth/script.projects');
  console.log('• https://www.googleapis.com/auth/presentations');
  console.log('• https://www.googleapis.com/auth/spreadsheets');
  console.log('• https://www.googleapis.com/auth/logging.read');

  console.log('\n⚠️  SECURITY RECOMMENDATIONS:');
  console.log('────────────────────────────');
  console.log('1. Test with MINIMAL scope set first');
  console.log('2. Remove drive.scripts if script.projects works alone');
  console.log('3. Consider separate dev/prod OAuth clients');
  console.log('4. Remove spreadsheets scope until Phase 2');
  console.log('5. Document which features break without each scope');

  console.log('\n🔧 NEXT ACTIONS:');
  console.log('───────────────');
  console.log('1. Create minimal-scopes branch for testing');
  console.log('2. Test core functionality with minimal scopes');
  console.log('3. Document scope requirements per feature');
  console.log('4. Consider service account for server deployments');

} else {
  console.log('❌ Could not parse scopes from deploy-web-manual.js');
}

console.log('\n💡 OAuth Best Practices:');
console.log('────────────────────────');
console.log('• Start with minimal scopes and expand as needed');
console.log('• Use separate OAuth clients for dev vs prod');  
console.log('• Document which features require which scopes');
console.log('• Regular scope audits (quarterly recommended)');
console.log('• Consider service accounts for automation');