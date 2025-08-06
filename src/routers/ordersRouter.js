// ./src/routers/ordersRouter.js

import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
    checkoutOrder,
    createOrder,
    getAllOrders,
    getOrder,
    getPaymentForm,
    updateOrder
} from "../controllers/ordersController.js";

const router = express.Router();

/**
 * @openapi
 * /order:
 *   post:
 *     summary: Create a new order (requires authorization)
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sessionId:
 *                 type: string
 *                 example: "session-123"
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               phone:
 *                 type: string
 *                 example: "+1234567890"
 *               services:
 *                 type: array
 *                 items:
 *                   type: object
 *               slot:
 *                 type: string
 *                 example: "2023-10-27T14:30:00-04:00"
 *                 description: Selected time slot for the event
 *               details:
 *                 type: string
 *                 example: "2 participants, birthday party"
 *                 description: Additional wishes or order details
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sessionId:
 *                   type: string
 *                 name:
 *                   type: string
 *                 phone:
 *                   type: string
 *                 services:
 *                   type: array
 *                   items:
 *                     type: object
 *                 slot:
 *                   type: string
 *                   description: Selected time slot for the event
 *                 price:
 *                   type: string
 *                   description: Full order price
 *                 status:
 *                   type: string
 *                   example: "pending"
 *                 details:
 *                   type: string
 *                   description: Additional wishes or order details
 *                 created_at:
 *                   type: string
 *                   example: "2023-10-27T14:30:00-04:00"
 *                   description: Date and time when order was created
 *             examples:
 *               example:
 *                 summary: Example response
 *                 value:
 *                   sessionId: "session-123"
 *                   name: "John Doe"
 *                   phone: "+1234567890"
 *                   services:
 *                     - name: "10 Jumpers Ticket"
 *                       price: "319.95"
 *                       relatedServices:
 *                         - name: "Upgrade to 2nd Floor Tables"
 *                           price: "120.00"
 *                     - name: "Mini-Melts"
 *                       price: "5.00"
 *                   slot: "2023-10-27T14:30:00-04:00"
 *                   price: "444.95"
 *                   status: "pending"
 *                   details: "2 participants, birthday party"
 *                   createdAt: "2023-10-27T14:30:00-04:00"
 */
router.post("/", createOrder);

/** Get all orders (need to be authorized) - hidden from swagger */
router.get("/", authMiddleware, getAllOrders);



/** Update an order (need to be authorized) - hidden from swagger */
router.put("/:orderId", updateOrder);

/**
 * @openapi
 * /order/{orderId}:
 *   get:
 *     summary: Get an order by Order Id (requires authorization)
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         schema:
 *           type: string
 *         required: true
 *         description: Session Id of the order
 *     responses:
 *       200:
 *         description: Order found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sessionId:
 *                   type: string
 *                   example: "session-123"
 *                 name:
 *                   type: string
 *                   example: "John Doe"
 *                 phone:
 *                   type: string
 *                   example: "+1234567890"
 *                 services:
 *                   type: array
 *                   items:
 *                     type: object
 *                 slot:
 *                   type: string
 *                   example: "2023-10-27T14:30:00-04:00"
 *                 price:
 *                   type: string
 *                   example: "448.95"
 *                 status:
 *                   type: string
 *                   example: "pending"
 *                 details:
 *                   type: string
 *                   example: "2 participants"
 *                 createdAt:
 *                   type: string
 *                   example: "2023-10-27T14:30:00-04:00"
 *       404:
 *         description: Order not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Order not found"
 */
router.get("/:orderId", authMiddleware, getOrder);

/**
 * @openapi
 * /order/{orderId}/checkout:
 *   get:
 *     summary: Render fake payment form for the order
 *     tags:
 *       - Orders
 *     parameters:
 *       - in: path
 *         name: orderId
 *         schema:
 *           type: string
 *         required: true
 *         description: Session Id of the order
 *     responses:
 *       200:
 *         description: Payment form HTML page
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               example: "<html><body><h1>Pay for your order</h1>...</body></html>"
 *       404:
 *         description: Order not found (HTML page)
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               example: "<html><body><h1>Order not found</h1></body></html>"
 */
router.get("/:orderId/checkout", getPaymentForm);

/**
 * @openapi
 * /order/{orderId}/checkout:
 *   post:
 *     summary: Confirm fake payment for the order
 *     tags:
 *       - Orders
 *     parameters:
 *       - in: path
 *         name: orderId
 *         schema:
 *           type: string
 *         required: true
 *         description: Session Id of the order
 *     responses:
 *       200:
 *         description: Order payment confirmed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "ok"
 *                 order:
 *                   type: object
 *       404:
 *         description: Order not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Order not found"
 */
router.post("/:orderId/checkout", checkoutOrder);

export default router;