import { Collapse, Typography } from "antd";

const { Panel } = Collapse;
const { Text, Paragraph } = Typography;

interface Props {
  data: Record<string, any>;
}

export default function InfoCollapse({ data }: Props) {
  // Chuyển JSON thành mảng key-value
  const entries = Object.entries(data);

  return (
    <Collapse accordion bordered={true}>
      {entries.map(([key, value]) => (
        <Panel header={formatKey(key)} key={key}>
          <Paragraph style={{ whiteSpace: "pre-wrap" }}>
            {typeof value === "boolean"
              ? value
                ? "Yes"
                : "No"
              : String(value)}
          </Paragraph>
        </Panel>
      ))}
    </Collapse>
  );
}

function formatKey(key: string) {
  // Chuyển snake_case → Title Case
  return key
    .replace(/_/g, " ")
    .replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase + w.slice(1));
}
