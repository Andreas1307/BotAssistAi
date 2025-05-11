import React, { useEffect, useState } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import axios from "axios";
import directory from "../directory";

const PayPalIntegration = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`${directory}/auth-check`, {
          withCredentials: true,
        });
        setUser(response.data.user);
      } catch (error) {
        console.error("❌ Error fetching user:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, []);

  const initialOptions = {
    clientId: `${process.env.REACT_APP_PAYPAL_CLIENT_ID}`,
    currency: "EUR",
    components: "buttons",
  };

  const styles = {
    shape: "rect", // Rectangular button shape
    layout: "vertical", // Button stacked vertically
    color: "blue", // Blue button color
    label: "paypal", // Label for the button
    height: 50, // Height of the button
    tagline: false, // Disables tagline for the button (optional)
    maxWidth: "300px", // Maximum width for the button
    borderRadius: 20, // Rounded corners for the button
    padding: "10px", // Padding around the button content
  };

  return (
    <div>

      {isLoading ? (
        <p>Loading...</p>
      ) : !user ? (
        <p>You must be logged in to see the payment button.</p>
      ) : (
        <PayPalScriptProvider options={initialOptions}>
          <PayPalButtons
            style={styles}
            forceReRender={[user.id]} // re-render if user ID changes
            createOrder={(data, actions) => {
              return actions.order.create({
                purchase_units: [
                  {
                    amount: {
                      value: "20.00",
                    },
                    custom_id: `${user.id}`, // attach user ID
                  },
                ],
              });
            }}
            onApprove={async (data, actions) => {
              const details = await actions.order.capture();
              console.log("✅ Payment successful:", details);

              try {
                await axios.post(
                  `${directory}/paypal/webhook`,
                  {
                    userId: user.id,
                    orderID: data.orderID,
                    payerID: data.payerID,
                    paymentDetails: details,
                  },
                  { withCredentials: true }
                );
              } catch (err) {
                console.error("❌ Failed to notify server:", err);
              }
            }}
            onError={(err) => {
              console.error("❌ PayPal Checkout error:", err);
            }}
          />
        </PayPalScriptProvider>
      )}
    </div>
  );
};
export default PayPalIntegration;
