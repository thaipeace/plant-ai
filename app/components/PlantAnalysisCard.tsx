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

const { Text } = Typography;

// -----------------------------------------------------------------------------
// 1. INTERFACES VÀ KIỂU DỮ LIỆU NGHIÊM NGẶT
// -----------------------------------------------------------------------------

/**
 * Interface cho dữ liệu phân tích cây trồng trả về từ API (hoặc Mock Data)
 */
interface IPlantAnalysisData {
  is_plant: boolean;
  name: string;
  place: string;
  current_status_of_plant: string;
  edible_parts_and_how_to_cook: string;
  poisonous_parts: string;
  how_to_grow_and_take_care: string;
  useful_advices: string;
}

// -----------------------------------------------------------------------------
// 4. COMPONENTS
// -----------------------------------------------------------------------------

interface PlantAnalysisCardProps {
  data: IPlantAnalysisData;
}

const PlantAnalysisCard: React.FC<PlantAnalysisCardProps> = ({ data }) => {
  if (!data.is_plant) {
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
          <span className="text-green-700 font-bold">{data.name}</span>
        </div>
      }
      className="w-full max-w-sm md:max-w-3xl border-green-100 shadow-md"
      style={{
        backgroundColor: "#f6ffed",
        borderBottom: "1px solid #d9f7be",
      }}
    >
      {/* Responsive Descriptions: 1 cột trên xs/sm, 2 cột trên md */}
      <Descriptions
        bordered
        column={{ xs: 1, sm: 1, md: 2 }}
        size="small"
        className="ant-descriptions-custom"
      >
        <Descriptions.Item
          label={
            <span className="flex items-center">
              <MapPin className="w-4 h-4 mr-1" /> Nơi sống
            </span>
          }
          span={2}
        >
          {data.place}
        </Descriptions.Item>

        <Descriptions.Item
          label={
            <span className="flex items-center">
              <Info className="w-4 h-4 mr-1" /> Tình trạng
            </span>
          }
          span={2}
        >
          <Tag color="blue">{data.current_status_of_plant}</Tag>
        </Descriptions.Item>

        <Descriptions.Item
          label={
            <span className="flex items-center">
              <Utensils className="w-4 h-4 mr-1" /> Ăn uống
            </span>
          }
          span={2}
        >
          {data.edible_parts_and_how_to_cook}
        </Descriptions.Item>

        <Descriptions.Item
          label={
            <span className="flex items-center text-red-500">
              <AlertTriangle className="w-4 h-4 mr-1" /> Độc tố
            </span>
          }
          span={2}
        >
          <Text type="danger">{data.poisonous_parts}</Text>
        </Descriptions.Item>

        <Descriptions.Item label="Chăm sóc" span={2}>
          {data.how_to_grow_and_take_care}
        </Descriptions.Item>

        <Descriptions.Item label="Lời khuyên" span={2}>
          <Text italic>{data.useful_advices}</Text>
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
};

export default PlantAnalysisCard;
