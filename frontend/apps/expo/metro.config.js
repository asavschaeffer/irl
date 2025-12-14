const { getDefaultConfig } = require('expo/metro-config');
let findYarnWorkspaceRoot;
try {
  // Optional: only works when using Yarn workspaces (yarn.lock present)
  // eslint-disable-next-line import/no-extraneous-dependencies
  findYarnWorkspaceRoot = require('find-yarn-workspace-root');
} catch (_) {
  findYarnWorkspaceRoot = null;
}
const { withNativeWind } = require('nativewind/metro');
const { withUnitools } = require('@unitools/metro-config');
const path = require('path');
const fs = require('fs');

function findNpmWorkspaceRoot(startDir) {
  let dir = startDir;
  // Walk up until we find a package.json with "workspaces" (npm/pnpm/yarn all use this field)
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const pkgPath = path.join(dir, 'package.json');
    if (fs.existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
        if (pkg && pkg.workspaces) return dir;
      } catch (_) {
        // ignore JSON errors and keep walking up
      }
    }

    const parent = path.dirname(dir);
    if (!parent || parent === dir) return startDir;
    dir = parent;
  }
}

// Ensure EXPO_PUBLIC_* vars from this app's `.env` are available to Metro/NativeWind during bundling.
// In some monorepo/Windows setups Expo's automatic env loading can be unreliable.
try {
  // eslint-disable-next-line import/no-extraneous-dependencies
  require('dotenv').config({ path: path.join(__dirname, '.env') });
} catch (_) {}

// eslint-disable-next-line no-undef
const workspaceRoot =
  (findYarnWorkspaceRoot && findYarnWorkspaceRoot(__dirname)) ||
  findNpmWorkspaceRoot(__dirname);
// Find the project and workspace directories
// eslint-disable-next-line no-undef
const projectRoot = __dirname;

const config = getDefaultConfig(projectRoot);
config.transformer.unstable_allowRequireContext = true;
config.watchFolders = workspaceRoot ? [workspaceRoot] : [];

// 2. Let Metro know where to resolve packages and in what order
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  ...(workspaceRoot ? [path.resolve(workspaceRoot, 'node_modules')] : []),
];
// Critical for monorepos on web:
// Prevent Metro from walking up directory trees and accidentally resolving a *second* copy of react/react-dom
// from workspace packages' own node_modules (which causes "Invalid hook call" / dispatcher is null).
config.resolver.disableHierarchicalLookup = true;

// Force a single React/ReactDOM/React-Native instance from the workspace root.
config.resolver.extraNodeModules = {
  react: path.resolve((workspaceRoot || projectRoot), 'node_modules/react'),
  'react-dom': path.resolve((workspaceRoot || projectRoot), 'node_modules/react-dom'),
  'react-native': path.resolve((workspaceRoot || projectRoot), 'node_modules/react-native'),
  // Ensure scheduler also comes from the same tree (common culprit in hook-call issues on web)
  scheduler: path.resolve((workspaceRoot || projectRoot), 'node_modules/scheduler'),
};

// Add workspace packages to resolver - help Metro find @app-launch-kit packages
// Use a custom resolver function to handle subpaths correctly
const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Handle @app-launch-kit workspace packages
  if (moduleName.startsWith('@app-launch-kit/')) {
    const parts = moduleName.split('/');
    const packageName = parts.slice(0, 2).join('/'); // e.g., '@app-launch-kit/modules'
    let subPath = parts.slice(2).join('/'); // e.g., 'aux/components/PrivacyPolicy'
    
    // Fix common path mismatches
    if (subPath.startsWith('aux/')) {
      subPath = subPath.replace('aux/', 'auxiliary/');
    }
    
    const packageMap = {
      '@app-launch-kit/components': path.resolve(workspaceRoot, 'packages/components'),
      '@app-launch-kit/modules': path.resolve(workspaceRoot, 'packages/modules'),
      '@app-launch-kit/utils': path.resolve(workspaceRoot, 'packages/utils'),
      '@app-launch-kit/config': path.resolve(workspaceRoot, 'packages/config'),
      '@app-launch-kit/assets': path.resolve(workspaceRoot, 'packages/assets'),
    };
    
    if (packageMap[packageName]) {
      const packagePath = packageMap[packageName];
      const fullPath = subPath 
        ? path.resolve(packagePath, subPath)
        : packagePath;
      
      // Try to resolve the file
      const extensions = ['', '.ts', '.tsx', '.js', '.jsx', '.json'];
      for (const ext of extensions) {
        const tryPath = fullPath + ext;
        if (require('fs').existsSync(tryPath)) {
          return {
            filePath: tryPath,
            type: 'sourceFile',
          };
        }
      }
      
      // If no file found, try as directory with index
      for (const ext of extensions) {
        const tryPath = path.join(fullPath, 'index' + ext);
        if (require('fs').existsSync(tryPath)) {
          return {
            filePath: tryPath,
            type: 'sourceFile',
          };
        }
      }
    }
  }
  
  // Fall back to default resolver
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

// Add workspace packages to resolver
config.resolver.sourceExts = [...(config.resolver.sourceExts || []), 'css'];
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Apply NativeWind first, then Unitools
// Use absolute paths normalized to forward slashes for Windows compatibility
// NativeWind has issues with Windows backslashes in paths
const globalsCssPath = path.resolve(projectRoot, 'globals.css').replace(/\\/g, '/');
const tailwindConfigPath = path.resolve(projectRoot, 'tailwind.config.js').replace(/\\/g, '/');

const configWithNativeWind = withNativeWind(config, {
  input: globalsCssPath,
  inlineRem: 16,
  configPath: tailwindConfigPath,
});

// Work around NativeWind Windows + web bug:
// nativewind/dist/metro/transformer.js generates: require('${config.nativewind.output}');
// If output contains backslashes (C:\Users\...), JS interprets \U, \f, etc as escapes -> broken path.
// Using forward slashes keeps the path valid on Windows and Metro can resolve it.
if (configWithNativeWind?.transformer?.nativewind?.output) {
  configWithNativeWind.transformer.nativewind.output =
    configWithNativeWind.transformer.nativewind.output.replace(/\\/g, '/');
}
if (configWithNativeWind?.transformer?.nativewind?.input) {
  configWithNativeWind.transformer.nativewind.input =
    configWithNativeWind.transformer.nativewind.input.replace(/\\/g, '/');
}

// Ensure NativeWind output directory exists (avoids occasional first-run issues)
try {
  const out = configWithNativeWind?.transformer?.nativewind?.output;
  if (out) {
    const outDir = path.dirname(out.replace(/\//g, path.sep));
    fs.mkdirSync(outDir, { recursive: true });
  }
} catch (_) {}

module.exports = withUnitools(configWithNativeWind);
