import React from 'react';
import { Form, Input, Select, DatePicker, Button, Radio } from 'antd';
import dayjs from 'dayjs';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { Service } from '../../booking/bookingTypes';
import { TimePicker } from 'antd';

const { Option } = Select;

interface MultiPetFieldsProps {
  form: any;
  services: Service[];
  petTypes: string[];
  // SLOT CHỈ THEO NGÀY – KHÔNG THEO PET
  slotAvailability: { [key: string]: number };
  availableTimeSlots: string[];
  currentDateTime: dayjs.Dayjs;
  onServiceChange: (value: string, index: number) => void;
  onDateChange: (date: dayjs.Dayjs | null, index: number) => void;
  onTimeChange: (value: number, index: number, field: 'hour' | 'minute') => void;
  getAvailableTimeSlots: (index: number) => string[];
  disabled?: boolean;
}

const MultiPetFields: React.FC<MultiPetFieldsProps> = ({
  form,
  services,
  petTypes,
  slotAvailability,
  availableTimeSlots,
  currentDateTime,
  onServiceChange,
  onDateChange,
  onTimeChange,
  getAvailableTimeSlots,
  disabled = false,
}) => {
  // LẤY FORM INSTANCE ĐÚNG CÁCH (Form.List)
  const formInstance = Form.useFormInstance();

  return (
    <Form.List name="pets">
      {(fields, { add, remove }) => (
        <>
          {fields.map(({ key, name, ...restField }, index) => {
            const selectedDate = formInstance.getFieldValue(['pets', index, 'date']);

            return (
              <div key={key} className="relative p-4 mb-4 border rounded-lg">
                <div className="mb-3 text-lg font-semibold">
                  Thú cưng {index + 1}
                </div>

                {!disabled && fields.length > 1 && (
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => remove(name)}
                    className="absolute top-4 right-4"
                  />
                )}

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {/* TÊN THÚ CƯNG */}
                  <Form.Item
                    {...restField}
                    name={[name, 'petName']}
                    label="Tên thú cưng"
                    rules={[
                      { required: true, message: 'Vui lòng nhập tên thú cưng!' },
                    ]}
                  >
                    <Input disabled={disabled} />
                  </Form.Item>

                  {/* LOẠI THÚ CƯNG */}
                  <Form.Item
                    {...restField}
                    name={[name, 'petType']}
                    label="Loại thú cưng"
                    rules={[
                      { required: true, message: 'Vui lòng chọn loại thú cưng!' },
                    ]}
                  >
                    <Select disabled={disabled}>
                      {petTypes.map(t => (
                        <Option key={t} value={t}>{t}</Option>
                      ))}
                    </Select>
                  </Form.Item>

                  {/* DỊCH VỤ */}
                  <Form.Item
                    {...restField}
                    name={[name, 'service']}
                    label="Dịch vụ"
                    rules={[
                      { required: true, message: 'Vui lòng chọn dịch vụ!' },
                    ]}
                  >
                    <Select
                      disabled={disabled}
                      onChange={(v) => onServiceChange(v, index)}
                    >
                      {services.map(s => (
                        <Option key={s.id} value={s.id}>{s.name}</Option>
                      ))}
                    </Select>
                  </Form.Item>

                  {/* NGÀY */}
                  <Form.Item
                    {...restField}
                    name={[name, 'date']}
                    label="Ngày đặt"
                    rules={[
                      { required: true, message: 'Vui lòng chọn ngày đặt!' },
                    ]}
                  >
                    <DatePicker
                      format="DD/MM/YYYY"
                      disabled={disabled}
                      onChange={(date) => {
                        onDateChange(date, index);
                        // formInstance.setFieldsValue({ pets: { [index]: { time: undefined } } });
                      }}
                      disabledDate={c => c && c.isBefore(dayjs().startOf('day'))}
                    />
                  </Form.Item>

                  {/* THỜI GIAN ĐẶT – GIỜ SELECT + PHÚT RADIO (HẾT NHẢY 100%) */}
                  <div className="col-span-1 md:col-span-2">
                    <div className="mb-2 text-base font-medium">
                      Thời gian đặt <span className="text-red-500">*</span>
                    </div>
                    <div className="flex items-center gap-6">
                      {/* GIỜ – GIỮ SELECT */}
                      <Form.Item
                        {...restField}
                        name={[name, 'hour']}
                        rules={[{ required: true, message: 'Vui lòng chọn giờ!' }]}
                        className="mb-0"
                      >
                        <Select
                          placeholder="Chọn giờ"
                          style={{ width: 120 }}
                          disabled={disabled || !selectedDate}
                          onChange={(value) => onTimeChange(value as number, index, 'hour')}
                        >
                          {[8, 9, 10, 11, 13, 14, 15, 16, 17].map((hour) => {
                            let disabledHour = false;
                            if (selectedDate && selectedDate.isSame(currentDateTime, 'day')) {
                              if (hour < currentDateTime.hour()) disabledHour = true;
                            }
                            return (
                              <Select.Option key={hour} value={hour} disabled={disabledHour}>
                                {hour.toString().padStart(2, '0')}h
                              </Select.Option>
                            );
                          })}
                        </Select>
                      </Form.Item>

                      {/* PHÚT – DÙNG RADIO NGANG ĐỂ HẾT NHẢY */}
                      <Form.Item
                        {...restField}
                        name={[name, 'minute']}
                        rules={[{ required: true, message: 'Vui lòng chọn phút!' }]}
                        className="mb-0"
                      >
                        <Radio.Group
                          disabled={disabled || !selectedDate}
                          onChange={(e) => onTimeChange(e.target.value, index, 'minute')}
                          buttonStyle="solid"
                        >
                          <Radio.Button value={0}>00</Radio.Button>
                          <Radio.Button value={15}>15</Radio.Button>
                          <Radio.Button value={30}>30</Radio.Button>
                          <Radio.Button value={45}>45</Radio.Button>
                        </Radio.Group>
                      </Form.Item>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {!disabled && (
            <Button
              type="dashed"
              onClick={() =>
                add({
                  petName: '',
                  petType: petTypes[0],
                  service: undefined,
                  date: null,
                  time: undefined,
                })
              }
              block
              icon={<PlusOutlined />}
            >
              Thêm thú cưng
            </Button>
          )}
        </>
      )}
    </Form.List>
  );
};

export default MultiPetFields;
