export function createScheduleObject(trainSchedulesBasic) {
  const insertHalkali = (trainSchedule) => {
    trainSchedule["Halkali"] = {
      Gebze: {
        departure: "05:58",
        last_train: {
          weekday: "22:58",
          weekend: "01:28",
        },
      },
    };
  };

  const insertGebze = (trainSchedule) => {
    trainSchedule["Gebze"] = {
      Halkali: {
        departure: "06:05",
        last_train: {
          weekday: "22:50",
          weekend: "01:20",
        },
      },
    };
  };

  let trainSchedule = {};
  insertHalkali(trainSchedule);

  Object.keys(trainSchedulesBasic["Gebze"]).forEach((station) => {
    const timeArrGebze = trainSchedulesBasic["Gebze"];
    const timeArrHalkali = trainSchedulesBasic["Halkali"];
    trainSchedule[station] = {
      Gebze: {
        departure: timeArrGebze[station][0],
        last_train: {
          weekday: timeArrGebze[station][1],
          weekend: timeArrGebze[station][2],
        },
      },
      Halkali: {
        departure: timeArrHalkali[station][0],
        last_train: {
          weekday: timeArrHalkali[station][1],
          weekend: timeArrHalkali[station][2],
        },
      },
    };
  });

  insertGebze(trainSchedule);

  return trainSchedule;
}

export function createScheduleObjectSmall(trainSchedulesBasic) {
  const insertAtakoy = (trainSchedule) => {
    trainSchedule["Atakoy"] = {
      Gebze: {
        departure: "06:09",
        last_train: "21:54",
      },
    };
  };

  const insertPendik = (trainSchedule) => {
    trainSchedule["Pendik"] = {
      Halkali: {
        departure: "06:09",
        last_train: "22:39",
      },
    };
  };

  let trainSchedule = {};
  insertAtakoy(trainSchedule);

  Object.keys(trainSchedulesBasic["Gebze"]).forEach((station) => {
    const timeArrGebze = trainSchedulesBasic["Gebze"];
    const timeArrHalkali = trainSchedulesBasic["Halkali"];
    trainSchedule[station] = {
      Gebze: {
        departure: timeArrGebze[station][0],
        last_train: timeArrGebze[station][1],
      },
      Halkali: {
        departure: timeArrHalkali[station][0],
        last_train: timeArrHalkali[station][1],
      },
    };
  });

  insertPendik(trainSchedule);

  return trainSchedule;
}
