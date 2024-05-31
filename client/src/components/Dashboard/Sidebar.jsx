import { useState } from "react";
import useAuth from "../../hooks/useAuth";
import { AiOutlineBars } from "react-icons/ai";
import { GrLogout } from "react-icons/gr";
import { Link, NavLink } from "react-router-dom";
import { BsFillHouseAddFill, BsGraphUp } from "react-icons/bs";
import { MdHomeWork } from "react-icons/md";
import { FcSettings } from "react-icons/fc";
import useRole from "../../hooks/useRole";
import ToggleBtn from "./Host/ToggleBtn";
import Swal from "sweetalert2";
import useAxiosCommon from "../../hooks/useAxiosCommon";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

const Sidebar = () => {
  const { user, logOut } = useAuth();
  const [isActive, setActive] = useState(false);
  const axiosCommon = useAxiosCommon();
  const [toggle, setToggle] = useState(true);
  const { role } = useRole();
  // Sidebar Responsive Handler
  const handleToggle = () => {
    setActive(!isActive);
  };
  const toggleHandler = (event) => {
    setToggle(event.target.checked);
  };
  const { mutateAsync } = useMutation({
    mutationFn: async (userInfo) => {
      const { data } = await axiosCommon.put("/users", userInfo);
      console.log(data);
      if (data.modifiedCount > 0) {
        Swal.fire({
          title: "Wait for Admin Confirmation!",
          text: "Your Request has been Sent.",
          icon: "success",
        });
      } else {
        toast.success("Please Wait for Admin Approval");
      }
      return data;
    },
  });
  const beHost = async () => {
    Swal.fire({
      title: "Wanna become a Host?",
      text: "Press Yes to go Further!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Next Step!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const userInfo = {
            email: user?.email,
            role: "Guest",
            status: "Requested",
          };
          await mutateAsync(userInfo);
        } catch (err) {
          console.log(err);
        }
      }
    });
  };
  return (
    <>
      {/* Small Screen Navbar */}
      <div className="bg-gray-100 text-gray-800 flex justify-between md:hidden">
        <div>
          <div className="block cursor-pointer p-4 font-bold">
            <Link to="/">
              <img
                // className='hidden md:block'
                src="https://i.ibb.co/4ZXzmq5/logo.png"
                alt="logo"
                width="100"
                height="100"
              />
            </Link>
          </div>
        </div>

        <button
          onClick={handleToggle}
          className="mobile-menu-button p-4 focus:outline-none focus:bg-gray-200"
        >
          <AiOutlineBars className="h-5 w-5" />
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`z-10 md:fixed flex flex-col justify-between overflow-x-hidden bg-gray-100 w-64 space-y-6 px-2 py-4 absolute inset-y-0 left-0 transform ${
          isActive && "-translate-x-full"
        }  md:translate-x-0  transition duration-200 ease-in-out`}
      >
        <div>
          <div>
            <div className="w-full hidden md:flex px-4 py-2 shadow-lg rounded-lg justify-center items-center bg-rose-100 mx-auto">
              <Link to="/">
                <img
                  // className='hidden md:block'
                  src="https://i.ibb.co/4ZXzmq5/logo.png"
                  alt="logo"
                  width="100"
                  height="100"
                />
              </Link>
            </div>
          </div>

          {/* Nav Items */}
          <div className="flex flex-col justify-between flex-1 mt-6">
            {/* Conditional toggle button here.. */}
            {role === "Host" && (
              <ToggleBtn toggleHandler={toggleHandler} toggle={toggle} />
            )}
            {/*  Menu Items */}
            {role === "Admin" && (
              <nav>
                {/* Statistics */}
                <NavLink
                  to="/dashboard"
                  end
                  className={({ isActive }) =>
                    `flex items-center px-4 py-2 my-5  transition-colors duration-300 transform  hover:bg-gray-300   hover:text-gray-700 ${
                      isActive ? "bg-gray-300  text-gray-700" : "text-gray-600"
                    }`
                  }
                >
                  <BsGraphUp className="w-5 h-5" />

                  <span className="mx-4 font-medium">Statistics</span>
                </NavLink>

                {/* Mangae Users */}
                <NavLink
                  to="manage-users"
                  className={({ isActive }) =>
                    `flex items-center px-4 py-2 my-5  transition-colors duration-300 transform  hover:bg-gray-300   hover:text-gray-700 ${
                      isActive ? "bg-gray-300  text-gray-700" : "text-gray-600"
                    }`
                  }
                >
                  <BsFillHouseAddFill className="w-5 h-5" />

                  <span className="mx-4 font-medium">Manage Users</span>
                </NavLink>
              </nav>
            )}
            {role === "Host" ? (
              toggle ? (
                <nav>
                  {/* Statistics */}
                  <NavLink
                    to="/dashboard"
                    end
                    className={({ isActive }) =>
                      `flex items-center px-4 py-2 my-5  transition-colors duration-300 transform  hover:bg-gray-300   hover:text-gray-700 ${
                        isActive
                          ? "bg-gray-300  text-gray-700"
                          : "text-gray-600"
                      }`
                    }
                  >
                    <BsGraphUp className="w-5 h-5" />

                    <span className="mx-4 font-medium">Statistics</span>
                  </NavLink>

                  {/* Add Room */}
                  <NavLink
                    to="add-room"
                    className={({ isActive }) =>
                      `flex items-center px-4 py-2 my-5  transition-colors duration-300 transform  hover:bg-gray-300   hover:text-gray-700 ${
                        isActive
                          ? "bg-gray-300  text-gray-700"
                          : "text-gray-600"
                      }`
                    }
                  >
                    <BsFillHouseAddFill className="w-5 h-5" />

                    <span className="mx-4 font-medium">Add Room</span>
                  </NavLink>
                  {/* My Listing */}
                  <NavLink
                    to="my-listings"
                    className={({ isActive }) =>
                      `flex items-center px-4 py-2 my-5  transition-colors duration-300 transform  hover:bg-gray-300   hover:text-gray-700 ${
                        isActive
                          ? "bg-gray-300  text-gray-700"
                          : "text-gray-600"
                      }`
                    }
                  >
                    <MdHomeWork className="w-5 h-5" />

                    <span className="mx-4 font-medium">My Listings</span>
                  </NavLink>
                </nav>
              ) : (
                <nav>
                  {/* Statistics */}
                  <NavLink
                    to="/dashboard"
                    end
                    className={({ isActive }) =>
                      `flex items-center px-4 py-2 my-5  transition-colors duration-300 transform  hover:bg-gray-300   hover:text-gray-700 ${
                        isActive
                          ? "bg-gray-300  text-gray-700"
                          : "text-gray-600"
                      }`
                    }
                  >
                    <BsGraphUp className="w-5 h-5" />

                    <span className="mx-4 font-medium">Statistics</span>
                  </NavLink>

                  {/* Add Room */}
                  <NavLink
                    to="myBookings"
                    className={({ isActive }) =>
                      `flex items-center px-4 py-2 my-5  transition-colors duration-300 transform  hover:bg-gray-300   hover:text-gray-700 ${
                        isActive
                          ? "bg-gray-300  text-gray-700"
                          : "text-gray-600"
                      }`
                    }
                  >
                    <BsFillHouseAddFill className="w-5 h-5" />

                    <span className="mx-4 font-medium">My Bookings</span>
                  </NavLink>
                  <button
                  disabled={role === "Host"}
              onClick={beHost}
              className={"disabled:cursor-not-allowed bg-slate-200 font-bold w-full px-4 py-3 rounded"}
            >
              Become A Host
            </button>
                </nav>
              )
            ) : undefined}
            {role === "Guest" && (
              <nav>
                {/* Statistics */}
                <NavLink
                  to="/dashboard"
                  end
                  className={({ isActive }) =>
                    `flex items-center px-4 py-2 my-5  transition-colors duration-300 transform  hover:bg-gray-300   hover:text-gray-700 ${
                      isActive ? "bg-gray-300  text-gray-700" : "text-gray-600"
                    }`
                  }
                >
                  <BsGraphUp className="w-5 h-5" />

                  <span className="mx-4 font-medium">Statistics</span>
                </NavLink>

                {/* Add Room */}
                <NavLink
                  to="myBookings"
                  className={({ isActive }) =>
                    `flex items-center px-4 py-2 my-5  transition-colors duration-300 transform  hover:bg-gray-300   hover:text-gray-700 ${
                      isActive ? "bg-gray-300  text-gray-700" : "text-gray-600"
                    }`
                  }
                >
                  <BsFillHouseAddFill className="w-5 h-5" />

                  <span className="mx-4 font-medium">My Bookings</span>
                </NavLink>
              </nav>
            )}
          </div>
          {role === "Guest" && (
            <button
              onClick={beHost}
              className={"bg-slate-200 font-bold w-full px-4 py-3 rounded"}
            >
              Become A Host
            </button>
          )}
        </div>

        <div>
          <hr />

          {/* Profile Menu */}
          <NavLink
            to="/dashboard/profile"
            className={({ isActive }) =>
              `flex items-center px-4 py-2 my-5  transition-colors duration-300 transform  hover:bg-gray-300   hover:text-gray-700 ${
                isActive ? "bg-gray-300  text-gray-700" : "text-gray-600"
              }`
            }
          >
            <FcSettings className="w-5 h-5" />

            <span className="mx-4 font-medium">Profile</span>
          </NavLink>
          <button
            onClick={logOut}
            className="flex w-full items-center px-4 py-2 mt-5 text-gray-600 hover:bg-gray-300   hover:text-gray-700 transition-colors duration-300 transform"
          >
            <GrLogout className="w-5 h-5" />

            <span className="mx-4 font-medium">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
