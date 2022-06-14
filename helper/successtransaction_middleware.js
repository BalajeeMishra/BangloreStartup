const PurchaseOfUser = require("../models/purchase_Schema");
const TransactionDetail = require("../models/transaction");
const Cart = require("../models/cart");
const User = require("../models/user");
const wrapAsync = require("../controlError/wrapAsync");
const { transactionWeekFormat, timingFormat } = require("../helper/date");
// this is the middleware that will execute after payment succession.
module.exports.isSuccess = wrapAsync(async (req, res, next) => {
  // taking purchaseid as datetime.now,
  const purchaseid = Date.now();
  // taking all cart on the basis of userid so that we can store the purchased item in other
  // schema named PurchaseOfUser.
  const allCartofuser = await Cart.find({ userId: req.user._id });
  for (let i = 0; i < allCartofuser.length; i++) {
    var purchaseOfUser = new PurchaseOfUser({
      userId: req.user._id,
      product: allCartofuser[i].product,
      purchaseId: purchaseid,
    });

    for (let j = 0; j < allCartofuser[i].categoryofprice.length; j++) {
      purchaseOfUser.purchaseOrder = [
        ...purchaseOfUser.purchaseOrder,
        {
          quantity: allCartofuser[i].categoryofprice[j].quantity,
          price: allCartofuser[i].categoryofprice[j].price,
          totalPrice: allCartofuser[i].categoryofprice[j].totalPrice,
          name: allCartofuser[i].categoryofprice[j].name,
        },
      ];
    }
    await purchaseOfUser.save();
  }
  // for storing current date.
  const dateNow = timingFormat(new Date());
  // finding previous purchase id.
  const lastPurchase = await TransactionDetail.find({});
  if (lastPurchase.length) {
    var id = lastPurchase[lastPurchase.length - 1].purchaseId;
  }

  // storing it for admin purpose.

  const amount = new TransactionDetail({
    userId: req.user._id,
    amount: req.session.amount,
    date: dateNow.dateformattransaction,
  });
  amount.purchaseId = id + 1;
  await amount.save();
  delete req.session.amount;
  // removing all the cart after successfully payment.
  await Cart.deleteMany({ userId: req.user._id });
  // basically here we will give null to cart of that user.
  const user = await User.findById(req.user._id);
  user.cart = null;
  await user.save();
  // await PurchaseOfUser.find({ userId: req.user._id }).updateMany(
  //   {},
  //   { purchaseId: Date.now() }
  // );
});
