"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Layout,
  Input,
  Button,
  Typography,
  Upload,
  notification,
  Spin,
  Avatar,
  Space,
  Tooltip,
  ConfigProvider,
} from "antd";
import { UploadProps } from "antd";
import {
  UploadOutlined,
  SendOutlined,
  UserOutlined,
  RobotOutlined,
  LoadingOutlined,
  ClearOutlined,
  LogoutOutlined,
  LoginOutlined,
} from "@ant-design/icons";
import { Leaf } from "lucide-react";
import PlantAnalysisCard from "./PlantAnalysisCard";
import { IPlantAnalysisData } from "../type";

const { Header, Content } = Layout;
const { Title, Text } = Typography;

/**
 * Interface cho cấu trúc tin nhắn trong giao diện chat
 */
interface IMessage {
  role: "user" | "ai";
  content: IPlantAnalysisData | string;
  image?: string; // Base64 image URL (chỉ có ở tin nhắn user)
  isError?: boolean; // Chỉ có ở tin nhắn ai
  timestamp: Date;
}

// -----------------------------------------------------------------------------
// 3. HELPER FUNCTIONS
// -----------------------------------------------------------------------------

const getBase64 = (file: File): Promise<string> =>
  new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => resolve("");
  });

// -----------------------------------------------------------------------------
// 5. MAIN COMPONENT (PlantAnnalistClient)
// -----------------------------------------------------------------------------
function PlantAnnalistClient() {
  const [api, contextHolder] = notification.useNotification();

  const [messages, setMessages] = useState<IMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Auth Mock
  const user = { uid: "mock-user-id", isAnonymous: true };
  const handleLogin = () =>
    api.info({ message: "Đăng nhập bị vô hiệu hóa trong chế độ Mock." });
  const handleLogout = () =>
    api.info({ message: "Đăng xuất bị vô hiệu hóa trong chế độ Mock." });

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }

    console.log("Messages updated:", messages);
  }, [messages, loading]);

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

  const handleSubmit = async (file: File) => {
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

  // Xử lý upload và giả lập kết quả - Sử dụng kiểu UploadProps['beforeUpload']
  const handleBeforeUpload: UploadProps["beforeUpload"] = async (file) => {
    const rawFile = file as unknown as File;

    // Kiểm tra định dạng
    const isJpgOrPng =
      rawFile.type === "image/jpeg" || rawFile.type === "image/png";
    if (!isJpgOrPng) {
      queueMicrotask(() => {
        setError("Chỉ chấp nhận file JPG/PNG!");
      });

      return Upload.LIST_IGNORE;
    }

    try {
      setUploading(true);
      const base64: string = await getBase64(rawFile);

      // 1. Thêm tin nhắn của User vào Chat
      const userMsg: IMessage = {
        role: "user",
        content: "Cây này là cây gì?",
        image: base64,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setLoading(true);

      const result = await handleSubmit(rawFile);

      // 2. Giả lập gọi API với thời gian chờ 2 giây
      // await new Promise((resolve) => setTimeout(resolve, 2000));

      // 3. Chọn kết quả Mock
      // const mockResult: IPlantAnalysisData = MOCK_PLANT_DATA;
    } catch (err) {
      setError("Lỗi xử lý ảnh Mock");
    } finally {
      setLoading(false);
      setUploading(false);
    }
    return false; // Ngăn chặn upload mặc định của antd
  };

  useEffect(() => {
    if (error) api.error({ message: error });
  }, [error]);

  useEffect(() => {
    if (!result) return;
    // 4. Thêm phản hồi của AI
    const aiMsg: IMessage = {
      role: "ai",
      content: result,
      timestamp: new Date(),
    };
    console.log("AI Message:", aiMsg);
    setMessages((prev) => [...prev, aiMsg]);
  }, [result]);

  const handleClear = (): void => {
    setMessages([]);
  };

  // --- Render Logic ---
  const hasData: boolean = messages.length > 0;
  console.log("Rendering PlantAnnalistClient, hasData:", hasData);

  return (
    <ConfigProvider>
      <Layout className="h-screen bg-white font-sans">
        {contextHolder}
        {/* 1. Header Fixed (Sử dụng px-4 cho mobile, px-8 cho desktop) */}
        <Header className="bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-8 sticky top-0 z-50">
          <div className="flex items-center space-x-2">
            <Leaf className="text-green-600 w-6 h-6" />
            <span className="text-xl font-bold text-gray-800 tracking-tight">
              Plant Annalist{" "}
              <span className="text-gray-400 font-normal text-sm">by AI</span>
            </span>
          </div>

          {/* Ẩn/hiện nút Đăng nhập/Đăng xuất tùy theo kích thước */}
          <Space>
            {hasData && (
              <Tooltip title="Xóa lịch sử chat">
                <Button
                  type="text"
                  icon={<ClearOutlined />}
                  onClick={handleClear}
                  className="hidden sm:inline-flex"
                >
                  Làm mới
                </Button>
                <Button
                  type="text"
                  icon={<ClearOutlined />}
                  onClick={handleClear}
                  shape="circle"
                  className="sm:hidden"
                />
              </Tooltip>
            )}
            {user.isAnonymous ? (
              <Button
                type="default"
                icon={<LoginOutlined />}
                onClick={handleLogin}
                className="hidden sm:inline-flex"
              >
                Đăng nhập (Mock)
              </Button>
            ) : (
              <Tooltip title={`Đăng xuất (${user.uid})`}>
                <Button
                  icon={<LogoutOutlined />}
                  onClick={handleLogout}
                  shape="circle"
                />
              </Tooltip>
            )}
          </Space>
        </Header>

        <Content className="relative flex flex-col h-full overflow-hidden bg-gray-50">
          {/* 2. Chat Area */}
          {hasData ? (
            <div className="flex-1 overflow-y-auto p-4 pb-32 scroll-smooth">
              <div className="max-w-4xl mx-auto space-y-8">
                {messages.map((msg: IMessage, idx: number) => (
                  <div
                    key={idx}
                    className={`flex ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {msg.role === "ai" && (
                      // Ẩn avatar trên màn hình quá nhỏ để tiết kiệm không gian, trừ khi bạn muốn hiển thị nó
                      <Avatar
                        icon={<RobotOutlined />}
                        className="mr-2 md:mr-3 bg-green-600 flex-shrink-0"
                        size="large"
                      />
                    )}

                    <div
                      className={`flex flex-col ${
                        msg.role === "user" ? "items-end" : "items-start"
                      } max-w-[95%] sm:max-w-[85%] md:max-w-[80%]`}
                    >
                      {/* User Message */}
                      {msg.role === "user" && (
                        <div className="bg-white p-3 rounded-2xl rounded-tr-none shadow-sm border border-gray-100">
                          <p>{msg.content as string}</p>
                          {msg.image && (
                            <img
                              src={msg.image}
                              alt="Uploaded"
                              // Responsive image: max-w-full trên mobile, giới hạn trên màn hình lớn hơn
                              className="max-w-full sm:max-w-xs h-auto max-h-60 rounded-lg mt-2 border border-gray-200"
                            />
                          )}
                        </div>
                      )}

                      {/* AI Message - PlantAnalysisCard đã có responsive bên trong */}
                      {msg.role === "ai" &&
                        (msg.isError ? (
                          <div className="bg-red-50 p-4 rounded-2xl rounded-tl-none text-red-600 border border-red-100">
                            {msg.content as string}
                          </div>
                        ) : (
                          <PlantAnalysisCard
                            data={msg.content as IPlantAnalysisData}
                          />
                        ))}
                    </div>

                    {msg.role === "user" && (
                      <Avatar
                        icon={<UserOutlined />}
                        className="ml-2 md:ml-3 bg-indigo-500 flex-shrink-0"
                        size="large"
                      />
                    )}
                  </div>
                ))}

                {loading && (
                  <div className="flex justify-start w-full max-w-4xl mx-auto">
                    <Avatar
                      icon={<RobotOutlined />}
                      className="mr-2 md:mr-3 bg-green-600"
                      size="large"
                    />
                    <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 flex items-center space-x-2">
                      <Spin
                        indicator={
                          <LoadingOutlined style={{ fontSize: 20 }} spin />
                        }
                      />
                      <span className="text-gray-500">
                        Đang phân tích mẫu vật (Mock)...
                      </span>
                    </div>
                  </div>
                )}
                <div ref={scrollRef} className="h-4" />
              </div>
            </div>
          ) : (
            /* 2.1 Empty State (Input ở giữa) */
            <div className="flex-1 flex flex-col items-center justify-center p-8 transition-all duration-500 ease-in-out">
              <div className="text-center mb-10">
                <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Leaf className="w-10 h-10 text-green-600" />
                </div>
                <Title
                  level={2}
                  className="text-gray-800 mb-2 text-2xl md:text-3xl"
                >
                  Tôi có thể giúp gì cho bạn?
                </Title>
                <Text className="text-gray-500 text-base md:text-lg">
                  Tải lên hình ảnh cây trồng để nhận phân tích chi tiết từ AI
                </Text>
              </div>

              <div className="w-full max-w-sm sm:max-w-md md:max-w-2xl">
                <Upload.Dragger
                  name="file"
                  multiple={false}
                  showUploadList={false}
                  beforeUpload={handleBeforeUpload}
                  className="bg-white border-dashed border-indigo-300 rounded-xl hover:border-indigo-500 transition-colors group"
                  disabled={loading}
                >
                  <div className="p-8">
                    <p className="ant-upload-drag-icon mb-4">
                      <UploadOutlined className="text-4xl text-indigo-400 group-hover:text-indigo-600 transition-colors" />
                    </p>
                    <p className="ant-upload-text text-lg font-semibold text-gray-700">
                      Nhấp hoặc kéo thả ảnh vào đây
                    </p>
                    <p className="ant-upload-hint text-gray-400">
                      Giao diện này đang sử dụng dữ liệu giả (Mock Data)
                    </p>
                  </div>
                </Upload.Dragger>
              </div>
            </div>
          )}

          {/* 3. Bottom Input (Hiển thị khi đã có data) */}
          {hasData && (
            <div className="bg-white border-t border-gray-200 p-3 md:p-4 fixed bottom-0 w-full z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
              {/* Giới hạn chiều rộng và căn giữa */}
              <div className="max-w-4xl mx-auto flex items-center space-x-3 md:space-x-4">
                <Upload
                  showUploadList={false}
                  beforeUpload={handleBeforeUpload}
                  disabled={loading}
                >
                  <Tooltip title="Tải lên ảnh khác">
                    <Button
                      icon={<UploadOutlined />}
                      size="large"
                      shape="circle"
                      className="flex-shrink-0"
                    />
                  </Tooltip>
                </Upload>

                <Input.Search
                  placeholder="Nhập câu hỏi thêm (Tính năng đang phát triển)..."
                  enterButton={<SendOutlined />}
                  size="large"
                  disabled={true}
                  className="flex-1"
                />
              </div>
              <div className="text-center mt-1">
                <Text type="secondary" className="text-xs">
                  AI có thể mắc lỗi. Hãy kiểm tra thông tin quan trọng.
                </Text>
              </div>
            </div>
          )}
        </Content>
      </Layout>
    </ConfigProvider>
  );
}

export default PlantAnnalistClient;
