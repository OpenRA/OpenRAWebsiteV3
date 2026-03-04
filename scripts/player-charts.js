// Chart.js implementation for OpenRA player activity chart (games page)
// Shows last 2 weeks of player activity
// Uses shared functionality from player-charts-common.js

const rrdFile = 'https://activity.openra.net/db/openra-players.rrd';

// Load RRD file and create chart
FetchBinaryURLAsync(rrdFile, function(bf) {
  try {
    const rrd_file = new RRDFile(bf);
    
    // Create chart with RRA index 2 (30 minute average, last 2 weeks)
    createPlayerChart('players', rrd_file, 2);
  } catch (error) {
    console.error('Error parsing RRD file:', error);
    const container = document.getElementById('players');
    if (container) {
      container.innerHTML = '<p style="color: rgba(255,255,255,0.8); padding: 1rem;">Error loading chart data.</p>';
    }
  }
});