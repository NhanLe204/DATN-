// src/pages/booking/BookingManager.tsx
import React, { useState } from 'react';
import { Card, Button, Spin } from 'antd';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';

import { FaPlus } from "react-icons/fa";

import SearchBar from '../components/booking/SearchBar';
import BookingTable from '../components/booking/BookingTable';

import StartServiceModal from '../components/booking/StartServiceModal';
import BookingFormModal from '../components/booking/BookingFormModal';

import { useBookingLogic } from './bookingLogic';
import { petTypesDefault, availableTimeSlots, Booking } from './bookingTypes';

const BookingManager: React.FC = () => {
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isStartModalVisible, setIsStartModalVisible] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const {
    filteredBookings, services, searchText, setSearchText,
    selectedDate, slotAvailability, isStarting, isCompleting,
    form, startForm, addForm,
    handleSearch, handleEdit, handleAdd, handleAddModalOk, handleAddModalCancel,
    handleEditModalOk, handleStart, handleStartModalOk, handleComplete,
    handleModalCancel, handleDateChange, handleTimeChange, handleServiceChange, selectedBooking,
  } = useBookingLogic();

  const openEdit = (record: Booking) => {
    setIsEditMode(false);
    handleEdit(record);
    setIsEditModalVisible(true);
  };

  const openStart = (record: Booking) => {
    handleStart(record);
    setIsStartModalVisible(true);
  };

  const openAdd = () => {
    handleAdd();
    setIsAddModalVisible(true);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Spin spinning={isStarting || isCompleting} tip={isStarting ? "Đang bắt đầu dịch vụ..." : "Đang hoàn thành dịch vụ..."}>
        <Card
          title={
            <div className="flex items-center justify-between gap-4">
              <SearchBar searchText={searchText} onSearch={handleSearch} />
              <Button type="primary" onClick={openAdd}><FaPlus />Thêm</Button>
            </div>
          }
          bordered={false}
          className="shadow-sm"
        >
          <BookingTable bookings={filteredBookings} onEdit={openEdit} onStart={openStart} onComplete={handleComplete} />
        </Card>

        {/* ADD MODAL */}
        <BookingFormModal
          visible={isAddModalVisible}
          isAddMode={true}
          isEditMode={false}
          services={services}
          petTypes={petTypesDefault}
          form={addForm}
          slotAvailability={slotAvailability}
          availableTimeSlots={availableTimeSlots}
          currentDateTime={dayjs().tz('Asia/Ho_Chi_Minh')}
          onOk={async () => {
            const success = await handleAddModalOk();
            if (success) setIsAddModalVisible(false);
            return success;
          }}
          onCancel={() => {
            handleModalCancel();
            setIsAddModalVisible(false);
          }}
          onDateChange={(date, index) => handleDateChange(date, index)}
          onTimeChange={(time, index) => handleTimeChange(time, index)}
          onServiceChange={(value, index) => handleServiceChange(value, index)}
        />

        {/* EDIT/VIEW MODAL */}
        <BookingFormModal
          visible={isEditModalVisible}
          isEditMode={isEditMode}
          booking={selectedBooking}
          services={services}
          petTypes={petTypesDefault}
          form={form}
          slotAvailability={slotAvailability}
          availableTimeSlots={availableTimeSlots}
          currentDateTime={dayjs().tz('Asia/Ho_Chi_Minh')}
          onOk={async () => {
            const success = await handleEditModalOk();
            if (success) {
              setIsEditModalVisible(false);
              setIsEditMode(false);
            }
            return success;
          }}
          onCancel={() => {
            handleModalCancel();
            setIsEditModalVisible(false);
          }}
          onEditModeToggle={() => setIsEditMode(true)}
          onDateChange={(date, index) => handleDateChange(date, index)}
          onTimeChange={(time, index) => handleTimeChange(time, index)}
          onServiceChange={(value, index) => handleServiceChange(value, index)}
        />
        <StartServiceModal
          visible={isStartModalVisible}
          booking={selectedBooking}
          form={startForm}
          onOk={async () => {
            await handleStartModalOk();
            setIsStartModalVisible(false);
          }}
          onCancel={() => {
            handleModalCancel();
            setIsStartModalVisible(false);
          }}
        />

      </Spin>
    </motion.div>
  );
};

export default BookingManager;