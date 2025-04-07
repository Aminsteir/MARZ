import { useState, useEffect } from "react";

export default function CategoryModal({ isOpen, onClose, onSelectCategory }) {
  // Maintain a breadcrumb history for category navigation.
  const [breadcrumb, setBreadcrumb] = useState<string[]>(["Root"]);
  const currentParent = breadcrumb[breadcrumb.length - 1];
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch child categories whenever the modal is open or the currentParent changes.
  useEffect(() => {
    if (isOpen) {
      fetchCategories(currentParent);
    }
  }, [isOpen, currentParent]);

  const fetchCategories = async (parent: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/traverse-category?parent=${encodeURIComponent(parent)}`,
      );
      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }
      const data = await response.json();
      setCategories(data.data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories([]);
    }
    setLoading(false);
  };

  const handleExplore = (cat: string) => {
    setBreadcrumb([...breadcrumb, cat]);
  };

  const handleBack = () => {
    if (breadcrumb.length > 1) {
      setBreadcrumb(breadcrumb.slice(0, -1));
    }
  };

  return isOpen ? (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-2xl">
        <h2 className="text-xl font-bold mb-4">Select a Category</h2>
        <div className="mb-4 flex items-center">
          {breadcrumb.length > 1 && <span>Current: {currentParent}</span>}
        </div>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <>
            {categories.length > 0 ? (
              <ul className="space-y-2">
                {categories.map((cat: string, index) => (
                  <li
                    key={`${cat}-${index}`}
                    className="flex justify-between items-center border-b pb-2"
                  >
                    <span>{cat}</span>
                    <div>
                      <button
                        className="mr-2 text-green-500 cursor-pointer border px-2 py-1"
                        onClick={() => {
                          onSelectCategory(cat);
                          onClose();
                        }}
                      >
                        Select
                      </button>
                      <button
                        className="text-blue-500 cursor-pointer border px-2 py-1"
                        onClick={() => handleExplore(cat)}
                      >
                        Explore
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              // No subcategories available, so allow selecting the current category.
              <div className="text-center">
                <p className="text-gray-500 mb-4">
                  No subcategories available.
                </p>
                <button
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 cursor-pointer"
                  onClick={() => {
                    onSelectCategory(currentParent);
                    onClose();
                  }}
                >
                  Select This Category
                </button>
              </div>
            )}
          </>
        )}
        <div className="mt-4 flex justify-end">
          {breadcrumb.length > 1 && (
            <button
              className="mr-2 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 cursor-pointer"
              onClick={handleBack}
            >
              Back
            </button>
          )}
          <button
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 cursor-pointer"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  ) : null;
}
