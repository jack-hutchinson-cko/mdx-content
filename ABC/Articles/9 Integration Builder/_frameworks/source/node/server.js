const express = require("express");
const path = require("path");
const cors = require("cors");
const port = 5000;
const app = express();

const { Checkout } = require("checkout-sdk-node");
const cko = new Checkout("sk_test_XXXX");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, '.'), {
    index: 'payment-form.html'
}));

app.route("/");
app.use(cors());

app.post("/", async (req, res) => {
	const payment = await cko.payments.request({
		source: { token: req.body.theSecureToken },
		customer: {
			email: "user@email.com",
			name: "James Bond",
		},
		currency: "EUR",
		amount: 1000,
		reference: "ORDER123",
	});
});

app.listen(port, () => {
	console.log(`Now listening on port http://localhost:${port}`);
});
