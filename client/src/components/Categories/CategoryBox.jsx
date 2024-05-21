import PropTypes from "prop-types";
import queryString from "query-string";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const CategoryBox = ({ label, icon: Icon }) => {
  const [isActive, setIsActive] = useState(false);
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const category = params.get("category");
  const handleActive = () => {
    let currentQuery = { category: label };
    const url = queryString.stringifyUrl({
      url: "/",
      query: currentQuery,
    });
    navigate(url);
    setIsActive(!isActive);
  };
  return (
    <div
      onClick={handleActive}
      className={`flex
    ${category === label && "border-b-black border-b-2"} 
  flex-col 
  items-center 
  justify-center 
  gap-2
  p-3
  border-b-2
  hover:text-neutral-800
  transition
  cursor-pointer`}
    >
      <Icon size={26} />
      <div className="text-sm font-medium">{label}</div>
    </div>
  );
};

CategoryBox.propTypes = {
  label: PropTypes.string,
  icon: PropTypes.elementType,
};

export default CategoryBox;
