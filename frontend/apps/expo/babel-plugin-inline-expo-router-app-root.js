/**
 * Babel plugin to inline Expo Router environment variables
 * This is needed because require.context() requires string literals, not variables
 * 
 * The key insight: require.context() paths are relative to the FILE being transformed,
 * NOT relative to the project root. So we need to calculate the correct relative path
 * from node_modules/expo-router/_ctx.web.js to the actual app directory.
 */

const nodePath = require('path');

let hasLoggedTransform = false;

module.exports = function ({ types: t }) {
  return {
    name: 'inline-expo-router-env-vars',
    visitor: {
      MemberExpression(path, state) {
        // Only transform expo-router's internal files
        const filename = this.file?.opts?.filename || state.filename || '';
        // Normalize path separators for Windows compatibility
        const normalizedFilename = filename.replace(/\\/g, '/');
        
        // Skip if this is NOT an expo-router node_modules file
        if (!normalizedFilename.includes('node_modules/expo-router')) {
          return;
        }
        
        // Match process.env.*
        if (
          path.node.object &&
          t.isMemberExpression(path.node.object) &&
          path.node.object.object &&
          t.isIdentifier(path.node.object.object, { name: 'process' }) &&
          path.node.object.property &&
          t.isIdentifier(path.node.object.property, { name: 'env' }) &&
          path.node.property &&
          t.isIdentifier(path.node.property)
        ) {
          const envVarName = path.node.property.name;
          
          // Handle EXPO_ROUTER_APP_ROOT
          if (envVarName === 'EXPO_ROUTER_APP_ROOT') {
            // Get the directory of the file being transformed
            const fileDir = nodePath.dirname(filename);
            
            // The app directory (where routes are) - this is typically __dirname + '/app' in the expo app
            // We need to find the project root (where app.json is) and then add /app
            // The _ctx files are in node_modules/expo-router/, so we go up to find the project
            
            // Find the expo app root by looking for the app directory relative to node_modules
            // node_modules/expo-router/_ctx.web.js -> ../../app
            const match = normalizedFilename.match(/^(.+?)\/node_modules\/expo-router\//);
            if (match) {
              const projectRoot = match[1];
              const appDir = nodePath.join(projectRoot, 'app');
              
              // Calculate relative path from the _ctx file to the app directory
              let relativePath = nodePath.relative(fileDir, appDir).replace(/\\/g, '/');
              
              // Ensure it starts with ./ for require.context
              if (!relativePath.startsWith('.') && !relativePath.startsWith('/')) {
                relativePath = './' + relativePath;
              }
              
              if (!hasLoggedTransform) {
                console.log(`[babel-plugin] Transforming EXPO_ROUTER_APP_ROOT:`);
                console.log(`  File: ${normalizedFilename.split('/').slice(-3).join('/')}`);
                console.log(`  Project root: ${projectRoot.split('/').slice(-3).join('/')}`);
                console.log(`  Relative path: '${relativePath}'`);
                hasLoggedTransform = true;
              }
              
              path.replaceWith(t.stringLiteral(relativePath));
            } else {
              // Fallback - shouldn't happen but just in case
              const value = process.env.EXPO_ROUTER_APP_ROOT || './app';
              console.warn(`[babel-plugin] Could not determine project root, using fallback: '${value}'`);
              path.replaceWith(t.stringLiteral(value));
            }
          }
          // Handle EXPO_ROUTER_IMPORT_MODE
          else if (envVarName === 'EXPO_ROUTER_IMPORT_MODE') {
            const value = process.env.EXPO_ROUTER_IMPORT_MODE || 'sync';
            path.replaceWith(t.stringLiteral(value));
          }
        }
      },
    },
  };
};

