import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import HomePage from "./pages/HomePage";
import SingleVenuePage from "./pages/SingleVenuePage";
import { AuthProvider } from "./context/AuthContext";
import ProfilePage from "./pages/Profile";
import CreateVenuePage from "./pages/CreateVenuePage";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/venue/:id" element={<SingleVenuePage />} />
          <Route path="/venues/create" element={<CreateVenuePage />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
