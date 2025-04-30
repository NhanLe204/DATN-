import React, { useEffect, useState } from 'react';
import { Table, DatePicker, Select, Typography, Space, Button, message, Spin, Divider, Form } from 'antd';
import dayjs from 'dayjs';
import revenueApi from '../../api/revenueAPI';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import debounce from 'lodash/debounce';
import { Color } from 'antd/es/color-picker';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Title, Text } = Typography;

interface RevenueItem {
  date: string;
  salesRevenue: number;
  serviceRevenue: number;
  totalRevenue: number;
}

const RevenuePage: React.FC = () => {
  const [data, setData] = useState<RevenueItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [chartLimit, setChartLimit] = useState(7); // Số ngày hoặc tháng hiển thị

  // Giá trị mặc định cho RangePicker: 7 ngày gần nhất
  const defaultRange: [dayjs.Dayjs, dayjs.Dayjs] = [dayjs().subtract(7, 'days'), dayjs()];

  // Trạng thái ban đầu của bộ lọc
  const initialFilters = {
    type: 'daily',
    range: defaultRange,
    chartLimit: 7,
  };

  // Hàm gọi API với debounce
  const fetchRevenue = debounce(async (filters: any) => {
    setLoading(true);
    try {
      const params: any = { type: filters.type };
      if (filters.range) {
        params.from = filters.range[0].format('YYYY-MM-DD');
        params.to = filters.range[1].format('YYYY-MM-DD');
      }
      const res = await revenueApi.getDetails(params);
      setData(res.data.data || []);
    } catch (err: any) {
      message.error(err.message);
    } finally {
      setLoading(false);
    }
  }, 500);

  // Gọi API khi nhấn "Áp dụng"
  const onFinish = (values: any) => {
    fetchRevenue(values);
    setChartLimit(values.chartLimit);
  };

  // Đặt lại bộ lọc
  const onReset = () => {
    form.setFieldsValue(initialFilters);
    fetchRevenue(initialFilters);
    setChartLimit(initialFilters.chartLimit);
  };

  // Điều chỉnh chartLimit khi type thay đổi
  useEffect(() => {
    const type = form.getFieldValue('type');
    if (type === 'monthly') {
      // Nếu chuyển sang monthly, đặt lại chartLimit về giá trị phù hợp với tháng
      const monthlyOptions = [6, 12, 24];
      const newLimit = monthlyOptions.includes(chartLimit) ? chartLimit : 6; // Mặc định 6 tháng nếu giá trị hiện tại không phù hợp
      setChartLimit(newLimit);
      form.setFieldsValue({ chartLimit: newLimit });
    } else if (type === 'daily') {
      // Nếu chuyển sang daily, đặt lại chartLimit về giá trị phù hợp với ngày
      const dailyOptions = [7, 14, 30];
      const newLimit = dailyOptions.includes(chartLimit) ? chartLimit : 7; // Mặc định 7 ngày nếu giá trị hiện tại không phù hợp
      setChartLimit(newLimit);
      form.setFieldsValue({ chartLimit: newLimit });
    }
  }, [form.getFieldValue('type')]);

  useEffect(() => {
    // Gọi API lần đầu với giá trị mặc định
    form.setFieldsValue(initialFilters);
    fetchRevenue(initialFilters);
  }, []);

  const columns = [
    {
      title: form.getFieldValue('type') === 'monthly' ? 'Tháng' : 'Ngày',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) =>
        form.getFieldValue('type') === 'monthly'
          ? dayjs(date).format('MM/YYYY')
          : dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Doanh thu bán hàng',
      dataIndex: 'salesRevenue',
      key: 'salesRevenue',
      render: (val: number) => `${val.toLocaleString()}₫`,
    },
    {
      title: 'Doanh thu dịch vụ',
      dataIndex: 'serviceRevenue',
      key: 'serviceRevenue',
      render: (val: number) => `${val.toLocaleString()}₫`,
    },
    {
      title: 'Tổng doanh thu',
      dataIndex: 'totalRevenue',
      key: 'totalRevenue',
      render: (val: number) => `${val.toLocaleString()}₫`,
    },
  ];

  const renderChart = () => {
    const limitedData = data.slice(-chartLimit);

    const chartData = limitedData.map(item => ({
      date: item.date,
      salesRevenue: item.salesRevenue,
      serviceRevenue: item.serviceRevenue,
      totalRevenue: item.totalRevenue,
    }));

    const type = form.getFieldValue('type');

    return (
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tickFormatter={(date) =>
              type === 'monthly' ? dayjs(date).format('MM/YYYY') : dayjs(date).format('DD/MM')
            }
						tick={{ fill: '#1E90FF' }}
          />
          <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M ₫`} />
          <Tooltip
            formatter={(value: number) => `${value.toLocaleString()}₫`}
            labelFormatter={(label) =>
              type === 'monthly'
                ? dayjs(label).format('MM/YYYY')
                : dayjs(label).format('DD/MM/YYYY')
            }
          />
          <Legend />
          <Line
            type="monotone"
            name="Doanh thu bán hàng"
            dataKey="salesRevenue"
            stroke="#8884d8"
            activeDot={{ r: 8 }}
          />
          <Line type="monotone" name="Doanh thu dịch vụ" dataKey="serviceRevenue" stroke="#82ca9d" />
          <Line type="monotone" name="Tổng doanh thu" dataKey="totalRevenue" stroke="#ffc658" />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="p-6">
      <Title level={3}>Thống kê doanh thu</Title>

      <Form
        form={form}
        onFinish={onFinish}
        layout="inline"
        initialValues={initialFilters}
        className="mb-4"
      >
        <Space size="middle" wrap>
          <Form.Item label="Kiểu hiển thị" name="type">
            <Select style={{ width: 150 }}>
              <Option value="daily">Theo ngày</Option>
              <Option value="monthly">Theo tháng</Option>
            </Select>
          </Form.Item>

          <Form.Item label="Khoảng thời gian" name="range">
            <RangePicker />
          </Form.Item>

          <Form.Item
            label={form.getFieldValue('type') === 'monthly' ? 'Số tháng hiển thị' : 'Số ngày hiển thị'}
            name="chartLimit"
          >
            <Select style={{ width: 120 }}>
              {form.getFieldValue('type') === 'monthly' ? (
                <>
                  <Option value={6}>6 tháng</Option>
                  <Option value={12}>12 tháng</Option>
                </>
              ) : (
                <>
                  <Option value={7}>7 ngày</Option>
                  <Option value={14}>14 ngày</Option>
                  <Option value={30}>30 ngày</Option>
                </>
              )}
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Áp dụng
              </Button>
              <Button onClick={onReset}>Đặt lại</Button>
            </Space>
          </Form.Item>
        </Space>
      </Form>

      {form.getFieldValue('range') && (
        <Text type="secondary" className="block mb-2">
          Đang xem từ <b>{form.getFieldValue('range')[0].format('DD/MM/YYYY')}</b> đến{' '}
          <b>{form.getFieldValue('range')[1].format('DD/MM/YYYY')}</b>
        </Text>
      )}

      <Spin spinning={loading}>
        <div className="my-6">{renderChart()}</div>

        <Divider />

        <Table
          columns={columns}
          dataSource={data.slice(-chartLimit)}
          rowKey="date"
          pagination={{ pageSize: 10 }}
          scroll={{ x: 'max-content' }}
        />
      </Spin>
    </div>
  );
};

export default RevenuePage;