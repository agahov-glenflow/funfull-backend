// api/src/controllers/slotsController.js

import {readSpreadsheetList} from "../services/sheetsService.js";

const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID;
const SCHEDULE_LIST = "Schedule";

export async function getAvailableSlots(req, res) {
    try {
        const rows = await readSpreadsheetList(SPREADSHEET_ID, SCHEDULE_LIST);

        // First row is headers
        const [header, ...dataRows] = rows;

        // Transform each row to object like { date: ..., "10:00": "1", ... }
        const slots = dataRows.map(row => {
            const slotObj = {};
            slotObj.date = row[0]; // First column is date

            // Pairs "time-slot": "value" for each cell
            for (let i = 1; i < header.length; i++) {
                slotObj[header[i]] = row[i] ?? ""; // если пусто — будет ""
            }
            return slotObj;
        });

        const availableSlots = [];
        for (let row of dataRows) {
            const date = row[0];
            for (let i = 1; i < header.length; i++) {
                if (!row[i] || row[i] === "") {
                    availableSlots.push({ date, time: header[i] });
                }
            }
        }

        res.json({ availableSlots: availableSlots, allSlots: slots });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to load slots from Google Sheets" });
    }
}