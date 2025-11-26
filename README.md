# GUIDify - Chrome Extension

A powerful Chrome extension that generates multiple GUIDs (Globally Unique Identifiers) instantly. Download as file or copy to clipboard. Perfect for developers!

## Features

- **Bulk Generation**: Generate up to 100,000 GUIDs at once
- **Dual Actions**: Download as .txt file or copy to clipboard
- **Case Formatting**: Choose between lowercase or UPPERCASE format
- **Form Helper**: Quick GUID upload button for file input fields on web pages
- **Persistent Settings**: Your preferences are saved and synced across devices
- **Unique Filenames**: Timestamp-based filenames prevent overwrites
- **Modern UI**: Clean, dark-themed interface with smooth animations

## Installation

### From Chrome Web Store
[Coming Soon]

### Manual Installation (Developer Mode)
1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked"
5. Select the extension directory

## Usage

### Popup Interface
1. Click the GUIDify icon in your toolbar
2. Enter the number of GUIDs (1-100,000)
3. Choose case format (lowercase/UPPERCASE)
4. Click "Download File" to save as .txt or "Copy to Clipboard" to copy

### Web Page Integration
When enabled in settings, a "Load GUIDs" button appears next to file upload fields:
1. Click the button next to any file input
2. Enter the number of GUIDs
3. GUIDs are automatically generated and uploaded to the form

## Settings

Access settings by clicking the gear icon in the popup or from the extension menu:
- **Form Helper**: Enable/disable the GUID upload button on web pages
- **Default Case Format**: Set your preferred case format (lowercase/UPPERCASE)

## Privacy

GUIDify does not collect, store, or transmit any personal data. All GUID generation happens locally in your browser. Settings are stored locally using Chrome's sync storage.

## Technical Details

- **GUID Format**: RFC 4122 compliant UUIDs (version 4)
- **Example**: `a1b2c3d4-e5f6-4789-a012-b3c4d5e6f7a8`
- **Randomness**: Uses cryptographically secure random number generation

## Development

### Running Tests
```bash
npm test
```

### File Structure
- `manifest.json`: Chrome extension manifest
- `popup.html/css/js`: Main popup interface
- `options.html/css/js`: Settings page
- `about.html/css`: About page
- `contentScript.js`: Web page integration
- `background.js`: Service worker for downloads
- `src/guidGenerator.js`: GUID generation logic
- `icons/`: Extension icons
- `tests/`: Unit tests

## Support

- **Website**: [canaktepe.com](https://canaktepe.com)
- **GitHub**: [github.com/canaktepe](https://github.com/canaktepe)
- **Sponsor**: [GitHub Sponsors](https://github.com/sponsors/canaktepe)

## License

© 2024 GUIDify by Can Aktepe. All rights reserved.

---

Made with ❤️ for developers who need GUIDs
