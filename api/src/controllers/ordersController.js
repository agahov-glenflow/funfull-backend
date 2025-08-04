// api/src/controllers/ordersController.js

import {appendToSpreadsheet, readSpreadsheetList, writeToSpreadsheet} from "../services/sheetsService.js";

const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID;
const ORDERS_SHEET = "Orders";

export async function getAllOrders(req, res) {
    try {
        const rows = await readSpreadsheetList(SPREADSHEET_ID, ORDERS_SHEET);
        if (!rows || rows.length < 2) {
            // no orders
            return res.json({ orders: [] });
        }
        const [header, ...dataRows] = rows;
        // Transform each row to an object
        const orders = dataRows.map(row => {
            const order = {};
            for (let i = 0; i < header.length; i++) {
                order[header[i]] = row[i] ?? "";
            }
            return order;
        });

        res.json({ orders });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to load orders from Google Sheets" });
    }
}

/**
 * Create new order (append to the end of a table)
 * Requirements: Session Id, Date, Name, Phone, Price, Status, Order Details
 */
export async function createOrder(req, res) {
    try {
        const order = req.body;

        // 1. Get headers
        const rows = await readSpreadsheetList(SPREADSHEET_ID, ORDERS_SHEET);
        const header = rows[0];

        // 2. Make properly row
        const rowToAppend = header.map(key => order[key] ?? "");

        // 3. append
        await appendToSpreadsheet(SPREADSHEET_ID, ORDERS_SHEET, [rowToAppend]);

        res.status(201).json({ status: "ok", order });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to create order in Google Sheets" });
    }
}

export async function updateOrder(req, res) {
    try {
        const orderId = req.params.orderId;
        const updatedFields = req.body;
        const result = await findOrderBySessionId(orderId);

        if (!result) return res.status(404).json({ error: "Order not found" });

        // Update fields
        Object.assign(result.order, updatedFields);
        const updatedRow = result.header.map(key => result.order[key] ?? "");
        const range = `${ORDERS_SHEET}!A${result.rowIndex + 1}`;
        await writeToSpreadsheet(SPREADSHEET_ID, range, [updatedRow]);

        res.json({ status: "ok", order: result.order });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to update order in Google Sheets" });
    }
}

export async function getOrder(req, res) {
    try {
        const orderId = req.params.orderId;
        const result = await findOrderBySessionId(orderId);

        if (!result) return res.status(404).json({ error: "Order not found" });

        res.json(result.order);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to get the order in Google Sheets" });
    }
}

async function findOrderBySessionId(orderId) {
    const rows = await readSpreadsheetList(SPREADSHEET_ID, ORDERS_SHEET);
    if (!rows || rows.length < 2) return null;

    const [header, ...dataRows] = rows;
    let rowIndex = -1;

    for (let i = 0; i < dataRows.length; i++) {
        if (dataRows[i][0] === orderId) {
            rowIndex = i + 1; // +1 with header
            break;
        }
    }
    if (rowIndex === -1) return null;

    const order = {};
    for (let i = 0; i < header.length; i++) {
        order[header[i]] = dataRows[rowIndex - 1][i] ?? "";
    }

    return { order, rowIndex, header, dataRows };
}

export async function getPaymentForm(req, res) {
    try {
        const sessionId = req.params.orderId;
        const result = await findOrderBySessionId(sessionId);

        if (!result) {
            return res.status(404).type("html").send(`
                <html><body><h1>Order not found</h1></body></html>
            `);
        }

        // 1. Update status to "opened"
        result.order["Status"] = "opened";
        const updatedRow = result.header.map(key => result.order[key] ?? "");
        const range = `${ORDERS_SHEET}!A${result.rowIndex + 1}`;
        await writeToSpreadsheet(SPREADSHEET_ID, range, [updatedRow]);

        // 2. Render HTML-page with payment
        res.type("html").send(`
            <html>
              <head>
                <title>Order Payment</title>
                <style>
                  body { font-family: sans-serif; background: #f9f9f9; padding: 40px; color: #222; }
                  .order-block { background: #fff; border-radius: 12px; padding: 32px 24px 20px; box-shadow: 0 2px 12px #0001; max-width: 420px; margin: 0 auto; }
                  h1 { font-size: 1.7em; }
                  .field { margin-bottom: 10px; }
                  label { color: #444; font-weight: 600; }
                  .val { color: #1a2232; margin-left: 8px; }
                  .pay-btn { padding: 12px 32px; background: #29d; color: #fff; border: none; border-radius: 8px; font-size: 1.1em; cursor: pointer; margin-top: 18px;}
                  .pay-btn:hover { background: #176edb;}
                </style>
              </head>
              <body>
                <div class="order-block">
                  <h1>Pay for your order</h1>
                  <div class="field"><label>Order:</label> <span class="val">${result.order["Session Id"]}</span></div>
                  <div class="field"><label>Name:</label> <span class="val">${result.order["Name"]}</span></div>
                  <div class="field"><label>Phone:</label> <span class="val">${result.order["Phone"]}</span></div>
                  <div class="field"><label>Price:</label> <span class="val">${result.order["Price"]}</span></div>
                  <div class="field"><label>Status:</label> <span class="val">${result.order["Status"]}</span></div>
                  <div class="field"><label>Order Details:</label> <span class="val">${result.order["Order Details"]}</span></div>
                  <form method="POST" action="/orders/${encodeURIComponent(result.order["Session Id"])}/checkout">
                    <button type="submit" class="pay-btn">Make Payment</button>
                  </form>
                </div>
              </body>
            </html>
        `);

    } catch (err) {
        console.error(err);
        res.status(500).type("html").send(`
            <html><body><h1>Internal server error</h1></body></html>
        `);
    }
}

export async function checkoutOrder(req, res) {
    try {
        const orderId = req.params.orderId;
        const result = await findOrderBySessionId(orderId);

        if (!result) {
            return res.status(404).type("html").send(`
                <html>
                  <body>
                    <h1>Order not found</h1>
                    <p>We could not find your order. Please check the link or contact support.</p>
                  </body>
                </html>
            `);
        }

        // Update status to "paid"
        result.order["Status"] = "paid";
        const updatedRow = result.header.map(key => result.order[key] ?? "");
        const range = `${ORDERS_SHEET}!A${result.rowIndex + 1}`;
        await writeToSpreadsheet(SPREADSHEET_ID, range, [updatedRow]);

        res.type("html").send(`
            <html>
              <body>
                <h1>Payment successful</h1>
                <p>Thank you for your purchase!</p>
                <p>Order ID: <b>${result.order["Session Id"]}</b></p>
                <p>Status: <b>${result.order["Status"]}</b></p>
              </body>
            </html>
        `);
    } catch (err) {
        console.error(err);
        res.status(500).type("html").send(`
            <html>
              <body>
                <h1>Internal server error</h1>
                <p>Sorry, something went wrong. Please try again later.</p>
              </body>
            </html>
        `);
    }
}
