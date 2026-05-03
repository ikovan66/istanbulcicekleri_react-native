// .vscode/launchReactNative.js

const { execSync } = require('child_process');

try {
    execSync('npx react-native run-ios', { stdio: 'inherit' });
} catch (error) {
    console.error('Failed to run React Native command:', error.message);
    process.exit(1);
}
