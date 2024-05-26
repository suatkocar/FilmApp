import PropTypes from "prop-types";
import { ToggleButtonGroup, ToggleButton } from "react-bootstrap";

const FormatSelector = ({ format, setFormat }) => {
  // Handler for selection change in format
  const handleFormatChange = (val) => {
    setFormat(val); // Update format state
    localStorage.setItem("selectedFormat", val); // Save selected format to local storage
  };
  // Toggle button group for selecting format
  return (
    <ToggleButtonGroup
      type="radio"
      name="formats"
      value={format}
      onChange={handleFormatChange}
    >
      <ToggleButton
        id="format-json"
        value={"json"}
        variant={format === "json" ? "primary" : "outline-secondary"}
      >
        JSON
      </ToggleButton>
      <ToggleButton
        id="format-xml"
        value={"xml"}
        variant={format === "xml" ? "primary" : "outline-secondary"}
      >
        XML
      </ToggleButton>
      <ToggleButton
        id="format-text"
        value={"text"}
        variant={format === "text" ? "primary" : "outline-secondary"}
      >
        TEXT
      </ToggleButton>
    </ToggleButtonGroup>
  );
};

// Prop type validation for the component
FormatSelector.propTypes = {
  format: PropTypes.string.isRequired,
  setFormat: PropTypes.func.isRequired,
};

export default FormatSelector;