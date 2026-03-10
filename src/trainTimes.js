import { DayType, MINUTES_BETWEEN, ROUTE_NAMES, RouteType, trainSchedules, trainSchedulesSmall } from "./constant.js";
import { DateTime } from "luxon";

// Constant Initialization
const { HALKALI, ATAKOY } = RouteType;
const { WEEKDAY, WEEKEND } = DayType;

// Utils
function getDayName(dateTime) {
  return dateTime.toFormat("cccc"); // Returns "Monday", "Tuesday", etc.
}

function isTimeInRange(now, startHour, endHour) {
  const hour = now.hour; // Directly access the hour from Luxon's DateTime object
  return startHour < endHour
    ? hour >= startHour && hour < endHour // Non-wrapping range
    : hour >= startHour || hour < endHour; // Wrapping range
}

function isAtNight(now) {
  return isTimeInRange(now, 0, 5);
}

function formatTime(dateTime, direction, type, diff = null) {
  if (diff) {
    dateTime = dateTime.minus({ minutes: diff });
  }

  return `${ROUTE_NAMES[direction][type]}: ${dateTime.toFormat("HH:mm")}`;
}

function parseTime(timeStr) {
  return DateTime.fromFormat(timeStr, "HH:mm", { zone: "Asia/Istanbul" });
}

function isStationSmallTrainsLast(station, direction) {
  return (
    (station === ROUTE_NAMES.Gebze.ATAKOY && direction === ROUTE_NAMES.Gebze.HALKALI) ||
    (station === ROUTE_NAMES.Halkali.ATAKOY && direction === ROUTE_NAMES.Halkali.HALKALI)
  );
}

function calculateDiff(firstDeparture, lastDeparture) {
  const lastMin = lastDeparture.minute;
  let firstMin = firstDeparture.minute;
  let diff = firstMin - lastMin;
  while (diff < 0 || diff > 5) {
    firstMin = (firstMin + 15) % 60;
    diff = firstMin - lastMin;
  }

  return diff;
}
// End Utils

// Parse Functions
function getLastTrainTime(station, direction, isWeekday) {
  const lastTrainStr =
    isWeekday === WEEKDAY
      ? trainSchedules[station][direction].last_train.weekday
      : trainSchedules[station][direction].last_train.weekend;

  return parseTime(lastTrainStr);
}

function getLastTrainTimeSmall(station, direction) {
  const lastTrainStr = trainSchedulesSmall[station][direction].last_train;
  return parseTime(lastTrainStr);
}

function getFirstTrainTime(station, direction) {
  const firstTrainStr = trainSchedules[station][direction].departure;
  return parseTime(firstTrainStr);
}

function getFirstTrainTimeSmall(station, direction) {
  const firstTrainStr = trainSchedulesSmall[station][direction].departure;
  return parseTime(firstTrainStr);
}
// End Parse Functions

// Departure Functions
function adjustForNextDayIfNeeded(trainTime, now) {
  return now > trainTime ? trainTime.plus({ days: 1 }) : trainTime;
}

function getTrainTypeForDay(dayName, now, station, direction) {
  if (dayName === "Friday") {
    const weekdayTrain = getLastTrainTime(station, direction, WEEKDAY);
    const weekendTrain = getLastTrainTime(station, direction, WEEKEND);
    return isAtNight(now) && isAtNight(weekdayTrain) && now <= weekdayTrain
      ? weekdayTrain
      : weekendTrain.plus({ days: 1 });
  }

  if (dayName === "Sunday") {
    const weekendTrain = getLastTrainTime(station, direction, WEEKEND);
    if (now <= weekendTrain) {
      return weekendTrain;
    }
    return getLastTrainTime(station, direction, WEEKDAY).plus({ days: 1 });
  }

  return getLastTrainTime(station, direction, WEEKDAY);
}

function getLastDeparture(station, direction, now) {
  const dayName = getDayName(now);
  let lastDeparture = getTrainTypeForDay(dayName, now, station, direction);

  if (dayName !== "Friday" && now > lastDeparture) {
    lastDeparture = adjustForNextDayIfNeeded(lastDeparture, now);
  }

  return lastDeparture;
}

function getLastDepartureSmall(station, direction, firstDepartureBig) {
  let lastDepartureSmall = getLastTrainTimeSmall(station, direction);

  // Ensure lastDepartureSmall has the same date as firstDepartureBig
  lastDepartureSmall = lastDepartureSmall.set({
    year: firstDepartureBig.year,
    month: firstDepartureBig.month,
    day: firstDepartureBig.day,
  });

  return lastDepartureSmall;
}

function getFirstDeparture(station, direction, lastDeparture) {
  let firstDeparture = getFirstTrainTime(station, direction);

  // Ensure firstDeparture has the same date as lastDeparture
  firstDeparture = firstDeparture.set({
    year: lastDeparture.year,
    month: lastDeparture.month,
    day: lastDeparture.day,
  });

  // If the last departure is at night, move the first departure to the previous day
  if (isAtNight(lastDeparture)) {
    firstDeparture = firstDeparture.minus({ days: 1 });
  }

  return firstDeparture;
}

function getFirstDepartureSmall(station, direction, firstDepartureBig) {
  let firstDepartureSmall = getFirstTrainTimeSmall(station, direction);

  firstDepartureSmall = firstDepartureSmall.set({
    year: firstDepartureBig.year,
    month: firstDepartureBig.month,
    day: firstDepartureBig.day,
  });

  return firstDepartureSmall;
}
// End Departure Functions

// Next Train Functions
function handleBeforeFirstTrain(firstDeparture, station, direction, interval, diff) {
  if (!(station in trainSchedulesSmall) || isStationSmallTrainsLast(station, direction)) {
    const nextBigTrainTime = firstDeparture.plus({ minutes: interval });
    return [formatTime(firstDeparture, direction, HALKALI), formatTime(nextBigTrainTime, direction, HALKALI, diff)];
  }

  const firstDepartureSmall = getFirstDepartureSmall(station, direction, firstDeparture);
  if (firstDepartureSmall < firstDeparture) {
    return [formatTime(firstDepartureSmall, direction, ATAKOY), formatTime(firstDeparture, direction, HALKALI)];
  }

  return [formatTime(firstDeparture, direction, HALKALI), formatTime(firstDepartureSmall, direction, ATAKOY)];
}

function handleNightInterval(lastDeparture, now, direction) {
  const nightInterval = 30; // 30 minutes interval
  let trainTime = lastDeparture;
  let prevTrainTime = lastDeparture.minus({ minutes: nightInterval });

  while (prevTrainTime > now) {
    trainTime = trainTime.minus({ minutes: nightInterval });
    prevTrainTime = trainTime.minus({ minutes: nightInterval });
  }

  const returnedTime = [formatTime(trainTime, direction, HALKALI)];

  if (trainTime.hour !== lastDeparture.hour || trainTime.minute !== lastDeparture.minute) {
    const nextTrainTime = trainTime.plus({ minutes: nightInterval });
    returnedTime.push(formatTime(nextTrainTime, direction, HALKALI));
  }

  return returnedTime;
}

function handleRegularSchedule(now, firstDeparture, lastDeparture, station, direction, interval, diff) {
  const minutesSinceFirstTrain = Math.floor(now.diff(firstDeparture, "minutes").minutes);
  const trainsSinceFirst = Math.ceil(minutesSinceFirstTrain / interval);
  const nextBigTrainTime = firstDeparture.plus({ minutes: trainsSinceFirst * interval });

  if (nextBigTrainTime >= lastDeparture) {
    return [
      formatTime(lastDeparture, direction, HALKALI, diff)
    ]
  }

  if (
    !(station in trainSchedulesSmall) ||
    isStationSmallTrainsLast(station, direction) ||
    now > getLastDepartureSmall(station, direction, firstDeparture)
  ) {
    const secondTrainTime = nextBigTrainTime.plus({ minutes: interval });

    return [
      formatTime(nextBigTrainTime, direction, HALKALI, diff),
      formatTime(secondTrainTime, direction, HALKALI, diff),
    ];
  }

  const smallTrainBefore = nextBigTrainTime.minus({ minutes: MINUTES_BETWEEN.ATAKOY_HALKALI });

  if (now <= smallTrainBefore) {
    return [
      formatTime(smallTrainBefore, direction, ATAKOY, diff),
      formatTime(nextBigTrainTime, direction, HALKALI, diff),
    ];
  }

  const smallTrainAfter = nextBigTrainTime.plus({ minutes: MINUTES_BETWEEN.HALKALI_ATAKOY });

  return [formatTime(nextBigTrainTime, direction, HALKALI, diff), formatTime(smallTrainAfter, direction, ATAKOY, diff)];
}

export function getNextTrainTime(station, direction) {
  if (station === direction) {
    return [];
  }

  const now = DateTime.now().setZone("Asia/Istanbul"); // Ensure correct timezone
  const interval = 15;

  const lastDeparture = getLastDeparture(station, direction, now);
  const firstDeparture = getFirstDeparture(station, direction, lastDeparture);
  const diff = calculateDiff(firstDeparture, lastDeparture);

  if (now < firstDeparture) {
    return handleBeforeFirstTrain(firstDeparture, station, direction, interval, diff);
  }

  if (isTimeInRange(lastDeparture, 1, 4) && now >= lastDeparture.minus({ minutes: 164 })) {
    return handleNightInterval(lastDeparture, now, direction, diff);
  }

  return handleRegularSchedule(now, firstDeparture, lastDeparture, station, direction, interval, diff);
}
// End Next Train Functions
