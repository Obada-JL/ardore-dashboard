import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Container, Row, Col, Card, Badge, Tabs, Tab, Spinner, Alert } from 'react-bootstrap';

export default function ViewCourse() {
  const { id, newLink } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = "https://api.lineduc.com/api";  
  const BASE_URL = "https://api.lineduc.com";  

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        let courseResponse;
        
        // Check if we're using the /course/:newLink route
        if (location.pathname.startsWith('/course/')) {
          console.log("Fetching course by newLink:", newLink);
          // Fetch course by newLink using the dedicated API endpoint
          courseResponse = await axios.get(`${API_BASE_URL}/getCourseByLink/${newLink}`);
        } else {
          // Fetch course by ID
          console.log("Fetching course by ID:", id);
          courseResponse = await axios.get(`${API_BASE_URL}/getCourse/${id}`);
        }
        
        const courseData = courseResponse.data;
        console.log("Course data received:", courseData);
        setCourse(courseData);
        
        // Handle redirection if newLink exists and we're not already on a newLink route
        if (courseData.newLink && 
            courseData.newLink.trim() !== '' && 
            !location.pathname.startsWith('/course/')) {
          console.log("Redirecting to course page with newLink:", courseData.newLink);
          navigate(`/course/${courseData.newLink}`);
          return;
        }
        
        if (courseData.category) {
          try {
            const categoryResponse = await axios.get(`${API_BASE_URL}/getCategory/${courseData.category}`);
            setCategory(categoryResponse.data);
          } catch (categoryError) {
            console.error('Error fetching category:', categoryError);
          }
        }
      } catch (error) {
        console.error('Error fetching course data:', error);
        setError('Failed to load course data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [id, newLink, navigate, location.pathname]);

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    const videoId = url.split('v=')[1]?.split('&')[0];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  if (!course) {
    return (
      <Container className="py-5 text-center">
        <h3>Course not found</h3>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={4}>
              {course.courseMainImage && (
                <img
                  src={`${BASE_URL}/courseImages/${course.courseMainImage}`}
                  alt={course.mainTitle?.en}
                  className="img-fluid rounded mb-3"
                />
              )}
            </Col>
            <Col md={8}>
              <Tabs defaultActiveKey="ar" id="course-language-tabs" className="mb-3">
                <Tab eventKey="ar" title="العربية">
                  <h2>{course.mainTitle?.ar}</h2>
                  <h5 className="text-muted">{course.courseField?.ar}</h5>
                  <p>{course.description?.ar}</p>
                </Tab>
                <Tab eventKey="en" title="English">
                  <h2>{course.mainTitle?.en}</h2>
                  <h5 className="text-muted">{course.courseField?.en}</h5>
                  <p>{course.description?.en}</p>
                </Tab>
              </Tabs>
              {category && (
                <Badge bg="info" className="mb-2">
                  {category.categoryTitle}
                </Badge>
              )}
              
              {course.newLink && (
                <div className="mt-3">
                  <Alert variant="info">
                    Course Link: <strong>{course.newLink}</strong>
                  </Alert>
                </div>
              )}
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Additional Images */}
      {course.courseImages && course.courseImages.length > 0 && (
        <Card className="mb-4">
          <Card.Header>
            <h4>Gallery</h4>
          </Card.Header>
          <Card.Body>
            <Row>
              {course.courseImages.map((image, index) => (
                <Col key={index} md={3} className="mb-3">
                  <img
                    src={`${BASE_URL}/courseImages/${image}`}
                    alt={`Gallery ${index + 1}`}
                    className="img-fluid rounded"
                  />
                </Col>
              ))}
            </Row>
          </Card.Body>
        </Card>
      )}

      {/* Videos Section */}
      {course.videos && course.videos.length > 0 && (
        <Card className="mb-4">
          <Card.Header>
            <h4>Videos</h4>
          </Card.Header>
          <Card.Body>
            {course.videos.map((video, index) => (
              <div key={index} className="mb-4">
                <Tabs defaultActiveKey="ar" id={`video-tabs-${index}`} className="mb-3">
                  <Tab eventKey="ar" title="العربية">
                    <h5>{video.title?.ar}</h5>
                    <p>{video.description?.ar}</p>
                  </Tab>
                  <Tab eventKey="en" title="English">
                    <h5>{video.title?.en}</h5>
                    <p>{video.description?.en}</p>
                  </Tab>
                </Tabs>
                {getYouTubeEmbedUrl(video.url) && (
                  <div className="ratio ratio-16x9">
                    <iframe
                      src={getYouTubeEmbedUrl(video.url)}
                      title={video.title?.en}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                )}
              </div>
            ))}
          </Card.Body>
        </Card>
      )}

      {/* Games Section */}
      {course.games && course.games.length > 0 && (
        <Card className="mb-4">
          <Card.Header>
            <h4>Games</h4>
          </Card.Header>
          <Card.Body>
            {course.games.map((game, index) => (
              <div key={index} className="mb-4">
                <Tabs defaultActiveKey="ar" id={`game-tabs-${index}`} className="mb-3">
                  <Tab eventKey="ar" title="العربية">
                    <h5>{game.title?.ar}</h5>
                    <p>{game.description?.ar}</p>
                  </Tab>
                  <Tab eventKey="en" title="English">
                    <h5>{game.title?.en}</h5>
                    <p>{game.description?.en}</p>
                  </Tab>
                </Tabs>
                <a href={game.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                  Play Game
                </a>
              </div>
            ))}
          </Card.Body>
        </Card>
      )}
    </Container>
  );
} 