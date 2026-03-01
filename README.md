# Battery Telemetry Dashboard

A comprehensive React-based dashboard for monitoring and analyzing battery telemetry data from multiple battery sources. Features real-time data visualization, performance metrics, and detailed insights.

## 🚀 Features

### Core Functionality
- **Multi-Battery Support**: Monitor data from multiple battery sources (Battery 1, 2, 3) or view combined data
- **Real-time Telemetry**: Live battery metrics including State of Charge (SoC), voltage, current, temperature
- **Interactive Charts**: Dynamic visualizations using Recharts for battery performance trends
- **Virtualized Tables**: Efficient handling of large datasets with react-window
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

### Advanced Analytics
- **Growth Charts**: Track SoC progression, charge cycle evolution, and State of Health (SoH) degradation
- **Performance Insights**: Automated analysis of battery efficiency and health metrics
- **Time-based Filtering**: Filter data by custom time ranges
- **Statistical Analysis**: Comprehensive metrics including min/max values, averages, and trends

### User Experience
- **Dark/Light Theme**: Toggle between themes with persistent preference storage
- **Battery Selection**: Dropdown to switch between individual batteries or combined view
- **Data Refresh**: Manual refresh capability with loading indicators
- **Status Notifications**: Real-time feedback for data loading and operations

## 🛠️ Technology Stack

- **Frontend**: React 18 with functional components and hooks
- **State Management**: React Context for theme management
- **Data Visualization**: Recharts library for interactive charts
- **Performance**: react-window for virtualized table rendering
- **Styling**: CSS with CSS variables for theming
- **Build Tool**: Vite for fast development and building
- **Data Format**: JSON files for battery telemetry data

## 📁 Project Structure

```
BatteryProject/
├── public/
│   └── data/
│       ├── battery1.json    # Battery 1 telemetry data
│       ├── battery2.json    # Battery 2 telemetry data
│       └── battery3.json    # Battery 3 telemetry data
├── src/
│   ├── components/
│   │   ├── DataTable.jsx           # Virtualized data table
│   │   ├── InsightsPanel.jsx      # Analytics and insights display
│   │   ├── VirtualizedTable.jsx   # Optimized table component
│   │   └── ChartComponents.jsx    # Reusable chart components
│   ├── hooks/
│   │   ├── useTelemetryData.js    # Data loading and management
│   │   └── useTheme.js           # Theme management
│   ├── services/
│   │   └── dataService.js        # Data loading and caching
│   ├── styles/
│   │   ├── dashboard.css         # Main dashboard styles
│   │   ├── insights.css          # Insights panel styles
│   │   └── virtualized-table.css # Table component styles
│   ├── utils/
│   │   ├── calculateMetrics.js   # Data analysis calculations
│   │   └── formatTime.js         # Time formatting utilities
│   ├── App.jsx                   # Main application component
│   └── main.jsx                  # Application entry point
├── package.json                   # Dependencies and scripts
└── README.md                     # This file
```

## 🚀 Getting Started

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd BatteryProject
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint for code quality

## 📊 Data Format

The dashboard expects JSON files with the following structure:

```json
[
  {
    "time": 1640995200,
    "soc": 85.5,
    "voltage": 3.85,
    "current": -2.1,
    "temperature": 25.3,
    "cycle_count": 150,
    "soh": 98.2
  }
]
```

### Data Fields
- `time`: Unix timestamp (seconds since epoch)
- `soc`: State of Charge percentage (0-100)
- `voltage`: Battery voltage (V)
- `current`: Current flow (A, positive for charging, negative for discharging)
- `temperature`: Battery temperature (°C)
- `cycle_count`: Number of charge/discharge cycles
- `soh`: State of Health percentage (0-100)

## 🎨 Customization

### Adding New Battery Data
1. Place your JSON file in `public/data/`
2. Update the `dataFiles` array in `src/services/dataService.js`
3. Add the battery option to the dropdown in `src/App.jsx`

### Theme Customization
Modify CSS variables in `src/styles/dashboard.css`:
```css
:root {
  --primary-color: #your-color;
  --background-color: #your-bg-color;
  --text-primary: #your-text-color;
}
```

### Adding New Metrics
1. Update the `FIELD_CONFIG` in `src/services/dataService.js`
2. Add calculation logic in `src/utils/calculateMetrics.js`
3. Update the table columns and chart configurations

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:
```env
VITE_API_BASE_URL=http://localhost:3001
VITE_DATA_REFRESH_INTERVAL=30000
```

### Performance Tuning
- Adjust virtualization parameters in `VirtualizedTable.jsx`
- Modify data sampling rates in `calculateMetrics.js`
- Configure caching strategies in `dataService.js`

## 🐛 Troubleshooting

### Common Issues

1. **Data not loading**
   - Check JSON file format and location
   - Verify file permissions
   - Check browser console for errors

2. **Charts not displaying**
   - Ensure data is properly formatted
   - Check Recharts dependencies
   - Verify data array is not empty

3. **Performance issues**
   - Enable virtualization for large datasets
   - Implement data sampling for charts
   - Use React.memo for expensive components

### Debug Mode
Enable debug logging by setting:
```javascript
localStorage.setItem('debug', 'true');
```

## 📱 Browser Support

- Chrome/Chromium (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style
- Use ES6+ features
- Follow React hooks rules
- Implement proper error handling
- Add comments for complex logic
- Use meaningful variable names

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- React team for the excellent framework
- Recharts for the powerful charting library
- react-window for efficient virtualization
- Battery data providers for sample datasets

## 📞 Support

For questions, issues, or feature requests:
- Create an issue on GitHub
- Contact the development team
- Check the documentation for common solutions

---

**Battery Telemetry Dashboard** - Empowering battery monitoring with data-driven insights.
