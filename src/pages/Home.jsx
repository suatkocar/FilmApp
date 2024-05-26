import { useEffect } from "react";
import axiosClient from "../api/axiosClient";
import FilmCards from "../components/film-cards/FilmCards";
import HeroSlide from "../components/heroSlide/HeroSlide";
import "./Home.css";

function Home() {
  useEffect(() => {
    localStorage.setItem("selectedFormat", "json");
    axiosClient.defaults.headers.common["Accept"] = "application/json";
    axiosClient.defaults.headers.common["Content-Type"] =
      "application/json; charset=UTF-8";
  }, []);

  return (
    <div className="home">
      <HeroSlide />
      <FilmCards />
    </div>
  );
}

export default Home;