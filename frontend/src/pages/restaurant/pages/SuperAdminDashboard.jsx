import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Table, Button, Form, Modal, Badge, InputGroup } from 'react-bootstrap';
import { FaStore, FaEdit, FaTrashAlt, FaSignOutAlt, FaSearch, FaUserTie, FaMapMarkerAlt, FaPhoneAlt } from 'react-icons/fa';
import '../styles/dashboard.css';

function SuperAdminDashboard() {
  const [restaurants, setRestaurants] = useState([]);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [superAdminName, setSuperAdminName] = useState('');


  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('superAdminName');
    window.location.href = '/restaurant/home'; // redirect to login page
  };
  

  const [editing, setEditing] = useState(null); // stores restaurant ID that is being edited
  const [formData, setFormData] = useState({
    name: '',
    ownerName: '',
    location: '',
    contactNumber: '',
  });

  const filteredRestaurants = restaurants.filter(r =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  

  // Fetch restaurants when the component mounts
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5002/api/superadmin/restaurants', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
  
        const data = await res.json();
        if (res.ok) {
          setRestaurants(data);
        } else {
          setError(data.message || 'Failed to fetch restaurants');
        }
      } catch (err) {
        setError('Server error while fetching restaurants');
      }
    };
  
    const name = localStorage.getItem('superAdminName');
    if (name) setSuperAdminName(name); // ✅ add this line
  
    fetchRestaurants();
  }, []);
  

  // Edit button click handler
  const handleEditClick = (restaurant) => {
    setEditing(restaurant._id); // set the restaurant being edited
    setFormData({
      name: restaurant.name,
      ownerName: restaurant.ownerName,
      location: restaurant.location,
      contactNumber: restaurant.contactNumber,
    });
  };

  // Handle form data changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle the Save button click
  const handleSaveEdit = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5002/api/superadmin/restaurant/${editing}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        // Update the restaurant list with the edited data
        setRestaurants(
          restaurants.map((rest) =>
            rest._id === editing ? { ...rest, ...formData } : rest
          )
        );
        setEditing(null); // close the edit form
        alert(data.message);
      } else {
        alert(data.message || 'Save failed');
      }
    } catch (err) {
      alert('Server error during saving');
    }
  };

  // Delete restaurant handler
  const handleDelete = async (id) => {
    const confirm = window.confirm('Are you sure you want to delete this restaurant?');
    if (!confirm) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5002/api/superadmin/restaurant/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        setRestaurants(restaurants.filter((r) => r._id !== id));
        alert(data.message);
      } else {
        alert(data.message || 'Delete failed');
      }
    } catch (err) {
      alert('Server error during deletion');
    }
  };

  return (
    <div style={{ backgroundColor: "#f4f7f6", minHeight: "100vh" }}>
      {/* Top Navbar */}
      <div style={{ backgroundColor: "#2c3e50", padding: "15px 30px", display: "flex", justifyContent: "space-between", alignItems: "center", color: "white", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
        <h3 style={{ margin: 0, fontWeight: "800", letterSpacing: "1px" }}>👑 SkyDish <span style={{ color: "#ffc107", fontWeight: "400" }}>Super Admin</span></h3>
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <span style={{ fontSize: "16px", fontWeight: "600" }}>Welcome, {superAdminName || 'Admin'} 👋</span>
          <Button variant="danger" onClick={handleLogout} style={{ borderRadius: "8px", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }}>
            <FaSignOutAlt /> Logout
          </Button>
        </div>
      </div>

      <Container fluid style={{ padding: "40px" }}>
        
        {/* Stats Section */}
        <Row className="mb-4">
          <Col md={4}>
            <Card style={{ borderRadius: "16px", border: "none", boxShadow: "0 8px 20px rgba(0,0,0,0.05)", background: "linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)", color: "white" }}>
              <Card.Body style={{ padding: "30px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h6 style={{ textTransform: "uppercase", letterSpacing: "1px", opacity: 0.9 }}>Total Restaurants</h6>
                  <h2 style={{ fontWeight: "800", margin: 0, fontSize: "40px" }}>{restaurants.length}</h2>
                </div>
                <FaStore size={50} style={{ opacity: 0.8 }} />
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card style={{ borderRadius: "16px", border: "none", boxShadow: "0 8px 20px rgba(0,0,0,0.05)", background: "linear-gradient(135deg, #fce38a 0%, #f38181 100%)", color: "white" }}>
              <Card.Body style={{ padding: "30px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h6 style={{ textTransform: "uppercase", letterSpacing: "1px", opacity: 0.9 }}>Active Partners</h6>
                  <h2 style={{ fontWeight: "800", margin: 0, fontSize: "40px" }}>{restaurants.length > 0 ? restaurants.length - 1 : 0}</h2>
                </div>
                <FaUserTie size={50} style={{ opacity: 0.8 }} />
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card style={{ borderRadius: "16px", border: "none", boxShadow: "0 8px 20px rgba(0,0,0,0.05)", background: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)", color: "white" }}>
              <Card.Body style={{ padding: "30px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h6 style={{ textTransform: "uppercase", letterSpacing: "1px", opacity: 0.9 }}>System Status</h6>
                  <h2 style={{ fontWeight: "800", margin: 0, fontSize: "36px" }}>Online</h2>
                </div>
                <Badge bg="light" text="success" style={{ padding: "10px", borderRadius: "50%" }}>
                   <div style={{ width: "20px", height: "20px", backgroundColor: "#28a745", borderRadius: "50%", border: "3px solid white", boxShadow: "0 0 10px rgba(40,167,69,0.5)" }}></div>
                </Badge>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {error && (
          <div className="alert alert-danger" style={{ borderRadius: "12px", fontWeight: "600" }}>{error}</div>
        )}

        {/* Main Data Section */}
        <Card style={{ borderRadius: "16px", border: "none", boxShadow: "0 8px 30px rgba(0,0,0,0.04)", overflow: "hidden" }}>
          <Card.Header style={{ backgroundColor: "white", padding: "20px 30px", borderBottom: "1px solid #f1f2f6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h4 style={{ margin: 0, fontWeight: "700", color: "#2d3436", display: "flex", alignItems: "center", gap: "10px" }}>
              <FaStore color="#007bff" /> Restaurant Management
            </h4>
            
            <InputGroup style={{ width: "350px" }}>
              <InputGroup.Text style={{ backgroundColor: "#f8f9fa", border: "1px solid #e9ecef", borderRight: "none" }}>
                <FaSearch color="#adb5bd" />
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Search by restaurant name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ border: "1px solid #e9ecef", borderLeft: "none", backgroundColor: "#f8f9fa", boxShadow: "none" }}
              />
            </InputGroup>
          </Card.Header>
          
          <Card.Body style={{ padding: 0 }}>
            <Table hover responsive style={{ margin: 0 }}>
              <thead style={{ backgroundColor: "#f8f9fa" }}>
                <tr>
                  <th style={{ padding: "15px 30px", color: "#636e72", fontWeight: "600", borderBottom: "2px solid #e9ecef" }}>Restaurant Name</th>
                  <th style={{ padding: "15px", color: "#636e72", fontWeight: "600", borderBottom: "2px solid #e9ecef" }}>Owner</th>
                  <th style={{ padding: "15px", color: "#636e72", fontWeight: "600", borderBottom: "2px solid #e9ecef" }}>Location</th>
                  <th style={{ padding: "15px", color: "#636e72", fontWeight: "600", borderBottom: "2px solid #e9ecef" }}>Contact</th>
                  <th style={{ padding: "15px 30px", color: "#636e72", fontWeight: "600", borderBottom: "2px solid #e9ecef", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRestaurants.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-5 text-muted">No restaurants found matching your search.</td>
                  </tr>
                ) : (
                  filteredRestaurants.map((rest) => (
                    <tr key={rest._id} style={{ verticalAlign: "middle" }}>
                      <td style={{ padding: "15px 30px", fontWeight: "700", color: "#2d3436" }}>{rest.name}</td>
                      <td style={{ padding: "15px", color: "#636e72" }}><FaUserTie className="me-2 text-muted"/> {rest.ownerName}</td>
                      <td style={{ padding: "15px", color: "#636e72" }}><FaMapMarkerAlt className="me-2 text-muted"/> {rest.location}</td>
                      <td style={{ padding: "15px", color: "#636e72" }}><FaPhoneAlt className="me-2 text-muted"/> {rest.contactNumber}</td>
                      <td style={{ padding: "15px 30px", textAlign: "right" }}>
                        <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleEditClick(rest)} style={{ borderRadius: "8px", fontWeight: "600" }}>
                          <FaEdit /> Edit
                        </Button>
                        <Button variant="outline-danger" size="sm" onClick={() => handleDelete(rest._id)} style={{ borderRadius: "8px", fontWeight: "600" }}>
                          <FaTrashAlt /> Delete
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      </Container>

      {/* Edit Restaurant Modal */}
      <Modal show={editing !== null} onHide={() => setEditing(null)} centered>
        <Modal.Header closeButton style={{ borderBottom: "none", padding: "25px 25px 10px 25px" }}>
          <Modal.Title style={{ fontWeight: "800", color: "#2d3436" }}>Edit Restaurant</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: "20px 25px" }}>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label style={{ fontWeight: "600", color: "#636e72" }}>Restaurant Name</Form.Label>
              <Form.Control type="text" name="name" value={formData.name} onChange={handleInputChange} style={{ borderRadius: "8px", padding: "10px" }} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label style={{ fontWeight: "600", color: "#636e72" }}>Owner Name</Form.Label>
              <Form.Control type="text" name="ownerName" value={formData.ownerName} onChange={handleInputChange} style={{ borderRadius: "8px", padding: "10px" }} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label style={{ fontWeight: "600", color: "#636e72" }}>Location</Form.Label>
              <Form.Control type="text" name="location" value={formData.location} onChange={handleInputChange} style={{ borderRadius: "8px", padding: "10px" }} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label style={{ fontWeight: "600", color: "#636e72" }}>Contact Number</Form.Label>
              <Form.Control type="text" name="contactNumber" value={formData.contactNumber} onChange={handleInputChange} style={{ borderRadius: "8px", padding: "10px" }} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer style={{ borderTop: "none", padding: "10px 25px 25px 25px" }}>
          <Button variant="light" onClick={() => setEditing(null)} style={{ borderRadius: "8px", fontWeight: "600" }}>Cancel</Button>
          <Button variant="primary" onClick={handleSaveEdit} style={{ borderRadius: "8px", fontWeight: "600" }}>Save Changes</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default SuperAdminDashboard;
