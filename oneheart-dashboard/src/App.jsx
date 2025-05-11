import {
  RouterProvider,
  createBrowserRouter,
  Navigate,
} from "react-router-dom";
import "./App.css";
import Login from "./Components/Login";
import MainPage from "./Components/MainPage";
import PageLayout from "./PageLayout";
import NotFound from "./Components/404Page";
import ProjectsPage from "./Components/ProjectsPage";
import CampaginsPage from "./Components/CampaginsPage";
import MessagesPage from "./Components/MessagesPage";
import SponsorshipPage from "./Components/SponsorshipsPage";
import DocumentationsPage from "./Components/DocumentationsPage";
import DocumentationPhotos from "./Components/DocumentationPhotos";
import DocumentationVideos from "./Components/DocumentationVideos";
import SettingsComponents from "./Components/SettingsComponents";
import StudentsPage from "./Components/StudentsPage";
import LessonsPage from "./Components/LessonsPage";
import ProductsPage from "./Components/ProductsPage";
import ProductDetailsPage from "./Components/ProductDetailsPage";
import CoursesPage from "./Components/CoursesPage";
import ViewCourse from './Components/ViewCourse';
import UsersPage from "./Components/UsersPage";
import NewsPage from "./Components/NewsPage";
import CarouselDemo from "./Components/CarouselDemo";

function App() {
  const isAuthenticated = !!localStorage.getItem("token");

  const router = createBrowserRouter([
    {
      path: "/login",
      element: isAuthenticated ? <Navigate to="/" replace /> : <Login />,
    },
    {
      path: "/",
      element: isAuthenticated ? (
        <PageLayout />
      ) : (
        <Navigate to="/login" replace />
      ),
      children: [
        { path: "/", element: <MainPage /> },
        { path: "/projects", element: <ProjectsPage /> },
        { path: "/students", element: <StudentsPage /> },
        { path: "/lessons", element: <LessonsPage /> },
        { path: "/products", element: <ProductsPage /> },
        { path: "/products/:id", element: <ProductDetailsPage /> },
        { path: "/news", element: <NewsPage /> },
        { path: "/courses", element: <CoursesPage /> },
        { path: "/sponsorship", element: <SponsorshipPage /> },
        { path: "/messages", element: <MessagesPage /> },
        { path: "/view-course/:id", element: <ViewCourse /> },
        { path: "/course/:newLink", element: <ViewCourse /> },
        { path: "/users", element: <UsersPage /> },
        { path: "/carousel-demo", element: <CarouselDemo /> },
        { path: "*", element: <NotFound /> },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;
