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

        if (!rows || rows.length < 3) {
            return res.json({ services: [] });
        }

        // [0] — warning, [1] — headers
        const [, header, ...dataRows] = rows;

        // define names for relatedServices
        const relatedHeaders = header.slice(2); // start from 3 column

        const services = dataRows
            .filter(row => row[0] && row[0].trim())
            .map(row => {
                // Primary Service
                const service = {
                    name: (row[0] ?? "").toString().trim(),
                    price: (row[1] ?? "").replace(/[^\d.]/g, ""), // only numbers and dot
                };

                // Related services — by headers and values if values exist
                const relatedServices = [];
                for (let i = 0; i < relatedHeaders.length; i++) {
                    const colValue = row[i + 2]; // related starts from index 2
                    if (colValue && typeof colValue === "string" && colValue.toLowerCase() !== "not available") {
                        relatedServices.push({
                            name: relatedHeaders[i],
                            price: colValue.replace(/[^\d.]/g, ""),
                        });
                    }
                }
                if (relatedServices.length) service.relatedServices = relatedServices;

                return service;
            });

        res.json({ services });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to load services from Google Sheets" });
    }
}