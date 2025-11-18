"use client";

import { useState } from "react";
import InfoCollapse from "./components/InfoCollapse";
import { Image } from "antd";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return alert("Please select an image");

    setLoading(true);

    // Convert file to Base64
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(",")[1];

      const res = await fetch("/api/analyze-plant", {
        method: "POST",
        headers: {
          Accept: "*/*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageBase64: base64 }),
      });

      const data = await res.json();
      setResult(data);
      setLoading(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Plant AI Analyzer</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Analyzing..." : "Analyze Plant"}
        </button>
      </form>

      <Image
        src={file ? URL.createObjectURL(file) : ""}
        alt="Uploaded"
        width={300}
        height={300}
      />

      {result && <InfoCollapse data={result} />}
    </div>
  );
}
