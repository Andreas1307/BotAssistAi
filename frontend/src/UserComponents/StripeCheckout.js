import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
  PaymentRequestButtonElement,
} from "@stripe/react-stripe-js";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import directory from "../directory";
import "../styling/StripeCheckout.css";
import { ToastContainer, toast } from 'react-toastify';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_KEY);

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [paymentRequest, setPaymentRequest] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${directory}/auth-check`, { withCredentials: true });
        setUser(res.data.user);
      } catch (error) {
        console.log("Error fetching user:", error);
        setUser(null);
      }
    };
    fetchUser();
  }, []);

  let toastId;
  const showNotification = (m) => {
    if (!toast.isActive(toastId)) {
      toastId = toast.success(m, {
        toastId: "unique-notification-id", // Helps prevent duplicates
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  const showErrorNotification = () => {
    toast.error("Something went wrong. Please try again.", {
      position: "top-center",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      style: {
        borderRadius: "8px",
        fontSize: "16px",
        backgroundColor: "#330000",
        color: "#fff",
      },
      progressStyle: {
        background: "#ff4d4f",
      },
    });
  };

  useEffect(() => {
    if (!stripe) return;

    const pr = stripe.paymentRequest({
      country: "IE",
      currency: "eur",
      total: { label: "Subscription", amount: 2000 }, // Amount in cents (20 EUR)
      requestPayerName: true,
      requestPayerEmail: true,
    });

    pr.canMakePayment().then((result) => {
      if (result) {
        setPaymentRequest(pr);
      }
    }).catch(error => {
      console.log("Error checking payment methods:", error);
    });
  }, [stripe]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    if (!user || !stripe || !elements) {
      alert("Something went wrong. Please try again.");
      setLoading(false);
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      alert("Card details are missing.");
      setLoading(false);
      return;
    }

    try {
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: "card",
        card: cardElement,
      });

      if (error) {
        alert(error.message);
        setLoading(false);
        return;
      }

      const response = await axios.post(`${directory}/create-subscription`, {
        paymentMethodId: paymentMethod.id,
        email: user.email,
        userId: user.user_id
      });

      const { clientSecret, success } = response.data;

      if (!success || !clientSecret) {
        alert("Payment failed. Please try again.");
        setLoading(false);
        return;
      }

      const { paymentIntent, error: confirmError } = await stripe.confirmCardPayment(clientSecret);

      if (confirmError) {
        alert(confirmError.message);
        setLoading(false);
        return;
      }

      if (paymentIntent.status === "succeeded") {
        alert("Subscription successful!");

        try {
          await axios.get(`${directory}/payed-membership`, {
            params: { type: "Pro", userId: user.user_id },
          });
        } catch (error) {
          console.log("Error updating membership:", error);
        }
        showNotification("Successful Payment");
        navigate(`/${user.username}/dashboard`);
      }
    } catch (error) {
      console.log("Payment processing error:", error);
      showErrorNotification();
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="checkout-form">
      {!user ? <p>Loading user data...</p> : (
        <>
          {paymentRequest && <PaymentRequestButtonElement options={{ paymentRequest }} />}
          <CardElement className="card-input" />
        </>
      )}
      <button type="submit" className="checkout-button" disabled={!stripe || loading || !user}>
        {loading ? "Processing..." : "Subscribe"}
      </button>
    </form>
  );
};

const StripeCheckout = () => (
  <Elements stripe={stripePromise}>
    <div>
      <ToastContainer />
      <CheckoutForm />
    </div>
  </Elements>
);

export default StripeCheckout;



/// keep watching video and see if its going to work, also maybe have
// to use ngrok 