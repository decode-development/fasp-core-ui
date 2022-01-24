import { calculateError } from '../Extrapolation/ErrorCalculations.js';
let m = 0;
let c = 0;
export function calculateSemiAverages(inputData, noOfProjectionMonths, props) {
    const data = inputData;
    console.log("InputData@@@",inputData)
    if (inputData.length % 2 == 1) {
        inputData.pop();
        noOfProjectionMonths += 1
    }

    const noOfMonthsForProjection = noOfProjectionMonths;
    let actualMonths = data[data.length - 1].month;
    initializeSemiAverage(data, actualMonths);
    for (let x = 1; x <= actualMonths + noOfMonthsForProjection; x++) {
        if (x <= actualMonths) {
            data[x - 1].forecast = getSemiAverage(x);
        } else {
            data[x - 1] = { "month": x, "actual": null, "forecast": getSemiAverage(x) };
        }
    }
    for (let y = 1; y <= actualMonths + noOfMonthsForProjection; y++) {
        console.log(y + " = " + data[y - 1].forecast);
    }
    calculateError(data, "semiAvgError", props);
    props.updateState("semiAvgData", data);
    // Print the output



}

function getSemiAverage(month) {
    return m * month + c;
}

function initializeSemiAverage(data, actualMonths) {
    let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
    let cnt = 0;
    for (let x = 1; x <= actualMonths / 2; x++) {
        x1 += data[x - 1].month;
        y1 += data[x - 1].actual;
        cnt++;
    }
    x1 = x1 / cnt;
    y1 = y1 / cnt;
    for (let x = actualMonths / 2 + 1; x <= actualMonths; x++) {
        x2 += data[x - 1].month;
        y2 += data[x - 1].actual;
    }
    x2 = x2 / cnt;
    y2 = y2 / cnt;
    m = (y2 - y1) / (x2 - x1);
    c = m * (0 - x2) + y2;
}