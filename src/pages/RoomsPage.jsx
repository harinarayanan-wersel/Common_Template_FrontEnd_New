import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card.jsx";
import { Badge } from "../components/ui/badge.jsx";
import { Button } from "../components/ui/button.jsx";
import { Calendar } from "../components/ui/calendar.jsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select.jsx";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../components/ui/carousel.jsx";
import { DataTable } from "../components/ui/data-table.jsx";
import {
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";
import { format, parse } from "date-fns";

export const RoomsPage = () => {
  const [date, setDate] = useState(new Date(2025, 10, 19)); // November 19, 2025
  const [roomsAvailabilityPeriod, setRoomsAvailabilityPeriod] =
    useState("Daily");
  const [guestActivityPeriod, setGuestActivityPeriod] = useState("Daily");
  const [vipReservationsPeriod, setVipReservationsPeriod] = useState("Monthly");
  const [customerRatingsPeriod, setCustomerRatingsPeriod] = useState("Monthly");

  // Popular Rooms Data
  const popularRooms = [
    {
      id: 1,
      name: "Deluxe Room - G - 3215",
      code: "SJ-56721",
      image:
        "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&h=300&fit=crop",
      status: "Available",
      statusColor: "bg-green-500",
    },
    {
      id: 2,
      name: "The Garden Suite 101",
      code: "SJ-54214",
      image:
        "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400&h=300&fit=crop",
      status: "Booked",
      statusColor: "bg-red-500",
    },
    {
      id: 3,
      name: "The Tranquil S-02",
      code: "SJ-45672",
      image:
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop",
      status: "Available",
      statusColor: "bg-green-500",
    },
    {
      id: 4,
      name: "The Velvet - F - 32045",
      code: "SJ-32056",
      image:
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&h=300&fit=crop",
      status: "Booked",
      statusColor: "bg-red-500",
    },
    {
      id: 5,
      name: "Executive Suite 205",
      code: "SJ-52341",
      image:
        "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=400&h=300&fit=crop",
      status: "Available",
      statusColor: "bg-green-500",
    },
  ];

  // Recent Bookings Data
  const recentBookings = [
    {
      id: 1,
      roomName: "Deluxe Room - G - 3215",
      bookedBy: "Angela Carter",
      dates: "10 Dec - 15 Dec",
      image:
        "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=100&h=100&fit=crop",
    },
    {
      id: 2,
      roomName: "The Garden Suite 101",
      bookedBy: "Jack Smith",
      dates: "12 Dec - 16 Dec",
      image:
        "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=100&h=100&fit=crop",
    },
    {
      id: 3,
      roomName: "The Tranquil S-02",
      bookedBy: "Jennifer Anderson",
      dates: "15 Dec - 20 Dec",
      image:
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=100&h=100&fit=crop",
    },
    {
      id: 4,
      roomName: "The Queen - X - 231",
      bookedBy: "Michael Brown",
      dates: "18 Dec - 22 Dec",
      image:
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=100&h=100&fit=crop",
    },
  ];

  // VIP Reservations Data - Extended for pagination demo
  const vipReservations = [
    {
      id: 1,
      code: "TRZ-32",
      room: "Deluxe Room - G - 3215",
      customer: "Angela Carter",
      duration: "10 Dec - 15 Dec",
    },
    {
      id: 2,
      code: "TRZ-33",
      room: "The Garden Suite 101",
      customer: "Jack Smith",
      duration: "12 Dec - 16 Dec",
    },
    {
      id: 3,
      code: "TRZ-34",
      room: "The Tranquil S-02",
      customer: "Jennifer Anderson",
      duration: "15 Dec - 20 Dec",
    },
    {
      id: 4,
      code: "TRZ-35",
      room: "The Velvet - F - 32045",
      customer: "Robert Wilson",
      duration: "20 Dec - 25 Dec",
    },
    {
      id: 5,
      code: "TRZ-36",
      room: "Executive Suite 205",
      customer: "Emily Davis",
      duration: "22 Dec - 28 Dec",
    },
    {
      id: 6,
      code: "TRZ-37",
      room: "Presidential Suite 301",
      customer: "David Martinez",
      duration: "25 Dec - 30 Dec",
    },
    {
      id: 7,
      code: "TRZ-38",
      room: "Ocean View - A - 1205",
      customer: "Lisa Thompson",
      duration: "28 Dec - 2 Jan",
    },
    {
      id: 8,
      code: "TRZ-39",
      room: "Mountain View - B - 2103",
      customer: "James Wilson",
      duration: "30 Dec - 5 Jan",
    },
    {
      id: 9,
      code: "TRZ-40",
      room: "City View Suite 405",
      customer: "Maria Garcia",
      duration: "2 Jan - 8 Jan",
    },
    {
      id: 10,
      code: "TRZ-41",
      room: "Luxury Penthouse 501",
      customer: "Michael Brown",
      duration: "5 Jan - 12 Jan",
    },
    {
      id: 11,
      code: "TRZ-42",
      room: "Deluxe Room - G - 3216",
      customer: "Sarah Johnson",
      duration: "8 Jan - 15 Jan",
    },
    {
      id: 12,
      code: "TRZ-43",
      room: "The Garden Suite 102",
      customer: "Christopher Lee",
      duration: "10 Jan - 17 Jan",
    },
  ];

  // VIP Reservations Columns
  const vipReservationsColumns = [
    { key: "code", label: "Code", sortable: true },
    {
      key: "room",
      label: "Room",
      sortable: true,
      cellClassName: "max-w-[150px] truncate",
    },
    { key: "customer", label: "Customer", sortable: true },
    {
      key: "duration",
      label: "Duration",
      sortable: true,
      render: (value) => (
        <Badge
          variant="outline"
          className="text-blue-600 border-blue-200 bg-blue-50"
        >
          {value}
        </Badge>
      ),
    },
  ];

  // Custom card renderer for VIP Reservations
  const renderVIPReservationCard = (row, { onView, onEdit, onDelete }) => {
    return (
      <CardContent className="p-5">
        <div className="space-y-4">
          {/* Code */}
          <div className="space-y-1">
            <div className="text-xs text-gray-500">Code</div>
            <div className="text-sm font-medium">{row.code}</div>
          </div>

          {/* Room */}
          <div className="space-y-1">
            <div className="text-xs text-gray-500">Room</div>
            <div className="text-sm text-gray-900">{row.room}</div>
          </div>

          {/* Customer */}
          <div className="space-y-1">
            <div className="text-xs text-gray-500">Customer</div>
            <div className="text-sm font-medium">{row.customer}</div>
          </div>

          {/* Duration */}
          <div className="space-y-1">
            <div className="text-xs text-gray-500">Duration</div>
            <div className="text-sm text-blue-600 font-medium">
              {row.duration}
            </div>
          </div>

          {/* Action Buttons Footer */}
          {(onView || onEdit || onDelete) && (
            <div className="flex items-center justify-end gap-[0.1rem] pt-3 border-t">
              {onView && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onView(row)}
                  title="View"
                >
                  <Eye className="h-4 w-4 text-blue-600" />
                </Button>
              )}
              {onEdit && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onEdit(row)}
                  title="Edit"
                >
                  <Pencil className="h-4 w-4 text-blue-600" />
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onDelete(row)}
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    );
  };

  // VIP Reservations Handlers
  const handleViewReservation = (row) => {
    console.log("View reservation:", row);
    // Add your view logic here
  };

  const handleEditReservation = (row) => {
    console.log("Edit reservation:", row);
    // Add your edit logic here
  };

  const handleDeleteReservation = (row) => {
    console.log("Delete reservation:", row);
    // Add your delete logic here (e.g., show confirmation dialog)
    if (
      window.confirm(`Are you sure you want to delete reservation ${row.code}?`)
    ) {
      // Handle deletion
    }
  };

  // Customer Ratings Data - Extended for pagination demo
  const customerRatings = [
    {
      id: 1,
      userId: "#007",
      customerName: "John Doe",
      rating: 4,
      review: "Decent experience",
      date: "19 Nov. 25",
      image: "https://i.pravatar.cc/150?img=1",
    },
    {
      id: 2,
      userId: "#008",
      customerName: "Jane Smith",
      rating: 5,
      review: "Excellent service and amenities",
      date: "18 Nov. 25",
      image: "https://i.pravatar.cc/150?img=5",
    },
    {
      id: 3,
      userId: "#009",
      customerName: "Mike Johnson",
      rating: 3,
      review: "Room was okay, could be better",
      date: "17 Nov. 25",
      image: "https://i.pravatar.cc/150?img=12",
    },
    {
      id: 4,
      userId: "#010",
      customerName: "Sarah Williams",
      rating: 5,
      review: "Amazing stay, highly recommended",
      date: "16 Nov. 25",
      image: "https://i.pravatar.cc/150?img=9",
    },
    {
      id: 5,
      userId: "#011",
      customerName: "Robert Taylor",
      rating: 4,
      review: "Good value for money",
      date: "15 Nov. 25",
      image: "https://i.pravatar.cc/150?img=13",
    },
    {
      id: 6,
      userId: "#012",
      customerName: "Emma Wilson",
      rating: 5,
      review: "Perfect location and service",
      date: "14 Nov. 25",
      image: "https://i.pravatar.cc/150?img=20",
    },
    {
      id: 7,
      userId: "#013",
      customerName: "Daniel Brown",
      rating: 2,
      review: "Needs improvement in cleanliness",
      date: "13 Nov. 25",
      image: "https://i.pravatar.cc/150?img=15",
    },
    {
      id: 8,
      userId: "#014",
      customerName: "Olivia Davis",
      rating: 5,
      review: "Exceeded expectations",
      date: "12 Nov. 25",
      image: "https://i.pravatar.cc/150?img=24",
    },
    {
      id: 9,
      userId: "#015",
      customerName: "William Miller",
      rating: 4,
      review: "Comfortable and clean",
      date: "11 Nov. 25",
      image: "https://i.pravatar.cc/150?img=33",
    },
    {
      id: 10,
      userId: "#016",
      customerName: "Sophia Garcia",
      rating: 5,
      review: "Best hotel experience ever",
      date: "10 Nov. 25",
      image: "https://i.pravatar.cc/150?img=47",
    },
    {
      id: 11,
      userId: "#017",
      customerName: "James Martinez",
      rating: 3,
      review: "Average stay",
      date: "9 Nov. 25",
      image: "https://i.pravatar.cc/150?img=51",
    },
    {
      id: 12,
      userId: "#018",
      customerName: "Isabella Anderson",
      rating: 5,
      review: "Will definitely come back",
      date: "8 Nov. 25",
      image: "https://i.pravatar.cc/150?img=60",
    },
    {
      id: 13,
      userId: "#019",
      customerName: "Benjamin Thomas",
      rating: 4,
      review: "Nice amenities",
      date: "7 Nov. 25",
      image: "https://i.pravatar.cc/150?img=68",
    },
    {
      id: 14,
      userId: "#020",
      customerName: "Mia Jackson",
      rating: 5,
      review: "Outstanding hospitality",
      date: "6 Nov. 25",
      image: "https://i.pravatar.cc/150?img=70",
    },
  ];

  // Customer Ratings Columns
  const customerRatingsColumns = [
    { key: "userId", label: "User ID", sortable: true },
    {
      key: "customerName",
      label: "Customer Name",
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <img
            src={row.image || "https://i.pravatar.cc/150?img=1"}
            alt={value}
            className="h-8 w-8 rounded-full object-cover"
          />
          <span>{value}</span>
        </div>
      ),
    },
    {
      key: "rating",
      label: "Ratings",
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <span
              key={i}
              className={i < value ? "text-yellow-400" : "text-gray-300"}
            >
              ★
            </span>
          ))}
        </div>
      ),
    },
    { key: "review", label: "Reviews", sortable: false },
    { key: "date", label: "Date", sortable: true },
  ];

  // Format date from "19 Nov. 25" to "19 Nov 2025"
  const formatRatingDate = (dateStr) => {
    try {
      // Parse "19 Nov. 25" format
      const cleaned = dateStr.replace(".", "");
      const parsed = parse(cleaned, "d MMM yy", new Date());
      return format(parsed, "d MMM yyyy");
    } catch {
      // Fallback to original if parsing fails
      return dateStr.replace(".", "");
    }
  };

  // Custom card renderer for customer ratings
  const renderCustomerRatingCard = (row, { onView, onEdit, onDelete }) => {
    const formattedDate = formatRatingDate(row.date);

    return (
      <CardContent className="p-4 sm:p-5">
        {/* Header Section with Avatar, Name, Title, and Action Icons */}
        <div className="flex items-start justify-between gap-2 mb-4 sm:mb-5">
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <img
              src={row.image || "https://i.pravatar.cc/150?img=1"}
              alt={row.customerName}
              className="h-12 w-12 sm:h-14 sm:w-14 rounded-full object-cover flex-shrink-0"
            />
            <div className="min-w-0 flex-1">
              <div className="text-sm sm:text-base font-semibold text-gray-900 truncate">
                {row.customerName}
              </div>
              <div className="text-xs sm:text-sm text-gray-500 mt-0.5 truncate">
                {row.userId}
              </div>
            </div>
          </div>
          {/* Action Icons in Top Right */}
          {(onView || onEdit || onDelete) && (
            <div className="flex items-center gap-[0.1rem] flex-shrink-0">
              {onView && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 sm:h-7 sm:w-7"
                  onClick={() => onView(row)}
                  title="View"
                >
                  <Eye className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-blue-600" />
                </Button>
              )}
              {onEdit && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 sm:h-7 sm:w-7"
                  onClick={() => onEdit(row)}
                  title="Edit"
                >
                  <Pencil className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-blue-600" />
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 sm:h-7 sm:w-7"
                  onClick={() => onDelete(row)}
                  title="Delete"
                >
                  <Trash2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-red-600" />
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Information Section */}
        <div className="space-y-2.5 sm:space-y-3">
          {/* Rating */}
          <div>
            <div className="text-xs text-gray-500 mb-1 sm:mb-1.5">Rating</div>
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <span
                  key={i}
                  className={`text-sm sm:text-base ${
                    i < row.rating ? "text-yellow-400" : "text-gray-300"
                  }`}
                >
                  ★
                </span>
              ))}
            </div>
          </div>

          {/* Review */}
          <div>
            <div className="text-xs text-gray-500 mb-1 sm:mb-1.5">Review</div>
            <div className="text-xs sm:text-sm text-gray-900 leading-relaxed">
              {row.review}
            </div>
          </div>

          {/* Date */}
          <div>
            <div className="text-xs text-gray-500 mb-1 sm:mb-1.5">Date</div>
            <div className="text-xs sm:text-sm text-gray-900">
              {formattedDate}
            </div>
          </div>
        </div>
      </CardContent>
    );
  };

  // Customer Ratings Handlers
  const handleViewRating = (row) => {
    console.log("View rating:", row);
    // Add your view logic here
  };

  const handleEditRating = (row) => {
    console.log("Edit rating:", row);
    // Add your edit logic here
  };

  const handleDeleteRating = (row) => {
    console.log("Delete rating:", row);
    // Add your delete logic here
    if (
      window.confirm(
        `Are you sure you want to delete rating from ${row.customerName}?`
      )
    ) {
      // Handle deletion
    }
  };

  // Guest Activity Data (for line chart)
  const guestActivityData = [
    { time: "09:00", value: 15, previous: 12 },
    { time: "10:00", value: 25, previous: 20 },
    { time: "11:00", value: 30, previous: 28 },
    { time: "12:00", value: 45, previous: 40 },
    { time: "13:00", value: 35, previous: 32 },
    { time: "14:00", value: 48, previous: 42 },
    { time: "15:00", value: 40, previous: 38 },
  ];

  const maxValue = Math.max(
    ...guestActivityData.map((d) => Math.max(d.value, d.previous))
  );

  return (
    <div className="space-y-6 p-6">
      {/* Full Width Sections */}
      <div className="space-y-6">
        {/* Popular Rooms Carousel - Full Width */}
        <Card>
          <CardHeader>
            <CardTitle>Popular Rooms</CardTitle>
          </CardHeader>
          <CardContent>
            <Carousel className="w-full" opts={{ align: "start", loop: false }}>
              <CarouselContent className="-ml-2 md:-ml-4">
                {popularRooms.map((room) => (
                  <CarouselItem
                    key={room.id}
                    className="pl-2 md:pl-4 basis-full md:basis-1/2 lg:basis-1/4 xl:basis-1/5"
                  >
                    <Card className="overflow-hidden">
                      <div className="relative">
                        <img
                          src={room.image}
                          alt={room.name}
                          className="w-full h-48 object-cover"
                        />
                        <Badge
                          className={`absolute top-2 right-2 ${room.statusColor} text-white border-0`}
                        >
                          {room.status}
                        </Badge>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-sm mb-1">
                          {room.name}
                        </h3>
                        <p className="text-xs text-gray-500">
                          Code {room.code}
                        </p>
                      </CardContent>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="-left-4" />
              <CarouselNext className="-right-4" />
            </Carousel>
          </CardContent>
        </Card>

        {/* Upcoming VIP Reservations - Full Width */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Upcoming VIP Reservations</CardTitle>
            <Select
              value={vipReservationsPeriod}
              onValueChange={setVipReservationsPeriod}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Daily">Daily</SelectItem>
                <SelectItem value="Weekly">Weekly</SelectItem>
                <SelectItem value="Monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <DataTable
              data={vipReservations}
              columns={vipReservationsColumns}
              searchKey=""
              searchPlaceholder="Search by code, room, or customer..."
              pageSize={5}
              onView={handleViewReservation}
              onEdit={handleEditReservation}
              onDelete={handleDeleteReservation}
              actionsLabel="ACTIONS"
              renderCard={renderVIPReservationCard}
            />
          </CardContent>
        </Card>

        {/* Customer Ratings - Full Width (Last) */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Customer Ratings</CardTitle>
            <Select
              value={customerRatingsPeriod}
              onValueChange={setCustomerRatingsPeriod}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Daily">Daily</SelectItem>
                <SelectItem value="Weekly">Weekly</SelectItem>
                <SelectItem value="Monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <DataTable
              data={customerRatings}
              columns={customerRatingsColumns}
              searchKey="customerName"
              searchPlaceholder="Search by customer name..."
              pageSize={5}
              onView={handleViewRating}
              onEdit={handleEditRating}
              onDelete={handleDeleteRating}
              actionsLabel="ACTIONS"
              renderCard={renderCustomerRatingCard}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
