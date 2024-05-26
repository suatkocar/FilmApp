function parseData(data, format) {
  // Selects the appropriate parsing method based on the data format
  switch (format) {
    case "xml":
      return parseXml(data);
    case "text":
      return parseText(data);
    default:
      return data; // Returns the data unchanged if the format is neither XML nor text
  }
}

function parseXml(xmlData) {
  // Converts a string of XML data into a document object that can be processed
  const parser = new window.DOMParser();
  const xmlDoc = parser.parseFromString(xmlData, "application/xml");

  // Checks for XML parsing errors
  const errors = xmlDoc.getElementsByTagName("parsererror");
  if (errors.length) {
    console.error("Error parsing XML:", errors[0].textContent);
    return []; // Returns an empty array if there are parsing errors
  }

  // Extracts film data from XML document
  const films = xmlDoc.getElementsByTagName("film");
  return Array.from(films).map((node) => {
    return {
      id: node.getElementsByTagName("id")[0]?.textContent.trim(),
      title: node.getElementsByTagName("title")[0]?.textContent.trim(),
      director: node.getElementsByTagName("director")[0]?.textContent.trim(),
      stars: node.getElementsByTagName("stars")[0]?.textContent.trim(),
      year: node.getElementsByTagName("year")[0]?.textContent.trim(),
      review: node.getElementsByTagName("review")[0]?.textContent.trim(),
    };
  });
}

function parseText(text) {
  // Splits text data into sections by '---', depicting separate entries
  const films = [];
  const entries = text.split("---");

  entries.forEach((entry) => {
    const lines = entry.trim().split("\n");
    if (lines.length > 1) {
      const film = {};
      lines.forEach((line) => {
        const colonIndex = line.indexOf(":");
        if (colonIndex !== -1) {
          const key = line.substring(0, colonIndex).trim().toLowerCase(); // Extracts the key before the colon
          const value = line.substring(colonIndex + 1).trim(); // Extracts the value after the colon

          // Maps strings to corresponding film attributes based on key matches
          switch (key) {
            case "id":
              film.id = value;
              break;
            case "title":
              film.title = value;
              break;
            case "year":
              film.year = value;
              break;
            case "director":
              film.director = value;
              break;
            case "stars":
              film.stars = value;
              break;
            case "review":
              film.review = value;
              break;
            default:
              break;
          }
        }
      });
      films.push(film); // Collects all film data into a single array from parsed text values
    }
  });

  return films; // Returns the fully constructed array of film objects
}

export { parseData };