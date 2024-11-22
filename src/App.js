import React, { useState, useRef } from "react";
import "./App.css";

const defaultSpec =
    {
      "title": "Basic Marks: bar",
      "subtitle": "Tutorial Examples",
      "tracks": [
        {
          "layout": "linear",
          "width": 800,
          "height": 180,
          "data": {
            "url": "https://resgen.io/api/v1/tileset_info/?d=UvVPeLHuRDiYA3qwFlm7xQ",
            "type": "multivec",
            "row": "sample",
            "column": "position",
            "value": "peak",
            "categories": ["sample 1"],
            "binSize": 5
          },
          "mark": "bar",
          "x": {"field": "start", "type": "genomic", "axis": "bottom"},
          "xe": {"field": "end", "type": "genomic"},
          "y": {"field": "peak", "type": "quantitative", "axis": "right"},
          "size": {"value": 5}
        }
      ]
    }

function App() {
  const [jsonInput, setJsonInput] = useState(JSON.stringify(defaultSpec));
  const [lines, setLines] = useState([]);
  const [error, setError] = useState("");
  const [showMessage, setShowMessage] = useState(false);
  const tableRef = useRef(null);

  const handleConvert = () => {
    try {
      // Parse and format JSON input
      const parsedJSON = JSON.parse(jsonInput);
      const formattedJSON = JSON.stringify(parsedJSON, null, 2);

      // Split formatted JSON into lines
      const jsonLines = formattedJSON.split("\n");
      setLines(jsonLines);
      setError("");
    } catch (err) {
      setError("Invalid JSON. Please check your input.");
      setLines([]);
    }
  };

  const handleCopyTable = () => {
    if (tableRef.current) {
      let range, sel;

      // Make sure that range and selection are supported by the browsers
      if (document.createRange && window.getSelection) {
        range = document.createRange();
        sel = window.getSelection();

        // Unselect any previously selected element in the page
        sel.removeAllRanges();

        try {
          // Attempt to select the contents of the table
          range.selectNodeContents(tableRef.current);
          sel.addRange(range);
        } catch (e) {
          // Fallback: Select the entire node if contents selection fails
          range.selectNode(tableRef.current);
          sel.addRange(range);
        }

        // Run copy command
        try {
          const successful = document.execCommand("copy");
          if (successful) {
            setShowMessage(true);
            setTimeout(() => {
              setShowMessage(false);
            }, 3000); // 3000ms = 3 seconds
          } else {
            alert("Failed to copy the table.");
          }
        } catch (err) {
          console.error("Copy failed: ", err);
        }

        // Remove the selection
        sel.removeAllRanges();
      }
    }
  };


  return (
      <div className="App">
        <h1>JSON → Table Converter</h1>
        <textarea
            rows="8"
            cols="50"
            placeholder="Paste your JSON here..."
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
        ></textarea>
        <br />
        <button onClick={handleConvert}>Convert to Table</button>
        {error && <p style={{ color: "red" }}>{error}</p>}
        {lines.length > 0 && (
            <div>
              <button onClick={handleCopyTable}>Copy Table</button>
              {/* Placeholder for the alert */}
              <div className="alert-placeholder">
                ‎
                {showMessage && <div className="alert">Copied text!</div>}
              </div>
              <div className="table-container">
                <table ref={tableRef} style={{ borderCollapse: "collapse", width: "100%" }}>
                  <tbody>
                  {lines.map((line, index) => (
                      <tr
                          key={index}
                      >
                        <td
                            style={{
                              whiteSpace: "pre",
                              fontFamily: "Monaco",
                            }}
                        >
                          {formatLine(line)}
                        </td>
                      </tr>
                  ))}
                  </tbody>
                </table>
              </div>
            </div>
        )}
      </div>
  );
}

function formatLine(line) {
  // Detect if line has a value field after the first ":"
  const regex = /:(?![[{}\]])\s*([^,]*)/; // Matches the value part after ":"
  const match = line.match(regex);

  if (!match) {
    // If no match, return the line as is
    return <span>{line}</span>;
  }

  // Extract the value part
  const value = match[1].trim();

  // Split the line into parts: before, value, and after
  const [beforeValue, afterValue] = line.split(value);

  if (!isNaN(Number(value))) {
    // If value is numerical, apply numType class
    return (
        <span>
                {beforeValue}
          <span className="numType">{value}</span>
          {afterValue}
            </span>
    );
  } else if (/^".*"$/.test(value) || /^'.*'$/.test(value)) {
    // If value is a string (enclosed in quotes), apply strType class
    return (
        <span>
                {beforeValue}
          <span className="strType">{value}</span>
          {afterValue}
            </span>
    );
  }

  // If value doesn't match any criteria, return the original line
  return <span>{line}</span>;
}

export default App;
