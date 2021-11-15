/* global Frames */
const payButton = document.getElementById("pay-button");
const form = document.getElementById("payment-form");
let requestData;

//Test key
Frames.init({
	publicKey: "pk_test_8ac41c0d-fbcc-4ae3-a771-31ea533a2beb",
	localization: "EN-GB",
	style: {
    base: {
      color: "#55657D",
      fontSize: "14px",
    },
  },
});

const logos = generateLogos();

//Error messages
const errors = {};
errors["card-number"] = "Please enter a valid card number";
errors["expiry-date"] = "Please enter a valid expiry date";
errors["cvv"] = "Please enter a valid cvv code";

//Frames event for validation change
Frames.addEventHandler(
	Frames.Events.FRAME_VALIDATION_CHANGED,
	onValidationChanged
);

//Function declarations
function generateLogos() {
	let logos = {};
	logos["card-number"] = {
		src: "card",
		alt: "card number logo",
	};
	logos["expiry-date"] = {
		src: "exp-date",
		alt: "expiry date logo",
	};
	logos["cvv"] = {
		src: "cvv",
		alt: "cvv logo",
	};
	return logos;
}

function onValidationChanged(event) {
	const e = event.element;

	if (event.isValid || event.isEmpty) {
		if (e === "card-number" && !event.isEmpty) {
			showPaymentMethodIcon();
		}
		setDefaultIcon(e);
		clearErrorIcon(e);
		clearErrorMessage(e);
	} else {
		if (e === "card-number") {
			clearPaymentMethodIcon();
		}
		setDefaultErrorIcon(e);
		setErrorIcon(e);
		setErrorMessage(e);
	}
}

function clearErrorMessage(el) {
	const selector = ".error-message__" + el;
	const message = document.querySelector(selector);
	message.textContent = "";
}

function clearErrorIcon(el) {
	const logo = document.getElementById("icon-" + el + "-error");
	logo.style.removeProperty("display");
}

function showPaymentMethodIcon(parent, pm) {
	if (parent) parent.classList.add("show");

	const logo = document.getElementById("logo-payment-method");
	if (pm) {
		const name = pm.toLowerCase();
		logo.setAttribute("src", "media/card-icons/" + name + ".svg");
		logo.setAttribute("alt", pm || "payment method");
	}
	logo.style.removeProperty("display");
}

function clearPaymentMethodIcon(parent) {
	if (parent) parent.classList.remove("show");

	const logo = document.getElementById("logo-payment-method");
	logo.style.setProperty("display", "none");
}

function setErrorMessage(el) {
	const selector = ".error-message__" + el;
	const message = document.querySelector(selector);
	message.textContent = errors[el];
}

function setDefaultIcon(el) {
	const selector = "icon-" + el;
	const logo = document.getElementById(selector);
	logo.setAttribute("src", "media/card-icons/" + logos[el].src + ".svg");
	logo.setAttribute("alt", logos[el].alt);
}

function setDefaultErrorIcon(el) {
	const selector = "icon-" + el;
	const logo = document.getElementById(selector);
	logo.setAttribute("src", "media/card-icons/" + logos[el].src + "-error.svg");
	logo.setAttribute("alt", logos[el].alt);
}

function setErrorIcon(el) {
	var logo = document.getElementById("icon-" + el + "-error");
	logo.style.setProperty("display", "block");
}

Frames.addEventHandler(
	Frames.Events.CARD_VALIDATION_CHANGED,
	cardValidationChanged
);

function cardValidationChanged() {
	payButton.disabled = !Frames.isCardValid();
}

Frames.addEventHandler(
	Frames.Events.CARD_TOKENIZATION_FAILED,
	onCardTokenizationFailed
);
function onCardTokenizationFailed(error) {
	console.log("CARD_TOKENIZATION_FAILED: %o", error);
	Frames.enableSubmitForm();
}

Frames.addEventHandler(Frames.Events.CARD_TOKENIZED, onCardTokenized);
function onCardTokenized(event) {
	const el = document.querySelector(".success-payment-message");
	el.innerHTML =
		"Card tokenization completed<br>" +
		'Your card token is: <span class="token">' +
		event.token +
		"</span>";
}

Frames.addEventHandler(
	Frames.Events.PAYMENT_METHOD_CHANGED,
	paymentMethodChanged
);
function paymentMethodChanged(event) {
	const pm = event.paymentMethod;
	let container = document.querySelector(".icon-container.payment-method");

	if (!pm) {
		clearPaymentMethodIcon(container);
	} else {
		clearErrorIcon("card-number");
		showPaymentMethodIcon(container, pm);
	}
}

form.addEventListener("submit", onSubmit);
function onSubmit(event) {
	event.preventDefault();
	Frames.submitCard();
}

Frames.addEventHandler(Frames.Events.CARD_TOKENIZED, function (event) {
	fetch("http://localhost:5000", {
		method: "post",
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			theSecureToken: event.token,
		}),
	});
});
