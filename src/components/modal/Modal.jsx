import { useEffect } from "react";
import PropTypes from "prop-types";
import "./Modal.css";

const Modal = ({ show, onClose, videoId }) => {
  // Effect to listen for ESC key to close the modal
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.keyCode === 27) {
        onClose(); // Call onClose prop when ESC key is pressed
      }
    };
    document.addEventListener("keydown", handleEsc); // Add event listener for keydown

    return () => {
      document.removeEventListener("keydown", handleEsc); // Cleanup the event listener
    };
  }, [onClose]); // Re-run the effect if onClose changes

  // Do not render modal if show is false
  if (!show) {
    return null;
  }

  const handleCloseClick = (e) => {
    e.stopPropagation();
    onClose();
  };

  const handleBackgroundClick = (e) => {
    if (e.target.className.includes("trailer-modal")) {
      onClose();
    }
  };

  return (
    <div
      className="trailer-modal"
      onClick={handleBackgroundClick}
      style={{ display: "flex" }}
    >
      <div
        className="trailer-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="trailer-close" onClick={handleCloseClick}></span>
        <iframe
          className="trailer-iframe"
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&showinfo=0&enablejsapi=1`}
          frameBorder="0"
          allowFullScreen
          title="YouTube video player"
        ></iframe>
      </div>
    </div>
  );
};

// Prop type validation for the Modal component
Modal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  videoId: PropTypes.string,
};

export default Modal;