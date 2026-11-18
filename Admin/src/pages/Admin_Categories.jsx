
import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  Tags,
  Package,
  CheckCircle2,
  Eye,
  EyeOff,
  RefreshCw,
  Image as ImageIcon,
} from "lucide-react";

import "./Admin_Categories.css";



import vegetablesImage from "../assets/images/categories/fresh-vegetables.jpg";
import fruitsImage from "../assets/images/categories/fresh-fruits.jpg";
import dairyImage from "../assets/images/categories/dairy-eggs.jpg";
import grainsImage from "../assets/images/categories/rice-grains.jpg";
import snacksImage from "../assets/images/categories/snacks.jpg";
import beveragesImage from "../assets/images/categories/beverages.jpg";

const API_URL = "http://localhost:5000/api";
const BACKEND_URL = "http://localhost:5000";

const imageOptions = [
  { label: "Fresh Vegetables", value: vegetablesImage, emoji: "🥦" },
  { label: "Fresh Fruits", value: fruitsImage, emoji: "🍎" },
  { label: "Dairy & Eggs", value: dairyImage, emoji: "🥛" },
  { label: "Rice & Grains", value: grainsImage, emoji: "🌾" },
  { label: "Snacks", value: snacksImage, emoji: "🍪" },
  { label: "Beverages", value: beveragesImage, emoji: "🥤" },
];


const emptyForm = {
  name: "",
  slug: "",
  description: "",
  icon: "🛒",
  image: vegetablesImage,
  color: "#e9f8ec",
  status: "Active",
};

function createSlug(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function getSavedCategories() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return defaultCategories;
    }

    const parsed = JSON.parse(saved);

    if (!Array.isArray(parsed)) {
      return defaultCategories;
    }

    return parsed.map((category) => {
      const matchingDefault = defaultCategories.find(
        (item) => item.id === category.id
      );

      // Replace old remote-image URLs with the downloaded local photos.
      const existingImage = imageOptions.some(
        (item) => item.value === category.image
      );

      return {
        ...matchingDefault,
        ...category,
        image: existingImage
          ? category.image
          : matchingDefault?.image || vegetablesImage,
      };
    });
  } catch (error) {
    console.error("Could not load saved categories:", error);
    return defaultCategories;
  }
}

export default function Admin_Categories() {
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem("nearshopAdminToken");

        const response = await fetch(
          `${API_URL}/categories/admin/all`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load categories");
        }

        const categoryList = (data.categories || []).map((category) => ({
          ...category,
          id: category._id,
          status: category.isActive ? "Active" : "Inactive",
          image: category.image
            ? `${BACKEND_URL}${category.image}`
            : "",
          products: 0,
          color: "#e9f8ec",
        }));

        setCategories(categoryList);
      } catch (error) {
        console.error("Category loading error:", error);
        setFormError(error.message);
      }
    };

    fetchCategories();
  }, []);


  const filteredCategories = useMemo(() => {
    const query = search.trim().toLowerCase();

    return categories.filter((category) => {
      const matchesSearch =
        category.name.toLowerCase().includes(query) ||
        category.slug.toLowerCase().includes(query) ||
        (category.description || "").toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" || category.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [categories, search, statusFilter]);

  const activeCount = categories.filter(
    (category) => category.status === "Active"
  ).length;

  const inactiveCount = categories.filter(
    (category) => category.status === "Inactive"
  ).length;

  const productCount = categories.reduce(
    (total, category) => total + Number(category.products || 0),
    0
  );

  function openAddModal() {
    setEditingId(null);
    setForm({ ...emptyForm });
    setImageFile(null);
    setImagePreview("");
    setFormError("");
    setModalOpen(true);
  }

  function openEditModal(category) {
    setEditingId(category.id);

    setForm({
      name: category.name,
      slug: category.slug,
      description: category.description || "",
      icon: category.icon || "🛒",
      image: category.image || vegetablesImage,
      color: category.color || "#e9f8ec",
      status: category.status || "Active",
    });

    setFormError("");
    setModalOpen(true);
  }

  function closeModal() {

    setImageFile(null);
    setImagePreview("");
    setModalOpen(false);
    setEditingId(null);
    setForm({ ...emptyForm });
    setImageFile(null);
    setImagePreview(category.image || "");

    setFormError("");
  }

  function handleNameChange(value) {
    setForm((previous) => ({
      ...previous,
      name: value,
      slug: editingId ? previous.slug : createSlug(value),
    }));
  }

  function handleImageChange(value) {
    const selectedImage = imageOptions.find(
      (item) => item.value === value
    );

    setForm((previous) => ({
      ...previous,
      image: value,
      icon: selectedImage?.emoji || previous.icon,
      color:
        selectedImage?.label === "Fresh Vegetables"
          ? "#e9f8ec"
          : selectedImage?.label === "Fresh Fruits"
            ? "#fff0e9"
            : selectedImage?.label === "Dairy & Eggs"
              ? "#e9f3ff"
              : selectedImage?.label === "Rice & Grains"
                ? "#fff7df"
                : selectedImage?.label === "Snacks"
                  ? "#f7eaff"
                  : selectedImage?.label === "Beverages"
                    ? "#e5f8f7"
                    : previous.color,
    }));
  }
  function handleFileChange(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setFormError("Please select a JPG, PNG or WEBP image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFormError("Image size must be less than 5 MB.");
      return;
    }

    setFormError("");
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function handleFileChange(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setFormError("Please select a JPG, PNG or WEBP image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFormError("Image size must be less than 5 MB.");
      return;
    }

    setFormError("");
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setFormError("");

      const name = form.name.trim();
      const slug = createSlug(form.slug);

      if (!name) {
        setFormError("Please enter a category name.");
        return;
      }

      if (!slug) {
        setFormError("Please enter a valid category URL.");
        return;
      }

      const token = localStorage.getItem("nearshopAdminToken");

      if (!token) {
        setFormError("Admin login expired. Please login again.");
        return;
      }

      const isEditing = editingId !== null;

      const formData = new FormData();

      formData.append("name", name);
      formData.append("slug", slug);
      formData.append("description", form.description);
      formData.append("icon", form.icon);
      formData.append("isActive", String(form.status === "Active"));

      if (imageFile) {
        formData.append("image", imageFile);
      }

      const response = await fetch(
        isEditing
          ? `${API_URL}/categories/${editingId}`
          : `${API_URL}/categories`,
        {
          method: isEditing ? "PUT" : "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to save category.");
      }

      const savedCategory = data.category;

      const updatedCategory = {
        ...savedCategory,
        id: savedCategory._id,
        status: savedCategory.isActive ? "Active" : "Inactive",
        image: savedCategory.image
          ? `${BACKEND_URL}${savedCategory.image}`
          : vegetablesImage,
        products: 0,
        color: form.color,
      };

      setImageFile(null);
      setImagePreview("");
      if (isEditing) {
        setCategories((previous) =>
          previous.map((item) =>
            item.id === editingId ? updatedCategory : item
          )
        );
      } else {
        setCategories((previous) => [
          updatedCategory,
          ...previous,
        ]);
      }

      alert(
        isEditing
          ? "Category updated successfully!"
          : "Category added successfully!"
      );

      closeModal();
    } catch (error) {
      console.error("Category save error:", error);
      setFormError(error.message);
    }
  }

  const toggleStatus = async (id) => {
    try {
      const category = categories.find((item) => item.id === id);

      if (!category) return;

      const newStatus = category.status !== "Active";

      const token = localStorage.getItem("nearshopAdminToken");

      const response = await fetch(`${API_URL}/categories/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          isActive: newStatus,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to update category");
      }

      setCategories((previous) =>
        previous.map((item) =>
          item.id === id
            ? {
              ...item,
              status: newStatus ? "Active" : "Inactive",
            }
            : item
        )
      );

      alert(
        newStatus
          ? "Category activated successfully!"
          : "Category disabled successfully!"
      );
    } catch (error) {
      console.error("Category status error:", error);
      setFormError(error.message);
    }
  };
  async function deleteCategory(category) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${category.name}"?`
    );

    if (!confirmed) return;

    try {
      const token = localStorage.getItem("nearshopAdminToken");

      if (!token) {
        throw new Error("Admin login expired. Please login again.");
      }

      const response = await fetch(
        `${API_URL}/categories/${category.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to delete category.");
      }

      setCategories((previous) =>
        previous.filter((item) => item.id !== category.id)
      );

      alert("Category deleted successfully!");
    } catch (error) {
      console.error("Category delete error:", error);
      setFormError(error.message);
    }
  }

  function resetDemo() {
    const confirmed = window.confirm(
      "Reset categories to the original six demo categories?"
    );

    if (!confirmed) return;

    setCategories(defaultCategories);
    setSearch("");
    setStatusFilter("All");
  }

  return (
    <div className="acat-page">
      <div className="acat-heading">
        <div>
          <p className="acat-eyebrow">CATALOG MANAGEMENT</p>
          <h1>Categories</h1>
          <p className="acat-subtitle">
            Organize grocery products into clear categories.
          </p>
        </div>

        <div className="acat-heading-actions">
          <button
            className="acat-reset-btn"
            onClick={resetDemo}
            type="button"
          >
            <RefreshCw size={16} />
            Reset demo
          </button>

          <button
            className="acat-primary-btn"
            onClick={openAddModal}
            type="button"
          >
            <Plus size={18} />
            Add category
          </button>
        </div>
      </div>

      <div className="acat-stat-grid">
        <div className="acat-stat-card">
          <div className="acat-stat-icon acat-icon-green">
            <Tags size={21} />
          </div>
          <div>
            <p>Total categories</p>
            <h2>{categories.length}</h2>
            <span>All catalog categories</span>
          </div>
        </div>

        <div className="acat-stat-card">
          <div className="acat-stat-icon acat-icon-blue">
            <CheckCircle2 size={21} />
          </div>
          <div>
            <p>Active categories</p>
            <h2>{activeCount}</h2>
            <span>Currently enabled</span>
          </div>
        </div>

        <div className="acat-stat-card">
          <div className="acat-stat-icon acat-icon-orange">
            <EyeOff size={21} />
          </div>
          <div>
            <p>Inactive categories</p>
            <h2>{inactiveCount}</h2>
            <span>Currently disabled</span>
          </div>
        </div>

        <div className="acat-stat-card">
          <div className="acat-stat-icon acat-icon-purple">
            <Package size={21} />
          </div>
          <div>
            <p>Products in demo</p>
            <h2>{productCount}</h2>
            <span>Across listed categories</span>
          </div>
        </div>
      </div>

      <section className="acat-panel">
        <div className="acat-panel-header">
          <div>
            <h2>All categories</h2>
            <p>Manage the categories shown in your marketplace.</p>
          </div>

          <span className="acat-total-pill">
            {filteredCategories.length} shown
          </span>
        </div>

        <div className="acat-toolbar">
          <div className="acat-search">
            <Search size={18} />
            <input
              type="search"
              placeholder="Search categories..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search categories"
            />
          </div>

          <select
            className="acat-filter"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            aria-label="Filter by status"
          >
            <option value="All">All statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        <div className="acat-category-grid">
          {filteredCategories.map((category) => (
            <article className="acat-category-card" key={category.id}>
              <div className="acat-card-top">
                <div
                  className="acat-category-photo"
                  style={{ backgroundColor: category.color }}
                >
                  <span className="acat-category-fallback">
                    {category.icon}
                  </span>

                  <img
                    src={category.image || vegetablesImage}
                    alt={`${category.name} groceries`}
                    loading="lazy"
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                  />
                </div>

                <span
                  className={`acat-status ${category.status === "Active"
                    ? "acat-status-active"
                    : "acat-status-inactive"
                    }`}
                >
                  <span className="acat-status-dot" />
                  {category.status}
                </span>
              </div>

              <h3>{category.name}</h3>
              <p className="acat-slug">/{category.slug}</p>

              <p className="acat-description">
                {category.description || "No description added."}
              </p>

              <div className="acat-card-products">
                <Package size={17} />
                <span>
                  <strong>{category.products || 0}</strong> products
                </span>
              </div>

              <div className="acat-card-actions">
                <button
                  className="acat-action-btn"
                  type="button"
                  onClick={() => openEditModal(category)}
                  title="Edit category"
                >
                  <Pencil size={15} />
                  Edit
                </button>

                <button
                  className="acat-action-btn"
                  type="button"
                  onClick={() => toggleStatus(category.id)}
                  title="Change category status"
                >
                  {category.status === "Active" ? (
                    <EyeOff size={15} />
                  ) : (
                    <Eye size={15} />
                  )}
                  {category.status === "Active" ? "Disable" : "Enable"}
                </button>

                <button
                  className="acat-delete-btn"
                  type="button"
                  onClick={() => deleteCategory(category)}
                  title="Delete category"
                  aria-label={`Delete ${category.name}`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </article>
          ))}

          {filteredCategories.length === 0 && (
            <div className="acat-empty-state">
              <div className="acat-empty-icon">
                <Tags size={28} />
              </div>
              <h3>No categories found</h3>
              <p>Try changing your search or status filter.</p>
              <button
                type="button"
                className="acat-primary-btn"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("All");
                }}
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </section>

      {modalOpen && (
        <div
          className="acat-modal-backdrop"
          onMouseDown={closeModal}
        >
          <section
            className="acat-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="acat-modal-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="acat-modal-header">
              <div>
                <p className="acat-eyebrow">CATEGORY SETTINGS</p>
                <h2 id="acat-modal-title">
                  {editingId !== null ? "Edit category" : "Add category"}
                </h2>
              </div>

              <button
                className="acat-modal-close"
                type="button"
                onClick={closeModal}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            <form className="acat-form" onSubmit={handleSubmit}>
            

              <label className="acat-field">
                <span>Category name *</span>
                <input
                  type="text"
                  value={form.name}
                  onChange={(event) => handleNameChange(event.target.value)}
                  placeholder="Example: Round Bun"
                  maxLength={60}
                  required
                />
              </label>

              <label className="acat-field">
                <span>Category URL *</span>
                <input
                  value={form.slug}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      slug: createSlug(event.target.value),
                    }))
                  }
                  placeholder="organic-groceries"
                  required
                />
                <small>Use a unique URL-friendly category name.</small>
              </label>

                <label className="acat-field">
                <span>Upload category photo *</span>

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                />

                <small>JPG, PNG or WEBP. Maximum size: 5 MB.</small>
              </label>

              <label className="acat-field">
                <span>Description</span>
                <textarea
                  value={form.description}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      description: event.target.value,
                    }))
                  }
                  placeholder="Write a short category description..."
                  rows={3}
                  maxLength={180}
                />
              </label>

              <label className="acat-field">
                <span>Choose category photo *</span>
                <select
                  value={form.image}
                  onChange={(event) => handleImageChange(event.target.value)}
                  required
                >
                  {imageOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.emoji} {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <div className="acat-image-preview">
                <img
                  src={imagePreview || form.image}
                  alt="Selected category preview"
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                  }}
                />
                <div>
                  <ImageIcon size={17} />
                  <span>Selected category image</span>
                </div>
              </div>

              <div className="acat-form-row">
                <label className="acat-field">
                  <span>Category emoji</span>
                  <select
                    value={form.icon}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        icon: event.target.value,
                      }))
                    }
                  >
                    <option value="🛒">🛒 Grocery</option>
                    <option value="🥦">🥦 Vegetables</option>
                    <option value="🍎">🍎 Fruits</option>
                    <option value="🥛">🥛 Dairy</option>
                    <option value="🌾">🌾 Grains</option>
                    <option value="🍞">🍞 Bakery</option>
                    <option value="🍪">🍪 Snacks</option>
                    <option value="🥤">🥤 Beverages</option>
                    <option value="🧼">🧼 Household</option>
                    <option value="🌿">🌿 Organic</option>
                  </select>
                </label>

                <label className="acat-field">
                  <span>Background color</span>
                  <select
                    value={form.color}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        color: event.target.value,
                      }))
                    }
                  >
                    <option value="#e9f8ec">Soft green</option>
                    <option value="#fff0e9">Soft peach</option>
                    <option value="#e9f3ff">Soft blue</option>
                    <option value="#fff7df">Soft yellow</option>
                    <option value="#f7eaff">Soft purple</option>
                    <option value="#e5f8f7">Soft teal</option>
                  </select>
                </label>
              </div>

              <label className="acat-field">
                <span>Status</span>
                <select
                  value={form.status}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      status: event.target.value,
                    }))
                  }
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </label>

              {formError && (
                <p className="acat-form-error" role="alert">
                  {formError}
                </p>
              )}

              <div className="acat-form-actions">
                <button
                  type="button"
                  className="acat-cancel-btn"
                  onClick={closeModal}
                >
                  Cancel
                </button>

                <button type="submit" className="acat-primary-btn">
                  {editingId !== null ? "Save changes" : "Create category"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
