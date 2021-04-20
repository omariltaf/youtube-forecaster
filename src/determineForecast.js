// Determine the forecast ////////////////////////////////////////////////////////////
function determineForecast(uploadDatetimes) {
  let uploadDays = new Map();
  let uploadHours = new Map();
  let numberOfUploads = uploadDatetimes.length;
  uploadDatetimes.forEach((uploadDatetime) => {
    incrementUploadDaysMap(uploadDays, getDayOfWeek(uploadDatetime.getDay()));
    incrementUploadHoursMap(uploadHours, uploadDatetime.getHours());
  });
  let sortedUploadDays = new Map(
    [...uploadDays.entries()].sort((a, b) => b[1] - a[1])
  );
  let sortedUploadHours = new Map(
    [...uploadHours.entries()].sort((a, b) => b[1] - a[1])
  );

  sortedUploadDays.forEach((count, day) => {
    console.log(`${count} uploads on ${day}s`);
  });
  sortedUploadHours.forEach((count, hour) => {
    console.log(`${count} uploads at hour: ${hour}`);
  });

  let mostFrequentDays = getMostFrequent(numberOfUploads, sortedUploadDays);
  let mostFrequentHours = getMostFrequent(numberOfUploads, sortedUploadHours);

  console.log(mostFrequentDays);
  console.log(mostFrequentHours);

  return { days: mostFrequentDays, hours: mostFrequentHours };
}

function getMostFrequent(numberOfUploads, sortedValues) {
  let mostFrequentValues = [];
  let cutoffThreshold = numberOfUploads / 2;
  console.log("Threshold=" + cutoffThreshold);
  sortedValues.forEach((count, value) => {
    if (count >= cutoffThreshold) {
      mostFrequentValues.push(value);
    }
  });
  return mostFrequentValues;
}

function incrementUploadDaysMap(uploadDays, day) {
  if (!uploadDays.has(day)) {
    uploadDays.set(day, 1);
  } else {
    let count = uploadDays.get(day);
    uploadDays.set(day, count + 1);
  }
}

function incrementUploadHoursMap(uploadHours, hour) {
  if (!uploadHours.has(hour)) {
    uploadHours.set(hour, 1);
  } else {
    let count = uploadHours.get(hour);
    uploadHours.set(hour, count + 1);
  }
}

function getDayOfWeek(dayIndex) {
  let orderedDaysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return orderedDaysOfWeek[dayIndex];
}
