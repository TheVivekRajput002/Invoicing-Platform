import { supabase } from '../supabaseClient';

export const uploadPhoto = async (file, invoiceNumber) => {
    try {
        // Generate unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${invoiceNumber}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
            .from('invoice-photos')
            .upload(filePath, file);

        if (error) throw error;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('invoice-photos')
            .getPublicUrl(filePath);

        return publicUrl;
    } catch (error) {
        console.error('Error uploading photo:', error);
        throw error;
    }
};