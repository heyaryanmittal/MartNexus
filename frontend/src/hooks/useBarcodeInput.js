import { useEffect, useRef, useCallback } from 'react';
export const useBarcodeInput = ({ onScan, enabled = true, minLength = 4, maxDelay = 50, }) => {
    const bufferRef = useRef('');
    const lastKeyTimeRef = useRef(0);
    const handleKeyDown = useCallback((event) => {
        if (!enabled)
            return;
        
        const target = event.target;
        if (target.tagName === 'INPUT' ||
            target.tagName === 'TEXTAREA' ||
            target.isContentEditable) {
            return;
        }
        const currentTime = Date.now();
        const timeDiff = currentTime - lastKeyTimeRef.current;
        
        if (timeDiff > maxDelay) {
            bufferRef.current = '';
        }
        lastKeyTimeRef.current = currentTime;
        
        if (event.key === 'Enter') {
            if (bufferRef.current.length >= minLength) {
                onScan(bufferRef.current);
            }
            bufferRef.current = '';
            return;
        }
        
        if (event.key.length === 1 && /^[a-zA-Z0-9\-_.]$/.test(event.key)) {
            bufferRef.current += event.key;
        }
    }, [enabled, minLength, maxDelay, onScan]);
    useEffect(() => {
        if (enabled) {
            window.addEventListener('keydown', handleKeyDown);
            return () => {
                window.removeEventListener('keydown', handleKeyDown);
            };
        }
    }, [enabled, handleKeyDown]);
    const reset = useCallback(() => {
        bufferRef.current = '';
    }, []);
    return { reset };
};
