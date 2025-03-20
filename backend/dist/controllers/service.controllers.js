import brandModel from '../models/brand.model.js';
export const getAllServices = async (req, res) => {
    try {
        const result = await brandModel.find();
        res.status(200).json({ success: true, result });
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(`Error brand up: ${error.message}`);
            return;
        }
        else {
            console.error('Error brand up:', error);
        }
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};
//# sourceMappingURL=service.controllers.js.map