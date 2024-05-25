import { useMutation, useQuery } from "@tanstack/react-query";
import useAxiosCommon from "../../hooks/useAxiosCommon";
import LoadingSpinner from "../Shared/LoadingSpinner";
import { DateRange } from "react-date-range";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import toast from "react-hot-toast";
import { categories } from "../Categories/CategoriesData";
import axios from "axios";

const UpdateRoomForm = ({ id }) => {
  const axiosCommon = useAxiosCommon();
  const [preview, setPreview] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [state, setState] = useState([
    {
      startDate: new Date(),
      endDate: null,
      key: "selection",
    },
  ]);
  const {
    data: selectedRoom,
    refetch,
    isLoading,
  } = useQuery({
    queryKey: ["updateRoom", id],
    queryFn: async () => {
      const { data } = await axiosCommon.get(`/myListing/${id}`);
      return data;
    },
  });
  const { mutateAsync } = useMutation({
    mutationFn: async (roomInfo) => {
      const { data } = await axiosCommon.patch(`/rooms/${id}`, roomInfo);
      console.log(data);
      return data;
    },
    onSuccess: () => {
      refetch();
      toast.success("Room Updated to your listing");
    },
    onError: (error) => {
      console.log(error);
      toast.error(error.message);
    },
  });

  const handleImage = async (e) => {
    const image = e.target.files[0];
    const formData = new FormData();
    formData.append("image", image);
    try {
      const { data } = await axios.post(
        `https://api.imgbb.com/1/upload?key=${
          import.meta.env.VITE_IMGBB_API_KEY
        }`,
        formData
      );
      setPreview(data.data.display_url);
    } catch (error) {
      console.log(error);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const location = form.location.value;
    const category = form.category.value;
    const startDate = state[0].startDate;
    const endDate = state[0].endDate;
    const title = form.title.value;
    const price = form.price.value;
    const totalGuest = form.total_guest.value;
    const bedrooms = form.bedrooms.value;
    const bathrooms = form.bathrooms.value;
    const description = form.description.value;

    try {
      const roomInfo = {
        location,
        category,
        from: startDate,
        to: endDate,
        title,
        image: preview || selectedRoom.image,
        price,
        totalGuest,
        bedrooms,
        bathrooms,
        description,
        host: {
          name: user?.displayName,
          email: user?.email,
          image: user?.photoURL,
        },
      };
      await mutateAsync(roomInfo);
      form.reset();
      setPreview(null);
      refetch();
      navigate("/dashboard/my-listings");
      //   toast.success("Room updated to your listing");
    } catch (err) {
      console.log(err);
      //   toast.error(err.message);
    }
  };
  if (isLoading) return <LoadingSpinner />;
  return (
    <div className="w-full min-h-[calc(100vh-40px)] flex flex-col justify-center items-center text-gray-800 rounded-xl bg-gray-50">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="space-y-6">
            <div className="space-y-1 text-sm">
              <label htmlFor="location" className="block text-gray-600">
                Location
              </label>
              <input
                className="w-full px-4 py-3 text-gray-800 border border-rose-300 focus:outline-rose-500 rounded-md "
                name="location"
                defaultValue={selectedRoom?.location}
                id="location"
                type="text"
                placeholder="Location"
                required
              />
            </div>

            <div className="space-y-1 text-sm">
              <label htmlFor="category" className="block text-gray-600">
                Category
              </label>
              <select
                required
                defaultValue={selectedRoom?.category}
                className="w-full px-4 py-3 border border-rose-300 focus:outline-rose-500 rounded-md"
                name="category"
              >
                {categories.map((category) => (
                  <option value={category.label} key={category.label}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor="location" className="block text-gray-600">
                Select Availability Range
              </label>
              {/* Calender */}
              <DateRange
                showDateDisplay={false}
                rangeColors={["#F43F5E"]}
                editableDateInputs={true}
                onChange={(item) => setState([item.selection])}
                moveRangeOnFirstSelection={false}
                ranges={state}
              />
            </div>
          </div>
          <div className="space-y-6">
            <div className="space-y-1 text-sm">
              <label htmlFor="title" className="block text-gray-600">
                Title
              </label>
              <input
                className="w-full px-4 py-3 text-gray-800 border border-rose-300 focus:outline-rose-500 rounded-md "
                name="title"
                defaultValue={selectedRoom?.title}
                id="title"
                type="text"
                placeholder="Title"
                required
              />
            </div>

            <div className=" p-4 bg-white w-full  m-auto rounded-lg">
              <div className="file_upload px-5 py-3 relative border-4 border-dotted border-gray-300 rounded-lg">
                <div className="flex flex-col items-center w-max mx-auto text-center">
                  <label>
                    <input
                      className="text-sm cursor-pointer w-36 hidden"
                      type="file"
                      name="image"
                      onChange={handleImage}
                      id="image"
                      accept="image/*"
                      hidden
                    />
                    <div className="bg-rose-500 text-white border border-gray-300 rounded font-semibold cursor-pointer p-1 px-3 hover:bg-rose-500">
                      Upload Image
                    </div>
                    {preview && (
                      <img
                        className="w-36 mt-3 h-20 object-cover rounded"
                        src={preview}
                        alt=""
                      />
                    )}
                  </label>
                </div>
              </div>
            </div>
            <div className="flex justify-between gap-2">
              <div className="space-y-1 text-sm">
                <label htmlFor="price" className="block text-gray-600">
                  Price
                </label>
                <input
                  className="w-full px-4 py-3 text-gray-800 border border-rose-300 focus:outline-rose-500 rounded-md "
                  name="price"
                  defaultValue={selectedRoom?.price}
                  id="price"
                  type="number"
                  placeholder="Price"
                  required
                />
              </div>

              <div className="space-y-1 text-sm">
                <label htmlFor="guest" className="block text-gray-600">
                  Total guest
                </label>
                <input
                  className="w-full px-4 py-3 text-gray-800 border border-rose-300 focus:outline-rose-500 rounded-md "
                  name="total_guest"
                  defaultValue={selectedRoom?.totalGuest}
                  id="guest"
                  type="number"
                  placeholder="Total guest"
                  required
                />
              </div>
            </div>

            <div className="flex justify-between gap-2">
              <div className="space-y-1 text-sm">
                <label htmlFor="bedrooms" className="block text-gray-600">
                  Bedrooms
                </label>
                <input
                  className="w-full px-4 py-3 text-gray-800 border border-rose-300 focus:outline-rose-500 rounded-md "
                  name="bedrooms"
                  id="bedrooms"
                  defaultValue={selectedRoom?.bedrooms}
                  type="number"
                  placeholder="Bedrooms"
                  required
                />
              </div>

              <div className="space-y-1 text-sm">
                <label htmlFor="bathrooms" className="block text-gray-600">
                  Bathrooms
                </label>
                <input
                  className="w-full px-4 py-3 text-gray-800 border border-rose-300 focus:outline-rose-500 rounded-md "
                  name="bathrooms"
                  id="bathrooms"
                  defaultValue={selectedRoom?.bathrooms}
                  type="number"
                  placeholder="Bathrooms"
                  required
                />
              </div>
            </div>

            <div className="space-y-1 text-sm">
              <label htmlFor="description" className="block text-gray-600">
                Description
              </label>

              <textarea
                id="description"
                defaultValue={selectedRoom?.description}
                className="block rounded-md focus:rose-300 w-full h-32 px-4 py-3 text-gray-800  border border-rose-300 focus:outline-rose-500 "
                name="description"
              ></textarea>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full p-3 mt-5 text-center font-medium text-white transition duration-200 rounded shadow-md bg-rose-500"
        >
          Update & Continue
        </button>
      </form>
    </div>
  );
};

export default UpdateRoomForm;
