import React from "react";
import { useDispatch, useSelector } from "react-redux";
import SearchBar from "../components/search/SearchBar";
import FilterSidebar from "../components/search/FilterSidebar";
import FilterChips from "../components/search/FilterChips";
import SearchResults from "../components/search/SearchResults";
import { fetchSearchResults } from "../redux/searchSlice";

const SearchPage = () => {
  const dispatch = useDispatch();
  const filters = useSelector((state) => state.search.filters);
  const total = useSelector((state) => state.search.filteredItems.length);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(fetchSearchResults(filters));
    }, 250);

    return () => clearTimeout(timer);
  }, [dispatch, filters]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          Tìm kiếm
        </h1>
        <p className="text-gray-600">
          Tìm trong bài viết, FAQ và các chủ đề forum bằng dữ liệu từ server.
        </p>
      </div>

      <SearchBar />

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <FilterSidebar />
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <FilterChips />
            <p className="text-sm text-gray-600">{total} kết quả</p>
          </div>

          <SearchResults />
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
