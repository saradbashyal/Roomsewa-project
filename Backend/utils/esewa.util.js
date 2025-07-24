import axios from 'axios';
import crypto from 'crypto';

export const generateEsewaSignature = ({ total_amount, transaction_uuid, product_code }) => {
    const secretKey = process.env.ESEWA_SECRET_KEY;

    if (!secretKey) {
        throw new Error('ESEWA_SECRET_KEY is not configured');
    }

    const message = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;

    const hmac = crypto.createHmac('sha256', secretKey);
    hmac.update(message);

    const signature = hmac.digest('base64');

    return signature;
};

export const checkEsewaTransactionStatus = async (transaction_uuid, totalAmount) => {
    try {
        const paymentData = {
            product_code: process.env.ESEWA_PRODUCT_CODE,
            total_amount: totalAmount,
            transaction_uuid: transaction_uuid,
        };

        console.log(`Checking eSewa status for transaction: ${transaction_uuid}`);

        const response = await axios.get(process.env.ESEWA_STATUS_CHECK_URL, {
            params: paymentData,
        });
        
        console.log('eSewa status response:', response.data);

        // Handle different response formats
        if (typeof response.data === 'string') {
            if (response.data.includes('Success')) {
                return { status: 'COMPLETE', ref_id: transaction_uuid };
            } else {
                return { status: 'FAILED', message: response.data };
            }
        }
        
        // Handle JSON response
        if (response.data && response.data.status) {
            return response.data;
        }
        
        return response.data;
    } catch (error) {
        console.error('eSewa status check API call failed:', error.response ? error.response.data : error.message);
        throw error;
    }
};