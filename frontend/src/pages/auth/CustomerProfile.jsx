import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { Container, Row, Col, Card, Badge, Spinner } from "react-bootstrap";
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope } from "react-icons/fa";

export default function CustomerProfile() {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5001/api/auth/customer/profile", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfile(res.data.data.customer);
      } catch (err) {
        setError("Could not fetch profile");
      }
    })();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("customerName");
    localStorage.removeItem("customerId");
    navigate("/auth/login");
  };

  if (error) {
    return (
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <Header />
        <Container className="my-5 text-center flex-grow-1">
          <h4 className="text-danger">{error}</h4>
        </Container>
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <Header />
        <Container className="my-5 d-flex justify-content-center align-items-center flex-grow-1">
          <Spinner animation="border" variant="primary" />
        </Container>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", backgroundColor: "#f8f9fa" }}>
      <Header />
      
      <Container className="flex-grow-1 py-5">
        <h2 style={{ fontWeight: "700", color: "#2d3436", marginBottom: "30px", textAlign: "center" }}>Profile Overview</h2>
        
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <Card style={{ borderRadius: "16px", border: "none", boxShadow: "0 8px 20px rgba(0,0,0,0.05)", overflow: "hidden" }}>
              <div style={{ height: "120px", background: "linear-gradient(135deg, #ff7f50 0%, #ff5722 100%)", position: "relative" }}>
                <div style={{
                  position: "absolute", bottom: "-40px", left: "50%", transform: "translateX(-50%)",
                  width: "90px", height: "90px", borderRadius: "50%", backgroundColor: "#fff", padding: "5px", boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
                }}>
                   <div style={{
                     width: "100%", height: "100%", borderRadius: "50%", backgroundColor: "#ffe8d6", 
                     display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px", fontWeight: "bold", color: "#ff5722" 
                   }}>
                     {profile.firstName.charAt(0)}{profile.lastName.charAt(0)}
                   </div>
                </div>
              </div>
              
              <Card.Body style={{ paddingTop: "60px", paddingBottom: "40px", paddingLeft: "40px", paddingRight: "40px", textAlign: "center" }}>
                <h3 style={{ fontWeight: "bold", color: "#2d3436", marginBottom: "5px" }}>
                  {profile.firstName} {profile.lastName}
                </h3>
                <Badge bg="success" className="mb-4" style={{ padding: "6px 15px", borderRadius: "20px", fontSize: "14px" }}>Active Account</Badge>

                <h5 style={{ fontWeight: "bold", color: "#2d3436", marginBottom: "20px", textAlign: "left" }}>Personal Information</h5>
                
                <div style={{ backgroundColor: "#fdfdfd", borderRadius: "12px", border: "1px solid #f1f2f6", padding: "20px", textAlign: "left" }}>
                  <div style={infoRowStyle}>
                    <FaEnvelope style={infoIconStyle} />
                    <div>
                      <small style={{ color: "#b2bec3", display: "block" }}>Email Address</small>
                      <span style={{ fontWeight: "500", color: "#2d3436" }}>{profile.email}</span>
                    </div>
                  </div>
                  
                  <div style={infoRowStyle}>
                    <FaPhoneAlt style={infoIconStyle} />
                    <div>
                      <small style={{ color: "#b2bec3", display: "block" }}>Phone Number</small>
                      <span style={{ fontWeight: "500", color: "#2d3436" }}>{profile.phone}</span>
                    </div>
                  </div>
                  
                  <div style={{ ...infoRowStyle, borderBottom: "none", paddingBottom: 0, marginBottom: 0 }}>
                    <FaMapMarkerAlt style={infoIconStyle} />
                    <div>
                      <small style={{ color: "#b2bec3", display: "block" }}>Default Location</small>
                      <span style={{ fontWeight: "500", color: "#2d3436" }}>{profile.location || "Location not set"}</span>
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
      
      <Footer />
    </div>
  );
}

// Reusable Styles
const infoRowStyle = {
  display: "flex",
  alignItems: "center",
  paddingBottom: "15px",
  marginBottom: "15px",
  borderBottom: "1px solid #f1f2f6"
};

const infoIconStyle = {
  fontSize: "20px",
  color: "#ff7f50",
  marginRight: "20px",
  width: "24px",
  textAlign: "center"
};
