import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateFilter } from "../../redux/searchSlice";

const SearchBar = () => {
  const dispatch = useDispatch();
  const keyword = useSelector((state) => state.search.filters.keyword);

  return (
    <div className="bg-white rounded-xl shadow-md p-4 md:p-5">
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        Từ khóa
      </label>
      <input
        type="text"
        value={keyword}
        onChange={(event) =>
          dispatch(updateFilter({ key: "keyword", value: event.target.value }))
        }
        placeholder="Nhập từ khóa: học bổng, việc làm, FAQ..."
        className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary"
      />
    </div>
  );
};

export default SearchBar;
