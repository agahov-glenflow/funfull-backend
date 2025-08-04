// ./src/controllers/servicesController.js

import { readSpreadsheetList } from "../services/sheetsService.js";

const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID;
const SERVICES_SHEET = "Services";

function filterNonEmptyFields(service) {
    const cleaned = {};
    for (const [key, value] of Object.entries(service)) {
        // Clear empty, null, undefined
        if (value && value !== "") {
            cleaned[key] = value;
        }
    }
    return cleaned;
}

export async function getAllServices(req, res) {
    try {
        const rows = await readSpreadsheetList(SPREADSHEET_ID, SERVICES_SHEET);

        if (!rows || rows.length < 2) {
            return res.json({ services: [] });
        }

        const [header, ...dataRows] = rows;

        const services = dataRows
            .filter(row => row[0] && row[0].trim())
            .map(row => {
                const service = {};
                for (let i = 0; i < header.length; i++) {
                    service[header[i]] = row[i] ?? "";
                }
                return filterNonEmptyFields(service);
            });

        res.json({ services });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to load services from Google Sheets" });
    }
}