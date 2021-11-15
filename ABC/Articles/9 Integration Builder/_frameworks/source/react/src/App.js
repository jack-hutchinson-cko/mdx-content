import { useState } from "react";
import Form from "./Form";
import "./App.css";

const initialErrorsState = {
	"card-number": false,
	"expiry-date": false,
	"cvv": false,
};

function App() {
	const [errors, setErrors] = useState(initialErrorsState);
	const [successMessage, setSuccessMessage] = useState("");
	const [isDisabled, setDisabled] = useState(true);

	return (
		<Form
			errors={errors}
			setError={(elementName, status) => setErrors((p) => ({ ...p, [elementName]: status }))}
			successMessage={successMessage}
			setSuccessMessage={setSuccessMessage}
			isDisabled={isDisabled}
			setDisabled={setDisabled}
		/>
	);
}

export default App;