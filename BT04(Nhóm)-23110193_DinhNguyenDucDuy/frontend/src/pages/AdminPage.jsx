import React from "react";
import { useDispatch, useSelector } from "react-redux";
import AdminTabs from "../components/admin/AdminTabs";
import AdminToolbar from "../components/admin/AdminToolbar";
import AdminDataTable from "../components/admin/AdminDataTable";
import AdminFormModal from "../components/admin/AdminFormModal";
import { fetchAdminResource } from "../redux/adminSlice";

const AdminPage = () => {
  const dispatch = useDispatch();
  const { activeModule, error } = useSelector((state) => state.admin);

  React.useEffect(() => {
    dispatch(fetchAdminResource({ resource: activeModule }));
  }, [dispatch, activeModule]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          Admin CMS
        </h1>
        <p className="text-gray-600">
          Quản lý bài viết và FAQ bằng API thật, chỉ dành cho tài khoản admin.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <AdminTabs />
      <AdminToolbar />
      <AdminDataTable />
      <AdminFormModal />
    </div>
  );
};

export default AdminPage;

