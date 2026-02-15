import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useSales } from './useSales';

export function useInvoice() {
  const { toast } = useToast();
  const { createSale, fetchSales, loading: isLoading } = useSales();

  
  const saveInvoice = useCallback(async (saleData) => {
    try {
      const sale = await createSale(saleData);
      return sale;
    } catch (error) {
      console.error('Error saving invoice:', error);
      throw error;
    }
  }, [createSale]);

  
  const getInvoices = useCallback(async () => {
    try {
      const invoices = await fetchSales();
      return invoices;
    } catch (error) {
      console.error('Error fetching invoices:', error);
      return [];
    }
  }, [fetchSales]);

  
  const getInvoiceById = useCallback(async (invoiceId) => {
    try {
      const invoices = await fetchSales();
      return invoices.find(invoice => invoice.id === invoiceId);
    } catch (error) {
      console.error('Error fetching invoice:', error);
      return null;
    }
  }, [fetchSales]);

  
  const getInvoiceByBillNumber = useCallback(async (billNumber) => {
    try {
      const invoices = await fetchSales();
      return invoices.find(invoice => invoice.billNumber === billNumber);
    } catch (error) {
      console.error('Error fetching invoice:', error);
      return null;
    }
  }, [fetchSales]);

  
  const getInvoiceStats = useCallback(async () => {
    try {
      const invoices = await fetchSales();
      const totalRevenue = invoices.reduce((sum, invoice) => sum + Number(invoice.totalAmount), 0);
      const totalGST = invoices.reduce((sum, invoice) => sum + Number(invoice.taxAmount), 0);
      const totalInvoices = invoices.length;

      const today = new Date().toDateString();
      const todayInvoices = invoices.filter(invoice =>
        new Date(invoice.createdAt).toDateString() === today
      );
      const todayRevenue = todayInvoices.reduce((sum, invoice) => sum + Number(invoice.totalAmount), 0);

      return {
        totalRevenue,
        totalGST,
        totalInvoices,
        todayRevenue,
        todayInvoices: todayInvoices.length
      };
    } catch (error) {
      console.error('Error calculating stats:', error);
      return {
        totalRevenue: 0,
        totalGST: 0,
        totalInvoices: 0,
        todayRevenue: 0,
        todayInvoices: 0
      };
    }
  }, [fetchSales]);

  return {
    isLoading,
    saveInvoice,
    getInvoices,
    getInvoiceById,
    getInvoiceByBillNumber,
    getInvoiceStats,
  };
}
