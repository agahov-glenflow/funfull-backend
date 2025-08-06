// ./src/controllers/ordersController.js

import {appendToSpreadsheet, readSpreadsheetList, writeToSpreadsheet} from "../services/sheetsService.js";

const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID;
const ORDERS_SHEET = "Orders";

export async function getAllOrders(req, res) {
    try {
        const rows = await readSpreadsheetList(SPREADSHEET_ID, ORDERS_SHEET);
        if (!rows || rows.length < 3) {
            // no orders
            return res.json({ orders: [] });
        }
        const [warning, header, ...dataRows] = rows;
        // Transform each row to an object
        const orders = dataRows.map(row => {
            const order = {};
            for (let i = 0; i < header.length; i++) {
                const key = header[i];
                // Если поле services — парсим JSON
                if (key === "services" && typeof row[i] === "string") {
                    try {
                        order[key] = JSON.parse(row[i]);
                    } catch {
                        order[key] = [];
                    }
                } else {
                    order[key] = row[i] ?? "";
                }
            }
            return order;
        });

        res.json({ orders });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to load orders from Google Sheets" });
    }
}

function sumServices(services) {
    let total = 0;
    for (const svc of services) {
        const price = parseFloat((svc.price || "0").replace(",", "."));
        total += isNaN(price) ? 0 : price;
        if (Array.isArray(svc.relatedServices)) {
            total += sumServices(svc.relatedServices);
        }
    }
    return total;
}

export async function createOrder(req, res) {
    try {
        const { sessionId, name, phone, services, slot, details } = req.body;

        // 1. Omit the first row (warning), take the seconds as a header
        const rows = await readSpreadsheetList(SPREADSHEET_ID, ORDERS_SHEET);
        const header = rows[1];

        // 2. Serialize array to string
        const servicesCell = JSON.stringify(services);

        // 3. Sum
        const price = sumServices(services).toFixed(2);

        const createdAt = new Date().toISOString();

        // 4. Create a row
        const status = "pending";
        const rowToAppend = header.map(key => {
            if (key === "sessionId") return sessionId ?? "";
            if (key === "name") return name ?? "";
            if (key === "phone") return phone ?? "";
            if (key === "services") return servicesCell;
            if (key === "slot") return slot ?? "";
            if (key === "details") return details ?? "";
            if (key === "price") return price;
            if (key === "status") return status;
            if (key === "createdAt") return createdAt;
            return "";
        });

        await appendToSpreadsheet(SPREADSHEET_ID, ORDERS_SHEET, [rowToAppend]);

        // Return the same object + status + fullPrice (for front)
        res.status(201).json({
            sessionId,
            name,
            phone,
            services,
            slot,
            price,
            status,
            details,
            createdAt
        });
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

        // update fields
        Object.assign(result.order, updatedFields);

        // serialize services
        if (Array.isArray(result.order.services)) {
            result.order.services = JSON.stringify(result.order.services);
        }

        // create row
        const updatedRow = result.header.map(key => result.order[key] ?? "");

        // define right range
        const range = `${ORDERS_SHEET}!A${result.rowIndex + 2}`;
        await writeToSpreadsheet(SPREADSHEET_ID, range, [updatedRow]);

        // answer order with parsed services
        const responseOrder = { ...result.order };
        if (typeof responseOrder.services === "string") {
            try {
                responseOrder.services = JSON.parse(responseOrder.services);
            } catch {
                responseOrder.services = [];
            }
        }

        res.json({ status: "ok", order: responseOrder });
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
    if (!rows || rows.length < 3) return null;

    const [warning, header, ...dataRows] = rows;
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
        const key = header[i];
        if (key === "services" && typeof dataRows[rowIndex - 1][i] === "string") {
            try {
                order[key] = JSON.parse(dataRows[rowIndex - 1][i]);
            } catch {
                order[key] = [];
            }
        } else {
            order[key] = dataRows[rowIndex - 1][i] ?? "";
        }
    }

    return { order, rowIndex, header, dataRows };
}

function renderServicesHtml(services) {
    if (!services || !Array.isArray(services) || services.length === 0) return '<div style="color:#aaa">No services</div>';
    return `<ul class="services">
        ${services.map(service => `
            <li>
                <strong>${service.name}</strong> — $${service.price}
                ${service.relatedServices && service.relatedServices.length
        ? `<ul>
                        ${service.relatedServices.map(rel => `
                            <li>${rel.name} — $${rel.price}</li>
                        `).join('')}
                     </ul>`
        : ''}
            </li>
        `).join('')}
    </ul>`;
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
        result.order.status = "opened";
        const updatedRow = result.header.map(key => {
            if (key === "services") {
                // serialize services
                return typeof result.order.services === "string"
                    ? result.order.services
                    : JSON.stringify(result.order.services ?? []);
            }
            return result.order[key] ?? "";
        });
        const range = `${ORDERS_SHEET}!A${result.rowIndex + 2}`;
        await writeToSpreadsheet(SPREADSHEET_ID, range, [updatedRow]);

        // 2. Render HTML-page with payment
        res.type("html").send(renderOrderPaymentPage(result.order));

    } catch (err) {
        console.error(err);
        res.status(500).type("html").send(`
            <html><body><h1>Internal server error</h1></body></html>
        `);
    }
}

function renderOrderPaymentPage(order) {
    // services
    let services = [];
    try {
        services = typeof order.services === "string" ? JSON.parse(order.services) : (order.services ?? []);
    } catch (_) {
        services = [];
    }

    return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Order Payment</title>
        <style>
          body { font-family: system-ui, sans-serif; background: #f5f7fa; margin: 0; color: #222; }
          .order-block {
            background: #fff;
            border-radius: 14px;
            padding: 28px 20px 20px;
            box-shadow: 0 2px 16px #0002;
            max-width: 420px;
            margin: 4vw auto;
            min-height: 80vh;
          }
          h1 { font-size: 1.25em; font-weight: 700; margin-top: 0; margin-bottom: 18px; }
          .field { margin-bottom: 10px; }
          label { color: #555; font-weight: 600; min-width: 110px; display: inline-block; }
          .val { color: #1a2232; margin-left: 2px; }
          .services { margin: 15px 0 12px 0; padding-left: 0; }
          .services li { font-size: 1em; margin-bottom: 8px; font-weight: 500; }
          .services li strong { font-size: 1em; }
          .services ul { margin-top: 2px; margin-bottom: 2px; padding-left: 19px; }
          .pay-btn {
            width: 100%;
            padding: 14px 0;
            background: linear-gradient(90deg, #1a7cff, #51bbfe);
            color: #fff; border: none; border-radius: 8px;
            font-size: 1.1em; cursor: pointer; margin-top: 22px; font-weight: 600;
            box-shadow: 0 1px 8px #1a7cff22;
            transition: background 0.15s;
          }
          .pay-btn:hover { background: #155bc1; }
          .footnote {
            margin-top: 18px; color: #888; font-size: 0.97em; text-align: center;
          }
          @media (max-width: 560px) {
            .order-block { max-width: 97vw; min-height: auto; padding: 18px 2vw 12px 2vw;}
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="order-block">
          <h1>Pay the deposit for your order</h1>
          <div class="field"><label>Order:</label> <span class="val">${order.sessionId}</span></div>
          <div class="field"><label>Name:</label> <span class="val">${order.name}</span></div>
          <div class="field"><label>Phone:</label> <span class="val">${order.phone}</span></div>
          <div class="field"><label>Slot:</label> <span class="val">${order.slot ?? ""}</span></div>
          <div class="field"><label>Order Details:</label> <span class="val">${order.details ?? ""}</span></div>
          <div class="field"><label>Full Price:</label> <span class="val">$${order.price}</span></div>
          <div class="field"><label>Status:</label> <span class="val">${order.status}</span></div>
          <div class="field"><label>Services:</label></div>
          ${renderServicesHtml(services)}
          <form method="POST" action="/orders/${encodeURIComponent(order.sessionId)}/checkout">
            <input type="hidden" name="amount" value="100.00" />
            <input type="hidden" name="purpose" value="Deposit" />
            <button type="submit" class="pay-btn">Pay $100.00 Deposit</button>
          </form>
          <div class="footnote">
            After payment, the deposit will be credited to your order.
          </div>
        </div>
      </body>
    </html>
    `;
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
        result.order.status = "paid";
        const updatedRow = result.header.map(key => {
            if (key === "services") {
                // serialize services
                return typeof result.order.services === "string"
                    ? result.order.services
                    : JSON.stringify(result.order.services ?? []);
            }
            return result.order[key] ?? "";
        });
        const range = `${ORDERS_SHEET}!A${result.rowIndex + 2}`;
        await writeToSpreadsheet(SPREADSHEET_ID, range, [updatedRow]);

        res.type("html").send(`
            <html>
              <body>
                <h1>Payment successful</h1>
                <p>Thank you for your order!</p>
                <p>Order ID: <b>${result.order["sessionId"]}</b></p>
                <p>Status: <b>${result.order["s tatus"]}</b></p>
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
