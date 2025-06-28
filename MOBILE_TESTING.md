# 📱 Mobile Testing Checklist

## Pre-Testing Setup
- [ ] Ensure latest code is deployed to GitHub Pages
- [ ] Local server running for development testing
- [ ] Browser developer tools enabled for debugging

## iOS Safari Testing

### iPhone Testing
- [ ] Open in iOS Safari
- [ ] Check browser detection shows "📱 iPhone"
- [ ] Test "Enable Notifications" button
- [ ] Verify permission prompt appears
- [ ] Test basic notification
- [ ] Test rich notification
- [ ] Test action notification
- [ ] Check haptic feedback (vibration)
- [ ] Test in portrait mode
- [ ] Test in landscape mode
- [ ] Add to Home Screen
- [ ] Test as PWA from home screen

### iPad Testing  
- [ ] Open in iOS Safari on iPad
- [ ] Check browser detection shows "📱 iPad"
- [ ] Verify responsive layout (tablet grid)
- [ ] Test all notification types
- [ ] Test touch interactions
- [ ] Test orientation changes
- [ ] Check console for any errors
- [ ] Test Add to Home Screen functionality

## Android Chrome Testing

### Phone Testing
- [ ] Open in Chrome on Android
- [ ] Check browser detection shows "📱 Android Device"
- [ ] Test notification permissions
- [ ] Test all notification types
- [ ] Check push notification support
- [ ] Test PWA install banner
- [ ] Test offline functionality
- [ ] Verify service worker registration

### Tablet Testing
- [ ] Test on Android tablet
- [ ] Check responsive grid layout
- [ ] Test touch targets (minimum 44px)
- [ ] Verify orientation handling

## Cross-Browser Mobile Testing

### Mobile Firefox
- [ ] Test on Firefox Mobile
- [ ] Check notification support
- [ ] Verify responsive design
- [ ] Test service worker features

### Samsung Internet
- [ ] Test on Samsung Internet browser
- [ ] Check PWA features
- [ ] Test notification functionality

## Performance Testing
- [ ] Page load time < 3 seconds on 3G
- [ ] No JavaScript errors in console
- [ ] Smooth scrolling and interactions
- [ ] Memory usage within reasonable limits
- [ ] Battery usage optimization

## Accessibility Testing
- [ ] Screen reader compatibility
- [ ] Keyboard navigation (where applicable)
- [ ] Color contrast compliance
- [ ] Touch target size compliance (44px minimum)

## User Experience Testing
- [ ] Clear visual feedback on button press
- [ ] Appropriate loading states
- [ ] User-friendly error messages
- [ ] Intuitive notification flow
- [ ] Proper keyboard behavior (no unexpected zoom)

## Debugging Checklist

### Console Logs to Monitor
- [ ] "Mobile device detected, enabling enhanced logging"
- [ ] "PushBell App initializing..." with device info
- [ ] Service worker registration success/failure
- [ ] Permission request results
- [ ] Notification send results
- [ ] Touch and orientation events

### Common Issues to Check
- [ ] "Checking permissions..." stuck state
- [ ] Permission request not appearing
- [ ] Notifications not displaying
- [ ] JavaScript errors preventing initialization
- [ ] CSS viewport issues
- [ ] Touch events not working

## Test URLs
- **GitHub Pages**: https://ntmatthews.github.io/pushbell
- **Local Development**: http://localhost:8080

## Device Test Matrix

### iOS Devices
- [ ] iPhone SE (smallest screen)
- [ ] iPhone 12/13/14 (standard)
- [ ] iPhone 12/13/14 Pro Max (large)
- [ ] iPad (tablet)
- [ ] iPad Pro (large tablet)

### Android Devices
- [ ] Small Android phone (< 5.5")
- [ ] Standard Android phone (5.5" - 6.5")
- [ ] Large Android phone (> 6.5")
- [ ] Android tablet (7" - 10")
- [ ] Large Android tablet (> 10")

## Success Criteria
- [ ] All notification types work on target devices
- [ ] No blocking JavaScript errors
- [ ] Responsive design works across all breakpoints
- [ ] Touch interactions feel natural and responsive
- [ ] PWA features work where supported
- [ ] Performance meets mobile web standards

## Known Limitations
- Action notifications may have limited support on some iOS versions
- PWA features vary by browser and OS version
- Some Android browsers may have notification quota limits
- iOS Safari requires user gesture for permission requests

## Next Steps After Testing
1. Document any device-specific issues found
2. Create browser-specific workarounds if needed
3. Update documentation with tested device list
4. Consider additional optimizations based on test results

---

**Testing Notes:**
- Test with real devices, not just browser dev tools
- Test with slow network conditions (3G simulation)
- Clear browser cache between tests
- Test both fresh installs and returning user scenarios
