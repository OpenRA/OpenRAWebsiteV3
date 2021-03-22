function generateGetBoundingClientRect (x, y) {
  return function () {
    return {
      width: 0,
      height: 0,
      top: y || 0,
      right: x || 0,
      bottom: y || 0,
      left: x || 0
    };
  }
}

function createPopper (element) {
  const virtualElement = {
    getBoundingClientRect: generateGetBoundingClientRect(),
  };
  
  const popperInstance = Popper.createPopper(virtualElement, element, {
    placement: 'bottom',
    modifiers: [
      {
        name: 'offset',
        options: {
          offset: [0, 35],
        },
      },
      {
        name: 'flip',
        options: {
          fallbackPlacements: ['top'],
          padding: 10
        },
      }
    ]
  });

  $(document).on('mousemove', function (event) {
    virtualElement.getBoundingClientRect = generateGetBoundingClientRect(event.clientX, event.clientY);
    popperInstance.update();
  });

  return popperInstance;
}

function marqueeScroll ($element, _position) {
  const position = _position || 'bottom';
  const scrollTop = position === 'bottom'
    ? ($element[0].scrollHeight - $element.height())
    : 0;
  
  $element.delay(1000)
  .animate({
    scrollTop: scrollTop,
  }, 3500)
  .delay(1500)
  .queue(function (next) {
    const newPosition = position === 'bottom'
      ? 'top'
      : 'bottom';
    marqueeScroll($element, newPosition);
    next();
  });
}

const isometricMods = ['ts', 'ra2', 'sp', 'rv'];
function getGridType (mapInfo) {
  const isIsometricMod = isometricMods.indexOf(mapInfo.game_mod) !== -1;
  return isIsometricMod
    ? 'RectangularIsometric'
    : mapInfo.map_grid_type;
}

function getSpawnPointsArray (spawnPointsString) {
  const spawnPointsStrings = spawnPointsString.split(',');
  const spawnPointsArray = [];

  for (let i = 0; i < spawnPointsStrings.length; i += 2) {
    const spawnPointX = parseInt(spawnPointsStrings[i]);
    const spawnPointY = parseInt(spawnPointsStrings[i + 1]);
    spawnPointsArray.push([spawnPointX, spawnPointY]);
  }

  return spawnPointsArray;
}

function getDisabledSpawnPointsArray (disabledSpawnPointsString) {
  return (disabledSpawnPointsString || '').split(',').map(function (spawnPointString) {
    return parseInt(spawnPointString.trim());
  });
}

function getMapBounds (boundsString) {
  const boundsStrings = boundsString.split(',');

  return {
    x: parseInt(boundsStrings[0]),
    y: parseInt(boundsStrings[1]),
    width: parseInt(boundsStrings[2]),
    height: parseInt(boundsStrings[3]) 
  };
}

function getMapImageWidth (mapWidth, gridType) {
  return gridType === 'RectangularIsometric'
    ? mapWidth * 2
    : mapWidth;
}

function getSpawnPointLocation (x, y, mapBounds, gridType) {
  if (gridType === 'RectangularIsometric') {
    const v = x + y - mapBounds.y;
    const u = x - y + (2 * ((v % 2) - mapBounds.x));

    return {
      left: ((u / 2) - mapBounds.x) / mapBounds.width,
      top: (v - mapBounds.y) / mapBounds.height
    };
  } else {
    return {
      left: (x - mapBounds.x) / mapBounds.width,
      top: (y - mapBounds.y) / mapBounds.height
    }
  }
}

function ServerBrowser (targetElement) {
  const _this = this;

  this.$element = $(targetElement);
  const $filterPlaying = $('.servers__filters__playing', this.$element);
  const $filterWaiting = $('.servers__filters__waiting', this.$element);
  const $filterEmpty = $('.servers__filters__empty', this.$element);
  this.$refresh = $('.servers__refresh', this.$element);
  const $sortByName = $('.servers__sort__name', this.$element);
  const $sortByPlayers = $('.servers__sort__players', this.$element);
  const $sortByStatus = $('.servers__sort__status', this.$element);
  const $sortByLocation = $('.servers__sort__location', this.$element);
  this.$serversList = $('.servers__list__body', this.$element);
  this.$serverCount = $('.servers__server-count', this.$element);
  this.$playerCount = $('.servers__player-count', this.$element);
  this.$tooltipContainer = $('.servers__list__tooltip-container', this.$element);

  this.filterState = {
    playing: true,
    waiting: true,
    empty: false,
    hiddenGroups: {}
  };
  this.sortState = {
    by: 'status',
    direction: 'ascending'
  };
  this.servers = [];
  this.mapsById = {};
  this.requestServerListTimeoutId;
  this.requestingServerList;
  this.serverCount = 0;
  this.playerCount = 0;

  // Interface bindings
  $filterPlaying.on('change', function handleFilterPlayingClick (event) {
    event.preventDefault();
    _this.filterState.playing = !_this.filterState.playing;
    $(_this).prop('checked', _this.filterState.playing);
    _this.renderServerList();
  });

  $filterWaiting.on('change', function handleFilterWaitingClick (event) {
    event.preventDefault();
    _this.filterState.waiting = !_this.filterState.waiting;
    $(_this).prop('checked', _this.filterState.waiting);
    _this.renderServerList();
  });

  $filterEmpty.on('change', function handleFilterEmptyClick (event) {
    event.preventDefault();
    _this.filterState.empty = !_this.filterState.empty;
    $(_this).prop('checked', _this.filterState.empty);
    _this.renderServerList();
  });

  this.$refresh.on('click', function handleRefreshClick () {
    _this.requestServerList();
  });

  $sortByName.on('click', function (event) {
    event.preventDefault();
    _this.setSortState('name');
    _this.renderServerList();
  });

  $sortByPlayers.on('click', function (event) {
    event.preventDefault();
    _this.setSortState('players');
    _this.renderServerList();
  });

  $sortByStatus.on('click', function (event) {
    event.preventDefault();
    _this.setSortState('status');
    _this.renderServerList();
  });

  $sortByLocation.on('click', function (event) {
    event.preventDefault();
    _this.setSortState('location');
    _this.renderServerList();
  });

  // toggling display of mod-version groups
  this.$serversList.on('click', '.servers__list__group', function () {
    const groupKey = $(this).data('group-key');

    if (!_this.filterState.hiddenGroups[groupKey]) {
      _this.filterState.hiddenGroups[groupKey] = true;
    } else {
      delete _this.filterState.hiddenGroups[groupKey];
    }

    _this.renderServerList();
  });

  this._popper = createPopper(this.$tooltipContainer.get(0));

  this.renderLoadingPlaceholder();
  this.requestServerList();

  return this;
}

ServerBrowser.prototype.renderServerListing = function renderServerListing (serverResult) {
  const _this = this;
  const $serverListing = ServerBrowser.$serverListingTemplate.contents().clone();
  const canJoin = (
    (serverResult.__status === 'waiting' && serverResult.players < serverResult.maxplayers)
    || serverResult.__status === 'empty'
  );
  const statusClassString = 'badge servers__listing__status__badge servers__listing__status__badge--' + serverResult.__status;
  const $statusBadge = $('<span class="' + statusClassString + '">' + serverResult.__status + '</span>');
  const $players = $('<span>' + serverResult.players + '/' + serverResult.maxplayers + '</span>');
  if (serverResult.spectators) {
    $players.append('<span class="servers__listing__spectators">+'
      + serverResult.spectators
      + '<svg class="icon"><use xlink:href="/images/icons/icons.svg#icon-eye"></use></svg>'
      + '</span>');
  }

  $serverListing.prop('data-id', serverResult.id);
  $('.servers__listing__name', $serverListing).text(serverResult.name);
  if (serverResult.protected) {
    $('.servers__listing__name', $serverListing).prepend('<svg class="icon"><use xlink:href="/images/icons/icons.svg#icon-lock"></use></svg>');
  }
  if (serverResult.authentication) {
    $('.servers__listing__name', $serverListing).prepend('<svg class="icon"><use xlink:href="/images/icons/icons.svg#icon-account"></use></svg>');
  }
  $('.servers__listing__status', $serverListing).append($statusBadge);
  $('.servers__listing__players', $serverListing).prepend($players);
  if (canJoin) {
    const $joinLink = $('<a class="servers__listing__join">Join</a>');
    $joinLink.prop('href', ServerBrowser.getJoinUrl(serverResult));
    $('.servers__listing__join', $serverListing).append($joinLink);
  }
  $('.servers__listing__location', $serverListing).text(serverResult.location || '—');

  $serverListing.hoverIntent({
    over: function () {
      _this.renderServerListingTooltip(serverResult);
    },
    out: function () {
      _this.$tooltipContainer.empty();
    },
    interval: 200
  });

  return $serverListing;
}

ServerBrowser.prototype.renderServerListingTooltip = function renderServerListingTooltip (serverInfo) {
  const _this = this;
  const $serverListingTooltip = ServerBrowser.$serverListingTooltipTemplate.contents().clone();

  const playerClients = [];
  const botClients = [];
  const spectatorClients = [];
  const spawnPointColors = {};
  const disabledSpawnPoints = getDisabledSpawnPointsArray(serverInfo.disabled_spawn_points);

  serverInfo.clients.forEach(function (client) {
    if (client.isbot) {
      botClients.push(client);
    } else if (client.isspectator) {
      spectatorClients.push(client);
    } else {
      playerClients.push(client);
    }
    // store spawnpoint color
    spawnPointColors[client.spawnpoint - 1] = client.color;
  });

  // sort playerClients for maximum effort
  playerClients.sort(function (playerClientA, playerClientB) {
    if (playerClientA.team < playerClientB.team) return -1;
    if (playerClientA.team > playerClientB.team) return 1;

    if (playerClientA.spawnpoint < playerClientB.spawnpoint) return -1;
    if (playerClientA.spawnpoint > playerClientB.spawnpoint) return 1;

    // localeCompare was unreliable
    if (playerClientA.name.toLowerCase() > playerClientB.name.toLowerCase()) return 1;
    if (playerClientA.name.toLowerCase() < playerClientB.name.toLowerCase()) return -1;

    return 0;
  });

  if (playerClients.length < serverInfo.maxplayers) {
    const emptySlotsCount = serverInfo.maxplayers - playerClients.length;
    for (let i = 0; i < emptySlotsCount; i++) {
      playerClients.push(null);
    }
  }

  const $playerClients = playerClients.map(_this.renderTooltipClient);
  const $botClients = botClients.map(_this.renderTooltipClient);
  const $spectatorClients = spectatorClients.map(_this.renderTooltipClient);
  let $clients = $playerClients.concat($botClients);

  if ($spectatorClients.length) {
    const $spectatorSubHead = $('<tr><th colspan="2">' +
      'Spectators' +
      '<svg class="servers__list__tooltip__clients__spectator icon">' +
        '<use xlink:href="/images/icons/icons.svg#icon-eye"></use>' +
      '</svg>' +
    '</th></tr>');
    $clients.push($spectatorSubHead);
    $clients = $clients.concat($spectatorClients);
  }

  $('.servers__list__tooltip__clients tbody', $serverListingTooltip).replaceWith($clients);
  $('.minimap__hash', $serverListingTooltip).text(serverInfo.map.replace(/(.{10})/g,"$1\n"));

  this.$tooltipContainer.html($serverListingTooltip);
  // fake marquee auto scroll
  marqueeScroll($('.servers__list__tooltip__clients', $serverListingTooltip));
  this._popper.forceUpdate();

  this.requestMapInfo(serverInfo.map, function (mapInfo) {
    _this.renderTooltipMapInfo(mapInfo, spawnPointColors, disabledSpawnPoints, $serverListingTooltip);
  });
},

ServerBrowser.prototype.renderTooltipClient = function renderTooltipClient (client) {
  let $client;
  if (client) {
    // create spawnpoint html
    const spawn = client.spawnpoint || '?';
    $client = $('<tr>' +
      '<td>' +
        '<strong class="servers__list__tooltip__clients__name"></strong>' +
      '</td>' +
      '<td>' + (client.team || '-') + '</td>' +
    '</tr>');
    $('.servers__list__tooltip__clients__name', $client).text(client.name); // injection protection
    if (!client.isspectator) {
      const $spawnPoint = $('<span class="servers__list__tooltip__clients__spawn" style="border-color: #' + client.color + '">' + spawn + '</span>');
      $('.servers__list__tooltip__clients__name', $client).before($spawnPoint);
    }
  } else {
    $client = $('<tr><td class="servers__list__tooltip__clients__empty" colspan="2">Empty</td></tr>');
  }

  return $client;
},

ServerBrowser.prototype.renderTooltipMapInfo = function renderTooltipMapInfo (
  mapInfo, spawnPointColors, disabledSpawnPoints, $serverListingTooltip
) {
  const mapBounds = getMapBounds(mapInfo.bounds);
  const spawnPoints = getSpawnPointsArray(mapInfo.spawnpoints);
  const gridType = getGridType(mapInfo);

  const $spawnPoints = spawnPoints.map(function (spawnPoint, index) {
    const $spawnPoint = $('<li class="minimap__spawnpoint">' + (index + 1) + '</li>');
    const spawnLocation = getSpawnPointLocation(spawnPoint[0], spawnPoint[1], mapBounds, gridType);
    $spawnPoint.css({
      top: spawnLocation.top * 100 + '%',
      left: spawnLocation.left * 100 + '%',
      'border-color': '#' + spawnPointColors[index]
    });
    if (disabledSpawnPoints.indexOf(index + 1) >= 0) {
      $spawnPoint.addClass('minimap__spawnpoint--disabled');
    }
    return $spawnPoint;
  });

  if (getMapImageWidth(mapBounds.width, gridType) >= mapBounds.height) {
    $('.minimap__image', $serverListingTooltip).css({ width: 200 });
  } else {
    $('.minimap__image', $serverListingTooltip).css({ height: 200 });
  }

  $('.minimap__image', $serverListingTooltip).prop('src', 'data:image/png;base64,' + mapInfo.minimap);
  $('.minimap', $serverListingTooltip).addClass('minimap--loaded');
  $('.minimap__spawnpoints', $serverListingTooltip).append($spawnPoints);
  $('.servers__list__tooltip__map__title', $serverListingTooltip).text(mapInfo.title);
},

ServerBrowser.prototype.renderServerGroups = function renderServerGroups (serverGroupsArray) {
  let $serverListings = []

  for (serverGroup of serverGroupsArray) {
    const $serverGroupHeader = ServerBrowser.$serverGroupHeaderTemplate.contents().clone();
    const $modIconImg = serverGroup.modMetadata.icon
      ? $('<img class="servers__list__group__mod-icon" />').prop('src', serverGroup.modMetadata.icon)
      : null;
    
    $('.servers__list__group__info', $serverGroupHeader).prepend($modIconImg);
    $('.servers__list__group__mod-link', $serverGroupHeader).prop('href', serverGroup.modMetadata.website);
    $('.servers__list__group__mod-link', $serverGroupHeader).text(serverGroup.modMetadata.title);
    $('.servers__list__group__version', $serverGroupHeader).text('[' + serverGroup.version + ']');
    $('.servers__list__group__players > var', $serverGroupHeader).text(serverGroup.players);
    const groupKey = serverGroup.modMetadata.title + '-' + serverGroup.version;
    $serverGroupHeader.data('group-key', groupKey);

    $serverListings.push($serverGroupHeader);
    if (!this.filterState.hiddenGroups[groupKey]) {
      $serverListings = $serverListings.concat(serverGroup.servers.map(this.renderServerListing, this));
    }
  }

  return $serverListings;
}

ServerBrowser.prototype.renderServerList = function renderServerList () {
  const filteredAndSortedServers = ServerBrowser.filterAndSortServers(this.servers, this.filterState, this.sortState);

  // get player counts out of the way
  this.countServersAndPlayers(filteredAndSortedServers);
  this.$serverCount.text(this.serverCount);
  this.$playerCount.text(this.playerCount);

  const serverGroups = ServerBrowser.groupServersByModAndRelease(filteredAndSortedServers);
  const sortedServerGroupsArray = ServerBrowser.getSortedServerGroupsArray(serverGroups);
  const $serverGroups = this.renderServerGroups(sortedServerGroupsArray);

  this.$serversList.html($serverGroups);

  // reset sort columns
  $('.servers__list__header__sort-toggle', this.$element).removeClass('servers__list__header__sort-toggle--ascending');
  $('.servers__list__header__sort-toggle', this.$element).removeClass('servers__list__header__sort-toggle--descending');
  $('.servers__sort__' + this.sortState.by, this.$element).addClass('servers__list__header__sort-toggle--' + this.sortState.direction);
}

ServerBrowser.prototype.renderLoadingPlaceholder = function renderLoadingPlaceholder () {
  for (let i = 0; i <= 15; i++) {
    const $serverListing = ServerBrowser.$serverListingTemplate.contents().clone();
    const nameWidth = 125 + (Math.random() * 125);
    const locationWidth = 40 + (Math.random() * 60);
    $('.servers__listing__name', $serverListing).html('<span class="u-placeholder" style="width: ' + nameWidth + 'px;" />');
    $('.servers__listing__status', $serverListing).html('<span class="u-placeholder" style="width: 70px;" />');
    $('.servers__listing__mod', $serverListing).html('<span class="u-placeholder" />');
    $('.servers__listing__players', $serverListing).html('<span class="u-placeholder" style="width: 40px;" />');
    $('.servers__listing__location', $serverListing).html('<span class="u-placeholder" style="width: ' + locationWidth + 'px;" />');

    this.$serversList.append($serverListing);
  }
}

ServerBrowser.prototype.requestServerList = function requestServerList () {
  const _this = this;
  this.requestingServerList = true;
  this.$refresh.prop('disabled', true);
  $.getJSON('https://master.openra.net/games?protocol=2&type=json', function (gameResults) {
    _this.$tooltipContainer.empty(); // just in case, to prevent unwanted popups
    _this.requestingServerList = false;
    _this.$refresh.prop('disabled', false);
    _this.servers = ServerBrowser.processGameResults(gameResults);
    _this.renderServerList();
  });

  clearTimeout(this.requestServerListTimeoutId);
  this.requestServerListTimeoutId = setTimeout(function () {
    _this.requestServerList();
  }, 30 * 1000);
}

ServerBrowser.prototype.requestMapInfo = function requestMapInfo (hashId, callback) {
  $.getJSON('https://resource.openra.net/map/hash/'+ hashId, function (mapResults) {
    callback(mapResults[0]);
  });
}

ServerBrowser.prototype.setSortState = function setSortState (by) {
  this.sortState.direction = (this.sortState.by === by && this.sortState.direction === 'ascending')
    ? 'descending'
    : 'ascending';
  this.sortState.by = by;
}

ServerBrowser.prototype.countServersAndPlayers = function countServersAndPlayers (servers) {
  this.serverCount = 0;
  this.playerCount = 0;

  for (server of servers) {
    this.serverCount++;
    this.playerCount += (server.players + server.spectators);
  }
}

// Static

ServerBrowser.$serverListingTemplate = $('#server-row-template');
ServerBrowser.$serverGroupHeaderTemplate = $('#server-group-header-template');
ServerBrowser.$serverListingTooltipTemplate = $('#server-listing-tooltip-template');

ServerBrowser.stateSortOrder = {
  waiting: 1,
  playing: 2,
  empty: 3
};

ServerBrowser.compareText = function compareText (textA, textB) {
  textA = (textA || '').toUpperCase();
  textB = (textB || '').toUpperCase();
  let sortValue = 0;
  if (textA > textB) {
    sortValue = -1;
  } else if (textA < textB) {
    sortValue = 1;
  }
  return sortValue;
}

ServerBrowser.getModMetadata = function getModMetadata (server) {
  // New format mods include the correct metadata already
  if (server.modtitle) {
    return {
      // Limit title length to avoid breakage
      title: server.modtitle.substring(0, 50),
      icon: server.modicon32,
      website: server.modwebsite
    };
  }

  // Generate data for older official mods
  switch (server.mod) {
    case 'ra':
      return {
        title: 'Red Alert',
        icon: 'https://www.openra.net/images/icons/ra_32x32.png',
        website: 'https://www.openra.net'
      };
    
    case 'cnc':
      return {
        title: 'Tiberian Dawn',
        icon: 'https://www.openra.net/images/icons/cnc_32x32.png',
        website: 'https://www.openra.net'
      };
    
    case 'd2k':
      return {
        title: 'Dune 2000',
        icon: 'https://www.openra.net/images/icons/d2k_32x32.png',
        website: 'https://www.openra.net'
      };
    
    default:
      return {
        title: 'Unknown Mod "' + server.mod + '"',
        icon: '',
        website: ''
      };
  }
}

ServerBrowser.getJoinUrl = function getJoinUrl (server) {
  return 'openra-' + server.mod + '-' + server.version + '://' + server.address;
}

ServerBrowser.getServerStatus = function getServerStatus (server) {
  switch (server.state) {
    case 2:
      return 'playing';
    case 1:
      if (server.players > 0) {
        return 'waiting';
      }
    default:
      return 'empty';
  }
}

ServerBrowser.processGameResults = function processGameResults (gameResults) {
  const processedGameResults = gameResults.map(function (server) {
    server.__status = ServerBrowser.getServerStatus(server);
    server.__modMetadata = ServerBrowser.getModMetadata(server);
    return server;
  });

  return processedGameResults;
}

ServerBrowser.filterServers = function filterServers (serversToFilter, filterState) {
  return serversToFilter.filter(function (server) {
    if (!filterState.playing && server.__status === 'playing') {
      return false;
    }

    if (!filterState.waiting && server.__status === 'waiting') {
      return false;
    }

    if (!filterState.empty && server.__status === 'empty') {
      return false;
    }

    return true;
  });
}

ServerBrowser.sortServers = function sortServers (serversToSort, sortState) {
  return serversToSort.sort(function (serverA, serverB) {
    let sortValue = 0;
    if (sortState.by === 'name') {
      sortValue = ServerBrowser.compareText(serverA.name, serverB.name);
    }
    if (sortState.by === 'status') {
      sortValue = (ServerBrowser.stateSortOrder[serverA.__status] - ServerBrowser.stateSortOrder[serverB.__status]) * -1;
    }
    if (sortState.by === 'players') {
      sortValue = serverA.players - serverB.players;
    }
    if (sortState.by === 'location') {
      sortValue = ServerBrowser.compareText(serverA.location, serverB.location);
    }
    if (sortState.direction === 'ascending') {
      sortValue = sortValue * -1;
    }
    return sortValue;
  });
}

ServerBrowser.filterAndSortServers = function filterAndSortServers (serversToFilterAndSort, filterState, sortState) {
  const filteredServers = ServerBrowser.filterServers(serversToFilterAndSort, filterState);
  const filteredAndSortedServers = ServerBrowser.sortServers(filteredServers, sortState);

  return filteredAndSortedServers;
}

ServerBrowser.groupServersByModAndRelease = function groupServersByModAndRelease (servers) {
  const serverGroups = {};

  for (server of servers) {
    const key = server.__modMetadata.title + '-' + server.version;
    if (!serverGroups[key]) {
      serverGroups[key] = {
        players: 0,
        servers: [],
        version: server.version,
        modMetadata: server.__modMetadata
      };
    }

    serverGroups[key].players += (server.players + server.spectators);
    serverGroups[key].servers.push(server);
  }

  return serverGroups;
}

// Turn server groups object into array
// Sort generated array by # of players
ServerBrowser.getSortedServerGroupsArray = function getSortedServerGroupsArray (serverGroups) {
  const serverGroupsArray = Object.keys(serverGroups).map(function (serverGroupKey) {
    return serverGroups[serverGroupKey];
  });
  const sortedServerGroups = serverGroupsArray.sort(function (serverGroupA, serverGroupB) {
    return serverGroupB.players - serverGroupA.players;
  });

  return sortedServerGroups;
}

new ServerBrowser('#server-browser');
