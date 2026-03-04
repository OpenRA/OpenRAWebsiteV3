// Chart.js implementation for OpenRA player statistics page
// Uses shared functionality from player-charts-common.js

const rrdFile = "https://activity.openra.net/db/openra-players.rrd";

// Load and parse RRD file, then create all charts
FetchBinaryURLAsync(rrdFile, function(bf) {
  try {
    const rrd_file = new RRDFile(bf);
    
    // Create charts with different RRA indices for different time ranges
    // For 5 hours chart, show 30-minute intervals
    createPlayerChart('thirtyseconds', rrd_file, 0, {
      unit: 'minute',
      stepSize: 30,
      displayFormats: {
        minute: 'HH:mm'
      }
    });
    
    createPlayerChart('fiveminutes', rrd_file, 1);     // 5 minute average, last 2 days
    createPlayerChart('halfanhour', rrd_file, 2);      // 30 minute average, last 2 weeks
    createPlayerChart('daily', rrd_file, 4);           // 1 day average, last 2 years
  } catch (error) {
    console.error('Error parsing RRD file:', error);
    ['thirtyseconds', 'fiveminutes', 'halfanhour', 'daily'].forEach(id => {
      const container = document.getElementById(id);
      if (container) {
        container.innerHTML = '<p style="color: rgba(255,255,255,0.8); padding: 1rem;">Error loading chart data.</p>';
      }
    });
  }
});