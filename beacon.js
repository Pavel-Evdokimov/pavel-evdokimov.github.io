(() => {
  window.onerror = (msg, url, line, col, error) => {
    window.navigator.sendBeacon(
      "http://ec2-13-58-164-101.us-east-2.compute.amazonaws.com:5984/beacons/_design/app/_update/beacon",
      JSON.stringify({ error: { msg, url, line, col, error } })
    );
  };
  window.onunload = () => {
    window.navigator.sendBeacon(
      "http://ec2-13-58-164-101.us-east-2.compute.amazonaws.com:5984/beacons/_design/app/_update/beacon",
      JSON.stringify({ entries: window.performance.getEntries() })
    );
  };
})();
