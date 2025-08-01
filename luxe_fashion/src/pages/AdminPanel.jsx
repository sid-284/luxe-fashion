import React, { useEffect, useState } from 'react';
import { useUser } from '../context/UserContext';
import { apiFetch } from '../utils/api';
import Header from '../components/ui/Header';
import Footer from './homepage/components/Footer';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { convertUSDToINR, formatINR } from '../utils/currency';

const AdminPanel = () => {
  const { user } = useUser();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState({ 
    name: '', 
    price: '', 
    description: '', 
    category: '', 
    subCategory: '', 
    sizes: '["XS", "S", "M", "L", "XL"]',
    bestseller: false,
    image1: null,
    image2: null,
    image3: null,
    image4: null
  });
  const [imagePreviews, setImagePreviews] = useState({
    image1: null,
    image2: null,
    image3: null,
    image4: null
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminForm, setAdminForm] = useState({ email: '', password: '' });
  const [adminLoading, setAdminLoading] = useState(false);

  useEffect(() => {
    if (isAdminLoggedIn) fetchProducts();
    // eslint-disable-next-line
  }, [isAdminLoggedIn]);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    console.log('Admin login form submitted:', adminForm);
    setAdminLoading(true);
    setError('');
    try {
      const response = await apiFetch('/auth/adminlogin', {
        method: 'POST',
        body: JSON.stringify({
          email: adminForm.email,
          password: adminForm.password
        }),
      });
      console.log('Admin login response:', response);
      setIsAdminLoggedIn(true);
      setSuccess('Admin login successful!');
    } catch (err) {
      console.error('Admin login error:', err);
      setError('Invalid admin credentials');
    } finally {
      setAdminLoading(false);
    }
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    setAdminForm({ email: '', password: '' });
    setSuccess('');
    setError('');
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/product/list');
      setProducts(data);
    } catch {
      setProducts([]);
    }
    setLoading(false);
  };

  const handleFormChange = (e) => {
    const { name, value, files, type, checked } = e.target;
    
    if (files && files[0]) {
      setForm((prev) => ({ ...prev, [name]: files[0] }));
      // Show preview for any image upload
      if (name.startsWith('image')) {
        setImagePreviews(prev => ({
          ...prev,
          [name]: URL.createObjectURL(files[0])
        }));
      }
    } else if (type === 'checkbox') {
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
    setError('');
    setSuccess('');
  };

  const handleAdd = () => {
    setForm({ 
      name: '', 
      price: '', 
      description: '', 
      category: '', 
      subCategory: '', 
      sizes: '["XS", "S", "M", "L", "XL"]',
      bestseller: false,
      image1: null,
      image2: null,
      image3: null,
      image4: null
    });
    // Reset all image previews
    setImagePreviews({
      image1: null,
      image2: null,
      image3: null,
      image4: null
    });
    setEditProduct(null);
    setShowForm(true);
  };

  const handleEdit = (product) => {
    setForm({ 
      name: product.name, 
      price: product.price, 
      description: product.description, 
      category: product.category, 
      subCategory: product.subCategory || product.category,
      sizes: JSON.stringify(product.sizes || ["XS", "S", "M", "L", "XL"]),
      bestseller: product.bestseller || false,
      image1: null,
      image2: null,
      image3: null,
      image4: null
    });
    
    // Set image previews for existing product images
    setImagePreviews({
      image1: product.image1 || null,
      image2: product.image2 || null,
      image3: product.image3 || null,
      image4: product.image4 || null
    });
    
    setEditProduct(product);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await apiFetch(`/product/delete/${id}`, { method: 'DELETE' });
      setSuccess('Product deleted');
      fetchProducts();
    } catch {
      setError('Failed to delete');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      let body = new FormData();
      
      // Add all form fields to FormData
      body.append('name', form.name);
      body.append('price', form.price);
      body.append('description', form.description);
      body.append('category', form.category);
      body.append('subCategory', form.subCategory);
      body.append('sizes', form.sizes);
      body.append('bestseller', form.bestseller.toString());
      
      // Add images if they exist
      if (form.image1) {
        body.append('image1', form.image1);
      }
      if (form.image2) {
        body.append('image2', form.image2);
      }
      if (form.image3) {
        body.append('image3', form.image3);
      }
      if (form.image4) {
        body.append('image4', form.image4);
      }
      
      console.log('Submitting FormData with fields:', {
        name: form.name,
        price: form.price,
        category: form.category,
        hasImage1: !!form.image1,
        hasImage2: !!form.image2,
        hasImage3: !!form.image3,
        hasImage4: !!form.image4
      });
      
      if (editProduct) {
        await apiFetch(`/product/update/${editProduct._id || editProduct.id}`, {
          method: 'PUT',
          body,
        });
        setSuccess('Product updated');
      } else {
        await apiFetch('/product/addproduct', {
          method: 'POST',
          body,
        });
        setSuccess('Product added');
      }
      setShowForm(false);
      setImagePreviews({
        image1: null,
        image2: null,
        image3: null,
        image4: null
      });
      fetchProducts();
    } catch (error) {
      console.error('Submit error:', error);
      setError('Failed to save: ' + (error.message || 'Unknown error'));
    }
  };

  if (!isAdminLoggedIn) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center py-16 px-4">
          <div className="bg-card rounded-lg shadow-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-serif font-semibold text-foreground mb-6 text-center">Admin Login</h2>
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="space-y-2 relative">
                <label htmlFor="admin-username" className="block text-sm font-medium text-foreground">
                  Admin Username *
                </label>
                <input
                  id="admin-username"
                  type="text"
                  value={adminForm.email}
                  onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                  required
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 pr-10"
                />
                {/* Copy button for username
                <button
                  type="button"
                  className="absolute right-2 top-8 text-xs text-muted-foreground hover:text-foreground focus:outline-none"
                  onClick={() => {
                    navigator.clipboard.writeText(adminForm.email);
                  }}
                  tabIndex={-1}
                  aria-label="Copy username"
                >
                  📋
                </button> */}
              </div>
              <div className="space-y-2 relative">
                <label htmlFor="admin-password" className="block text-sm font-medium text-foreground">
                  Admin Password *
                </label>
                <input
                  id="admin-password"
                  type="password"
                  value={adminForm.password}
                  onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                  placeholder="Enter admin password"
                  required
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 pr-10"
                />
                {/* Copy button for password
                <button
                  type="button"
                  className="absolute right-2 top-8 text-xs text-muted-foreground hover:text-foreground focus:outline-none"
                  onClick={() => {
                    navigator.clipboard.writeText(adminForm.password);
                  }}
                  tabIndex={-1}
                  aria-label="Copy password"
                >
                  📋
                </button> */}
              </div>
              {error && <div className="text-red-500 text-sm text-center">{error}</div>}
              {success && <div className="text-green-500 text-sm text-center">{success}</div>}
              <Button 
                type="submit" 
                variant="primary" 
                fullWidth 
                loading={adminLoading}
              >
                Admin Login
              </Button>
              
              {/* Debug button to test form state */}
              <Button 
                type="button" 
                variant="outline" 
                fullWidth 
                onClick={() => {
                  console.log('Current admin form state:', adminForm);
                  alert(`Email: ${adminForm.email}\nPassword: ${adminForm.password}`);
                }}
              >
                Debug: Check Form State
              </Button>
            </form>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col items-center py-16 px-4">
        <div className="bg-card rounded-lg shadow-lg p-8 max-w-4xl w-full">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-serif font-semibold text-foreground">Admin Product Management</h2>
            <div className="flex gap-2">
              <Button variant="primary" onClick={handleAdd}>Add Product</Button>
              <Button variant="outline" onClick={handleAdminLogout}>Logout</Button>
            </div>
          </div>
          {error && <div className="text-error text-sm text-center mb-2">{error}</div>}
          {success && <div className="text-success text-sm text-center mb-2">{success}</div>}
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <table className="w-full text-left border border-border rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-muted">
                  <th className="p-3">Name</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">Description</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product._id || product.id} className="border-t border-border">
                    <td className="p-3">{product.name}</td>
                    <td className="p-3">{formatINR(convertUSDToINR(product.price))}</td>
                    <td className="p-3">{product.description}</td>
                    <td className="p-3 flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(product)}>Edit</Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(product._id || product.id)}>Delete</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {/* Add/Edit Form Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div
              className="bg-card rounded-lg shadow-lg w-full max-w-md relative flex flex-col"
              style={{
                maxHeight: '90vh',
                height: 'auto'
              }}
            >
              <form className="flex flex-col" style={{height: '100%'}} onSubmit={handleSubmit}>
                <div className="flex-shrink-0 p-6 pb-4 border-b border-border">
                  <button
                    type="button"
                    className="absolute top-4 right-4 text-muted-foreground hover:text-accent"
                    onClick={() => setShowForm(false)}
                    aria-label="Close"
                  >
                    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                  <h3 className="text-xl font-serif font-semibold text-foreground">{editProduct ? 'Edit' : 'Add'} Product</h3>
                </div>
                <div
                  className="flex-1 p-6 pt-4 space-y-4"
                  style={{
                    overflowY: 'auto',
                    minHeight: '0',
                    maxHeight: 'calc(90vh - 200px)'
                  }}
                >
                  <div>
                    <label className="block text-sm font-medium mb-1">Name</label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleFormChange}
                      className="w-full border border-border rounded-md px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Price</label>
                    <input
                      type="number"
                      name="price"
                      value={form.price}
                      onChange={handleFormChange}
                      className="w-full border border-border rounded-md px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleFormChange}
                      className="w-full border border-border rounded-md px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Category</label>
                    <select
                      name="category"
                      value={form.category}
                      onChange={handleFormChange}
                      className="w-full border border-border rounded-md px-3 py-2"
                      required
                    >
                      <option value="">Select a category</option>
                      <option value="men">Men</option>
                      <option value="women">Women</option>
                      <option value="kids">Kids</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Sub Category</label>
                    <input
                      type="text"
                      name="subCategory"
                      value={form.subCategory}
                      onChange={handleFormChange}
                      className="w-full border border-border rounded-md px-3 py-2"
                      placeholder="e.g., Coats, Dresses, Sweaters"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Sizes (JSON)</label>
                    <input
                      type="text"
                      name="sizes"
                      value={form.sizes}
                      onChange={handleFormChange}
                      className="w-full border border-border rounded-md px-3 py-2"
                      placeholder='["XS", "S", "M", "L", "XL"]'
                    />
                  </div>
                  <div>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        name="bestseller"
                        checked={form.bestseller}
                        onChange={handleFormChange}
                        className="rounded border-border"
                      />
                      <span className="text-sm font-medium">Bestseller</span>
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Main Image</label>
                    <input
                      type="file"
                      name="image1"
                      accept="image/*"
                      onChange={handleFormChange}
                      className="w-full border border-border rounded-md px-3 py-2"
                    />
                    {imagePreviews.image1 && (
                      <img src={imagePreviews.image1} alt="Preview" className="mt-2 w-32 h-32 object-cover rounded border" />
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Image 2 (Optional)</label>
                    <input
                      type="file"
                      name="image2"
                      accept="image/*"
                      onChange={handleFormChange}
                      className="w-full border border-border rounded-md px-3 py-2"
                    />
                    {imagePreviews.image2 && (
                      <img src={imagePreviews.image2} alt="Preview" className="mt-2 w-32 h-32 object-cover rounded border" />
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Image 3 (Optional)</label>
                    <input
                      type="file"
                      name="image3"
                      accept="image/*"
                      onChange={handleFormChange}
                      className="w-full border border-border rounded-md px-3 py-2"
                    />
                    {imagePreviews.image3 && (
                      <img src={imagePreviews.image3} alt="Preview" className="mt-2 w-32 h-32 object-cover rounded border" />
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Image 4 (Optional)</label>
                    <input
                      type="file"
                      name="image4"
                      accept="image/*"
                      onChange={handleFormChange}
                      className="w-full border border-border rounded-md px-3 py-2"
                    />
                    {imagePreviews.image4 && (
                      <img src={imagePreviews.image4} alt="Preview" className="mt-2 w-32 h-32 object-cover rounded border" />
                    )}
                  </div>
                </div>
                <div className="flex-shrink-0 p-6 pt-4 border-t border-border">
                  <Button type="submit" variant="primary" fullWidth>{editProduct ? 'Update' : 'Add'} Product</Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default AdminPanel;