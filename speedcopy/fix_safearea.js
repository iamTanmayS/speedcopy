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
  
  // Basic RegExp to remove SafeAreaView from react-native imports
  if (content.includes("SafeAreaView")) {
      // If it exists in react-native import
      if (content.includes("'react-native'")) {
          // Replace Exact Match if it is isolated
          content = content.replace(/import\s*\{\s*SafeAreaView\s*\}\s*from\s*'react-native';/, '');
          
          // Or if it is listed with other imports
          content = content.replace(/SafeAreaView\s*,\s*/g, '');
          content = content.replace(/,\s*SafeAreaView(?=\s*\})/g, '');
          
          // Also, if it was the only one and we stripped it out leaving empty brackets
          content = content.replace(/import\s*\{\s*\}\s*from\s*'react-native';\n?/g, '');
      }

      // Add it to react-native-safe-area-context
      if (!content.includes("'react-native-safe-area-context'")) {
          content = "import { SafeAreaView } from 'react-native-safe-area-context';\n" + content;
      } else if (!content.includes("SafeAreaView") && content.includes("'react-native-safe-area-context'")) {
          content = content.replace(/import\s*\{([^}]+)\}\s*from\s*'react-native-safe-area-context';/, "import { SafeAreaView, $1 } from 'react-native-safe-area-context';");
      }
      
      fs.writeFileSync(file, content);
      console.log('Fixed', file);
  }
});
