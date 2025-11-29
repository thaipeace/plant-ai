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

  return <PlantAnnalistClient />;
}
