
const rrdFile = 'https://activity.openra.net/db/openra-players.rrd';
const graphOptions = {
  tooltip: true,
  tooltipOpts: {
    defaultTheme: false,
    id: 'flotTip',
    content: '%s: %y on %x'
  },
  selection: {
    mode: null
  },
  grid: {
    backgroundColor: 'rgba(0, 0, 0, 0.33)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
    tickColor: 'rgba(0, 0, 0, 0.3)',
    hoverable: true,
    margin: { left: 0, top: 0, right: 0, bottom: 0 }
  },
  series: { stack: true }
};

const dsGraphOptions = {
  playing: { label: 'Playing', color: 'green', lines: { show: true, fill: 1, lineWidth: 0 } },
  waiting: { label: 'Waiting', color: 'orange', lines: { show: true, fill: 1, lineWidth: 0 } }
};

const rrdFlotOptions = {
  use_rra: true,
  rra: 2,
  graph_only: true,
  legend: 'None',
  use_checked_DSs: true,
  checked_DSs: ['playing', 'waiting'],
  graph_width: "100%",
  graph_height: "300px"
};

const plot = new rrdFlotAsync(
  'players',
  rrdFile,
  null,
  graphOptions,
  dsGraphOptions,
  rrdFlotOptions,
  null,
  null, 
  null
);