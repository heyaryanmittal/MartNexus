import { useState } from 'react';
import api from '@/lib/api';

export function useStockMovements() {
    const [movements, setMovements] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchMovements = async (productId) => {
        setLoading(true);
        try {
            const { data } = await api.get(`/inventory/movements?productId=${productId}`);
            setMovements(data || []);
        } catch (error) {
            console.error('Error fetching stock movements:', error);
        } finally {
            setLoading(false);
        }
    };

    const createMovement = async (movementData) => {
        try {
            
            const payload = {
                productId: movementData.product_id,
                type: movementData.movement_type.toUpperCase(), 
                quantity: movementData.quantity,
                batchNumber: movementData.batch_number,
                expiryDate: movementData.expiry_date,
                referenceNumber: movementData.reference_number,
                notes: movementData.notes
            };

            await api.post('/inventory/movements', payload);

            
            
        } catch (error) {
            console.error('Error creating stock movement:', error);
            throw error;
        }
    };

    return {
        movements,
        loading,
        fetchMovements,
        createMovement,
    };
}
