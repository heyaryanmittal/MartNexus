import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '@/lib/api';

export function useReports(startDate, endDate) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const activeShop = useSelector((state) => state.shops.activeShop);

    useEffect(() => {
        if (activeShop?.id) {
            fetchReportData();
        }
    }, [startDate, endDate, activeShop?.id]);

    const fetchReportData = async () => {
        setLoading(true);
        try {
            const [salesRes, stockRes, profitRes, gstRes] = await Promise.all([
                api.get('/reports/sales', { params: { shopId: activeShop.id, startDate, endDate } }),
                api.get('/reports/stock', { params: { shopId: activeShop.id } }),
                api.get('/reports/profit', { params: { shopId: activeShop.id, startDate, endDate } }),
                api.get('/reports/gst', { params: { shopId: activeShop.id, startDate, endDate } })
            ]);

            
            setData({
                ...salesRes.data,
                ...profitRes.data,
                ...gstRes.data,
                summary: {
                    ...salesRes.data.summary,
                    ...profitRes.data.summary,
                    ...gstRes.data.summary
                },
                stockData: stockRes.data.stockData,
                stockSummary: stockRes.data.summary
            });
        }
        catch (error) {
            console.error('Error fetching report data:', error);
            setData(null);
        }
        finally {
            setLoading(false);
        }
    };


    return { data, loading };
}

