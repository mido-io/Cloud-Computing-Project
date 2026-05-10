import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Badge, Button, Spinner } from "react-bootstrap";
import axios from "axios";
import { CartContext } from "../contexts/CartContext";
import { FaHome, FaHeart, FaRegHeart, FaCartPlus, FaUtensils } from "react-icons/fa";
import Header from "../../components/Header";

function FoodItemList() {
  const { restaurantId } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);

  const [foods, setFoods] = useState([]);
  const [restaurantName, setRestaurantName] = useState(""); 
  const [error, setError] = useState("");
  const [favorites, setFavorites] = useState({});

  useEffect(() => {
    const fetchRestaurantFoods = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5002/api/food-items/restaurant/${restaurantId}`
        );
        setFoods(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load food items.");
      }
    };

    const fetchRestaurantDetails = async () => {
      try {
        // Use the public restaurant endpoint on the restaurant service (5002)
        const res = await axios.get(
          `http://localhost:5002/api/superAdmin/restaurants/public`
        );
        const restaurant = res.data.find(r => r._id === restaurantId);
        if (restaurant) setRestaurantName(restaurant.name);
      } catch (err) {
        console.error(err);
        setRestaurantName('Restaurant');
      }
    };

    fetchRestaurantFoods();
    fetchRestaurantDetails(); //  Fetch restaurant name
  }, [restaurantId]);

  const toggleFavorite = (foodId) => {
    setFavorites((prev) => ({
      ...prev,
      [foodId]: !prev[foodId],
    }));
  };

  const handleAddToCart = (food) => {
    addToCart(food);
    navigate("/customer/cart");
  };

  return (
    <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />

      <Container className="py-5 flex-grow-1">
        {/* Back Navigation & Restaurant Header */}
        <div className="d-flex align-items-center mb-5 gap-3">
          <button
            onClick={() => navigate("/customer/home")}
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
          
          <div style={{ flexGrow: 1, position: "relative", overflow: "hidden", borderRadius: "16px", background: "linear-gradient(135deg, #ff7f50 0%, #ff5722 100%)", padding: "30px", color: "white", boxShadow: "0 8px 20px rgba(255, 87, 34, 0.2)" }}>
            <FaUtensils style={{ position: "absolute", right: "-20px", bottom: "-20px", fontSize: "120px", opacity: 0.1, transform: "rotate(-15deg)" }} />
            <h2 style={{ fontWeight: "800", margin: 0, fontSize: "32px", textShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>{restaurantName}</h2>
            <p style={{ margin: 0, opacity: 0.9, fontSize: "16px", marginTop: "5px" }}>Explore our delicious menu</p>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger" style={{ borderRadius: "12px", fontWeight: "600" }}>
            {error}
          </div>
        )}

        {/* Menu Grid */}
        {foods.length === 0 && !error ? (
          <div className="text-center py-5">
            <div style={{ width: "80px", height: "80px", backgroundColor: "#ffeaa7", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <FaUtensils size={30} color="#fdcb6e" />
            </div>
            <h4 style={{ color: "#2d3436", fontWeight: "700" }}>Menu Unavailable</h4>
            <p style={{ color: "#636e72" }}>This restaurant hasn't added any food items yet.</p>
          </div>
        ) : (
          <Row className="g-4">
            {foods.map((food) => (
              <Col xs={12} sm={6} lg={4} xl={3} key={food._id}>
                <Card className="h-100 food-card-hover" style={{ borderRadius: "16px", border: "none", boxShadow: "0 4px 15px rgba(0,0,0,0.04)", overflow: "hidden", transition: "transform 0.2s, box-shadow 0.2s", position: "relative" }}>
                  
                  {/* Favorite Button Overlay */}
                  <div 
                    onClick={(e) => { e.stopPropagation(); toggleFavorite(food._id); }}
                    style={{ position: "absolute", top: "15px", right: "15px", zIndex: 2, backgroundColor: "white", width: "35px", height: "35px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", cursor: "pointer", transition: "transform 0.2s" }}
                    onMouseEnter={e => e.currentTarget.style.transform = "scale(1.1)"}
                    onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                  >
                    {favorites[food._id] ? <FaHeart color="#ff4757" size={18} /> : <FaRegHeart color="#a4b0be" size={18} />}
                  </div>

                  <div style={{ height: "200px", overflow: "hidden" }}>
                    <Card.Img 
                      variant="top" 
                      src={food.image?.startsWith('/uploads') ? `http://localhost:5002${food.image}` : food.image || 'https://placehold.co/300x200?text=Food'} 
                      style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s" }}
                      className="food-img"
                    />
                  </div>
                  
                  <Card.Body className="d-flex flex-column p-4">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h5 style={{ fontWeight: "700", color: "#2d3436", margin: 0, fontSize: "18px", lineHeight: "1.3" }}>{food.name}</h5>
                      <Badge bg="light" text="dark" style={{ border: "1px solid #e9ecef", fontWeight: "600" }}>{food.category}</Badge>
                    </div>
                    
                    <Card.Text style={{ color: "#636e72", fontSize: "14px", flexGrow: 1, marginBottom: "20px" }}>
                      {food.description}
                    </Card.Text>
                    
                    <div className="d-flex justify-content-between align-items-center mt-auto">
                      <span style={{ fontSize: "20px", fontWeight: "800", color: "#ff5722" }}>
                        {food.price} <span style={{ fontSize: "14px", color: "#b2bec3" }}>EGP</span>
                      </span>
                      
                      <Button 
                        onClick={() => handleAddToCart(food)}
                        style={{ backgroundColor: "#2d3436", border: "none", borderRadius: "10px", padding: "8px 16px", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }}
                        className="add-to-cart-btn"
                      >
                        <FaCartPlus /> Add
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Container>
      
      <style dangerouslySetInnerHTML={{__html: `
        .food-card-hover:hover { transform: translateY(-5px) !important; box-shadow: 0 12px 25px rgba(0,0,0,0.08) !important; }
        .food-card-hover:hover .food-img { transform: scale(1.05) !important; }
        .add-to-cart-btn:hover { background-color: #ff5722 !important; box-shadow: 0 4px 10px rgba(255, 87, 34, 0.3); transform: translateY(-2px); }
      `}} />
    </div>
  );
}

export default FoodItemList;
