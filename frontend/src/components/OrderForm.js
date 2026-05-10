import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Button, Form, Spinner, Card, ListGroup, Badge } from "react-bootstrap";
import { CartContext } from "../pages/contexts/CartContext";

function OrderForm({ addOrder }) {
  const { cartItems } = useContext(CartContext);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Read token and customer ID from localStorage
  const token = localStorage.getItem('token');
  const customerId = (() => {
    try {
      return JSON.parse(atob(token.split('.')[1])).id;
    } catch { return ''; }
  })();

  // Group cart items and calculate totals
  const orderDetails = React.useMemo(() => {
    if (!cartItems || cartItems.length === 0) return null;

    const itemsMap = {};
    let total = 0;
    const restId = cartItems[0].restaurant || cartItems[0].restaurantId;

    cartItems.forEach(item => {
      const id = item.name; // using name as foodId for readability
      if (!itemsMap[id]) {
        itemsMap[id] = { foodId: id, quantity: 1, price: item.price };
      } else {
        itemsMap[id].quantity += 1;
      }
      total += item.price;
    });

    return {
      restaurantId: restId,
      items: Object.values(itemsMap),
      totalPrice: total
    };
  }, [cartItems]);

  useEffect(() => {
    if (!cartItems || cartItems.length === 0) {
      navigate('/customer/cart');
    }
  }, [cartItems, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!deliveryAddress.trim() || deliveryAddress.length < 10) {
      setError("Please enter a valid delivery address (at least 10 characters).");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const orderPayload = {
        customerId,
        restaurantId: orderDetails.restaurantId,
        items: orderDetails.items,
        totalPrice: orderDetails.totalPrice,
        deliveryAddress
      };

      await axios.post('http://localhost:5005/api/orders', orderPayload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Clear the cart in UI? The context doesn't have a clearCart function, but we can just navigate away.
      alert("Your Order Is Successfully Created 🎉");
      // Optionally we could empty the cart items here if CartContext exposed setCartItems
      navigate("/orders");
    } catch (err) {
      console.error("Error creating order:", err);
      const backendMessage = err.response?.data?.message || "There was an error creating your order. Please try again.";
      setError(backendMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!orderDetails) return null;

  return (
    <div className="container" style={{ padding: "40px 20px", display: "flex", justifyContent: "center" }}>
      <Card style={{ width: "100%", maxWidth: "600px", borderRadius: "12px", boxShadow: "0 8px 24px rgba(0,0,0,0.1)", border: "none" }}>
        <Card.Body style={{ padding: "40px" }}>
          <h2 style={{ textAlign: "center", marginBottom: "30px", fontWeight: "bold", color: "#333" }}>
            Complete Your Order
          </h2>

          <Card className="mb-4" style={{ background: "#f8f9fa", border: "none" }}>
            <Card.Body>
              <h5 style={{ fontWeight: "bold", marginBottom: "15px" }}>Order Summary</h5>
              <ListGroup variant="flush">
                {orderDetails.items.map((item, idx) => (
                  <ListGroup.Item key={idx} style={{ background: "transparent", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0" }}>
                    <div>
                      <span style={{ fontWeight: "600" }}>{item.foodId}</span>
                      <span style={{ color: "#666", marginLeft: "10px", fontSize: "14px" }}>x{item.quantity}</span>
                    </div>
                    <span style={{ fontWeight: "600", color: "#1a73e8" }}>{item.price * item.quantity} EGP</span>
                  </ListGroup.Item>
                ))}
              </ListGroup>
              <hr />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "15px" }}>
                <span style={{ fontSize: "18px", fontWeight: "bold" }}>Total to Pay:</span>
                <span style={{ fontSize: "22px", fontWeight: "bold", color: "#e60000" }}>{orderDetails.totalPrice} EGP</span>
              </div>
            </Card.Body>
          </Card>

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-4">
              <Form.Label style={{ fontWeight: "600" }}>Delivery Address</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="e.g., 123 Main St, Apt 4B, Cairo"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                style={{ borderRadius: "8px", resize: "none" }}
              />
              {error && <Form.Text className="text-danger mt-2" style={{ fontSize: "14px" }}>{error}</Form.Text>}
            </Form.Group>

            <div style={{ display: "flex", gap: "15px" }}>
              <Button
                variant="light"
                onClick={() => navigate("/customer/cart")}
                style={{ flex: 1, padding: "12px", borderRadius: "8px", fontWeight: "bold" }}
              >
                Back to Cart
              </Button>
              <Button
                type="submit"
                disabled={loading}
                style={{
                  flex: 2,
                  padding: "12px",
                  borderRadius: "8px",
                  fontWeight: "bold",
                  background: "#ff7f50",
                  borderColor: "#ff7f50"
                }}
              >
                {loading ? <Spinner as="span" animation="border" size="sm" /> : "Confirm & Place Order"}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}

export default OrderForm;
