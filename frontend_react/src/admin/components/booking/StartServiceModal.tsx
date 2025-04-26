import React from 'react';
import { Modal, Form, Input } from 'antd';
import { Booking } from '../../booking/booking';

interface StartServiceModalProps {
  visible: boolean;
  booking: Booking | null;
  form: any;
  onOk: () => void;
  onCancel: () => void;
}

const StartServiceModal: React.FC<StartServiceModalProps> = ({
  visible,
  booking,
  form,
  onOk,
  onCancel,
}) => {
  return (
    <Modal
      title="Bắt đầu dịch vụ - Cân thú cưng"
      open={visible}
      onOk={onOk}
      onCancel={onCancel}
      okText="Bắt đầu"
      cancelText="Hủy bỏ"
      width="90%"
      className="max-w-xl mx-auto"
    >
      {booking && (
        <div className="p-4 bg-white rounded-lg shadow-sm">
          <Form form={form} layout="vertical">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Form.Item label="Order ID">
                  <Input value={booking.orderId} disabled />
                </Form.Item>
                <Form.Item label="Loại thú cưng">
                  <Input value={booking.petType} disabled />
                </Form.Item>
                <Form.Item
                  label="Cân nặng (kg)"
                  name="petWeight"
                  rules={[
                    { required: true, message: 'Vui lòng nhập cân nặng thú cưng!' },
                    {
                      validator: async (_, value) => {
                        const numValue = Number(value);
                        if (isNaN(numValue)) {
                          return Promise.reject('Cân nặng phải là số!');
                        }
                        if (numValue < 0) {
                          return Promise.reject('Cân nặng không được nhỏ hơn 0!');
                        }
                        if (numValue > 100) {
                          return Promise.reject('Cân nặng không được lớn hơn 100 kg!');
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    placeholder="Nhập cân nặng (kg)"
                  />
                </Form.Item>
              </div>
              <div>
                <Form.Item label="Tên thú cưng">
                  <Input value={booking.petName} disabled />
                </Form.Item>
                <Form.Item label="Dịch vụ">
                  <Input value={booking.serviceName} disabled />
                </Form.Item>
              </div>
            </div>
          </Form>
        </div>
      )}
    </Modal>
  );
};

export default StartServiceModal;