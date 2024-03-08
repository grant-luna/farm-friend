function reformatCallLogDates(callLogs) {
  return callLogs.map((callLog) => {
    return {
      ...callLog,
      date: new Date(callLog.date).toUTCString(),
    }
  }).sort((callLogA, callLogB) => {
    if (callLogA.date < callLogB.date) {
      return 1;
    } else if (callLogA.date > callLogB.date) {
      return -1;
    } else {
      return 0;
    }
  });
}

module.exports = reformatCallLogDates;
