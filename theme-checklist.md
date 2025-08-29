# 🎨 BoardGame Timer Theme Creation Checklist

## 📋 **Theme Development Process**

### **1. Theme Concept & Planning**
- [ ] Choose game with strong visual identity
- [ ] Define color palette (3-5 main colors)
- [ ] Select theme-appropriate icons/emojis
- [ ] Plan unique background pattern/texture
- [ ] Ensure contrast with existing themes

### **2. CSS Theme Variables Setup**
```css
[data-theme="themename"] {
    --bg-primary: /* Main background */
    --bg-secondary: /* Card/panel backgrounds */
    --bg-tertiary: /* Input/tertiary backgrounds */
    --text-primary: /* Main text color */
    --text-secondary: /* Secondary text */
    --text-muted: /* Muted text */
    --border-color: /* Border colors */
    --accent-primary: /* Primary accent */
    --accent-secondary: /* Secondary accent */
    --success-color: /* Success states */
    --warning-color: /* Warning states */
    --error-color: /* Error states */
}
```

### **3. Background Design**
- [ ] Create unique body background pattern
- [ ] Use gradients, repeating patterns, or textures
- [ ] Ensure readability over background
- [ ] Test on different screen sizes

### **4. Text Visibility (CRITICAL)**
**Homepage Elements:**
- [ ] Section titles (h2, h3)
- [ ] Radio button labels (unselected)
- [ ] Selected radio button labels (remove shadows)
- [ ] Player numbering (1,2,3 and count)
- [ ] Player name inputs
- [ ] Custom timer labels and inputs
- [ ] Footer text and version info

**Game Screen Elements:**
- [ ] Current player display
- [ ] Timer values
- [ ] Game duration
- [ ] Player time panels
- [ ] Keyboard hints
- [ ] Turn history elements

**Text Shadow Formula:**
```css
text-shadow: 
    0 0 8px rgba(accent-color, 1),     /* Glow */
    0 0 4px rgba(0, 0, 0, 1),          /* Outline */
    0 2px 4px rgba(0, 0, 0, 0.8);     /* Drop shadow */
```

### **5. Component Styling**
- [ ] Mode selection panels
- [ ] Turn flow selection panels
- [ ] Template selection panels
- [ ] Player setup panels
- [ ] Button styling
- [ ] Input field styling
- [ ] Player time displays

### **6. Theme Selector Integration**
**JavaScript (app.js):**
```javascript
// Add to theme selector modal
<div class="theme-option" data-theme="themename">
    <div class="theme-preview themename-preview"></div>
    <span>🎮 Theme Name</span>
</div>
```

**CSS Preview:**
```css
.themename-preview {
    background: /* Representative gradient */;
}
.themename-preview::after {
    color: /* Accent color */;
}
```

### **7. Decorative Elements**
**Section Icons:**
- [ ] Mode selection icon
- [ ] Turn flow selection icon
- [ ] Template selection icon
- [ ] Player setup icon

**Timer Display Effects:**
Choose ONE approach:
- [ ] **Static columns** (like Azul tiles)
- [ ] **Animated scrolling** (like Wingspan birds)
- [ ] **Custom effects** (like Gloomhaven candles)
- [ ] **Clean/minimal** (like Sagrada)

**Footer Icons:**
- [ ] Before and after footer text

### **8. Special Effects (Optional)**
- [ ] Animations (flickering, floating, etc.)
- [ ] Backdrop filters
- [ ] Custom shapes with CSS
- [ ] Dynamic elements via JavaScript

### **9. Mobile Responsiveness**
- [ ] Test on mobile theme selector
- [ ] Ensure text remains readable
- [ ] Check decorative elements don't overflow
- [ ] Verify touch targets remain accessible

### **10. Testing Checklist**
**Visual Tests:**
- [ ] All text clearly visible
- [ ] Theme preview looks good
- [ ] Background doesn't interfere with functionality
- [ ] Consistent styling across all screens

**Functional Tests:**
- [ ] Theme switches properly
- [ ] Theme persists after refresh
- [ ] No JavaScript errors
- [ ] Performance remains smooth

**Cross-Theme Tests:**
- [ ] Switching between themes works
- [ ] No style bleeding between themes
- [ ] Each theme feels distinct

## 🎯 **Theme Examples Reference**

### **Wingspan** 🐦 (Nature/Organic)
- Colors: Sky blues, greens, earth tones
- Background: Subtle nature gradients
- Icons: Birds, eggs, nests, feathers
- Effect: Animated flowing birds

### **Azul** 🟦 (Geometric/Colorful)
- Colors: Bright primary colors
- Background: Tile-pattern crosshatch
- Icons: Colored squares only
- Effect: Static tile columns

### **Sagrada** 🏰 (Elegant/Translucent)
- Colors: Jewel tones on dark stone
- Background: Cathedral light rays
- Icons: Colored glass circles
- Effect: Clean, no distractions

### **Gloomhaven** ⚔️ (Dark Fantasy)
- Colors: Dark blues, gold text, red accents
- Background: Stone texture with crosshatch
- Icons: Medieval weapons, dungeons
- Effect: Flickering candle flames

## 💡 **Pro Tips**

1. **Start with text visibility** - Get this right first
2. **Test early and often** - Switch themes frequently during development
3. **Use consistent shadow patterns** - Copy successful formulas
4. **Keep decorative elements subtle** - Don't distract from gameplay
5. **Consider the game's mood** - Match the theme to the game's atmosphere
6. **Mobile first** - Ensure it works on small screens
7. **Performance matters** - Avoid too many animations

## 🚀 **Quick Start Template**

1. Copy an existing theme CSS block
2. Update color variables
3. Change background pattern
4. Test text visibility
5. Add decorative icons
6. Update theme selector
7. Test thoroughly

**Estimated Time:** 30-45 minutes for a complete theme

---

*Happy theming! 🎨✨*