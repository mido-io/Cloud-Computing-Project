import React, { useEffect, useState } from "react";
import { Form, Container, Row, Col, Card, Badge, Button, Spinner } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { FaEdit, FaTrashAlt, FaEye, FaShoppingCart, FaHome, FaStore, FaUser, FaBoxOpen, FaMapMarkerAlt, FaHashtag } from "react-icons/fa";
import Header from "../../components/Header";
import axios from "axios";



function OrderHome({ handleDelete, handleEdit }) {
  const [orders, setOrders]               = useState([]);
  const [restaurants, setRestaurants]     = useState([]);
  const [customerNames, setCustomerNames] = useState({});
  const [searchQuery, setSearchQuery]     = useState('');
  const navigate = useNavigate();

  // Helper: get restaurant name by ID
  const getRestName = (id) => {
    const r = restaurants.find(r => r._id === id);
    return r ? r.name : (id?.length > 12 ? id.slice(0,8)+'...' : id);
  };

  // Helper: get customer name by ID
  const getCustName = (id) => {
    if (customerNames[id]) return customerNames[id];
    const stored = localStorage.getItem('customerId');
    if (stored === id) return localStorage.getItem('customerName') || id.slice(0,8)+'...';
    return id?.length > 12 ? id.slice(0,8)+'...' : id;
  };

  // Load orders and restaurants
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get("http://localhost:5005/api/orders", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.status !== 200) throw new Error("Failed to fetch orders");
        setOrders(response.data);
        return response.data;
      } catch (error) {
        console.error("Error fetching orders:", error);
        return [];
      }
    };

    const fetchRestaurants = async () => {
      try {
        const res = await axios.get('http://localhost:5002/api/superAdmin/restaurants/public');
        setRestaurants(res.data);
      } catch (e) { console.error(e); }
    };

    const fetchCustomerNames = async (ordersData) => {
      const token = localStorage.getItem('token');
      const uniqueIds = [...new Set(ordersData.map(o => o.customerId))];
      const names = {};
      await Promise.allSettled(
        uniqueIds.map(async (id) => {
          try {
            const res = await axios.get(`http://localhost:5005/api/users/${id}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            names[id] = res.data.name || id.slice(0,8)+'...';
          } catch { names[id] = id?.slice(0,8)+'...'; }
        })
      );
      setCustomerNames(names);
    };

    fetchOrders().then(data => { if (data) fetchCustomerNames(data); });
    fetchRestaurants();
  }, []);

  // Filter orders (excluding canceled ones and matching search)
  const filteredOrders = orders
    .filter((order) => order.status.toLowerCase() !== "canceled")
    .filter((order) =>
      order.restaurantId.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleBack = () => {
    navigate("/customer/home"); // Navigate back to customer home page
  };

  return (
    <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />
      
      <Container className="py-5 flex-grow-1">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="d-flex align-items-center gap-3">
            <button
              onClick={handleBack}
              style={{
                backgroundColor: "#fff", border: "1px solid #e9ecef", color: "#2d3436",
                width: "45px", height: "45px", borderRadius: "12px", display: "flex", 
                alignItems: "center", justifyContent: "center", cursor: "pointer",
                boxShadow: "0 2px 5px rgba(0,0,0,0.02)", transition: "all 0.2s"
              }}
              onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"}
              onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
            >
              <FaHome size={20} />
            </button>
            <h2 style={{ fontWeight: "800", color: "#2d3436", margin: 0 }}>My Orders</h2>
          </div>

          <Link to="/customer/cart" style={{ textDecoration: "none" }}>
            <Button variant="warning" style={{
              backgroundColor: "#ff9800", border: "none", color: "white",
              padding: "10px 20px", borderRadius: "12px", fontWeight: "600",
              boxShadow: "0 4px 10px rgba(255, 152, 0, 0.3)", display: "flex", alignItems: "center", gap: "8px"
            }}>
              <FaShoppingCart /> View Cart
            </Button>
          </Link>
        </div>

        <Card style={{ borderRadius: "16px", border: "none", boxShadow: "0 8px 20px rgba(0,0,0,0.03)", marginBottom: "30px" }}>
          <Card.Body className="p-4">
            <Form.Group className="position-relative">
              <FaStore style={{ position: "absolute", left: "20px", top: "50%", transform: "translateY(-50%)", color: "#b2bec3" }} />
              <Form.Control
                type="text"
                placeholder="Search orders by Restaurant ID..."
                value={searchQuery}
                onChange={handleSearchChange}
                style={{
                  padding: "15px 15px 15px 50px", fontSize: "16px", borderRadius: "12px",
                  border: "1px solid #e9ecef", backgroundColor: "#fdfdfd", boxShadow: "none"
                }}
              />
            </Form.Group>
          </Card.Body>
        </Card>

        {filteredOrders.length === 0 ? (
          <div className="text-center py-5">
            <div style={{ width: "80px", height: "80px", backgroundColor: "#ffeaa7", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <FaBoxOpen size={30} color="#fdcb6e" />
            </div>
            <h4 style={{ color: "#2d3436", fontWeight: "700" }}>No Orders Found</h4>
            <p style={{ color: "#636e72" }}>You haven't placed any orders matching your search.</p>
          </div>
        ) : (
          <Row className="g-4">
            {filteredOrders.map((order) => (
              <Col xs={12} key={order._id}>
                <Card style={{ borderRadius: "16px", border: "none", boxShadow: "0 4px 15px rgba(0,0,0,0.04)", overflow: "hidden", transition: "transform 0.2s" }} className="order-card-hover">
                  
                  {/* Order Header */}
                  <div style={{ backgroundColor: "#fff", padding: "20px 25px", borderBottom: "1px solid #f1f2f6", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "15px" }}>
                    <div className="d-flex align-items-center gap-3">
                      <div style={{ width: "50px", height: "50px", backgroundColor: "#ffe8d6", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", color: "#ff5722", fontSize: "20px" }}>
                        <FaStore />
                      </div>
                      <div>
                        <h5 style={{ fontWeight: "700", color: "#2d3436", margin: 0, marginBottom: "4px" }}>{getRestName(order.restaurantId)}</h5>
                        <div className="d-flex align-items-center gap-2" style={{ fontSize: "13px", color: "#636e72" }}>
                          <FaHashtag /> {order._id.slice(-8).toUpperCase()} &nbsp;&bull;&nbsp; 
                          <FaUser /> {getCustName(order.customerId)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="d-flex align-items-center gap-4">
                      <div className="text-end">
                        <small style={{ color: "#b2bec3", display: "block", textTransform: "uppercase", letterSpacing: "1px", fontSize: "11px", fontWeight: "700" }}>Total Amount</small>
                        <strong style={{ fontSize: "20px", color: "#2d3436", fontWeight: "800" }}>{order.totalPrice} EGP</strong>
                      </div>
                      <Badge bg={order.status === "Pending" ? "warning" : "success"} style={{ padding: "8px 12px", borderRadius: "8px", fontSize: "13px", fontWeight: "600" }}>
                        {order.status}
                      </Badge>
                    </div>
                  </div>

                  {/* Order Items */}
                  <Card.Body style={{ padding: "25px", backgroundColor: "#fdfdfd" }}>
                    <Row className="g-3">
                      <Col md={8}>
                        <h6 style={{ fontWeight: "700", color: "#2d3436", marginBottom: "15px", fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Order Items</h6>
                        <div className="d-flex flex-column gap-2">
                          {order.items.map((item, index) => (
                            <div key={index} className="d-flex justify-content-between align-items-center" style={{ backgroundColor: "#fff", padding: "12px 15px", borderRadius: "8px", border: "1px solid #f1f2f6" }}>
                              <div className="d-flex align-items-center gap-3">
                                <Badge bg="secondary" style={{ backgroundColor: "#e9ecef", color: "#2d3436", borderRadius: "6px" }}>{item.quantity}x</Badge>
                                <span style={{ fontWeight: "600", color: "#2d3436" }}>{item.foodId.replace('food_', '').replace(/_/g, ' ')}</span>
                              </div>
                              <span style={{ fontWeight: "600", color: "#ff5722" }}>{item.price} EGP</span>
                            </div>
                          ))}
                        </div>
                        
                        <div className="mt-4 d-flex align-items-center gap-2" style={{ color: "#636e72", fontSize: "14px" }}>
                          <FaMapMarkerAlt color="#ff7f50" /> 
                          <strong>Delivery to:</strong> {order.deliveryAddress}
                        </div>
                      </Col>
                      
                      <Col md={4} className="d-flex flex-column justify-content-center align-items-end border-start ps-4">
                        <div className="d-flex gap-2">
                          <Link to={`/orders/details/${order._id}`}>
                            <Button variant="outline-info" style={{ borderRadius: "8px", fontWeight: "600", display: "flex", alignItems: "center", gap: "6px" }}>
                              <FaEye /> Details
                            </Button>
                          </Link>
                          {order.status === "Pending" && (
                            <Link to={`/orders/delete/${order._id}`}>
                              <Button variant="outline-danger" style={{ borderRadius: "8px", fontWeight: "600", display: "flex", alignItems: "center", gap: "6px" }}>
                                <FaTrashAlt /> Cancel
                              </Button>
                            </Link>
                          )}
                        </div>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </div>
  );
}

export default OrderHome;    
