(() => {
  window.onerror = (msg, url, line, col, error) => {
    window.navigator.sendBeacon(
      "https://2886795326-5984-elsy04.environments.katacoda.com/beacons/_design/app/_update/beacon",
      JSON.stringify({ error: { msg, url, line, col, error } })
    );
  };
  window.onunload = () => {
    window.navigator.sendBeacon(
      "https://2886795326-5984-elsy04.environments.katacoda.com/beacons/_design/app/_update/beacon",
      JSON.stringify({ entries: window.performance.getEntries() })
    );
  };
})();
