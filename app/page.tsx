"use client";

import { useState } from "react";
import InfoCollapse from "./components/InfoCollapse";
import { Image as AntdImage } from "antd";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const resizeImage = (file: File, maxWidth = 800, maxHeight = 800) => {
    return new Promise<Blob>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = width * ratio;
          height = height * ratio;
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject("Cannot get canvas context");
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject("Image compression failed");
          },
          "image/jpeg",
          0.7
        ); // adjust quality here
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return alert("Please select an image");

    setLoading(true);

    const compressedBlob = await resizeImage(file);
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
    reader.readAsDataURL(compressedBlob);
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

      <AntdImage
        src={file ? URL.createObjectURL(file) : ""}
        alt="Uploaded"
        width={300}
        height={300}
      />

      {result && <InfoCollapse data={result} />}
    </div>
  );
}
