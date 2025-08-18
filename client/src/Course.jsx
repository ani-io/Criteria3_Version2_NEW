import React, { useState, useRef } from "react";
import * as mammoth from "mammoth";
import { getDocument } from "pdfjs-dist";
import "./Course.css";

function Course({ setCourseOutcomes }) {
  const editorRef = useRef(null);

  const defaultTemplate = `
    <h3>Course Outcomes Template</h3>
    <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
      <thead>
        <tr>
          <th style="padding: 10px; border: 1px solid #ccc; background-color: #f4f4f4; text-align: left;">
            Course Name
          </th>
          <th style="padding: 10px; border: 1px solid #ccc; background-color: #f4f4f4; text-align: left;">
            Statement
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="padding: 10px; border: 1px solid #ccc;">[1]</td>
          <td style="padding: 10px; border: 1px solid #ccc;">
            Apply constructs—sequence, selection, iteration; classes and objects, inheritance, use of predefined classes.
          </td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ccc;">[2]</td>
          <td style="padding: 10px; border: 1px solid #ccc;">
            Design object-oriented solutions for small systems using inheritance.
          </td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ccc;">[3]</td>
          <td style="padding: 10px; border: 1px solid #ccc;">
            Develop application using polymorphism to solve real-time problems.
          </td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ccc;">[4]</td>
          <td style="padding: 10px; border: 1px solid #ccc;">Develop application using file handling concepts.</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ccc;">[5]</td>
          <td style="padding: 10px; border: 1px solid #ccc;">
            Demonstrate exception handling by developing an application in C++.
          </td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ccc;">[6]</td>
          <td style="padding: 10px; border: 1px solid #ccc;">
            Use templates and the STL, and analyze their strengths.
          </td>
        </tr>
      </tbody>
    </table>
  `;

  const [fileContent, setFileContent] = useState(defaultTemplate);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleFileRead = async (file) => {
    setError("");
    setIsLoading(true);
    const type = file.type;

    if (type === "application/pdf") {
      await readPdfFile(file);
    } else if (
      type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      await readDocxFile(file);
    } else {
      setError("Please upload a .docx or .pdf file.");
      setIsLoading(false);
    }
  };

  const readDocxFile = (file) =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const { value } = await mammoth.convertToHtml({ arrayBuffer: e.target.result });
        setFileContent(value || "No content found in the document.");
        setIsLoading(false);
        resolve();
      };
      reader.readAsArrayBuffer(file);
    });

  const readPdfFile = (file) =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const pdf = await getDocument({ data: new Uint8Array(e.target.result) }).promise;
        let text = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          text += `<p>${content.items.map((item) => item.str).join(" ")}</p>`;
        }
        setFileContent(text || "No content found in the PDF.");
        setIsLoading(false);
        resolve();
      };
      reader.readAsArrayBuffer(file);
    });

  const handleDrop = (e) => {
    e.preventDefault();
    const [file] = e.dataTransfer.files;
    if (file) handleFileRead(file);
  };

  const handleBlur = () => {
    const html = editorRef.current.innerHTML;
    setFileContent(html);
    if (setCourseOutcomes) setCourseOutcomes(html);
  };

  const handleResetTemplate = () => {
    setFileContent(defaultTemplate);
    setError("");
    if (setCourseOutcomes) setCourseOutcomes(defaultTemplate);
  };

  return (
    <div className="container">
      <h1 className="page-heading">Course Outcomes</h1>

      {/* Upload Area */}
      <div
        className="drop-area"
        onDragOver={(e) => {
          e.preventDefault();
          e.currentTarget.classList.add("highlight");
        }}
        onDragLeave={(e) => {
          e.currentTarget.classList.remove("highlight");
        }}
        onDrop={handleDrop}
      >
        <p className="upload-text">
          Drag & drop a .docx or .pdf here, or click below to browse
        </p>
        <input
          id="file-upload"
          type="file"
          accept=".docx,.pdf"
          className="file-input"
          onChange={(e) => handleFileRead(e.target.files[0])}
        />
        <label htmlFor="file-upload" className="browse-button">
          Browse Files
        </label>
      </div>

      {isLoading && <p className="processing-text">Processing file…</p>}
      {error && <p className="error-text">{error}</p>}

      {/* Editable Content */}
      <div className="editable-content-section">
        <h2>Editable Course Outcomes</h2>
        <div
          ref={editorRef}
          className="content-text editable"
          contentEditable
          suppressContentEditableWarning
          dangerouslySetInnerHTML={{ __html: fileContent }}
          onBlur={handleBlur}
        />
        <button onClick={handleResetTemplate} className="reset-btn">
          Reset to Default Template
        </button>
      </div>
    </div>
  );
}

export default Course;
