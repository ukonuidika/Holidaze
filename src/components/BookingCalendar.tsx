import React, { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface BookingCalendarProps {
  bookings: any[];
  isOpen: boolean;
  onClose: () => void;
}

export const BookingCalendar = ({
  bookings,
  isOpen,
  onClose,
}: BookingCalendarProps): React.ReactElement => {
  const [currentDate, setCurrentDate] = useState(new Date());

  if (!isOpen) return <></>;

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const isDateBooked = (date: Date) => {
    if (!date) return false;

    return bookings.some((booking) => {
      const dateFrom = new Date(booking.dateFrom);
      const dateTo = new Date(booking.dateTo);

      const checkDate = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
      );
      const fromDate = new Date(
        dateFrom.getFullYear(),
        dateFrom.getMonth(),
        dateFrom.getDate()
      );
      const toDate = new Date(
        dateTo.getFullYear(),
        dateTo.getMonth(),
        dateTo.getDate()
      );

      return checkDate >= fromDate && checkDate <= toDate;
    });
  };

  const goToPreviousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
    );
  };

  const goToNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
    );
  };

  const getDayClassName = (day: Date | null) => {
    if (!day) return "";

    const isBooked = isDateBooked(day);
    return isBooked
      ? "bg-red-500 text-white font-medium"
      : "text-gray-700 hover:bg-gray-100";
  };

  const days = getDaysInMonth(currentDate);

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            Booking Calendar
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={goToPreviousMonth}
              className="p-2 hover:bg-gray-100 rounded"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-medium">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>

            <button
              onClick={goToNextMonth}
              className="p-2 hover:bg-gray-100 rounded"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {daysOfWeek.map((day) => (
              <div
                key={day}
                className="text-center text-sm font-medium text-gray-500 py-2"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => (
              <div
                key={day ? day.toISOString() : `empty-${index}`} // Fixed: Using unique identifier
                className={`h-10 flex items-center justify-center text-sm rounded ${getDayClassName(
                  day
                )}`} // Fixed: Extracted nested ternary
              >
                {day ? day.getDate() : ""}
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center text-sm text-gray-600">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
              <span>Booked dates</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
