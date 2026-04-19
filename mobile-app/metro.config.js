const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Find the project and workspace root
const projectRoot = __dirname;
// We want to allow importing from the parent shared folder
const workspaceRoot = path.resolve(projectRoot, '..');
const sharedRoot = path.resolve(workspaceRoot, 'shared');

const config = getDefaultConfig(projectRoot);

// 1. Watch all files within the monorepo and shared folder
config.watchFolders = [workspaceRoot, sharedRoot];

// 2. Let Metro know where to resolve modules and where to look for them
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// 3. Force Metro to resolve modules from the project's node_modules first
config.resolver.disableHierarchicalLookup = true;

module.exports = config;
