import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/header/Header";
import Footer from "./components/footer/Footer";
import Home from "./pages/Home";
import FilmList from "./pages/FilmList";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  return (
    <Router basename="/FilmApp">
      <div className="main-content">
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/film-list" element={<FilmList />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
