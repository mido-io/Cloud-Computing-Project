import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Container, Row, Col, Card, Badge, Button } from "react-bootstrap";
import { FaUtensils, FaMotorcycle, FaMapMarkerAlt, FaStar } from "react-icons/fa";
import "../styles/home.css";

// Import images
import burgerImage from "../assets/images/burgers.jpg";
import pizzaImage from "../assets/images/pizzas.png";
import sushiImage from "../assets/images/sushi.jpg";
import dessertImage from "../assets/images/desserts.png";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <Header />

      <main className="home-main">
        {/* Premium Hero Section */}
        <section className="hero-section">
          <div className="hero-overlay"></div>
          <Container className="hero-content">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <Badge bg="warning" text="dark" className="hero-badge mb-3 py-2 px-3 rounded-pill fs-6">
                🚀 #1 Food Delivery Service
              </Badge>
              <h1 className="hero-title">
                Craving Something <span className="highlight-text">Delicious?</span>
              </h1>
              <p className="hero-subtitle">
                Get your favorite meals delivered blazing fast. Discover the best restaurants around you and enjoy a premium dining experience at home.
              </p>
              
              <div className="hero-buttons">
                <motion.button 
                  onClick={() => navigate('/customer/home')}
                  className="btn btn-lg btn-primary hero-btn-primary"
                  whileHover={{ scale: 1.05, boxShadow: "0 10px 20px rgba(255, 87, 34, 0.3)" }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaUtensils className="me-2" /> Explore Menu
                </motion.button>
                <motion.button 
                  onClick={() => navigate('/auth/register')}
                  className="btn btn-lg btn-outline-light hero-btn-secondary"
                  whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.1)" }}
                  whileTap={{ scale: 0.95 }}
                >
                  Sign Up Now
                </motion.button>
              </div>

              <div className="hero-stats mt-5">
                <div className="stat-item">
                  <h3 className="fw-bold">500+</h3>
                  <span>Restaurants</span>
                </div>
                <div className="stat-item border-start border-end border-light px-4">
                  <h3 className="fw-bold">20Mins</h3>
                  <span>Fast Delivery</span>
                </div>
                <div className="stat-item">
                  <h3 className="fw-bold">4.9<FaStar className="text-warning fs-5 pb-1" /></h3>
                  <span>User Ratings</span>
                </div>
              </div>
            </motion.div>
          </Container>
        </section>

        {/* Featured Categories (Glassmorphism Cards) */}
        <section className="featured-categories py-5">
          <Container>
            <div className="text-center mb-5">
              <h2 className="section-title">Popular Categories</h2>
              <p className="section-subtitle">Find what you're craving today</p>
            </div>
            
            <Row className="g-4">
              {[
                { name: 'Gourmet Burgers', image: burgerImage, items: "120+ Places" }, 
                { name: 'Wood-fired Pizza', image: pizzaImage, items: "85+ Places" }, 
                { name: 'Fresh Sushi', image: sushiImage, items: "40+ Places" }, 
                { name: 'Sweet Desserts', image: dessertImage, items: "60+ Places" }
              ].map((category, index) => (
                <Col md={6} lg={3} key={index}>
                  <motion.div
                    className="category-card-wrapper"
                    whileHover={{ y: -10 }}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    onClick={() => navigate(`/customer/home?search=${category.name.split(' ').pop()}`)}
                  >
                    <Card className="category-card border-0 h-100">
                      <div className="category-img-wrapper">
                        <Card.Img variant="top" src={category.image} className="category-img" />
                        <div className="category-overlay">
                          <span className="view-btn">View Menu</span>
                        </div>
                      </div>
                      <Card.Body className="text-center">
                        <h5 className="fw-bold mb-1">{category.name}</h5>
                        <small className="text-muted">{category.items}</small>
                      </Card.Body>
                    </Card>
                  </motion.div>
                </Col>
              ))}
            </Row>
          </Container>
        </section>

        {/* How It Works Section */}
        <section className="how-it-works-section py-5 bg-light">
          <Container>
            <div className="text-center mb-5">
              <h2 className="section-title">How It Works</h2>
              <p className="section-subtitle">Your food, delivered in 3 simple steps</p>
            </div>
            
            <Row className="text-center g-4 position-relative">
              <Col md={4}>
                <motion.div className="process-card p-4 rounded-4 bg-white shadow-sm h-100"
                  initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
                >
                  <div className="icon-wrapper bg-primary-light text-primary mx-auto mb-4">
                    <FaMapMarkerAlt size={32} />
                  </div>
                  <h4 className="fw-bold">1. Set Location</h4>
                  <p className="text-muted">Enter your address to see restaurants delivering to your area.</p>
                </motion.div>
              </Col>
              
              <Col md={4}>
                <motion.div className="process-card p-4 rounded-4 bg-white shadow-sm h-100"
                  initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
                >
                  <div className="icon-wrapper bg-success-light text-success mx-auto mb-4">
                    <FaUtensils size={32} />
                  </div>
                  <h4 className="fw-bold">2. Choose Food</h4>
                  <p className="text-muted">Browse menus, customize your order, and add items to your cart.</p>
                </motion.div>
              </Col>
              
              <Col md={4}>
                <motion.div className="process-card p-4 rounded-4 bg-white shadow-sm h-100"
                  initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.4 }}
                >
                  <div className="icon-wrapper bg-warning-light text-warning mx-auto mb-4">
                    <FaMotorcycle size={32} />
                  </div>
                  <h4 className="fw-bold">3. Fast Delivery</h4>
                  <p className="text-muted">Track your order in real-time as it makes its way to your doorstep.</p>
                </motion.div>
              </Col>
            </Row>
          </Container>
        </section>

      </main>
      <Footer />
    </div>
  );
}

export default Home;
