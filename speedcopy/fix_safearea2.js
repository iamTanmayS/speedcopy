const fs = require('fs');

const files = [
  'src/screens/home/ModeSwitchScreen.tsx',
  'src/screens/editor/EditorScreen.tsx',
  'src/screens/auth/ProfileSetupScreen.tsx',
  'src/screens/auth/OTPScreen.tsx',
  'src/screens/auth/LoginScreen.tsx',
  'src/components/common/ScreenWrapper.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // check if SafeAreaView is imported
  const hasImport = /import\s+.*SafeAreaView.*\s+from/.test(content);
  
  if (!hasImport) {
    if (content.includes("'react-native-safe-area-context'")) {
      content = content.replace(/import\s*\{([^}]+)\}\s*from\s*'react-native-safe-area-context';/, "import { SafeAreaView, $1 } from 'react-native-safe-area-context';");
    } else {
      content = "import { SafeAreaView } from 'react-native-safe-area-context';\n" + content;
    }
    fs.writeFileSync(file, content);
    console.log('Fixed syntax in', file);
  }
});
