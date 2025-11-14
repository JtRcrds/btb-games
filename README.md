# JetRecords - Simple Project

A lightweight web application for viewing engine timeline data with PDF document grounding visualization.

## 🚀 Live Demo

**[View Live Demo on GitHub Pages](https://jtrcrds.github.io/btb-games/)**

## ✨ Features

### 📊 Timeline Table
- Interactive data table displaying engine timeline entries
- Support for engine serial numbers (ESN), hours, cycles, and operator information
- Clickable cells with associated document groundings
- Dark/Light theme toggle with localStorage persistence

### 📄 PDF Viewer with Grounding Navigation
- **PDF.js Integration**: Client-side PDF rendering without server dependencies
- **Smart Grounding Highlighting**: 
  - Active groundings highlighted in orange
  - Other groundings on the same page shown in blue
  - Visual distinction between calculated and grounded values
- **Multi-Grounding Support**: Navigate through multiple groundings for a single field
- **Cross-Page Navigation**: Seamlessly switch between different PDF pages
- **Dual Canvas Architecture**: Separate layers for PDF content and bound overlays

### ⌨️ Keyboard Navigation
- **Arrow Keys**: Navigate between cells in the table
- **Enter/Space**: View groundings for focused cell
- **Tab**: Standard focus navigation
- Visual focus indicators with orange outlines

### 🎨 Theming
- Dark theme (default)
- Light theme option
- Theme preference saved to localStorage
- Smooth transitions between themes

## 🛠️ Technology Stack

- **Frontend**: Vanilla JavaScript (ES6 modules)
- **PDF Rendering**: [PDF.js](https://mozilla.github.io/pdf.js/) v3.11.174
- **Styling**: CSS with CSS custom properties (variables)
- **Architecture**: Service-oriented with modular design

## 📁 Project Structure

```
jr-simple-proj/
├── index.html              # Main HTML file
├── css/
│   └── main.css           # Styles with CSS variables
├── js/
│   ├── main.js            # Main application logic
│   └── services/
│       ├── timeline.service.js  # Data management
│       └── pdf.service.js       # PDF rendering logic
├── pdf/
│   └── doc1.pdf           # Sample PDF documents
└── README.md
```

## 🚦 Getting Started

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/jtrcrds/btb-games.git
   cd btb-games
   ```

2. **Serve locally**
   
   Since the project uses ES6 modules, you need to serve it via HTTP:
   
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Using Node.js (http-server)
   npx http-server -p 8000
   
   # Using PHP
   php -S localhost:8000
   ```

3. **Open in browser**
   ```
   http://localhost:8000
   ```

### Deploy to GitHub Pages

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Enable GitHub Pages**
   - Go to repository Settings → Pages
   - Select branch: `main`
   - Select folder: `/ (root)`
   - Click Save

3. **Access your site**
   ```
   https://jtrcrds.github.io/btb-games/
   ```

## 📖 Usage Guide

### Viewing Groundings

1. **Click on a highlighted cell** in the timeline table
2. The PDF viewer will load and display the relevant page
3. The grounding area will be highlighted in orange
4. If multiple groundings exist, use the navigation controls

### Navigating Multiple Groundings

- **Previous Grounding ◄**: View the previous grounding
- **Next Grounding ►**: View the next grounding
- **Counter Display**: Shows current grounding number (e.g., "Grounding: 2 / 5")

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Tab` | Focus next cell |
| `Shift+Tab` | Focus previous cell |
| `↑` `↓` `←` `→` | Navigate between cells |
| `Enter` / `Space` | View groundings for focused cell |

### Theme Toggle

Click the **"Toggle Theme"** button in the bottom-right corner to switch between dark and light modes.

## 🎨 Customization

### Change Grounding Highlight Color

Edit the CSS variables in `css/main.css`:

```css
:root {
    --grounding-highlight: #ff6b35;  /* Border color */
    --grounding-highlight-bg: rgba(255, 107, 53, 0.25);  /* Fill color */
}
```

### Add More Data

Edit the `demoData` array in `js/services/timeline.service.js`:

```javascript
const demoData = [
    {
        id: 'entry-101',
        dateRange: { start: '...', end: '...' },
        engine: { /* ... */ },
        part: { /* ... */ },
        op: { /* ... */ }
    }
]
```

## 🔧 Configuration

### PDF File Mapping

Update the `cfileUrlMap` in `js/services/timeline.service.js`:

```javascript
const cfileUrlMap = {
    'cfile-101': 'pdf/doc1.pdf',
    'cfile-102': 'pdf/doc2.pdf'
}
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 👤 Author

**JetRecords Team**

---

Made with ❤️ for aviation data transparency