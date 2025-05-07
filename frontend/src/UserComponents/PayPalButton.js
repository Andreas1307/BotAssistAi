import React from "react";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import PayPalButton from "./PayPalButton"; // Adjust the import path as needed

const App = () => {
  const initialOptions = {
    "client-id": "ARbQko77YCiZKJNtoXufKsS23r_-P4Ak5kKwJ0roLrsX1SWCm-Ab3tN1AWyt9HYcbTzLQ6RjJnRnSMEd", // Replace with your PayPal client ID
    currency: "USD",
    intent: "capture",
  };

  return (
    <PayPalScriptProvider options={initialOptions}>
      <div>
        <h1>Your App</h1>
        <PayPalButton amount={10.00} /> {/* Example amount */}
      </div>
    </PayPalScriptProvider>
  );
};

export default App;

// trebuie sa am plan_id ala si poate pot sa creez din backend