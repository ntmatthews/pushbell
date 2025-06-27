# PushBell 🔔

A comprehensive cross-browser notification API demo that showcases the Web Notifications API with enhanced features and fallbacks for maximum compatibility.

## Features

- ✅ **Cross-Browser Compatibility** - Works on Chrome, Firefox, Safari, Edge, and Opera
- ✅ **Service Worker Integration** - Enhanced notifications with action buttons
- ✅ **Rich Notifications** - Support for images, badges, and custom styling
- ✅ **Action Buttons** - Interactive notifications with custom actions
- ✅ **Permission Management** - Graceful permission request handling
- ✅ **Fallback Support** - In-app notifications when browser notifications are blocked
- ✅ **Real-time Compatibility Display** - Shows what features work in your browser
- ✅ **Activity Logging** - Track all notification events
- ✅ **Responsive Design** - Beautiful UI that works on all devices
- ✅ **Progressive Web App** - Offline support with service worker caching

## Live Demo

Visit the live demo: [https://yourusername.github.io/pushbell](https://yourusername.github.io/pushbell)

## Browser Support

| Browser | Basic Notifications | Rich Notifications | Action Buttons | Service Worker |
|---------|-------------------|-------------------|----------------|----------------|
| Chrome | ✅ | ✅ | ✅ | ✅ |
| Firefox | ✅ | ✅ | ✅ | ✅ |
| Safari | ✅ | ⚠️ | ❌ | ❌ |
| Edge | ✅ | ✅ | ✅ | ✅ |
| Opera | ✅ | ✅ | ✅ | ✅ |

**Legend:**
- ✅ Full support
- ⚠️ Partial support
- ❌ Not supported

## Quick Start

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/pushbell.git
   cd pushbell
   ```

2. **Serve the files:**
   - For development: Use any local server (Live Server extension in VS Code, Python's `http.server`, etc.)
   - For production: Deploy to GitHub Pages, Netlify, or any static hosting service

3. **Open in browser:**
   - Navigate to `http://localhost:3000` (or your local server address)
   - Click "Request Permission" to enable notifications
   - Test different notification types!

## Usage

### Basic Notification
```javascript
const api = new NotificationAPI();
await api.requestPermission();
await api.showBasicNotification('Hello!', {
    body: 'This is a basic notification'
});
```

### Rich Notification with Image
```javascript
await api.showRichNotification('Rich Notification', {
    body: 'This notification has an image',
    image: 'path/to/image.jpg',
    requireInteraction: true
});
```

### Action Notification
```javascript
await api.showActionNotification('Choose Action', {
    body: 'Click one of the action buttons',
    actions: [
        { action: 'yes', title: 'Yes' },
        { action: 'no', title: 'No' }
    ]
});
```

## API Reference

### NotificationAPI Class

#### Methods

- `requestPermission()` - Request notification permission
- `showBasicNotification(title, options)` - Show basic notification
- `showRichNotification(title, options)` - Show notification with enhanced features
- `showActionNotification(title, options)` - Show notification with action buttons
- `showCustomNotification(title, options)` - Show fully customized notification

#### Properties

- `isSupported` - Object containing feature support information
- `permission` - Current permission status ('granted', 'denied', 'default')

#### Events

- `onPermissionChange(permission)` - Called when permission status changes
- `onNotificationClick(event, notification)` - Called when notification is clicked
- `onNotificationClose(event, notification)` - Called when notification is closed
- `onNotificationError(event, notification)` - Called when notification error occurs
- `onFallbackNotification(fallback)` - Called when fallback notification is shown

## Notification Options

| Option | Type | Description | Browser Support |
|--------|------|-------------|-----------------|
| `body` | string | Notification message | All |
| `icon` | string | Icon URL | All |
| `badge` | string | Badge URL | Chrome, Edge, Opera |
| `image` | string | Large image URL | Chrome, Firefox, Edge, Opera |
| `tag` | string | Notification identifier | All |
| `requireInteraction` | boolean | Keep notification until user interacts | Chrome, Firefox, Edge, Opera |
| `silent` | boolean | Suppress notification sound | All |
| `renotify` | boolean | Alert for same tag | All |
| `timestamp` | number | Notification timestamp | All |
| `actions` | array | Action buttons | Chrome, Firefox, Edge, Opera (Service Worker only) |
| `vibrate` | array | Vibration pattern | Chrome, Firefox, Edge, Opera (mobile) |

## Development

### Project Structure
```
pushbell/
├── index.html          # Main HTML file
├── styles.css          # CSS styles
├── app.js             # Main application logic
├── notification-api.js # Notification API wrapper
├── sw.js              # Service worker
└── README.md          # This file
```

### Local Development

1. Install a local server:
   ```bash
   # Using Node.js
   npx http-server
   
   # Using Python 3
   python -m http.server 8000
   
   # Using VS Code Live Server extension
   # Right-click index.html → "Open with Live Server"
   ```

2. Open in browser and test notifications

### Testing

- Test on different browsers to verify compatibility
- Test with notifications enabled/disabled
- Test offline functionality
- Test action button interactions
- Verify service worker caching

## Deployment

### GitHub Pages

1. Push code to GitHub repository
2. Go to repository Settings → Pages
3. Select source branch (usually `main`)
4. Your site will be available at `https://yourusername.github.io/pushbell`

### Other Platforms

- **Netlify**: Drag and drop the folder or connect your GitHub repo
- **Vercel**: Import your GitHub repository
- **Surge**: `npm install -g surge && surge`

## Browser Compatibility Notes

### Chrome/Edge/Opera
- Full feature support including service worker notifications
- Action buttons work in persistent notifications
- Badge and image support

### Firefox
- Good support for most features
- Action buttons work with service worker
- No badge support
- Image support available

### Safari
- Basic notification support only
- No service worker notification support
- No action buttons or rich media
- Limited customization options

### Fallback Handling

When notifications are not supported or permission is denied:
- In-app toast notifications are shown
- Visual indicators update accordingly
- Full functionality remains available through UI

## Security Considerations

- Notifications require user permission
- HTTPS required for service workers in production
- Icons and images should be served from same origin when possible
- Validate all user input for custom notifications

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and test thoroughly
4. Commit your changes: `git commit -am 'Add feature'`
5. Push to the branch: `git push origin feature-name`
6. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Web Notifications API](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API) documentation
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API) documentation
- Font Awesome for icons
- All browser vendors for implementing notification standards

## Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/yourusername/pushbell/issues) page
2. Create a new issue with:
   - Browser and version
   - Steps to reproduce
   - Expected vs actual behavior
   - Console errors (if any)

---

Made with ❤️ for the web development community. Happy coding! 🚀
