# Publishing Your Spotify VS Code Extension

## Two Ways to Ship Your Extension

### Option 1: Package as VSIX (Quick & Easy)
Package your extension as a `.vsix` file that users can install manually.

#### Steps:
1. **Package the extension:**
   ```bash
   vsce package
   ```
   This creates a file like `spotify-vscode-1.0.0.vsix`

2. **Share the VSIX file:**
   - Upload to GitHub Releases
   - Share directly with users
   - Users install via: `code --install-extension spotify-vscode-1.0.0.vsix`
   - Or in VS Code: Extensions → "..." menu → "Install from VSIX..."

---

### Option 2: Publish to VS Code Marketplace (Recommended)
Make your extension available to millions of VS Code users worldwide.

#### Prerequisites:
1. **Create a Publisher Account:**
   - Go to https://marketplace.visualstudio.com/manage
   - Sign in with Microsoft account
   - Create a publisher ID (this should match the "publisher" field in package.json)

2. **Get a Personal Access Token (PAT):**
   - Go to https://dev.azure.com
   - Click on your profile → Security → Personal Access Tokens
   - Click "New Token"
   - Name: "VS Code Extension Publishing"
   - Organization: "All accessible organizations"
   - Scopes: Select "Marketplace" → "Manage"
   - Click "Create"
   - **SAVE THE TOKEN** - you won't see it again!

#### Publishing Steps:

1. **Login to vsce:**
   ```bash
   vsce login andyosyndoh
   ```
   Enter your PAT when prompted.

2. **Publish your extension:**
   ```bash
   vsce publish
   ```
   
   Or publish with a version bump:
   ```bash
   vsce publish patch  # 1.0.0 → 1.0.1
   vsce publish minor  # 1.0.0 → 1.1.0
   vsce publish major  # 1.0.0 → 2.0.0
   ```

3. **Verify publication:**
   - Visit: https://marketplace.visualstudio.com/items?itemName=andyosyndoh.spotify-vscode
   - Takes ~5-10 minutes to appear

---

## Before Publishing Checklist

### 1. Update README.md
Make sure your README includes:
- Clear description of features
- Installation instructions
- Setup guide (Spotify API credentials)
- Screenshots/GIFs showing the extension in action
- Usage examples

### 2. Add an Icon (Optional but Recommended)
Create a 128x128 PNG icon and add to package.json:
```json
"icon": "icon.png"
```

### 3. Add a LICENSE file
```bash
# If you want MIT license
curl -o LICENSE https://raw.githubusercontent.com/licenses/license-templates/master/templates/mit.txt
```
Edit the file to add your name and year.

### 4. Test Your Extension
- Install dependencies: `npm install`
- Compile: `npm run compile`
- Press F5 to test in Extension Development Host
- Test all features thoroughly

### 5. Add .vscodeignore
Create a `.vscodeignore` file to exclude unnecessary files from the package:
```
.vscode/**
.vscode-test/**
src/**
test/**
.gitignore
.env
.env.example
scripts/**
tsconfig.json
**/*.ts
**/*.map
.eslintrc.json
node_modules/**
```

### 6. Version Your Extension
Update version in package.json before each release:
```json
"version": "1.0.0"
```

---

## Updating Your Extension

When you make changes and want to release an update:

1. **Make your changes**
2. **Update version:**
   ```bash
   npm version patch  # or minor, or major
   ```
3. **Publish:**
   ```bash
   vsce publish
   ```

---

## Important Notes

### Security Considerations
- **Never** include your Spotify Client Secret in the extension
- The extension uses OAuth with PKCE (Proof Key for Code Exchange) for security
- Users must authenticate with their own Spotify accounts
- Tokens are stored securely in VS Code's secret storage

### Spotify App Setup for Users
Users will need to:
1. Create their own Spotify Developer app at https://developer.spotify.com/dashboard
2. Add their Client ID to VS Code settings
3. Set redirect URI: `http://127.0.0.1:5500/test/spot.html`

Consider creating a setup guide or wizard to help users with this process.

---

## Troubleshooting

### "Publisher not found" error
- Make sure you created a publisher at https://marketplace.visualstudio.com/manage
- The publisher ID in package.json must match exactly

### "Missing required field" errors
Run `vsce package` first to see what's missing:
```bash
vsce package --no-yarn
```

### Cannot find module errors
Make sure all dependencies are installed:
```bash
npm install
npm run compile
```

---

## Resources

- [VS Code Extension Publishing Guide](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
- [Extension Marketplace](https://marketplace.visualstudio.com/)
- [Publisher Management](https://marketplace.visualstudio.com/manage)
