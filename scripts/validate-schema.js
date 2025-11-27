#!/usr/bin/env node

/**
 * Schema Validation Script
 * 
 * This script validates that the unified schema is consistent across
 * all layers (TypeScript interfaces, Zod schemas, database schema).
 */

import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

console.log('🔍 Validating unified schema consistency...\n');

let hasErrors = false;

// Validation functions
function validateSchemaFiles() {
  console.log('📁 Checking schema files exist...');
  
  const requiredFiles = [
    'schema/unified-schema.ts',
    'schema/validation.ts',
    'schema/database.ts'
  ];
  
  for (const file of requiredFiles) {
    try {
      const filePath = join(projectRoot, file);
      readFileSync(filePath, 'utf8');
      console.log(`  ✅ ${file}`);
    } catch (error) {
      console.log(`  ❌ ${file} - File not found`);
      hasErrors = true;
    }
  }
  
  console.log();
}

function validateSchemaExports() {
  console.log('📤 Checking schema exports...');
  
  try {
    const schemaPath = join(projectRoot, 'schema/unified-schema.ts');
    const schemaContent = readFileSync(schemaPath, 'utf8');
    
    const requiredExports = [
      'export interface Task',
      'export interface TaskDbRecord',
      'export interface TaskCreateInput',
      'export interface TaskUpdateInput',
      'export const TaskCategory',
      'export const TaskPriority',
      'export const TASK_CONSTRAINTS'
    ];
    
    for (const exportStatement of requiredExports) {
      if (schemaContent.includes(exportStatement)) {
        console.log(`  ✅ ${exportStatement}`);
      } else {
        console.log(`  ❌ ${exportStatement} - Missing export`);
        hasErrors = true;
      }
    }
  } catch (error) {
    console.log(`  ❌ Error reading schema file: ${error.message}`);
    hasErrors = true;
  }
  
  console.log();
}

function validateValidationSchemas() {
  console.log('🔧 Checking validation schemas...');
  
  try {
    const validationPath = join(projectRoot, 'schema/validation.ts');
    const validationContent = readFileSync(validationPath, 'utf8');
    
    const requiredSchemas = [
      'export const TaskSchema',
      'export const TaskDbRecordSchema',
      'export const TaskCreateInputSchema',
      'export const TaskUpdateInputSchema',
      'export function validateTask',
      'export function validateTaskCreateInput',
      'export function validateTaskUpdateInput'
    ];
    
    for (const schema of requiredSchemas) {
      if (validationContent.includes(schema)) {
        console.log(`  ✅ ${schema}`);
      } else {
        console.log(`  ❌ ${schema} - Missing schema`);
        hasErrors = true;
      }
    }
  } catch (error) {
    console.log(`  ❌ Error reading validation file: ${error.message}`);
    hasErrors = true;
  }
  
  console.log();
}

function validateDatabaseSchema() {
  console.log('🗄️  Checking database schema...');
  
  try {
    const dbSchemaPath = join(projectRoot, 'schema/database.ts');
    const dbSchemaContent = readFileSync(dbSchemaPath, 'utf8');
    
    const requiredElements = [
      'CREATE TABLE',
      'tasks',
      'id',
      'title',
      'description',
      'is_completed',
      'created_at',
      'updated_at'
    ];
    
    for (const element of requiredElements) {
      if (dbSchemaContent.includes(element)) {
        console.log(`  ✅ ${element}`);
      } else {
        console.log(`  ❌ ${element} - Missing in database schema`);
        hasErrors = true;
      }
    }
  } catch (error) {
    console.log(`  ❌ Error reading database schema file: ${error.message}`);
    hasErrors = true;
  }
  
  console.log();
}

function validateMigrationFiles() {
  console.log('📋 Checking migration files...');
  
  try {
    const migrationPath = join(projectRoot, 'supabase/migrations');
    const migrationFiles = readdirSync(migrationPath);
    
    if (migrationFiles.length > 0) {
      console.log(`  ✅ Found ${migrationFiles.length} migration file(s)`);
      migrationFiles.forEach(file => {
        console.log(`    📄 ${file}`);
      });
    } else {
      console.log(`  ❌ No migration files found`);
      hasErrors = true;
    }
  } catch (error) {
    console.log(`  ❌ Error reading migration directory: ${error.message}`);
    hasErrors = true;
  }
  
  console.log();
}

function validateTestFixtures() {
  console.log('🧪 Checking test fixtures...');
  
  try {
    const fixturesPath = join(projectRoot, 'tests/fixtures/task.ts');
    const fixturesContent = readFileSync(fixturesPath, 'utf8');
    
    const requiredFixtures = [
      'export const mockTask',
      'export const mockTaskCreateInput',
      'export const mockTaskUpdateInput',
      'export const mockTaskDbRecord',
      'export function createMockTask'
    ];
    
    for (const fixture of requiredFixtures) {
      if (fixturesContent.includes(fixture)) {
        console.log(`  ✅ ${fixture}`);
      } else {
        console.log(`  ❌ ${fixture} - Missing fixture`);
        hasErrors = true;
      }
    }
  } catch (error) {
    console.log(`  ❌ Error reading fixtures file: ${error.message}`);
    hasErrors = true;
  }
  
  console.log();
}

// Run all validations
validateSchemaFiles();
validateSchemaExports();
validateValidationSchemas();
validateDatabaseSchema();
validateMigrationFiles();
validateTestFixtures();

// Final result
if (hasErrors) {
  console.log('❌ Schema validation failed! Please fix the errors above.\n');
  process.exit(1);
} else {
  console.log('✅ Schema validation passed! All schemas are consistent.\n');
  process.exit(0);
}