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
import MessagesPage from "./Components/MessagesPage";
import ProductsPage from "./Components/ProductsPage";
// import ProductDetailsPage from "./Components/ProductDetailsPage";
import UsersPage from "./Components/UsersPage";
import AddPerfumePage from "./Components/AddPerfumePage";
import EditPerfumePage from "./Components/EditPerfumePage";
import AboutPage from "./Components/AboutPage";
import AboutListPage from "./Components/AboutListPage";

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
        { path: "/products", element: <ProductsPage /> },
        // { path: "/products/:id", element: <ProductDetailsPage /> },
        { path: "/messages", element: <MessagesPage /> },
        { path: "/users", element: <UsersPage /> },
        { path: "/about", element: <AboutListPage /> },
        { path: "/about/edit", element: <AboutPage /> },
        { path: "/perfumes/add", element: <AddPerfumePage /> },
        { path: "/perfumes/edit/:id", element: <EditPerfumePage /> },
        { path: "*", element: <NotFound /> },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;
