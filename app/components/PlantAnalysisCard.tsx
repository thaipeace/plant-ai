import React, { useState } from "react";
import { Layout, Card, Typography, Descriptions, Tag } from "antd";
import {
  Leaf,
  Sprout,
  AlertTriangle,
  Utensils,
  MapPin,
  Info,
} from "lucide-react";
import { IPlantAnalysisData } from "../type";

const { Text } = Typography;

// -----------------------------------------------------------------------------
// 4. COMPONENTS
// -----------------------------------------------------------------------------

interface PlantAnalysisCardProps {
  data: IPlantAnalysisData;
}

const PlantAnalysisCard: React.FC<PlantAnalysisCardProps> = ({ data }) => {
  if (!data) {
    return null; // Hoặc hiển thị một placeholder/loading state nếu cần
  }

  if (data && !data.is_plant) {
    return (
      <Card className="border-red-200 bg-red-50 w-full max-w-sm md:max-w-2xl shadow-sm">
        <div className="flex items-center text-red-600 mb-2">
          <AlertTriangle className="w-5 h-5 mr-2" />
          <Text strong className="text-red-600 text-lg">
            Không phải cây trồng
          </Text>
        </div>
        <Text>
          Hệ thống không nhận diện được đây là thực vật. Vui lòng thử lại với
          hình ảnh khác.
        </Text>
      </Card>
    );
  }

  return (
    // Card dùng max-w-full trên mobile, và giới hạn trên màn hình lớn
    <Card
      title={
        <div className="flex items-center">
          <Sprout className="w-5 h-5 mr-2 text-green-600" />
          <span className="text-green-700 font-bold">{data.name.text}</span>
        </div>
      }
      className="w-full max-w-sm md:max-w-3xl border-green-100 shadow-md"
      style={{
        backgroundColor: "#f6ffed",
        borderBottom: "1px solid #d9f7be",
      }}
    >
      <div className="desc">
        <div className="desc-item span-2">
          <div className="desc-label">
            <span className="flex items-center">
              <MapPin className="w-4 h-4 mr-1" /> Nơi sống
            </span>
          </div>
          <div className="desc-value">{data.place.text}</div>
        </div>

        <div className="desc-item span-2">
          <div className="desc-label">
            <span className="flex items-center">
              <Info className="w-4 h-4 mr-1" /> Tình trạng
            </span>
          </div>
          <div
            className={`desc-value ${
              data.current_status_of_plant.positive
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            <span className="tag tag-blue">
              {data.current_status_of_plant.text}
            </span>
          </div>
        </div>

        <div className="desc-item span-2">
          <div className="desc-label">
            <span className="flex items-center">
              <Utensils className="w-4 h-4 mr-1" /> Ăn uống
            </span>
          </div>
          <div
            className={`desc-value ${
              data.edible_parts_and_how_to_cook.positive
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {data.edible_parts_and_how_to_cook.text}
          </div>
        </div>

        <div className="desc-item span-2">
          <div className="desc-label label-danger">
            <span className="flex items-center text-red-500">
              <AlertTriangle className="w-4 h-4 mr-1" /> Độc tố
            </span>
          </div>
          <div
            className={`desc-value ${
              data.poisonous_parts.positive ? "text-green-600" : "text-red-600"
            }`}
          >
            {data.poisonous_parts.text}
          </div>
        </div>

        <div className="desc-item span-2">
          <div className="desc-label">
            <span className="flex items-center">
              <Leaf className="w-4 h-4 mr-1" /> Chăm sóc
            </span>
          </div>
          <div className="desc-value">
            {data.how_to_grow_and_take_care.text}
          </div>
        </div>

        <div className="desc-item span-2">
          <div className="desc-label">
            <span className="flex items-center">
              <Sprout className="w-4 h-4 mr-1" /> Lời khuyên
            </span>
          </div>
          <div
            className={`desc-value ${
              data.useful_advices.positive ? "text-green-600" : "text-red-600"
            }`}
          >
            {data.useful_advices.text}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PlantAnalysisCard;
