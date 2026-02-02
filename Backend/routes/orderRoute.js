const express = require("express");
const {
  getAllOrders,
  getAdminOrders,
  addOrder,
  updateOrderPaymentStatus,
} = require("../controllers/ordersController");
const {
  authMiddleware,
  requireRole,
} = require("../middlewares/authMiddleware");
const validateOrder = require("../middlewares/validateOrder");

const router = express.Router();

router.get("/admin", authMiddleware, requireRole(["admin"]), getAdminOrders);
router.patch("/:id", authMiddleware, requireRole(["admin"]), updateOrder);
router
  .route("/")
  .get(authMiddleware, getAllOrders)
  .post(authMiddleware, validateOrder, addOrder);

module.exports = router;
