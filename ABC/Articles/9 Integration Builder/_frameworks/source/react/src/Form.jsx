import { Frames, CardNumber, ExpiryDate, Cvv } from "frames-react";
import { useState } from 'react';

const Form = ({
	errors,
	setError,
	successMessage,
	setSuccessMessage,
	isDisabled,
	setDisabled,
}) => {
	const [showLogoPaymentMethod, setShowLogoPaymentMethod] = useState(false);
	const [paymentMethodIcon, setPaymentMethodIcon] = useState('');

	const errorMessages = Object.keys(errors).map((key) => errors[key] && (
		<p key={key} className="error-message">Please enter a valid {key}</p>
	));

	const showPaymentMethodIcon = (paymentType) => {
		setShowLogoPaymentMethod(true);

		if (paymentType) {
			const name = paymentType.toLowerCase();
			setPaymentMethodIcon(`media/card-icons/${name}.svg`);
		}
	};

	const frameValidationChanged = (e) => {
		if (e.isValid || e.isEmpty) {
			if (e.element === 'card-number' && !e.isEmpty) showPaymentMethodIcon();
			setError(e.element, false);
		} else {
			if (e.element === 'card-number') setShowLogoPaymentMethod(false);
			setError(e.element, true);
		}
	};

	const paymentMethodChanged = (e) => {
		if (!e.paymentMethod) setShowLogoPaymentMethod(false);
		else {
			setError('card-number', false);
			showPaymentMethodIcon(e.paymentMethod);
		}
	};

	const cardTokenized = (e) => {
		fetch("http://localhost:5000", {
			method: "post",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				theSecureToken: e.token,
			}),
		});

		setSuccessMessage(`Your card token is ${e.token}.`);
	};

	return (
		<form method="POST" action="/payment" onSubmit={(e) => {
			e.preventDefault();
			return Frames.submitCard();
		}}>
			<Frames
				config={{
					debug: true,
					publicKey: "pk_test_6e40a700-d563-43cd-89d0-f9bb17d35e73",
					/* Inserted localization */
					localization: "NL-NL",
					style: {
						base: {
							color: "#55657D",
							/* Inserted fontSize data */
							fontSize: "16px",
						},
					},
				}}
				frameValidationChanged={frameValidationChanged}
				paymentMethodChanged={paymentMethodChanged}
				cardSubmitted={() =>
					setSuccessMessage("Your card has been submitted successfully.")
				}
				cardTokenized={cardTokenized}
				cardValidationChanged={(e) => setDisabled(!e.isValid)}
			>
				<label>Card Number</label>
				<div className="input-container card-number">
					<InputIcon type="card-number" isError={errors['card-number']} />
					<CardNumber className="input" />
					<PaymentIcon isShown={showLogoPaymentMethod} src={paymentMethodIcon} />
					<ErrorIcon isShown={errors['card-number']} />
				</div>
				<label>Security code</label>
				<div className="expiry-cvv-wrapper">
					<div className="input-container expiry-date">
						<InputIcon type="expiry-date" isError={errors['expiry-date']} />
						<ExpiryDate className="input" />
						<ErrorIcon isShown={errors['expiry-date']} />
					</div>
					<div className="input-container cvv">
						<InputIcon type="cvv" isError={errors['cvv']} />
						<Cvv className="input" />
						<ErrorIcon isShown={errors['cvv']} />
					</div>
				</div>
				<button id="pay-button" type="submit" disabled={isDisabled}>
					Pay £25.00
				</button>
				{errorMessages}
				{successMessage && <p className="success-payment-message">{successMessage}</p>}
			</Frames>
		</form >
	);
};

const imgData = {
	'card-number': { name: 'card', alt: 'PAN' },
	'expiry-date': { name: 'exp-date', alt: 'Expiry date' },
	'cvv': { name: 'cvv', alt: 'cvv' },
};

const InputIcon = ({ isError = false, type = 'card-number' }) => {
	const iconPath = `media/card-icons/${imgData[type].name}${isError ? '-error' : ''}.svg`;
	return (
		<div className="icon-container">
			<img src={iconPath} alt={imgData[type].alt} />
		</div>
	);
};

const PaymentIcon = ({ isShown = false, src = '' }) => {
	const classes = "icon-container payment-method" + (isShown ? ' show' : '');
	return src && (
		<div className={classes}>
			<img id="logo-payment-method" src={src} alt="Payment method" />
		</div>
	);
};

const ErrorIcon = ({ isShown = false }) => isShown && (
	<div className="icon-container">
		<img src="media/card-icons/error.svg" alt="Error" />
	</div>
);

export default Form;
