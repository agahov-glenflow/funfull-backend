// api/src/controllers/eventsController.js

export async function getSlots(req, res) {
    res.json([]); // return empty array for now
}

export async function getPrice(req, res) {
    res.json({}); // return empty object for now
}

export async function getPaymentPage(req, res) {
    res.type('html').send("<html><body><h1>Invoice payment page</h1></body></html>")
}

export async function getInvoice(req, res) {
    res.json({
        invoiceId: "123456",
        status: "paid"
        // ...other invoice info
    });
}

export async function createInvoice(req, res) {
    res.status(201).json({
        invoiceId: "12345",
        status: "not_paid"
    });
}