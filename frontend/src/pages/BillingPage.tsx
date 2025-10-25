import React, { useState, useEffect } from 'react';
import { productsAPI, billingAPI } from '../utils/api';
import styles from './BillingPage.module.css';

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
}

interface BillItem {
  product_id: number;
  product_name: string;
  quantity: number;
  price: number;
  total: number;
}

const BillingPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [billItems, setBillItems] = useState<BillItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Fetch autocomplete suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.length >= 1) {
        try {
          const response = await productsAPI.getAutocomplete(searchQuery);
          setSuggestions(response.suggestions);
          setShowSuggestions(true);
        } catch (error) {
          console.error('Failed to fetch suggestions:', error);
          setSuggestions([]);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const addProductToBill = (product: Product) => {
    const existingItem = billItems.find(item => item.product_id === product.id);
    
    if (existingItem) {
      // Increase quantity if product already exists
      setBillItems(items =>
        items.map(item =>
          item.product_id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                total: (item.quantity + 1) * item.price
              }
            : item
        )
      );
    } else {
      // Add new product to bill
      const newItem: BillItem = {
        product_id: product.id,
        product_name: product.name,
        quantity: 1,
        price: product.price,
        total: product.price
      };
      setBillItems([...billItems, newItem]);
    }

    setSearchQuery('');
    setShowSuggestions(false);
  };

  const updateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(productId);
      return;
    }

    setBillItems(items =>
      items.map(item =>
        item.product_id === productId
          ? {
              ...item,
              quantity: newQuantity,
              total: newQuantity * item.price
            }
          : item
      )
    );
  };

  const removeItem = (productId: number) => {
    setBillItems(items => items.filter(item => item.product_id !== productId));
  };

  const getTotalAmount = () => {
    return billItems.reduce((sum, item) => sum + item.total, 0);
  };

  const handleCreateBill = async () => {
    if (billItems.length === 0) {
      setError('Please add at least one item to the bill');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const items = billItems.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity
      }));

      const response = await billingAPI.create(items);
      setSuccess(`Bill created successfully! Bill Number: ${response.bill.bill_number}`);
      setBillItems([]);
    } catch (error: any) {
      setError(error.message || 'Failed to create bill');
    } finally {
      setIsLoading(false);
    }
  };

  const clearBill = () => {
    setBillItems([]);
    setError('');
    setSuccess('');
  };

  return (
    <div className={styles.billingPage}>
      <div className={styles.header}>
        <h1>Create New Bill</h1>
        <p>Search for products and add them to the bill</p>
      </div>

      <div className={styles.content}>
        <div className={styles.productSearch}>
          <h2>Add Products</h2>
          <div className={styles.searchContainer}>
            <input
              type="text"
              placeholder="Search products... (e.g., 'so' for soap, soda, etc.)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
            
            {showSuggestions && suggestions.length > 0 && (
              <div className={styles.suggestions}>
                {suggestions.map((product) => (
                  <div
                    key={product.id}
                    className={styles.suggestion}
                    onClick={() => addProductToBill(product)}
                  >
                    <div className={styles.productInfo}>
                      <span className={styles.productName}>{product.name}</span>
                      <span className={styles.productPrice}>${product.price.toFixed(2)}</span>
                    </div>
                    <span className={styles.productStock}>Stock: {product.stock}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className={styles.billSection}>
          <div className={styles.billHeader}>
            <h2>Current Bill</h2>
            {billItems.length > 0 && (
              <button onClick={clearBill} className={styles.clearButton}>
                Clear All
              </button>
            )}
          </div>

          {billItems.length === 0 ? (
            <div className={styles.emptyBill}>
              <p>No items added yet. Search and select products to add them to the bill.</p>
            </div>
          ) : (
            <div className={styles.billItems}>
              {billItems.map((item) => (
                <div key={item.product_id} className={styles.billItem}>
                  <div className={styles.itemInfo}>
                    <span className={styles.itemName}>{item.product_name}</span>
                    <span className={styles.itemPrice}>${item.price.toFixed(2)} each</span>
                  </div>
                  
                  <div className={styles.quantityControls}>
                    <button
                      onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                      className={styles.quantityButton}
                    >
                      -
                    </button>
                    <span className={styles.quantity}>{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                      className={styles.quantityButton}
                    >
                      +
                    </button>
                  </div>
                  
                  <div className={styles.itemTotal}>
                    ${item.total.toFixed(2)}
                  </div>
                  
                  <button
                    onClick={() => removeItem(item.product_id)}
                    className={styles.removeButton}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {billItems.length > 0 && (
            <div className={styles.billFooter}>
              <div className={styles.totalSection}>
                <div className={styles.totalAmount}>
                  Total: ${getTotalAmount().toFixed(2)}
                </div>
                
                <button
                  onClick={handleCreateBill}
                  disabled={isLoading}
                  className={styles.createBillButton}
                >
                  {isLoading ? 'Creating Bill...' : 'Create Bill'}
                </button>
              </div>
            </div>
          )}

          {error && <div className={styles.error}>{error}</div>}
          {success && <div className={styles.success}>{success}</div>}
        </div>
      </div>
    </div>
  );
};

export default BillingPage;
