const rrdFile = "https://activity.openra.net/db/openra-players.rrd";
const graphOptions = {
  tooltip: true,
  tooltipOpts: {
    defaultTheme: false,
    id: 'flotTip',
    content: '%s: %y on %x'
  },
  selection: { mode: null },
  grid: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderColor: 'transparent',
    borderWidth: 0,
    tickColor: 'rgba(255, 255, 255, 0.05)',
    hoverable: true,
    margin: { left: 0, top: 0, right: 0, bottom: 0 }
  },
  series: { stack: true }
};

const fivemin_options = $.extend({}, graphOptions);
fivemin_options.tooltipOpts = $.extend({}, graphOptions.tooltipOpts);
fivemin_options.tooltipOpts.content = "%s: %y at %x";

const dsGraphOptions = {
  'playing': { label: 'Playing', color: "green", lines: { show: true, fill: 1, lineWidth: 0 } },
  'waiting': { label: 'Waiting', color: "orange", lines: { show: true, fill: 1, lineWidth: 0 } }
};

const rrdFlotDaily = {
  use_rra: true, rra: 4,
  graph_only: true, legend: "None",
  use_checked_DSs: true, checked_DSs: ['playing', 'waiting'],
  graph_width: "100%", graph_height: "300px"
};

const rrdFlotHalfAnHour = {
  use_rra: true, rra: 2,
  graph_only: true, legend: "None",
  use_checked_DSs: true, checked_DSs: ['playing', 'waiting'],
  graph_width: "100%", graph_height: "300px"
};

const rrdFlotFiveMinutes = {
  use_rra: true, rra: 1,
  graph_only: true, legend: "None",
  use_checked_DSs: true, checked_DSs: ['playing', 'waiting'],
  graph_width: "100%", graph_height: "300px"
};

const rrdFlotThirtyseconds = {
  use_rra: true, rra: 0,
  graph_only: true, legend: "None",
  use_checked_DSs: true, checked_DSs: ['playing', 'waiting'],
  graph_width: "100%", graph_height: "300px"
};

const firstplot = new rrdFlotAsync("thirtyseconds", rrdFile, null, fivemin_options, dsGraphOptions, rrdFlotThirtyseconds, null, null, afterFirstPlot);

function afterFirstPlot (obj) {
  new rrdFlot("fiveminutes", obj.rrd_data, graphOptions, dsGraphOptions, rrdFlotFiveMinutes);
  new rrdFlot("halfanhour", obj.rrd_data, graphOptions, dsGraphOptions, rrdFlotHalfAnHour);
  new rrdFlot("daily", obj.rrd_data, graphOptions, dsGraphOptions, rrdFlotDaily);
}