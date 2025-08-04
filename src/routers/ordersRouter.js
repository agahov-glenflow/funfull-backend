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
 * /orders:
 *   get:
 *     summary: Get all orders (need to be authorized)
 *     tags:
 *       - Orders
 *     security:
 *        - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of orders
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 orders:
 *                   type: array
 *                   items:
 *                     type: object
 */
router.get("/", authMiddleware, getAllOrders);

/**
 * @openapi
 * /order:
 *   post:
 *     summary: Create a new order (need to be authorized)
 *     tags:
 *       - Orders
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Order created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.post("/", createOrder);

/**
 * @openapi
 * /order/{orderId}:
 *   put:
 *     summary: Update an order by Session Id (need to be authorized)
 *     tags:
 *       - Orders
 *     parameters:
 *       - in: path
 *         name: orderId
 *         schema:
 *           type: string
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Order updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: Order not found
 */
router.put("/:orderId", updateOrder);

/**
 * @openapi
 * /order/{orderId}:
 *   get:
 *     summary: Get an order by Session Id (need to be authorized)
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
router.get("/:orderId", authMiddleware, getOrder);

/**
 * @openapi
 * /order/{orderId}/form:
 *   get:
 *     summary: Render payment form for the order
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
router.get("/:orderId/form", getPaymentForm);

/**
 * @openapi
 * /order/{orderId}/checkout:
 *   post:
 *     summary: Confirm payment for the order
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