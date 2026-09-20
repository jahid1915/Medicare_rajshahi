import React, { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem("niramoy_cart") || localStorage.getItem("medicare_cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("niramoy_cart", JSON.stringify(items));
    } catch (e) {
      console.error("Failed to save cart to localStorage", e);
    }
  }, [items]);

  const addToCart = (medicine, pharmacy, quantity = 1) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (i) => i.medicineId === (medicine._id || medicine.id) && i.pharmacyId === (pharmacy._id || pharmacy.id)
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      }

      return [
        ...prev,
        {
          medicineId: medicine._id || medicine.id,
          brandName: medicine.brand_name || medicine.name,
          genericName: medicine.generic_name || "",
          dosageForm: medicine.dosage_form || "Tablet",
          strength: medicine.strength || "",
          unitPrice: Number(medicine.unit_price || medicine.price || 0),
          quantity,
          pharmacyId: pharmacy._id || pharmacy.id,
          pharmacyName: pharmacy.name,
          pharmacyArea: pharmacy.area || "",
          pharmacyDeliveryFee: pharmacy.delivery_fee || 35,
          freeDeliveryAbove: pharmacy.free_delivery_above || 500,
          requiresPrescription: Boolean(medicine.requires_prescription)
        }
      ];
    });
  };

  const removeFromCart = (medicineId, pharmacyId) => {
    setItems((prev) =>
      prev.filter((i) => !(i.medicineId === medicineId && i.pharmacyId === pharmacyId))
    );
  };

  const updateQuantity = (medicineId, pharmacyId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(medicineId, pharmacyId);
      return;
    }
    setItems((prev) =>
      prev.map((i) =>
        i.medicineId === medicineId && i.pharmacyId === pharmacyId
          ? { ...i, quantity: newQty }
          : i
      )
    );
  };

  const clearCart = (pharmacyId = null) => {
    if (pharmacyId) {
      setItems((prev) => prev.filter((i) => i.pharmacyId !== pharmacyId));
    } else {
      setItems([]);
    }
  };

  // Group items by pharmacy for split orders
  const groupedByPharmacy = items.reduce((acc, item) => {
    if (!acc[item.pharmacyId]) {
      acc[item.pharmacyId] = {
        pharmacyId: item.pharmacyId,
        pharmacyName: item.pharmacyName,
        pharmacyArea: item.pharmacyArea,
        deliveryFee: item.pharmacyDeliveryFee,
        freeDeliveryAbove: item.freeDeliveryAbove,
        items: [],
        subtotal: 0,
        requiresPrescription: false
      };
    }
    acc[item.pharmacyId].items.push(item);
    acc[item.pharmacyId].subtotal += item.unitPrice * item.quantity;
    if (item.requiresPrescription) {
      acc[item.pharmacyId].requiresPrescription = true;
    }
    return acc;
  }, {});

  const totalItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalRawPrice = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        groupedByPharmacy,
        totalItemsCount,
        totalRawPrice
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return ctx;
}
