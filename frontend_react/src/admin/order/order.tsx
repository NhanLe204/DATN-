import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Table,
  Checkbox,
  Modal,
  Input,
  Select,
  Tag,
  Form,
  message,
  Space,
  DatePicker,
} from 'antd';
import {
  DeleteOutlined,
  EyeOutlined,
  SearchOutlined,
  ReloadOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import orderApi from '../../api/orderApi';
import moment from 'moment';
import 'moment/locale/vi';
import { CSVLink } from 'react-csv';

const { Option } = Select;
const { RangePicker } = DatePicker;

interface Order {
  key: string;
  orderId: string;
  fullname: string;
  orderDate?: string;
  product: string;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  payment_status?: 'PENDING' | 'PAID' | 'CANCELLED';
  quantity?: number;
  price?: string;
}

interface FilterParams {
  status?: string;
  dateRange?: [moment.Moment, moment.Moment] | null;
  search?: string;
}

const OrderList: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<FilterParams>({});
  const [form] = Form.useForm();

  useEffect(() => {
    fetchOrders();
  }, [filters]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderApi.getAll();
      console.log('Full API response:', response);

      if (!response.data || !response.data.result) {
        console.error('API response is missing data or result:', response);
        message.error('Không thể tải danh sách đơn hàng');
        setOrders([]);
        return;
      }

      const orderList = response.data.result;
      if (!Array.isArray(orderList)) {
        console.error('API result is not an array:', orderList);
        message.error('Dữ liệu đơn hàng không hợp lệ');
        setOrders([]);
        return;
      }

      const formattedOrders = orderList.map((order: any, index: number) => ({
        key: order._id || index.toString(),
        orderId: order._id || `ORDER_${index}`,
        fullname: order.userID?.fullname || order.fullname || 'Không xác định',
        product: order.product || 'Không xác định',
        status: order.status || 'PENDING',
        payment_status: order.payment_status || 'PENDING',
        quantity: order.quantity || 0,
        price: order.total_price?.toString() || '0',
        orderDate: order.createdAt ? moment(order.createdAt).format('DD/MM/YYYY HH:mm') : 'Không xác định',
      }));

      const updatedOrders = await Promise.all(
        formattedOrders.map(async (order) => {
          if (order.payment_status === 'PAID' && order.status === 'PENDING') {
            try {
              console.log(`Updating status for order ${order.orderId} from PENDING to PROCESSING`);
              await orderApi.updateOrderStatus(order.orderId, 'PROCESSING');
              return { ...order, status: 'PROCESSING' };
            } catch (error: any) {
              console.error(
                `Failed to update status for order ${order.orderId}:`,
                error.response?.data || error.message
              );
              return order;
            }
          }
          return order;
        })
      );

      const filteredOrders = applyFilters(updatedOrders);
      setOrders(filteredOrders);
    } catch (error: any) {
      console.error('Error fetching orders:', error.response?.data || error.message);
      message.error(
        error.response?.status === 404
          ? 'Không tìm thấy API đơn hàng'
          : 'Tải danh sách đơn hàng thất bại'
      );
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (orderList: Order[]): Order[] => {
    return orderList.filter((order) => {
      let matches = true;

      if (filters.status) {
        matches = matches && order.status === filters.status;
      }

      if (filters.dateRange) {
        const orderDate = moment(order.createdAt);
        matches = matches && orderDate.isBetween(filters.dateRange[0], filters.dateRange[1], 'day', '[]');
      }

      if (filters.search) {
        const searchRegex = new RegExp(filters.search, 'i');
        matches = matches && (
          searchRegex.test(order.orderId) ||
          searchRegex.test(order.fullname) ||
          searchRegex.test(order.product)
        );
      }

      return matches;
    });
  };

  const handleSearch = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value }));
  };

  const handleStatusFilter = (status: string) => {
    setFilters((prev) => ({ ...prev, status: status || undefined }));
  };

  const handleDateRangeFilter = (dates: any) => {
    setFilters((prev) => ({ ...prev, dateRange: dates }));
  };

  const handleView = (record: Order) => {
    setSelectedOrder(record);
    form.setFieldsValue({ status: record.status });
    setIsModalVisible(true);
  };

  const handleDeleteAll = () => {
    if (selectedRows.length === 0) {
      message.warning('Vui lòng chọn ít nhất một đơn hàng để xóa!');
      return;
    }
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: `Bạn có chắc chắn muốn xóa ${selectedRows.length} đơn hàng đã chọn?`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await Promise.all(selectedRows.map((id) => orderApi.delete(id)));
          message.success('Xóa đơn hàng thành công');
          await fetchOrders();
          setSelectedRows([]);
        } catch (error: any) {
          console.error('Error deleting orders:', error.response?.data || error.message);
          message.error('Xóa đơn hàng thất bại');
        }
      },
    });
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (selectedOrder) {
        console.log('Updating order ID:', selectedOrder.orderId);
        await orderApi.updateOrderStatus(selectedOrder.orderId, values.status);
        message.success('Cập nhật trạng thái thành công');
        await fetchOrders();
        setIsModalVisible(false);
      }
    } catch (error: any) {
      console.error('Error updating order status:', error.response?.data || error.message);
      if (error.response?.status === 404) {
        message.error('Đơn hàng không tồn tại hoặc không thể cập nhật');
      } else if (error.response?.status === 405) {
        message.error('Phương thức cập nhật không được hỗ trợ');
      } else {
        message.error('Cập nhật trạng thái thất bại');
      }
    }
  };

  const columns = [
    {
      title: (
        <Checkbox
          onChange={(e) => {
            const keys = e.target.checked ? orders.map((o) => o.key) : [];
            setSelectedRows(keys);
          }}
          checked={selectedRows.length === orders.length && orders.length > 0}
          indeterminate={selectedRows.length > 0 && selectedRows.length < orders.length}
        />
      ),
      dataIndex: 'checkbox',
      width: 50,
      render: (_: any, record: Order) => (
        <Checkbox
          checked={selectedRows.includes(record.key)}
          onChange={(e) => {
            const keys = e.target.checked
              ? [...selectedRows, record.key]
              : selectedRows.filter((k) => k !== record.key);
            setSelectedRows(keys);
          }}
        />
      ),
    },
    {
      title: 'Mã đơn hàng',
      dataIndex: 'orderId',
      key: 'orderId',
      render: (text: string) => (
        <span className="text-[14px] font-normal text-gray-700">{text.substring(0, 8)}...</span>
      ),
    },
    {
      title: 'Khách hàng',
      dataIndex: 'fullname',
      key: 'fullname',
      render: (text: string) => (
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center">
            <span className="text-sm text-blue-500">{text.charAt(0).toUpperCase()}</span>
          </div>
          <span className="ml-3 text-[14px] font-normal text-gray-700">{text || 'Không xác định'}</span>
        </div>
      ),
    },
    {
      title: 'Đơn hàng',
      dataIndex: 'product',
      key: 'product',
      render: (text: string) => (
        <span className="text-[14px] font-normal text-gray-700">{text}</span>
      ),
    },
    {
      title: 'Tình trạng',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusConfig = {
          PENDING: { color: 'warning', text: 'Chờ xử lý' },
          PROCESSING: { color: 'processing', text: 'Đang xử lý' },
          SHIPPING: { color: 'blue', text: 'Đang vận chuyển' },
          SHIPPED: { color: 'cyan', text: 'Đã giao hàng' },
          DELIVERED: { color: 'success', text: 'Đã giao' },
          CANCELLED: { color: 'error', text: 'Đã hủy' },
        };
        return (
          <Tag
            color={statusConfig[status]?.color}
            className="px-3 py-0.5 text-[13px] font-normal rounded-full"
          >
            {statusConfig[status]?.text || status}
          </Tag>
        );
      },
    },
    {
      title: 'Tính năng',
      key: 'action',
      render: (_: any, record: Order) => (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          onClick={() => handleView(record)}
          size="small"
          className="bg-blue-400 hover:bg-blue-500 rounded-md"
        />
      ),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 bg-gray-50 min-h-screen"
    >
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-800">Quản lý đơn hàng</h1>
          <p className="mt-1 text-[14px] text-gray-500">Quản lý và theo dõi tất cả đơn hàng trong hệ thống</p>
        </div>

        <Card
          bordered={false}
          className="shadow-sm bg-white rounded-lg"
          title={
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1 max-w-md">
                <Input.Search
                  placeholder="Tìm kiếm đơn hàng..."
                  allowClear
                  enterButton
                  onSearch={handleSearch}
                  className="rounded-lg"
                />
              </div>
              <Space wrap>
                <Select
                  placeholder="Lọc trạng thái"
                  allowClear
                  style={{ width: 150 }}
                  onChange={handleStatusFilter}
                  className="text-[14px]"
                >
                  <Option value="PENDING">Chờ xử lý</Option>
                  <Option value="PROCESSING">Đang xử lý</Option>
                  <Option value="SHIPPING">Đang vận chuyển</Option>
                  <Option value="SHIPPED">Đã giao hàng</Option>
                  <Option value="DELIVERED">Đã giao</Option>
                  <Option value="CANCELLED">Đã hủy</Option>
                </Select>
                <RangePicker
                  onChange={handleDateRangeFilter}
                  format="DD/MM/YYYY"
                  className="text-[14px]"
                />
                <Button
                  icon={<ReloadOutlined />}
                  onClick={() => fetchOrders()}
                  className="border border-gray-100 hover:border-gray-200 rounded-md text-[14px]"
                >
                  Làm mới
                </Button>
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  onClick={handleDeleteAll}
                  disabled={selectedRows.length === 0}
                  className="bg-red-50 hover:bg-red-100 border border-gray-100 rounded-md text-[14px]"
                >
                  Xóa ({selectedRows.length})
                </Button>
                <CSVLink
                  data={orders}
                  filename="orders.csv"
                  className="flex items-center text-[14px] text-gray-700 hover:text-gray-900"
                >
                  <DownloadOutlined className="mr-2" />
                  Xuất CSV
                </CSVLink>
              </Space>
            </div>
          }
        >
          <Table
            columns={columns}
            dataSource={orders}
            loading={loading}
            pagination={{
              total: orders.length,
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `Tổng ${total} đơn hàng`,
            }}
            className="overflow-hidden rounded-lg"
            rowClassName="hover:bg-gray-50"
            scroll={{ x: true }}
          />
        </Card>

        <Modal
          title={
            <div className="flex items-center gap-3">
              <EyeOutlined className="text-blue-400" />
              <span className="text-[16px] font-medium text-gray-800">Chi tiết đơn hàng</span>
            </div>
          }
          open={isModalVisible}
          onOk={handleModalOk}
          onCancel={() => setIsModalVisible(false)}
          okText="Lưu thay đổi"
          cancelText="Hủy bỏ"
          width={600}
          className="top-8"
        >
          <AnimatePresence>
            {selectedOrder && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-medium text-gray-800 mb-4 text-[15px]">Thông tin đơn hàng</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[13px] text-gray-500">Mã đơn hàng</p>
                          <p className="text-[14px] font-normal text-gray-700">{selectedOrder.orderId}</p>
                        </div>
                        <div>
                          <p className="text-[13px] text-gray-500">Ngày đặt</p>
                          <p className="text-[14px] font-normal text-gray-700">{selectedOrder.orderDate}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-medium text-gray-800 mb-4 text-[15px]">Chi tiết đơn hàng</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[13px] text-gray-500">Khách hàng</p>
                          <p className="text-[14px] font-normal text-gray-700">{selectedOrder.fullname}</p>
                        </div>
                        <div>
                          <p className="text-[13px] text-gray-500">Sản phẩm</p>
                          <p className="text-[14px] font-normal text-gray-700">{selectedOrder.product}</p>
                        </div>
                        <div>
                          <p className="text-[13px] text-gray-500">Số lượng</p>
                          <p className="text-[14px] font-normal text-gray-700">{selectedOrder.quantity}</p>
                        </div>
                        <div>
                          <p className="text-[13px] text-gray-500">Giá (VNĐ)</p>
                          <p className="text-[14px] font-normal text-gray-700">{selectedOrder.price}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <Form form={form} layout="vertical">
                      <Form.Item
                        label="Cập nhật trạng thái"
                        name="status"
                        rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
                      >
                        <Select className="w-full text-[14px]">
                          <Option value="PENDING">Chờ xử lý</Option>
                          <Option value="PROCESSING">Đang xử lý</Option>
                          <Option value="SHIPPING">Đang vận chuyển</Option>
                          <Option value="SHIPPED">Đã giao hàng</Option>
                          <Option value="DELIVERED">Đã giao</Option>
                          <Option value="CANCELLED">Đã hủy</Option>
                        </Select>
                      </Form.Item>
                    </Form>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Modal>
      </div>
    </motion.div>
  );
};

export default OrderList;