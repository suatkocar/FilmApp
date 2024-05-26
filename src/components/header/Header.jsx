import { useState, useEffect, useRef } from "react";
import "./Header.css";
import lottie from "lottie-web";

function Header() {
    const [isPlaying, setIsPlaying] = useState(false); // State to manage play status of the music
    const [isEverPlayed, setIsEverPlayed] = useState(false); // State to track if the logo has ever been played
    const headerLogoRef = useRef(null); // Ref for the header logo container
    const headerMusicRef = useRef(null); // Ref for the audio element
    const animationInstance = useRef(null); // Ref for the lottie animation instance

    // Effect to initialize the lottie animation on component mount
    useEffect(() => {
        animationInstance.current = lottie.loadAnimation({
            container: headerLogoRef.current,
            renderer: "svg",
            loop: true,
            autoplay: true,
            path: "/FilmApp/assets/json/header-logo-paused.json",
        });
        return () => animationInstance.current.destroy();
    }, []);

    const togglePlay = () => {
        setIsEverPlayed(true); // Set that the logo has been interacted with
        if (!isPlaying) {
            headerMusicRef.current
                .play()
                .catch((err) => console.error("Playback failed:", err));
            animationInstance.current.destroy();
            animationInstance.current = lottie.loadAnimation({
                // Load the playing animation
                container: headerLogoRef.current,
                renderer: "svg",
                autoplay: true,
                path: "/FilmApp/assets/json/header-logo-playing.json",
            });
        } else {
            headerMusicRef.current.pause(); // Pause the audio
            animationInstance.current.destroy(); // Destroy the animation instance
            animationInstance.current = lottie.loadAnimation({
                // Load the paused animation
                container: headerLogoRef.current,
                renderer: "svg",
                autoplay: true,
                path: "/FilmApp/assets/json/header-logo-paused.json",
            });
        }
        setIsPlaying(!isPlaying); // Toggle the isPlaying state
    };

    // Effect to handle the header animation on scroll
    useEffect(() => {
        const shrinkHeader = () => {
            const header = document.getElementById("header"); // Get the header element by id
            const scrollPosition =
                window.pageYOffset || document.documentElement.scrollTop; // Get current scroll position
            header.classList.toggle("shrink", scrollPosition > 100); // Add/remove 'shrink' class based on scroll position
        };
        window.addEventListener("scroll", shrinkHeader); // Attach scroll event listener
        return () => window.removeEventListener("scroll", shrinkHeader); // Cleanup the event listener
    }, []);

    return (
        <div className="header" id="header">
            <div className="headerWrap">
                <div
                    className={`header-content-logo ${isPlaying
                        ? "header-logo-playing"
                        : isEverPlayed
                            ? "header-logo-paused"
                            : ""
                        }`}
                    ref={headerLogoRef}
                    onClick={togglePlay}
                ></div>
                <audio
                    src="/FilmApp/assets/audio/The-Godfather-Theme-Song.mp3"
                    ref={headerMusicRef}
                ></audio>
                <ul className="headerNav">
                    <li className="navItem">
                        <a href="/FilmApp/">Home</a>
                    </li>
                    <li className="navItem">
                        <a href="/FilmApp/film-list">Film List</a>
                    </li>
                </ul>
            </div>
        </div>
    );
}

export default Header;