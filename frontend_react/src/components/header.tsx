
import React, { useState, useEffect } from "react";
import {
  Input,
  Dropdown,
  Menu,
  Space,
  Typography,
  Badge,
  Avatar,
  Drawer,
  Button,
} from "antd";
import {
  FaTruck,
  FaGift,
  FaCheckCircle,
  FaShoppingCart,
  FaUserAlt,
  FaPhoneAlt,
  FaSearch,
  FaBars,
  FaAngleDown,
  FaTimes,
} from "react-icons/fa";
import { BsGeoAltFill } from "react-icons/bs";
import { Search } from "lucide-react";
import { useContext } from "react";
import { useSelector } from "react-redux"
import { useLocation } from "react-router-dom";
const { Title, Text } = Typography;

export default function Header() {
  const cartItems=useSelector((state:any)=>state.cart.items);
  const cartCount=cartItems. reduce((count:any,item:any)=> count +Number(item.quantity),0)
  const [open, setOpen] = useState(false);
  const [searchMobileOpen, setSearchMobileOpen] = useState(false);
  const [searchDesktopOpen, setSearchDesktopOpen] = useState(false);
  const [subMenu, setSubMenu] = useState(false);
  interface User {
    fullname: string;
    avatar?: string;
    // Add other properties as needed
  }

  const [user, setUser] = useState<User | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  const showDrawer = () => setOpen(true);
  const onClose = () => {
    setOpen(false);
    setSubMenu(false);
  };

  const showSearchMobile = () => setSearchMobileOpen(true);
  const closeSearchMobile = () => setSearchMobileOpen(false);

  const showSearchDesktop = () => setSearchDesktopOpen(true);
  const closeSearchDesktop = () => setSearchDesktopOpen(false);

  // Load lịch sử tìm kiếm từ localStorage khi component mount
  useEffect(() => {
    const storedHistory = localStorage.getItem("searchHistory");
    if (storedHistory) {
      setSearchHistory(JSON.parse(storedHistory));
    }
  }, []);

  // Lưu lịch sử tìm kiếm vào localStorage khi thay đổi
  useEffect(() => {
    localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
  }, [searchHistory]);

  // Xử lý khi người dùng tìm kiếm
  const handleSearch = (value: string) => {
    const trimmedValue = value.trim();
    if (trimmedValue && !searchHistory.includes(trimmedValue)) {
      const newHistory = [trimmedValue, ...searchHistory].slice(0, 5);
      setSearchHistory(newHistory);
    }
    // Điều hướng sang trang /search với query parameter
    // window.location.href = `/search?q=${encodeURIComponent(trimmedValue)}`;
    // setKeyword(""); // Reset keyword sau khi tìm kiếm
  };
  // Xóa toàn bộ lịch sử tìm kiếm
  const clearSearchHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem("searchHistory");
  };

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const accountID = localStorage.getItem("accountID") || "";
    console.log("token nà: ", token);
    console.log("ID nà: ", accountID);
    if (!token || !accountID) {
      console.error("Không tìm thấy token hoặc accountID trong local");
      return;
    }

    const storedUserData = localStorage.getItem("userData");
    if (storedUserData) {
      setUser(JSON.parse(storedUserData));
    }

    fetch(`http://localhost:5000/api/v1/users/${accountID}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch user data");
        }
        return res.json();
      })
      .then((data) => {
        setUser(data.data);
        localStorage.setItem("userData", JSON.stringify(data.data));
      })
      .catch((err) => {
        console.error("Error fetching user:", err);
        // localStorage.removeItem("accessToken");
        // localStorage.removeItem("accountID");
        // localStorage.removeItem("userData");
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("accountID");
    localStorage.removeItem("userData");
    setUser(null);
    window.location.href = "/"; // Thay vì dùng router.push
  };

  // Menu cho dropdown khi hover
  const userMenu = (
    <Menu>
      <Menu.Item key="1">
        <a href={`/userprofile/account}`}>
          <i className="fas fa-user mr-2"></i>Tài khoản
        </a>
      </Menu.Item>
      <Menu.Item key="2" onClick={handleLogout}>
        <a href="#">
          <i className="fas fa-sign-out-alt mr-2"></i>Đăng xuất
        </a>
      </Menu.Item>
    </Menu>
  );

  // Nội dung của Dropdown tìm kiếm (desktop)
  const searchDesktop = (
    <div className="w-[100%] bg-white shadow-lg rounded-lg border border-gray-200" style={{ position: "absolute", top: "100%", left: 0, zIndex: 1000, maxHeight: "400px", overflowY: "auto" }}>
      <div className="p-4">
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-bold">TÌM KIẾM GẦN ĐÂY</h3>
            <Button
              type="link"
              icon={<FaTimes />}
              onClick={clearSearchHistory}
              className="text-red-500"
            >
              Xóa lịch sử
            </Button>
          </div>
          {searchHistory.length > 0 ? (
            <Space wrap className="mb-2">
              {searchHistory.map((item, index) => (
                <button
                  key={index}
                  className="rounded-full bg-gray-100 px-4 py-2 hover:bg-gray-200"
                  onClick={() => handleSearch(item)}
                >
                  {item}
                </button>
              ))}
            </Space>
          ) : (
            <p className="text-gray-500">Không có lịch sử tìm kiếm.</p>
          )}
        </div>
        <div>
          <h3 className="mb-2 text-lg font-bold">SẢN PHẨM NỔI BẬT</h3>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-2">
            <div className="rounded bg-gray-50 p-4 shadow-md">
              <div className="mb-2 h-32 w-full bg-gray-200"></div>
              <p className="font-bold">Nhà Cung Cấp</p>
              <p>Tiêu Đề Sản Phẩm Mẫu</p>
              <p className="text-[#22A6DF] font-bold">145.000đ</p>
            </div>
            <div className="rounded bg-gray-50 p-4 shadow-md">
              <div className="mb-2 h-32 w-full bg-gray-200"></div>
              <p className="font-bold">Nhà Cung Cấp</p>
              <p>Tiêu Đề Sản Phẩm Mẫu</p>
              <p className="text-[#22A6DF] font-bold">145.000đ</p>
            </div>
            <div className="rounded bg-gray-50 p-4 shadow-md">
              <div className="mb-2 h-32 w-full bg-gray-200"></div>
              <p className="font-bold">Nhà Cung Cấp</p>
              <p>Tiêu Đề Sản Phẩm Mẫu</p>
              <p className="text-[#22A6DF] font-bold">145.000đ</p>
            </div>
            <div className="rounded bg-gray-50 p-4 shadow-md">
              <div className="mb-2 h-32 w-full bg-gray-200"></div>
              <p className="font-bold">Nhà Cung Cấp</p>
              <p>Tiêu Đề Sản Phẩm Mẫu</p>
              <p className="text-[#22A6DF] font-bold">145.000đ</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Nội dung của Drawer tìm kiếm (mobile)
  const searchMobile = (
    <div className="p-4">
      <Input.Search
        placeholder="Tìm kiếm..."
        size="large"
        className="mb-4"
        onSearch={handleSearch}
      />
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-bold">TÌM KIẾM GẦN ĐÂY</h3>
          <Button
            type="link"
            icon={<FaTimes />}
            onClick={clearSearchHistory}
            className="text-red-500"
          >
            Xóa lịch sử
          </Button>
        </div>
        {searchHistory.length > 0 ? (
          <Space wrap className="mb-2">
            {searchHistory.map((item, index) => (
              <button
                key={index}
                className="rounded-full bg-gray-100 px-4 py-2 hover:bg-gray-200"
                onClick={() => handleSearch(item)}
              >
                {item}
              </button>
            ))}
          </Space>
        ) : (
          <p className="text-gray-500">Không có lịch sử tìm kiếm.</p>
        )}
      </div>
      <div>
        <h3 className="mb-2 text-lg font-bold">SẢN PHẨM NỔI BẬT</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded bg-gray-50 p-4">
            <div className="mb-2 h-32 w-full bg-gray-200"></div>
            <p className="font-bold">Nhà Cung Cấp</p>
            <p>Tiêu Đề Sản Phẩm Mẫu</p>
            <p className="text-[#22A6DF] font-bold">145.000đ</p>
          </div>
          <div className="rounded bg-gray-50 p-4">
            <div className="mb-2 h-32 w-full bg-gray-200"></div>
            <p className="font-bold">Nhà Cung Cấp</p>
            <p>Tiêu Đề Sản Phẩm Mẫu</p>
            <p className="text-[#22A6DF] font-bold">145.000đ</p>
          </div>
        </div>
      </div>
    </div>
  );

  const location = useLocation();
  const currentPath = location.pathname;

  const menuItems = [
    { path: "/", label: "Trang chủ" },
    { path: "/product", label: "Sản phẩm" },
    { path: "/info", label: "Dịch vụ thú cưng" },
    { path: "#", label: "Blog" },
    { path: "#", label: "Giới thiệu" },
    { path: "/contact", label: "Liên hệ" },
  ];

  return (
    <>
      <header className="w-full">
        {/* Menu 1 */}
        <div className="flex h-[34px] items-center justify-between bg-[#22A6DF] px-4 text-[10px] text-white sm:h-[34px] sm:px-[40px] sm:text-xs lg:px-[154px] lg:text-sm">
          <Space className="gap-4 sm:gap-4 lg:gap-10">
            <span className="flex items-center gap-1">
              <BsGeoAltFill className="h-3 w-3 sm:h-4 sm:w-4" /> Địa điểm
            </span>
            <span className="flex items-center gap-1">
              <FaTruck className="h-3 w-3 sm:h-4 sm:w-4" /> Trạng thái đơn hàng
            </span>
          </Space>
          <Space className="hidden items-center gap-1 text-xs sm:flex sm:text-xs">
            <div className="flex items-center rounded-xl bg-black px-2 py-1 font-semibold">
              %15 Off
            </div>{" "}
            khi mua tại cửa hàng
          </Space>
          <Space className="hidden gap-10 lg:flex">
            <span>VND ▼</span>
            <span>Tiếng Việt ▼</span>
          </Space>
        </div>

        {/* Menu 2 */}
        <div className="flex items-center justify-between px-4 py-3 sm:px-[40px] sm:py-4 lg:px-[154px]">
          {/* Logo */}
          <a href="/">
            <img
              src="/images/icons/logo.jpg"
              alt="PetHeaven Logo"
              className="h-[40px] w-auto sm:h-[60px] lg:h-[100px]"
            />
          </a>

          <Dropdown
            overlay={searchDesktop}
            trigger={["click"]}
            open={searchDesktopOpen}
            onOpenChange={setSearchDesktopOpen}
            placement="bottomLeft"
            overlayClassName="search-dropdown"
          >
            <Input.Search
              placeholder="Tìm kiếm..."
              enterButton={
                <button
                  style={{
                    backgroundColor: "#22A6DF",
                    borderColor: "#22A6DF",
                    height: "32px",
                    width: "32px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderTopRightRadius: "8px",
                    borderBottomRightRadius: "8px",
                  }}
                  onClick={showSearchDesktop}
                >
                  <FaSearch className="text-white" />
                </button>
              }
              className="custom-search hidden w-1/3 rounded-full md:flex"
              onSearch={handleSearch}
              
            />
          </Dropdown>

          <Space size={50} className="hidden xl:flex">
            <div className="flex flex-col items-center">
              <FaGift className="text-2xl text-[#22A6DF]" />
              <span>Free shipping</span>
              <span className="text-xs text-gray-500">
                Details & Restrictions
              </span>
            </div>
            <div className="flex flex-col items-center">
              <FaCheckCircle className="text-2xl text-[#22A6DF]" />
              <span>100% Satisfaction</span>
              <span className="text-xs text-gray-500">30 days no hassle</span>
            </div>
            <a href="/cart">
              <Badge count={cartCount}>
                <FaShoppingCart className="text-2xl" />
              </Badge>
            </a>
            {user ? (
              <Dropdown overlay={userMenu} trigger={["hover"]}>
                <div className="flex items-center cursor-pointer">
                  <Avatar
                    src={`${user.avatar}`}
                    icon={!user.avatar && <FaUserAlt />}
                    className="bg-[#22A6DF]"
                  />
                  <FaAngleDown className="ml-1 text-[#22A6DF]" />
                </div>
              </Dropdown>
            ) : (
              <a href="/login">
                <Avatar icon={<FaUserAlt />} className="bg-[#22A6DF]" />
              </a>
            )}
          </Space>

          <Space size={50} className="flex items-center xl:hidden">
            <button
              className="rounded-full p-2 hover:bg-gray-100 md:hidden"
              onClick={showSearchMobile}
            >
              <Search className="h-6 w-6" />
            </button>
            <a href="/cart">
              <Badge count={1}>
                <FaShoppingCart className="text-2xl" />
              </Badge>
            </a>
            {user ? (
              <Dropdown overlay={userMenu} trigger={["hover"]}>
                <div className="flex items-center cursor-pointer">
                  <Avatar
                    src={`${user.avatar}`}
                    icon={!user.avatar && <FaUserAlt />}
                    className="bg-[#22A6DF]"
                  />
                  <FaAngleDown className="ml-1 text-[#22A6DF]" />
                </div>
              </Dropdown>
            ) : (
              <a href="/login">
                <Avatar icon={<FaUserAlt />} className="bg-[#22A6DF]" />
              </a>
            )}
          </Space>
        </div>

        {/* Menu 3 */}
        <nav className="flex items-center justify-between bg-white px-4 text-black sm:px-[40px] lg:px-[154px]">
        <Space className="hidden items-center justify-between py-3 md:flex md:gap-[20px] lg:gap-[27px] xl:gap-[50px]">
            {menuItems.map((item) => (
              <a
                key={item.path}
                href={item.path}
                className="group relative"
              >
                <Typography.Text
                  className={`text-sm font-bold transition-colors duration-300 lg:text-sm xl:text-lg relative z-10 ${currentPath === item.path
                      ? "text-[#22A6DF]"
                      : "text-black group-hover:text-[#22A6DF]"
                    }`}
                >
                  {item.label}
                  <span
                    className={`absolute bottom-0 left-0 h-[2px] bg-[#22A6DF] transition-all duration-300 ${currentPath === item.path ? "w-full" : "w-0 group-hover:w-full"
                      }`}
                  ></span>
                </Typography.Text>
              </a>
            ))}
          </Space>

          <FaBars className="cursor-pointer md:hidden" onClick={showDrawer} />

          <Space className="whitespace-nowrap text-sm font-bold sm:text-xs lg:text-sm xl:text-base">
            <FaPhoneAlt className="mr-1" />
            24/7 Hỗ trợ: <span className="ml-1 text-[#22A6DF]">0393153129</span>
          </Space>
        </nav>

        <hr className="mt-[5px] border-dashed border-gray-300" />
      </header>

      {/* Search Drawer */}
      <Drawer
        title="Tìm Kiếm"
        placement="top"
        onClose={closeSearchMobile}
        open={searchMobileOpen}
        height={400}
      >
        {searchMobile}
      </Drawer>

      {/* Menu Drawer */}
      <Drawer
        title={subMenu ? "Sản phẩm" : "Menu"}
        placement="left"
        onClose={onClose}
        open={open}

      >
        <Menu
          mode="vertical"
          items={[
            { key: "home", label: <a href="/">Trang chủ</a> },
            { key: "products", label: <a href="/product">Sản phẩm</a> },
            { key: "services", label: <a href="#">Dịch vụ thú cưng</a> },
            { key: "blog", label: <a href="#">Blog</a> },
            { key: "about", label: <a href="#">Giới thiệu</a> },
            { key: "contact", label: <a href="#">Liên hệ</a> },
          ]}
        />
      </Drawer>
    </>
  );
}
