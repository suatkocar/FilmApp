import { useEffect, useRef } from "react";
import "./Footer.css";
import lottie from "lottie-web";

function Footer() {
    // Refs for DOM elements and animation instance
    const footerLogoRef = useRef(null);
    const animationInstance = useRef(null);

    // Effect hook for managing the lifecycle of the Lottie animation
    useEffect(() => {
        // Ensure the animation only starts if ref is attached and no instance already exists
        if (footerLogoRef.current && !animationInstance.current) {
            // Initialising Lottie animation on the footer logo container
            animationInstance.current = lottie.loadAnimation({
                container: footerLogoRef.current,
                renderer: "svg",
                loop: false,
                autoplay: true,
                path: "/FilmApp/assets/json/footer-logo.json",
            });

            animationInstance.current.addEventListener("DOMLoaded", () => {
                setTimeout(() => {
                    animationInstance.current.goToAndStop(100, true);
                }, 3000);
            });
        }

        // Cleanup function to destroy the animation instance
        return () => {
            if (animationInstance.current) {
                animationInstance.current.destroy();
                animationInstance.current = null;
            }
        };
    }, []);

    return (
        <div className="footer">
            <div className="footer__content">
                <div ref={footerLogoRef} className="footer-content-logo"></div>
                <div className="footer__copyright">
                    &copy; {new Date().getFullYear()} - Designed by Suat Kocar
                </div>
            </div>
        </div>
    );
}

export default Footer;