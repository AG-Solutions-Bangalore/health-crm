import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Select from "react-select";
import { Save, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

import Layout from "@/components/Layout";
import { Base_Url } from "@/config/BaseUrl";
import { toast } from "sonner";

const EditUserType = () => {
  
  const { id } = useParams();


  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [userData, setUserData] = useState(null);
  const [selectedButtons, setSelectedButtons] = useState([]);
  const [selectedPages, setSelectedPages] = useState([]);

  const buttonControl = JSON.parse(
    localStorage.getItem("buttonControl") || "[]"
  );
  const pageControl = JSON.parse(localStorage.getItem("pageControl") || "[]");

  const buttonOptions = buttonControl.map((btn) => ({
    value: btn.button,
    label: btn.button,
    pages: btn.pages,
  }));

  const pageOptions = pageControl.map((page) => ({
    value: page.url,
    label: page.page,
    url: page.url,
  }));

  const groupedButtonOptions = buttonControl.reduce((acc, curr) => {
    if (!acc[curr.pages]) {
      acc[curr.pages] = [];
    }
    acc[curr.pages].push({
      value: curr.button,
      label: curr.button,
    });
    return acc;
  }, {});

  const groupedOptions = Object.keys(groupedButtonOptions).map((key) => ({
    label: key,
    options: groupedButtonOptions[key],
  }));

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${Base_Url}/api/panel-fetch-usertype-by-id/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setUserData(response.data.userType);
        if (response.data.userType.default_button_role) {
          const selectedButtonValues =
            response.data.userType.default_button_role.split(",");
          setSelectedButtons(
            buttonOptions.filter((opt) =>
              selectedButtonValues.includes(opt.value)
            )
          );
        }

        if (response.data.userType.default_page_role) {
          const selectedPageValues =
            response.data.userType.default_page_role.split(",");
          setSelectedPages(
            pageOptions.filter((opt) => selectedPageValues.includes(opt.value))
          );
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedButtons.length === 0 || selectedPages.length === 0) {
      toast.error("Please select at least one button and one page.");
      return;
    }
    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      const payload = {
        default_button_role: selectedButtons.map((btn) => btn.value).join(","),
        default_page_role: selectedPages.map((page) => page.value).join(","),
      };

      await axios.put(
        `${Base_Url}/api/panel-update-usertype/${id}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      navigate("/user-type");
    } catch (error) {
      console.error("Error updating user type:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    <Layout>
        <div className="flex justify-center items-center h-full">
          <Button disabled>
            <Loader2 className=" h-4 w-4 animate-spin" />
            Loading Usertype Data
          </Button>
        </div>
      </Layout>
  }

  return (
    <Layout>
      <div className="max-w-screen p-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6 border-b pb-4">
            <h1 className="text-2xl font-semibold">
              Edit User Type: {userData?.user_position}
            </h1>
            <button
              onClick={() => navigate("/user-type")}
              className="flex items-center text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="h-5 w-5 mr-1" />
              Back
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* User Role Display */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                User Role
              </label>
              <input
                type="text"
                value={userData?.user_role || ""}
                disabled
                className="w-full p-2 border rounded-md bg-gray-50"
              />
            </div>

            {/* Button Permissions */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Button Permissions
              </label>
              <Select
                isMulti
                closeMenuOnSelect={false}
                options={groupedOptions}
                value={selectedButtons}
                onChange={setSelectedButtons}
                className="basic-multi-select"
                classNamePrefix="select"
                placeholder="Select button permissions..."
              />
            </div>

            {/* Page Permissions */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Page Permissions
              </label>
              <Select
                isMulti
                closeMenuOnSelect={false}
                options={pageOptions}
                value={selectedPages}
                onChange={setSelectedPages}
                className="basic-multi-select"
                classNamePrefix="select"
                placeholder="Select page permissions..."
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
          
              <Button
                type="submit"
                disabled={saving}
                className={`ml-2`}
              >
                {saving ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                ) : (
                  <Save className="h-5 w-5 mr-2" />
                )}
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default EditUserType;
