# 🎲 BoardGame Timer PWA

**Professional Progressive Web App for boardgame timing with dual modes, custom settings, and native mobile experience.**

[![PWA Ready](https://img.shields.io/badge/PWA-Ready-brightgreen)](https://web.dev/progressive-web-apps/)
[![Mobile Optimized](https://img.shields.io/badge/Mobile-Optimized-blue)](https://developers.google.com/web/fundamentals/design-and-ux/responsive/)
[![Offline Support](https://img.shields.io/badge/Offline-Support-orange)](https://developers.google.com/web/fundamentals/instant-and-offline/offline-cookbook/)

## ✨ Features

### 🎯 **Dual Timer Modes**
- **Mode 1**: Track total time per player (unlimited)
- **Mode 2**: Dual countdown timers (turn + round timing)
- **Custom Templates**: Quick/Standard/Long/Custom timing
- **Overtime Detection**: Visual and audio alerts

### 👥 **Player Management**
- **2-8 Players** with unique names and colors
- **Dynamic Add/Remove** players during setup
- **Color Validation** prevents duplicates
- **Touch-Optimized** interface for mobile

### 📱 **Progressive Web App**
- **Install as Native App** on mobile and desktop
- **Works Completely Offline** after installation
- **Screen Wake Lock** prevents sleep during games
- **Full Screen Mode** when launched from home screen

### 🎨 **Advanced UI/UX**
- **Dark/Light Themes** with system preference detection
- **Sound Effects** for turn changes and game events
- **Haptic Feedback** (vibration) on mobile devices
- **Smooth Animations** and micro-interactions
- **Professional Typography** with Inter font

### 💾 **Smart Persistence**
- **Auto-Save** game state every second
- **Resume Interrupted Games** after browser refresh
- **Local Storage** for offline data persistence
- **No Data Loss** during unexpected interruptions

## 🚀 Quick Start

### **Option 1: Python Server (Recommended)**
```bash
# Clone repository
git clone https://github.com/kuettai/boardgame-timer.git
cd boardgame-timer

# Start server
python simple-server.py

# Open browser
open http://localhost:8000
```

### **Option 2: Any HTTP Server**
```bash
# Using Python 3
python -m http.server 8000 --directory frontend

# Using Node.js (if you have it)
npx serve frontend

# Using PHP
php -S localhost:8000 -t frontend
```

### **📱 Mobile Installation**
1. Open the app in **Safari** (iOS) or **Chrome** (Android)
2. Tap **"Add to Home Screen"** or look for install prompt
3. Launch from home screen for full native experience

## 🎮 Usage Examples

### **Quick Games (15-30 second turns)**
- Select **Mode 2** → **Quick Template**
- Perfect for speed games like **Azul** or **Splendor**

### **Strategy Games (1-2 minute turns)**
- Select **Mode 2** → **Standard Template**
- Great for **Wingspan**, **Scythe**, or **Terraforming Mars**

### **Tournament Play**
- Select **Mode 2** → **Custom Timers**
- Set exact timing requirements
- Professional tournament-ready precision

### **Casual Time Tracking**
- Select **Mode 1**
- Simple time tracking without pressure
- Perfect for learning new games

## 🏗️ Project Structure

```
boardgame-timer/
├── frontend/
│   ├── index.html              # Main app structure
│   ├── css/
│   │   ├── main.css            # Base styles + responsive
│   │   ├── setup.css           # Player setup styles
│   │   ├── animations.css      # Visual effects
│   │   ├── themes.css          # Dark/light themes
│   │   └── polish.css          # Advanced visual polish
│   ├── js/
│   │   ├── app.js              # Main app + PWA controls
│   │   ├── player-setup.js     # Player management
│   │   ├── timer-engine.js     # Core timer logic
│   │   ├── countdown-timer.js  # Mode 2 implementation
│   │   ├── game-timer.js       # UI management
│   │   ├── ui-effects.js       # Visual animations
│   │   ├── storage-manager.js  # Local persistence
│   │   ├── wake-lock.js        # Screen wake lock
│   │   ├── theme-manager.js    # Theme system
│   │   ├── sound-manager.js    # Audio feedback
│   │   └── haptic-manager.js   # Vibration feedback
│   ├── assets/                 # App icons
│   ├── manifest.json           # PWA manifest
│   └── sw.js                   # Service worker
├── simple-server.py           # Python development server
├── FINAL_CHECKPOINT.md        # Complete development log
└── README.md                  # This file
```

## 🛠️ Technical Details

### **Performance**
- **200ms Timer Precision** for smooth display updates
- **GPU-Accelerated Animations** running at 60fps
- **Efficient Service Worker** caching for instant loading
- **Optimized Bundle Size** with no external dependencies

### **Compatibility**
- ✅ **Chrome/Edge** (desktop & mobile)
- ✅ **Firefox** (desktop & mobile)
- ✅ **Safari** (desktop & mobile)
- ✅ **PWA Support** on iOS and Android
- ✅ **Responsive Design** (320px to 4K displays)

### **Accessibility**
- **WCAG 2.1 Compliant** color contrast
- **Keyboard Navigation** support
- **Screen Reader** friendly
- **Touch Target** minimum 44px for mobile
- **Focus Management** for better UX

## 🎯 Roadmap

### **Completed ✅**
- [x] Dual timer modes with custom settings
- [x] PWA with offline support and installation
- [x] Dark/light themes with system detection
- [x] Sound effects and haptic feedback
- [x] Advanced UI polish and animations
- [x] Local data persistence and recovery

### **Future Enhancements 🚀**
- [ ] **Game Statistics & History** - Track performance over time
- [ ] **Template Library** - Presets for popular boardgames
- [ ] **Cloud Sync** - Multi-device synchronization
- [ ] **Template Sharing** - Community template exchange

## 🤝 Contributing

Contributions are welcome! Please read `FINAL_CHECKPOINT.md` for development context and current status.

### **Development Setup**
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly on mobile and desktop
5. Submit a pull request

## 📄 License

MIT License - feel free to use this for your boardgame sessions!

## 🎲 Perfect For

- **Board Game Cafes** - Professional timing solution
- **Tournament Organizers** - Reliable and customizable
- **Game Groups** - Easy setup and mobile-friendly
- **Solo Gamers** - Track your improvement over time
- **Game Designers** - Playtest timing analysis

---

**Built with ❤️ for the boardgaming community**

*Transform your boardgame sessions with professional timing that works anywhere, anytime.*