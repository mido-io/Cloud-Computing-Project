import React from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FaUser, FaStore, FaCrown, FaArrowRight } from "react-icons/fa";

function LoginHub() {
  const navigate = useNavigate();

  const portals = [
    {
      id: "customer",
      title: "Customer Login",
      description: "Order food, track delivery, and manage your profile.",
      icon: <FaUser size={40} color="#ff9800" />,
      path: "/auth/login",
      gradient: "linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)",
      borderColor: "#ffb74d"
    },
    {
      id: "restaurant",
      title: "Restaurant Admin",
      description: "Manage your menu, view orders, and update details.",
      icon: <FaStore size={40} color="#4caf50" />,
      path: "/restaurant/login",
      gradient: "linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)",
      borderColor: "#81c784"
    },
    {
      id: "superadmin",
      title: "Super Admin",
      description: "Manage all users, restaurants, and system settings.",
      icon: <FaCrown size={40} color="#2196f3" />,
      path: "/superadmin/login",
      gradient: "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)",
      borderColor: "#64b5f6"
    }
  ];

  return (
    <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "40px 20px" }}>
      <div style={{ textAlign: "center", marginBottom: "50px" }}>
        <h1 style={{ fontWeight: "900", color: "#2d3436", fontSize: "48px", letterSpacing: "-1px", marginBottom: "15px" }}>
          Welcome to SkyDish
        </h1>
        <p style={{ color: "#636e72", fontSize: "18px", maxWidth: "600px", margin: "0 auto" }}>
          Please select your portal below to log in and access your personalized dashboard.
        </p>
      </div>

      <Container>
        <Row className="justify-content-center g-4">
          {portals.map((portal) => (
            <Col xs={12} md={4} key={portal.id}>
              <Card 
                onClick={() => navigate(portal.path)}
                className="h-100 border-0 portal-card"
                style={{ 
                  borderRadius: "20px", 
                  boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
                  cursor: "pointer",
                  transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)",
                  overflow: "hidden",
                  position: "relative"
                }}
              >
                <div style={{ 
                  height: "8px", 
                  width: "100%", 
                  backgroundColor: portal.borderColor 
                }}></div>
                <Card.Body style={{ padding: "40px 30px", background: portal.gradient }}>
                  <div style={{ 
                    backgroundColor: "white", 
                    width: "80px", 
                    height: "80px", 
                    borderRadius: "50%", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center",
                    boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
                    marginBottom: "25px"
                  }}>
                    {portal.icon}
                  </div>
                  <h3 style={{ fontWeight: "800", color: "#2d3436", marginBottom: "15px" }}>{portal.title}</h3>
                  <p style={{ color: "#636e72", fontSize: "15px", lineHeight: "1.6", marginBottom: "30px" }}>
                    {portal.description}
                  </p>
                  
                  <div className="d-flex align-items-center gap-2" style={{ color: portal.borderColor, fontWeight: "700", fontSize: "16px", marginTop: "auto" }}>
                    Go to Portal <FaArrowRight />
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
      
      <style dangerouslySetInnerHTML={{__html: `
        .portal-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.1) !important;
        }
      `}} />
    </div>
  );
}

export default LoginHub;
