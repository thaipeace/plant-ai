"use client";

import { useState } from "react";
import InfoCollapse from "./components/InfoCollapse";
import { Image as AntdImage } from "antd";
import PlantAnalysisCard from "./components/PlantAnalysisCard";
import PlantAnnalistClient from "./components/PlantAnnalistClient";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  return (
    // <div style={{ padding: "2rem" }}>
    //   <h1>Plant AI Analyzer</h1>
    //   <form onSubmit={handleSubmit}>
    //     <input
    //       type="file"
    //       accept="image/*"
    //       onChange={(e) => setFile(e.target.files?.[0] ?? null)}
    //     />
    //     <button type="submit" disabled={loading}>
    //       {loading ? "Analyzing..." : "Analyze Plant"}
    //     </button>
    //   </form>

    //   <AntdImage
    //     src={file ? URL.createObjectURL(file) : ""}
    //     alt="Uploaded"
    //     width={300}
    //     height={300}
    //   />

    //   {result && <InfoCollapse data={result} />}
    // </div>
    <PlantAnnalistClient />
  );
}
