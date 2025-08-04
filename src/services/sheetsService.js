// ./src/services/sheetsService.js

import { google } from "googleapis";
import { readFile } from "fs/promises";

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

async function getSheetsClient() {
    const credentials = JSON.parse(
        await readFile(new URL("../credentials/google-credentials.json", import.meta.url), "utf-8")
    );
    const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: SCOPES,
    });
    return google.sheets({ version: "v4", auth });
}

/** @param {string} range - can be as a list `Schedule` or as a range `Schedule!A1:R151`  */
export async function readSpreadsheetList(spreadsheetId, range) {
    const sheets = await getSheetsClient();
    const res = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
    });
    return res.data.values;
}

/**
 * Write to the Google Sheets
 * @param {string} spreadsheetId - table ID
 * @param {string} range - range as A1-note, e.g "Schedule!C5" or "Schedule!B2:D2"
 * @param {Array} values - Array of arrays of values (e.g. [["newValue"]])
 * @returns {Promise<Object>} - Answer from the Google Sheets API
 */
export async function writeToSpreadsheet(spreadsheetId, range, values) {
    const sheets = await getSheetsClient();
    const response = await sheets.spreadsheets.values.update({
        spreadsheetId,
        range,
        valueInputOption: "RAW",
        requestBody: {
            values,
        },
    });
    return response.data;
}

/** add new row to an exist table */
export async function appendToSpreadsheet(spreadsheetId, sheetName, values) {
    const sheets = await getSheetsClient();
    const response = await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: sheetName,
        valueInputOption: "RAW",
        insertDataOption: "INSERT_ROWS",
        requestBody: {
            values,
        },
    });
    return response.data;
}