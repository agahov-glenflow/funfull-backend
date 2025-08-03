// api/src/routers/eventsRouter.js

import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {createInvoice, getInvoice, getPaymentPage, getPrice, getSlots} from "../controllers/eventsController.js";

const router = express.Router();

/**
 * @openapi
 * /events/{eventId}/slots:
 *   get:
 *     summary: Get available reservation slots for the event (need to be authorized)
 *     tags:
 *     - Events
 *     parameters:
 *       - in: path
 *         name: eventId
 *         schema:
 *           type: string
 *         required: true
 *         description: Event ID
 *     responses:
 *       200:
 *         description: List of available slots
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 description: "Slot model"
 */
router.get("/:eventId/slots", authMiddleware, getSlots);

/**
 * @openapi
 * /events/{eventId}/price:
 *   get:
 *     summary: Get an invoice object describing the price for the event (need to be authorized)
 *     tags:
 *      - Events
 *     parameters:
 *       - in: path
 *         name: eventId
 *         schema:
 *           type: string
 *         required: true
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Invoice price object
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               description: "Invoice model"
 */
router.get("/:eventId/price", authMiddleware, getPrice);

/**
 * @openapi
 * /events/{eventId}/invoice:
 *   post:
 *     summary: Create an invoice for the event and returns invoice details (need to be authorized)
 *     tags:
 *       - Events
 *     parameters:
 *       - in: path
 *         name: eventId
 *         schema:
 *           type: string
 *         required: true
 *         description: Event ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: "Invoice creation parameters (optional)"
 *     responses:
 *       201:
 *         description: Invoice created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 invoiceId:
 *                   type: string
 *                   example: "12345"
 *                 status:
 *                   type: string
 *                   example: "not_paid"
 */
router.post("/:eventId/invoice", authMiddleware, createInvoice);


/**
 * @openapi
 * /events/{eventId}/payment:
 *   get:
 *     summary: Get the HTML page for payment of the event's invoice
 *     tags:
 *       - Events
 *     parameters:
 *       - in: path
 *         name: eventId
 *         schema:
 *           type: string
 *         required: true
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Event invoice payment HTML page
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               description: HTML string
 */
router.get("/:eventId/payment", getPaymentPage);

/**
 * @openapi
 * /events/{eventId}/invoice:
 *   get:
 *     summary: Get invoice information, including payment status (need to be authorized)
 *      tags:
 *          - Events
 *     parameters:
 *       - in: path
 *         name: eventId
 *         schema:
 *           type: string
 *         required: true
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Invoice info and status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 invoiceId:
 *                   type: string
 *                   example: "123456"
 *                 status:
 *                   type: string
 *                   example: "paid"
 *                   description: "Invoice status: not_paid, paid, payment_error"
 */
router.get("/:eventId/invoice", authMiddleware, getInvoice);

/**
 * @openapi
 * /events/{eventId}/payment:
 *   post:
 *     summary: Payment completed callback called by the external payment system when payment is completed successfully
 *     tags:
 *       - Events
 *     parameters:
 *       - in: path
 *         name: eventId
 *         schema:
 *           type: string
 *         required: true
 *         description: Event ID
 *     requestBody:
 *       required: false
 *     responses:
 *       200:
 *         description: Payment confirmed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "ok"
 */
router.post("/:eventId/payment", async (req, res) => {
    // TODO: process callback from payment system
    res.json({ status: "ok" });
});

export default router;