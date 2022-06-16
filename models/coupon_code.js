const mongoose = require("mongoose");
const CouponCodeSchema = new mongoose.Schema({
  coupon: {
    type: Number,
  },
  discountinpercentage: {
    type: Number,
  },
  discountinprice: {
    type: Number,
  },
});
module.exports = mongoose.model("Coupon", CouponCodeSchema);
