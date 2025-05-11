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
    clientId: "AeLR7-a4m24hwoJp_te4UIxc2XQvPdv_V4JH2MnUVaWvPfCyiSNwD-413nUW7CgYncWem8tJu4t0MBHt", // Replace this with a real sandbox/live ID
    currency: "EUR",
    components: "buttons",
  };

  const styles = {
    shape: "rect",
    layout: "vertical",
    color: "blue",
    label: "paypal",
  };

  return (
    <div>
      <h2>Subscribe to BotAssist</h2>

      {isLoading ? (
        <p>Loading...</p>
      ) : !user ? (
        <p>You must be logged in to see the payment button.</p>
      ) : (
        <PayPalScriptProvider options={initialOptions}>
        {/* PayPal button */}
        <PayPalButtons
          style={styles}
          forceReRender={[user.id]}
          createOrder={(data, actions) => {
            return actions.order.create({
              purchase_units: [
                {
                  amount: {
                    value: "20.00",
                  },
                  custom_id: `${user.id}`,
                },
              ],
            });
          }}
          onApprove={async (data, actions) => {
            const details = await actions.order.capture();
            console.log("✅ PayPal Payment successful:", details);
      
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
      
        {/* Debit or Credit Card button */}
        <PayPalButtons
          fundingSource="card"
          style={{
            color: "black", // ✅ valid color for card button
            shape: "pill",
            label: "pay",
            layout: "vertical",
          }}
          forceReRender={[user.id]}
          createOrder={(data, actions) => {
            return actions.order.create({
              purchase_units: [
                {
                  amount: {
                    value: "20.00",
                  },
                  custom_id: `${user.id}`,
                },
              ],
            });
          }}
          onApprove={async (data, actions) => {
            const details = await actions.order.capture();
            console.log("✅ Card Payment successful:", details);
      
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
            console.error("❌ Card Checkout error:", err);
          }}
        />
      </PayPalScriptProvider>
      

      )}
    </div>
  );
};
export default PayPalIntegration;
