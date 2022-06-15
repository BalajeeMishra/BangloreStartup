const mongoose = require("mongoose");
const CartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Webinar",
    },
    categoryofprice: [
      {
        quantity: Number,
        price: {
          type: Number,
        },
        totalPrice: {
          type: Number,
        },
        name: {
          type: String,
        },
      },
    ],
    active: {
      type: Boolean,
      default: true,
    },
    modifiedOn: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: Boolean,
      default: false,
    },
    visibility: {
      type: Boolean,
      default: true,
    },
    cartSessionId: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Cart", CartSchema);
